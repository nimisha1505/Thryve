async function runTests() {
  const authUrl = 'http://localhost:5000/api/v1/auth';
  const journalUrl = 'http://localhost:5000/api/v1/journals';
  const timestamp = Date.now();

  const userA = {
    name: 'Journal User A',
    email: `journal_usera_${timestamp}@example.com`,
    password: 'password123',
    bio: 'User A for Journal Verification'
  };

  const userB = {
    name: 'Journal User B',
    email: `journal_userb_${timestamp}@example.com`,
    password: 'password123',
    bio: 'User B for Journal Verification'
  };

  console.log('--- STARTING JOURNAL MODULE VERIFICATION TESTS ---');

  // Helper to extract cookies from a response
  const getCookies = (res) => {
    let cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : res.headers.get('set-cookie');
    let accessToken = '';
    let refreshToken = '';
    if (cookies) {
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      cookieArray.forEach(c => {
        if (c.startsWith('accessToken=')) {
          accessToken = c.split(';')[0];
        }
        if (c.startsWith('refreshToken=')) {
          refreshToken = c.split(';')[0];
        }
      });
    }
    return `${accessToken}; ${refreshToken}`;
  };

  // Register & Login User A
  console.log('\n[Prep] Registering and Authenticating User A...');
  let regARes = await fetch(`${authUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userA)
  });
  if (regARes.status !== 201) {
    console.error('Failed to register User A', await regARes.json());
    process.exit(1);
  }
  const cookieA = getCookies(regARes);

  // Register & Login User B
  console.log('[Prep] Registering and Authenticating User B...');
  let regBRes = await fetch(`${authUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userB)
  });
  if (regBRes.status !== 201) {
    console.error('Failed to register User B', await regBRes.json());
    process.exit(1);
  }
  const cookieB = getCookies(regBRes);

  console.log('User A and User B successfully authenticated.');

  // Test 1: Create journal entry
  console.log('\n[1] POST /api/v1/journals - Creating valid entry for User A...');
  let createRes = await fetch(journalUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieA
    },
    body: JSON.stringify({
      title: 'Morning Reflections',
      content: 'Woke up feeling peaceful and refreshed today. Ready to take on new projects.',
      moodTag: 'Peaceful',
      category: 'Personal',
      isPinned: false
    })
  });
  let createData = await createRes.json();
  console.log(`Status: ${createRes.status}`);
  console.log(`Payload:`, JSON.stringify(createData, null, 2));
  
  if (createRes.status !== 201 || !createData.data?.journal) {
    console.error('Test 1 Failed: Could not create journal entry.');
    process.exit(1);
  }
  const journalId = createData.data.journal._id;

  // Test 2: Invalid payloads
  console.log('\n[2] POST /api/v1/journals - Creating entry with missing/invalid fields (Zod Validation test)...');
  let invalidRes = await fetch(journalUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieA
    },
    body: JSON.stringify({
      title: '', // Empty Title
      content: '', // Empty Content
      moodTag: '', // Empty mood
      category: 'SuperInvalidCategory'
    })
  });
  let invalidData = await invalidRes.json();
  console.log(`Status: ${invalidRes.status}`);
  console.log(`Payload:`, JSON.stringify(invalidData, null, 2));
  if (invalidRes.status !== 400) {
    console.error('Test 2 Failed: Expected 400 Bad Request for invalid schema, got', invalidRes.status);
    process.exit(1);
  }

  // Create additional journals for pagination / filtering testing
  console.log('\n[Prep] Adding more journals for pagination & filtering tests...');
  await fetch(journalUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      title: 'Study session logs',
      content: 'Studying advanced database aggregation structures for the final mock interview.',
      moodTag: 'Productive',
      category: 'Study',
      isPinned: true
    })
  });

  await fetch(journalUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      title: 'Workout session',
      content: 'Tired but finished my 5k run in record time. Health and fitness goal.',
      moodTag: 'Tired',
      category: 'Health',
      isPinned: false
    })
  });

  // Test 3: Pagination
  console.log('\n[3] GET /api/v1/journals?page=1&limit=2 - Pagination check...');
  let paginatedRes = await fetch(`${journalUrl}?page=1&limit=2`, {
    method: 'GET',
    headers: { 'Cookie': cookieA }
  });
  let paginatedData = await paginatedRes.json();
  console.log(`Status: ${paginatedRes.status}`);
  console.log(`Response summary: Found ${paginatedData.data.journals.length} items, total count = ${paginatedData.data.totalCount}`);
  if (paginatedRes.status !== 200 || paginatedData.data.journals.length !== 2 || paginatedData.data.totalCount !== 3) {
    console.error('Test 3 Failed: Pagination values mismatched.');
    process.exit(1);
  }

  // Test 4: Search title/content
  console.log('\n[4] GET /api/v1/journals?search=aggregation - Search keyword check...');
  let searchRes = await fetch(`${journalUrl}?search=aggregation`, {
    method: 'GET',
    headers: { 'Cookie': cookieA }
  });
  let searchData = await searchRes.json();
  console.log(`Status: ${searchRes.status}`);
  console.log(`Items found:`, searchData.data.journals.map(j => j.title));
  if (searchRes.status !== 200 || searchData.data.journals.length !== 1 || !searchData.data.journals[0].title.includes('Study')) {
    console.error('Test 4 Failed: Search failed to filter results properly.');
    process.exit(1);
  }

  // Test 5: Category and Mood Filters
  console.log('\n[5] GET /api/v1/journals?category=Health&moodTag=Tired - Filters check...');
  let filterRes = await fetch(`${journalUrl}?category=Health&moodTag=Tired`, {
    method: 'GET',
    headers: { 'Cookie': cookieA }
  });
  let filterData = await filterRes.json();
  console.log(`Status: ${filterRes.status}`);
  console.log(`Items found:`, filterData.data.journals.map(j => j.title));
  if (filterRes.status !== 200 || filterData.data.journals.length !== 1 || filterData.data.journals[0].category !== 'Health') {
    console.error('Test 5 Failed: Category/mood filters failed.');
    process.exit(1);
  }

  // Test 6: Ownership boundaries (User B attempting to view, modify or delete User A's journal)
  console.log('\n[6] GET /api/v1/journals/:id - Ownership Protection check (User B fetching User A\'s journal)...');
  let ownerGetRes = await fetch(`${journalUrl}/${journalId}`, {
    method: 'GET',
    headers: { 'Cookie': cookieB }
  });
  let ownerGetData = await ownerGetRes.json();
  console.log(`Fetch User A entry by User B - Status: ${ownerGetRes.status}`);
  console.log(`Response:`, ownerGetData);
  if (ownerGetRes.status !== 403) {
    console.error('Test 6 Failed: Expected 403 Forbidden for unauthorized access, got', ownerGetRes.status);
    process.exit(1);
  }

  console.log('\n[6b] PUT /api/v1/journals/:id - Ownership Protection check (User B modifying User A\'s journal)...');
  let ownerPutRes = await fetch(`${journalUrl}/${journalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieB
    },
    body: JSON.stringify({
      title: 'Hacked Title',
      content: 'Hacked content.',
      moodTag: 'Sad',
      category: 'Other'
    })
  });
  console.log(`Modify User A entry by User B - Status: ${ownerPutRes.status}`);
  if (ownerPutRes.status !== 403) {
    console.error('Test 6b Failed: Expected 403 Forbidden on update, got', ownerPutRes.status);
    process.exit(1);
  }

  // Test 7: Update Journal entry by author
  console.log('\n[7] PUT /api/v1/journals/:id - Author updating entry...');
  let updateRes = await fetch(`${journalUrl}/${journalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieA
    },
    body: JSON.stringify({
      title: 'Morning Reflections (Updated)',
      content: 'Refined my reflection. Today is going to be incredibly productive.',
      moodTag: 'Productive',
      category: 'Gratitude'
    })
  });
  let updateData = await updateRes.json();
  console.log(`Status: ${updateRes.status}`);
  console.log(`Updated title:`, updateData.data.journal.title);
  console.log(`Updated mood:`, updateData.data.journal.moodTag);
  if (updateRes.status !== 200 || updateData.data.journal.title !== 'Morning Reflections (Updated)') {
    console.error('Test 7 Failed: Entry could not be updated.');
    process.exit(1);
  }

  // Test 8: Pin / Unpin
  console.log('\n[8] PATCH /api/v1/journals/:id/pin - Toggling Pin status...');
  let pinRes = await fetch(`${journalUrl}/${journalId}/pin`, {
    method: 'PATCH',
    headers: { 'Cookie': cookieA }
  });
  let pinData = await pinRes.json();
  console.log(`Pin status returned:`, pinData.data.journal.isPinned);
  if (pinRes.status !== 200 || pinData.data.journal.isPinned !== true) {
    console.error('Test 8 Failed: Could not toggle pin status.');
    process.exit(1);
  }

  // Test 9: Stats Endpoint
  console.log('\n[9] GET /api/v1/journals/stats - Fetching metrics stats...');
  let statsRes = await fetch(`${journalUrl}/stats`, {
    method: 'GET',
    headers: { 'Cookie': cookieA }
  });
  let statsData = await statsRes.json();
  console.log(`Status: ${statsRes.status}`);
  console.log(`Stats Payload:`, JSON.stringify(statsData.data, null, 2));
  if (statsRes.status !== 200 || statsData.data.totalJournals !== 3) {
    console.error('Test 9 Failed: Stats metrics mismatch.');
    process.exit(1);
  }

  // Test 10: Analytics Endpoint
  console.log('\n[10] GET /api/v1/journals/analytics - Fetching Recharts analytics data...');
  let analyticsRes = await fetch(`${journalUrl}/analytics`, {
    method: 'GET',
    headers: { 'Cookie': cookieA }
  });
  let analyticsData = await analyticsRes.json();
  console.log(`Status: ${analyticsRes.status}`);
  console.log(`Analytics keys returned:`, Object.keys(analyticsData.data));
  if (analyticsRes.status !== 200 || !analyticsData.data.categoryDistribution || !analyticsData.data.heatmapData) {
    console.error('Test 10 Failed: Analytics output key mismatch.');
    process.exit(1);
  }

  // Test 11: Delete Journal
  console.log('\n[11] DELETE /api/v1/journals/:id - Deleting journal entry...');
  let deleteRes = await fetch(`${journalUrl}/${journalId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieA }
  });
  let deleteData = await deleteRes.json();
  console.log(`Status: ${deleteRes.status}`);
  console.log(`Response:`, deleteData);
  if (deleteRes.status !== 200) {
    console.error('Test 11 Failed: Could not delete journal entry.');
    process.exit(1);
  }

  // Confirm delete verify
  console.log('\n[Verify Delete] GET /api/v1/journals/:id - Expecting 404...');
  let verifyRes = await fetch(`${journalUrl}/${journalId}`, {
    method: 'GET',
    headers: { 'Cookie': cookieA }
  });
  console.log(`Verify delete status: ${verifyRes.status}`);
  if (verifyRes.status !== 404) {
    console.error('Test 11 Verify Failed: Entry is still accessible, status =', verifyRes.status);
    process.exit(1);
  }

  console.log('\n--- ALL AUTOMATED JOURNAL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error("Verification test execution encountered an error:", err);
  process.exit(1);
});
