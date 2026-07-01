async function runTests() {
  const authUrl = 'http://localhost:5000/api/v1/auth';
  const insightsUrl = 'http://localhost:5000/api/v1/insights';
  const moodUrl = 'http://localhost:5000/api/v1/moods';
  const journalUrl = 'http://localhost:5000/api/v1/journals';
  const timestamp = Date.now();

  const testUser = {
    name: 'AI Insights Tester',
    email: `insights_tester_${timestamp}@example.com`,
    password: 'password123',
    bio: 'User for Insights Verification'
  };

  console.log('--- STARTING AI INSIGHTS VERIFICATION TESTS ---');

  // Helper to extract cookies
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

  // 1. Authenticate User
  console.log('\n[1] Registering and Authenticating Test User...');
  let regRes = await fetch(`${authUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  if (regRes.status !== 201) {
    console.error('Failed to register user', await regRes.json());
    process.exit(1);
  }
  const cookies = getCookies(regRes);
  console.log('User registered and authenticated successfully.');

  // 2. Test route protections
  console.log('\n[2] GET /insights/summary - Authentication Protection check (No Cookies)...');
  let authRes = await fetch(`${insightsUrl}/summary`, {
    method: 'GET'
  });
  console.log(`Status (Expecting 401): ${authRes.status}`);
  if (authRes.status !== 401) {
    console.error('Test 2 Failed: Allowed access to insights summary without auth.');
    process.exit(1);
  }

  // 3. Log mock mood values & journal entries to build datasets
  console.log('\n[Prep] Generating mock mood and journal logs database data for calculations...');
  
  // Log 7 mood check-ins (simulating last 7 days scores: 8, 9, 7, 5, 8, 9, 10)
  const moodScores = [8, 9, 7, 5, 8, 9, 10];
  for (let i = 0; i < moodScores.length; i++) {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - i);
    
    await fetch(moodUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        moodScore: moodScores[i],
        moodTags: ['Calm', 'Productive'],
        notes: `Mock check-in day ${i}`,
        loggedAt: logDate.toISOString()
      })
    });
  }

  // Log 3 journals
  await fetch(journalUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookies },
    body: JSON.stringify({
      title: 'Monday Reflections',
      content: 'Reflecting on project progress and study outlines. Feeling productive.',
      moodTag: 'Productive',
      category: 'Study',
      isPinned: false
    })
  });

  await fetch(journalUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookies },
    body: JSON.stringify({
      title: 'Gratitude logs',
      content: 'I am grateful for hot mornings coffee and stable code compilers today.',
      moodTag: 'Peaceful',
      category: 'Gratitude',
      isPinned: true
    })
  });

  console.log('Mock check-ins and reflections generated.');

  // 4. Test Summary Endpoint calculations
  console.log('\n[3] GET /insights/summary - Verifying wellbeing calculations & forecast...');
  let summaryRes = await fetch(`${insightsUrl}/summary`, {
    method: 'GET',
    headers: { 'Cookie': cookies }
  });
  let summaryData = await summaryRes.json();
  console.log(`Status: ${summaryRes.status}`);
  console.log(`Summary Payload:`, JSON.stringify(summaryData.data, null, 2));

  if (summaryRes.status !== 200) {
    console.error('Test 3 Failed: Summary endpoint failed.');
    process.exit(1);
  }

  const wbScore = summaryData.data.wellbeingScore;
  console.log(`Wellbeing Score Calculated: ${wbScore} / 100`);
  if (wbScore < 0 || wbScore > 100) {
    console.error('Test 3 Failed: Wellbeing Score is out of bounds [0, 100].');
    process.exit(1);
  }

  const prediction = summaryData.data.forecast.predictedMood;
  console.log(`Forecast Prediction: ${prediction} / 10`);
  if (prediction < 1 || prediction > 10) {
    console.error('Test 3 Failed: Forecast prediction out of bounds [1, 10].');
    process.exit(1);
  }

  // 5. Test Patterns Endpoint distributions
  console.log('\n[4] GET /insights/patterns - Verifying tag & time distributions...');
  let patternsRes = await fetch(`${insightsUrl}/patterns`, {
    method: 'GET',
    headers: { 'Cookie': cookies }
  });
  let patternsData = await patternsRes.json();
  console.log(`Status: ${patternsRes.status}`);
  console.log(`Patterns Payload keys:`, Object.keys(patternsData.data));
  console.log(`Weekday averages sample:`, patternsData.data.weekdaysMapped.slice(0, 3));
  console.log(`Time-of-day blocks:`, patternsData.data.timePeriods);

  if (patternsRes.status !== 200 || !patternsData.data.commonTags || !patternsData.data.weekdaysMapped) {
    console.error('Test 4 Failed: Patterns payload key mismatch.');
    process.exit(1);
  }

  // 6. Test Recommendations Endpoint (Gemini/Mock structure check)
  console.log('\n[5] GET /insights/recommendations - Verifying recommendations structure...');
  let recRes = await fetch(`${insightsUrl}/recommendations`, {
    method: 'GET',
    headers: { 'Cookie': cookies }
  });
  let recData = await recRes.json();
  console.log(`Status: ${recRes.status}`);
  console.log(`Recommendations Output:`, JSON.stringify(recData.data, null, 2));

  if (recRes.status !== 200 || !recData.data.recommendations || !recData.data.habits || !recData.data.prompts) {
    console.error('Test 5 Failed: Recommendations output keys mismatched.');
    process.exit(1);
  }

  console.log('\n--- ALL AI INSIGHTS MODULE VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error("Test execution encountered an error:", err);
  process.exit(1);
});
