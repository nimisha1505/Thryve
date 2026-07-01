async function runHabitTests() {
  const authUrl = 'http://localhost:5000/api/v1/auth';
  const habitUrl = 'http://localhost:5000/api/v1/habits';
  const moodUrl = 'http://localhost:5000/api/v1/moods';
  const timestamp = Date.now();

  // Distinct users to verify access isolation
  const userA = {
    name: 'Habit User A',
    email: `habit_user_a_${timestamp}@example.com`,
    password: 'password123',
  };

  const userB = {
    name: 'Habit User B',
    email: `habit_user_b_${timestamp}@example.com`,
    password: 'password123',
  };

  console.log('--- STARTING HABIT & GOAL MODULE VERIFICATION TESTS ---');

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

  // Test 1: Create Habits for User A
  console.log('\n[2] Creating habits for User A...');
  
  const createRes1 = await fetch(habitUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      name: 'Drink 2L Water',
      description: 'Drink water consistently throughout the day',
      frequency: 'daily',
    }),
  });
  console.log(`Create Habit 1 status: ${createRes1.status}`);
  const habit1 = await createRes1.json();
  const habitId = habit1.data.habit._id;
  console.log(`Habit 1 ID: ${habitId}`);

  const createRes2 = await fetch(habitUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      name: 'Jogging',
      description: '20 mins morning jog',
      frequency: 'weekly',
    }),
  });
  console.log(`Create Habit 2 status: ${createRes2.status}`);

  // Test 2: Toggle completion for streaks verification
  console.log('\n[3] Toggling habit completion for today, yesterday, and 2 days ago to test streaks...');
  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(0);
  const yesterdayStr = getLocalDateString(-1);
  const twoDaysAgoStr = getLocalDateString(-2);

  // Toggle today
  console.log(`Toggling today: ${todayStr}`);
  const toggleTodayRes = await fetch(`${habitUrl}/${habitId}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ date: todayStr }),
  });
  const todayData = await toggleTodayRes.json();
  console.log(`Today Toggle currentStreak: ${todayData.data.habit.currentStreak} (Expected: 1)`);

  // Toggle yesterday
  console.log(`Toggling yesterday: ${yesterdayStr}`);
  const toggleYesterdayRes = await fetch(`${habitUrl}/${habitId}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ date: yesterdayStr }),
  });
  const yesterdayData = await toggleYesterdayRes.json();
  console.log(`Yesterday Toggle currentStreak: ${yesterdayData.data.habit.currentStreak} (Expected: 2)`);

  // Toggle 2 days ago
  console.log(`Toggling 2 days ago: ${twoDaysAgoStr}`);
  const toggle2DaysAgoRes = await fetch(`${habitUrl}/${habitId}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ date: twoDaysAgoStr }),
  });
  const twoDaysAgoData = await toggle2DaysAgoRes.json();
  console.log(`2 Days Ago Toggle currentStreak: ${twoDaysAgoData.data.habit.currentStreak} (Expected: 3), longestStreak: ${twoDaysAgoData.data.habit.longestStreak} (Expected: 3)`);

  // Untoggle yesterday to break streak
  console.log(`\nUntoggling yesterday (${yesterdayStr}) to test breaking streak...`);
  const untoggleYesterdayRes = await fetch(`${habitUrl}/${habitId}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ date: yesterdayStr }),
  });
  const untoggleData = await untoggleYesterdayRes.json();
  console.log(`Broken Streak currentStreak: ${untoggleData.data.habit.currentStreak} (Expected: 1), longestStreak: ${untoggleData.data.habit.longestStreak} (Expected: 3)`);

  // Toggle yesterday back to recover streak
  console.log(`Toggling yesterday back to restore streak...`);
  await fetch(`${habitUrl}/${habitId}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ date: yesterdayStr }),
  });

  // Test 3: Log some mood data to verify correlation engine
  console.log('\n[4] Logging mood checks to seed correlation stats...');
  // Log mood = 9 today
  await fetch(moodUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ moodScore: 9, moodTags: ['Happy', 'Productive'] }),
  });
  
  // Log mood = 4 on a different day (yesterday - when habit was uncompleted but wait, we completed it. 
  // Let's create another date, e.g. 5 days ago, and log mood = 5 without completing habit.
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  await fetch(moodUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ moodScore: 5, moodTags: ['Tired'], loggedAt: fiveDaysAgo.toISOString() }),
  });

  // Test 4: Fetch analytics, correlation, and suggestions
  console.log('\n[5] Querying habit analytics dashboard info...');
  const analyticsRes = await fetch(`${habitUrl}/analytics`, {
    method: 'GET',
    headers: { 'Cookie': cookieA },
  });
  const analyticsData = await analyticsRes.json();
  console.log(`Analytics status: ${analyticsRes.status}`);
  console.log('Analytics response breakdown:', JSON.stringify(analyticsData.data, null, 2));

  console.log('\n[6] Querying habit-mood correlation analysis...');
  const correlationRes = await fetch(`${habitUrl}/correlation`, {
    method: 'GET',
    headers: { 'Cookie': cookieA },
  });
  const correlationData = await correlationRes.json();
  console.log(`Correlation status: ${correlationRes.status}`);
  console.log('Correlation response breakdown:', JSON.stringify(correlationData.data, null, 2));

  console.log('\n[7] Querying smart habit suggestions...');
  const suggestionsRes = await fetch(`${habitUrl}/suggestions`, {
    method: 'GET',
    headers: { 'Cookie': cookieA },
  });
  const suggestionsData = await suggestionsRes.json();
  console.log(`Suggestions status: ${suggestionsRes.status}`);
  console.log('Suggestions list count:', suggestionsData.data.suggestions?.length || 0);

  // Test 5: Verify access isolation (User B trying to modify User A's habit)
  console.log('\n[8] Testing access isolation: User B trying to toggle User A\'s habit...');
  const exploitRes = await fetch(`${habitUrl}/${habitId}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieB },
    body: JSON.stringify({ date: todayStr }),
  });
  console.log(`Exploit attempt status (Expected 403): ${exploitRes.status}`);

  // Test 6: Verify PUT update
  console.log('\n[9] Editing Habit details (PUT /:id)...');
  const updateRes = await fetch(`${habitUrl}/${habitId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ name: 'Hydration 2L Water', description: 'Updated water tracking goal description' }),
  });
  const updateData = await updateRes.json();
  console.log(`Updated Habit name: "${updateData.data.habit.name}"`);

  // Test 7: Verify DELETE
  console.log('\n[10] Deleting Habit (DELETE /:id)...');
  const deleteRes = await fetch(`${habitUrl}/${habitId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieA },
  });
  console.log(`Delete status: ${deleteRes.status}`);

  console.log('--- HABIT & GOAL MODULE VERIFICATION TESTS COMPLETED ---');
}

runHabitTests().catch(err => {
  console.error("Habit tests execution failed with error:", err);
});
