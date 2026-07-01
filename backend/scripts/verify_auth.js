async function runTests() {
  const baseUrl = 'http://localhost:5000/api/v1/auth';
  const timestamp = Date.now();
  const testUser = {
    name: 'Test Verify User',
    email: `test_verify_${timestamp}@example.com`,
    password: 'password123',
    bio: 'Test bio for authentication verification',
  };

  console.log('--- STARTING AUTH VERIFICATION TESTS ---');

  // Test 1: Register User
  console.log('\n[1] POST /register - Creating User...');
  let res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  let status = res.status;
  let data = await res.json();
  console.log(`Status: ${status}`);
  console.log(`Response:`, JSON.stringify(data, null, 2));

  // Extract cookies
  let cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : res.headers.get('set-cookie');
  console.log(`Set-Cookie Headers:`, cookies);

  let accessTokenCookie = '';
  let refreshTokenCookie = '';
  if (cookies) {
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    cookieArray.forEach(c => {
      if (c.startsWith('accessToken=')) {
        accessTokenCookie = c.split(';')[0];
      }
      if (c.startsWith('refreshToken=')) {
        refreshTokenCookie = c.split(';')[0];
      }
    });
  }

  // Test 2: Register duplicate email
  console.log('\n[2] POST /register (Duplicate) - Expecting Fail (400)...');
  res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, await res.json());

  // Test 3: Login User
  console.log('\n[3] POST /login - Authenticating...');
  res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });
  console.log(`Status: ${res.status}`);
  const loginData = await res.json();
  console.log(`Response:`, JSON.stringify(loginData, null, 2));
  
  let loginCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : res.headers.get('set-cookie');
  let loginAccessCookie = '';
  let loginRefreshCookie = '';
  if (loginCookies) {
    const arr = Array.isArray(loginCookies) ? loginCookies : [loginCookies];
    arr.forEach(c => {
      if (c.startsWith('accessToken=')) loginAccessCookie = c.split(';')[0];
      if (c.startsWith('refreshToken=')) loginRefreshCookie = c.split(';')[0];
    });
  }

  // Test 4: GET /me (With valid access token)
  console.log('\n[4] GET /me (Authorized) - Expecting Profile...');
  res = await fetch(`${baseUrl}/me`, {
    method: 'GET',
    headers: {
      'Cookie': `${loginAccessCookie}; ${loginRefreshCookie}`
    }
  });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, await res.json());

  // Test 5: GET /me (Without access token)
  console.log('\n[5] GET /me (Unauthorized) - Expecting 401...');
  res = await fetch(`${baseUrl}/me`, {
    method: 'GET'
  });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, await res.json());

  // Test 6: POST /refresh (Token Rotation)
  console.log('\n[6] POST /refresh - Rotating Tokens...');
  res = await fetch(`${baseUrl}/refresh`, {
    method: 'POST',
    headers: {
      'Cookie': `${loginRefreshCookie}`
    }
  });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, await res.json());
  let refreshSetCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : res.headers.get('set-cookie');
  console.log(`Rotated Cookie Headers:`, refreshSetCookies);

  // Test 7: POST /logout - Cleaning cookies
  console.log('\n[7] POST /logout - Sign Out...');
  res = await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: {
      'Cookie': `${loginAccessCookie}; ${loginRefreshCookie}`
    }
  });
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, await res.json());
  console.log(`Set-Cookie headers from logout:`, res.headers.get('set-cookie') || res.headers.getSetCookie());
}

runTests().catch(err => {
  console.error("Test execution encountered an error:", err);
});
