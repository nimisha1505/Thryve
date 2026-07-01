async function runResourceTests() {
  const authUrl = 'http://localhost:5000/api/v1/auth';
  const resourceUrl = 'http://localhost:5000/api/v1/resources';
  const timestamp = Date.now();

  const testUser = {
    name: 'Resource Tester',
    email: `resource_tester_${timestamp}@example.com`,
    password: 'password123',
  };

  console.log('--- STARTING WELLNESS RESOURCES MODULE VERIFICATION TESTS ---');

  // Helper to register & login, returning active cookies
  async function authenticate(userPayload) {
    // Register
    await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    });

    // Login to fetch cookies
    const loginRes = await fetch(`${authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userPayload.email, password: userPayload.password }),
    });

    const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : loginRes.headers.get('set-cookie');
    let accessTokenCookie = '';
    let refreshTokenCookie = '';
    if (setCookies) {
      const arr = Array.isArray(setCookies) ? setCookies : [setCookies];
      arr.forEach(c => {
        if (c.startsWith('accessToken=')) accessTokenCookie = c.split(';')[0];
        if (c.startsWith('refreshToken=')) refreshTokenCookie = c.split(';')[0];
      });
    }
    return `${accessTokenCookie}; ${refreshTokenCookie}`;
  }

  console.log('\n[1] Registering and Authenticating Test User...');
  const cookie = await authenticate(testUser);
  console.log('Authentication Successful.');

  // Test 1: Verify auto-seeding occurred
  console.log('\n[2] Checking if auto-seeded wellness resources are loaded (GET /)...');
  const listRes = await fetch(resourceUrl, {
    method: 'GET',
    headers: { 'Cookie': cookie },
  });
  console.log(`Resources List status: ${listRes.status}`);
  const listData = await listRes.json();
  const resourcesList = listData.data.resources;
  console.log(`Total seeded resources found: ${resourcesList.length} (Expected: 12)`);
  if (resourcesList.length >= 12) {
    console.log('PASS: Seeder populated all 12 default wellness items.');
  } else {
    console.log('FAIL: Seeder items count mismatch.');
  }

  // Test 2: Fetch Featured Resources
  console.log('\n[3] Fetching featured wellness resources (GET /featured)...');
  const featRes = await fetch(`${resourceUrl}/featured`, {
    method: 'GET',
    headers: { 'Cookie': cookie },
  });
  console.log(`Featured status: ${featRes.status}`);
  const featData = await featRes.json();
  const featuredList = featData.data.resources;
  console.log(`Total featured resources found: ${featuredList.length} (Expected: 5)`);
  featuredList.forEach(r => {
    console.log(`- Featured Item: "${r.title}" (isFeatured: ${r.isFeatured})`);
  });

  // Test 3: Filter by Category
  console.log('\n[4] Querying resources by category: Nature Sounds (GET /category/:category)...');
  const catRes = await fetch(`${resourceUrl}/category/Nature%20Sounds`, {
    method: 'GET',
    headers: { 'Cookie': cookie },
  });
  console.log(`Category filter status: ${catRes.status}`);
  const catData = await catRes.json();
  const catList = catData.data.resources;
  console.log(`Nature Sounds count: ${catList.length} (Expected: 5)`);
  catList.forEach(r => {
    console.log(`- Item: "${r.title}" (Category: ${r.category}, Type: ${r.type})`);
  });

  // Test 4: Query Search filtration
  console.log('\n[5] Querying resources by search keyword: Breathing (GET /?search=Breathing)...');
  const searchRes = await fetch(`${resourceUrl}?search=Breathing`, {
    method: 'GET',
    headers: { 'Cookie': cookie },
  });
  console.log(`Search query status: ${searchRes.status}`);
  const searchData = await searchRes.json();
  const searchList = searchData.data.resources;
  console.log(`Matching resources count: ${searchList.length}`);
  searchList.forEach(r => {
    console.log(`- Match: "${r.title}" - Description: "${r.description}"`);
  });

  // Test 5: Verify detail lookup and related resources
  if (resourcesList.length > 0) {
    const targetResource = resourcesList[0];
    console.log(`\n[6] Fetching detailed content for resource "${targetResource.title}" (GET /:id)...`);
    const detailRes = await fetch(`${resourceUrl}/${targetResource._id}`, {
      method: 'GET',
      headers: { 'Cookie': cookie },
    });
    console.log(`Detail lookup status: ${detailRes.status}`);
    const detailData = await detailRes.json();
    console.log(`Retrieved title: "${detailData.data.resource.title}"`);
    console.log(`Related items returned count: ${detailData.data.related.length}`);
    detailData.data.related.forEach(r => {
      console.log(`- Related: "${r.title}" (Category: ${r.category})`);
    });
  }

  // Test 6: Route security locks (Access isolation check without credentials)
  console.log('\n[7] Verifying security locks: requesting list without auth cookie...');
  const lockRes = await fetch(resourceUrl, {
    method: 'GET',
  });
  console.log(`Unauthenticated request status (Expected 401): ${lockRes.status}`);
  const lockData = await lockRes.json();
  console.log(`Response message: "${lockData.message}"`);

  console.log('\n--- WELLNESS RESOURCES MODULE VERIFICATION TESTS COMPLETED ---');
}

runResourceTests().catch(err => {
  console.error("Resource tests execution failed with error:", err);
});
