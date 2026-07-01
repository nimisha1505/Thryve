async function runMoodTests() {
  const authUrl = 'http://localhost:5000/api/v1/auth';
  const moodUrl = 'http://localhost:5000/api/v1/moods';
  const timestamp = Date.now();
  
  // Set up two distinct users to verify access isolation (User A and User B)
  const userA = {
    name: 'Mood User A',
    email: `mood_user_a_${timestamp}@example.com`,
    password: 'password123',
  };
  
  const userB = {
    name: 'Mood User B',
    email: `mood_user_b_${timestamp}@example.com`,
    password: 'password123',
  };

  console.log('--- STARTING MOOD MODULE VERIFICATION TESTS ---');

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

  console.log('\n[1] Registering and Authenticating User A and User B...');
  const cookieA = await authenticate(userA);
  const cookieB = await authenticate(userB);
  console.log('Authentication Successful.');

  // Test 1: Create Mood entries for User A (Backdate logs to simulate a streak and averages)
  console.log('\n[2] Logging mood entries for User A...');
  
  // Log 1: Logged today (Score: 8)
  const todayRes = await fetch(moodUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      moodScore: 8,
      moodTags: ['Calm', 'Productive'],
      notes: 'Felt really good today!',
    }),
  });
  console.log(`Log Today status: ${todayRes.status}`);
  const logToday = await todayRes.json();
  const entryAId = logToday.data.mood._id;
  console.log(`Logged entry ID: ${entryAId}`);

  // Log 2: Logged yesterday (Score: 6, backdated for streak verification)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayRes = await fetch(moodUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      moodScore: 6,
      moodTags: ['Tired'],
      notes: 'Busy day, felt a bit exhausted.',
      loggedAt: yesterday.toISOString(),
    }),
  });
  console.log(`Log Yesterday status: ${yesterdayRes.status}`);

  // Log 3: Logged 2 days ago (Score: 9, backdated)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  await fetch(moodUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      moodScore: 9,
      moodTags: ['Excited', 'Grateful'],
      notes: 'Outstanding day!',
      loggedAt: twoDaysAgo.toISOString(),
    }),
  });

  // Test 2: Verify getUserMoodLogs (pagination and sorting)
  console.log('\n[3] Fetching User A mood history list (GET /)...');
  const historyRes = await fetch(`${moodUrl}?page=1&limit=2`, {
    method: 'GET',
    headers: { 'Cookie': cookieA },
  });
  console.log(`History status: ${historyRes.status}`);
  const historyData = await historyRes.json();
  console.log(`Total Count in database: ${historyData.data.totalCount}`);
  console.log(`Returned page logs length: ${historyData.data.moodLogs.length} (Expected: 2)`);
  console.log(`First returned log date (should be latest/today):`, historyData.data.moodLogs[0].loggedAt);

  // Test 3: Fetch Stats Aggregations (GET /stats)
  console.log('\n[4] Fetching Stats Aggregations for User A (GET /stats)...');
  const statsRes = await fetch(`${moodUrl}/stats`, {
    method: 'GET',
    headers: { 'Cookie': cookieA },
  });
  console.log(`Stats status: ${statsRes.status}`);
  const statsData = await statsRes.json();
  console.log('Aggregation Results:', JSON.stringify(statsData.data, null, 2));

  // Test 4: Fetch Trend charts aggregates (GET /trends)
  console.log('\n[5] Fetching Trend visual aggregates for User A (GET /trends)...');
  const trendsRes = await fetch(`${moodUrl}/trends`, {
    method: 'GET',
    headers: { 'Cookie': cookieA },
  });
  console.log(`Trends status: ${trendsRes.status}`);
  const trendsData = await trendsRes.json();
  console.log('Trends Results:', JSON.stringify(trendsData.data, null, 2));

  // Test 5: Verify route protection & access isolation (Cross-user block check)
  console.log('\n[6] Testing access isolation: User B trying to fetch User A\'s log...');
  const exploitRes = await fetch(`${moodUrl}/${entryAId}`, {
    method: 'GET',
    headers: { 'Cookie': cookieB },
  });
  console.log(`Exploit request status (Expected 403): ${exploitRes.status}`);
  console.log(`Response payload:`, await exploitRes.json());

  // Test 6: Verify PUT operation
  console.log('\n[7] Editing User A\'s mood log (PUT /:id)...');
  const editRes = await fetch(`${moodUrl}/${entryAId}`, {
    method: 'POST', // Wait, routing is PUT! Let's check: yes, router.put('/:id', ...)
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      moodScore: 10,
      notes: 'Super edit! Actually felt fantastic!',
    }),
  });
  console.log(`Edit status: ${editRes.status}`);
  const editData = await editRes.json();
  console.log(`Updated notes: "${editData.data.moodLog.notes}"`);
  console.log(`Updated score: ${editData.data.moodLog.moodScore} (Expected: 10)`);

  // Test 7: Verify DELETE operation
  console.log('\n[8] Deleting User A\'s mood log (DELETE /:id)...');
  const deleteRes = await fetch(`${moodUrl}/${entryAId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieA },
  });
  console.log(`Delete status: ${deleteRes.status}`);
  console.log(`Response payload:`, await deleteRes.json());

  // Verify deletion by attempting to retrieve it
  console.log('\n[9] Attempting to retrieve deleted entry (Expecting 404)...');
  const checkDelRes = await fetch(`${moodUrl}/${entryAId}`, {
    method: 'GET',
    headers: { 'Cookie': cookieA },
  });
  console.log(`Retrieve deleted status: ${checkDelRes.status}`);
  console.log('--- MOOD MODULE VERIFICATION TESTS COMPLETED ---');
}

runMoodTests().catch(err => {
  console.error("Mood tests execution failed with error:", err);
});
