async function runTests() {
  const authUrl = 'http://localhost:5000/api/v1/auth';
  const chatUrl = 'http://localhost:5000/api/v1/chat';
  const timestamp = Date.now();

  const testUser = {
    name: 'AI Chat Tester',
    email: `chat_tester_${timestamp}@example.com`,
    password: 'password123',
    bio: 'User for Chat Verification'
  };

  console.log('--- STARTING AI COMPANION VERIFICATION TESTS ---');

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

  // 2. Test authentication protection
  console.log('\n[2] GET /chat/history - Authentication Protection check (No Cookies)...');
  let authRes = await fetch(`${chatUrl}/history`, {
    method: 'GET'
  });
  console.log(`Status (Expecting 401): ${authRes.status}`);
  if (authRes.status !== 401) {
    console.error('Test 2 Failed: Allowed access to chat history without auth.');
    process.exit(1);
  }

  // 3. Send message and test Gemini Integration & Title Generation
  console.log('\n[3] POST /chat - Sending first message (Expecting Gemini Reply & Title generation)...');
  let firstMsgRes = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      message: 'I feel extremely stressed about my exams starting tomorrow.'
    })
  });
  let firstMsgData = await firstMsgRes.json();
  console.log(`Status: ${firstMsgRes.status}`);
  console.log(`Response payload snippet:`, JSON.stringify({
    success: firstMsgData.success,
    userMessage: firstMsgData.data?.userMessage,
    assistantResponse: firstMsgData.data?.assistantResponse ? {
      role: firstMsgData.data.assistantResponse.role,
      message: firstMsgData.data.assistantResponse.message.substring(0, 100) + '...',
      conversationTitle: firstMsgData.data.assistantResponse.conversationTitle
    } : null
  }, null, 2));

  if (firstMsgRes.status !== 200 || !firstMsgData.data?.assistantResponse) {
    console.error('Test 3 Failed: Could not get response from Gemini.');
    process.exit(1);
  }

  const generatedTitle = firstMsgData.data.assistantResponse.conversationTitle;
  console.log(`Verified Generated Title: "${generatedTitle}"`);
  if (!generatedTitle || generatedTitle === 'Wellness Chat' || generatedTitle === '') {
    console.warn('Warning: Title generation returned generic or empty string, checking if model generated another title.');
  }

  // 4. Test Zod validation limits
  console.log('\n[4] POST /chat - Zod schema validation (Empty message)...');
  let emptyRes = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({ message: '' })
  });
  let emptyData = await emptyRes.json();
  console.log(`Status (Expecting 400): ${emptyRes.status}`);
  console.log(`Validation Errors:`, emptyData.errors);
  if (emptyRes.status !== 400) {
    console.error('Test 4 Failed: Accepted empty message schema.');
    process.exit(1);
  }

  // 5. Test Crisis screening check
  console.log('\n[5] POST /chat - Crisis Detection Check (Sending self-harm message)...');
  let crisisRes = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      message: 'I want to kill myself, I feel so hopeless.'
    })
  });
  let crisisData = await crisisRes.json();
  console.log(`Status: ${crisisRes.status}`);
  console.log(`Assistant Reply (Should contain hotlines):`);
  console.log(crisisData.data?.assistantResponse?.message);
  if (crisisRes.status !== 200 || !crisisData.data?.assistantResponse?.message.includes('988') || !crisisData.data?.assistantResponse?.message.includes('helpline')) {
    console.error('Test 5 Failed: Crisis detection did not trigger crisis response with helpline details.');
    process.exit(1);
  }

  // 6. Test history persistence
  console.log('\n[6] GET /chat/history - Verifying persisted history count...');
  let historyRes = await fetch(`${chatUrl}/history`, {
    method: 'GET',
    headers: { 'Cookie': cookies }
  });
  let historyData = await historyRes.json();
  console.log(`Status: ${historyRes.status}`);
  console.log(`Persisted History Count: ${historyData.data.history.length}`);
  // Should have: 1st User msg + 1st Assistant reply + Crisis User msg + Crisis assistant reply = 4 logs
  if (historyRes.status !== 200 || historyData.data.history.length !== 4) {
    console.error(`Test 6 Failed: Persisted history count mismatch (Expected 4, got ${historyData.data.history.length}).`);
    process.exit(1);
  }

  // 7. Test clear conversation history
  console.log('\n[7] DELETE /chat/history - Clearing conversation history...');
  let clearRes = await fetch(`${chatUrl}/history`, {
    method: 'DELETE',
    headers: { 'Cookie': cookies }
  });
  let clearData = await clearRes.json();
  console.log(`Status: ${clearRes.status}`);
  console.log(`Response:`, clearData);
  if (clearRes.status !== 200) {
    console.error('Test 7 Failed: Could not clear conversation history.');
    process.exit(1);
  }

  // Double check clear
  console.log('\n[Verify Clear] GET /chat/history - Confirming history is empty...');
  let verifyRes = await fetch(`${chatUrl}/history`, {
    method: 'GET',
    headers: { 'Cookie': cookies }
  });
  let verifyData = await verifyRes.json();
  console.log(`Status: ${verifyRes.status}`);
  console.log(`Remaining History Count: ${verifyData.data.history.length}`);
  if (verifyRes.status !== 200 || verifyData.data.history.length !== 0) {
    console.error('Test 7 Verify Failed: Chat logs are still present after clear request.');
    process.exit(1);
  }

  console.log('\n--- ALL AI COMPANION AUTOMATED TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error("Test execution encountered an error:", err);
  process.exit(1);
});
