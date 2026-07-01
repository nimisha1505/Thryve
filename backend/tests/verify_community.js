import 'dotenv/config';

async function runCommunityTests() {
  const authUrl = 'http://localhost:5000/api/v1/auth';
  const communityUrl = 'http://localhost:5000/api/v1/community';
  const timestamp = Date.now();

  const testUser = {
    name: 'Community Tester',
    email: `community_tester_${timestamp}@example.com`,
    password: 'password123',
  };

  console.log('--- STARTING ANONYMOUS COMMUNITY SUPPORT FEED MODULE VERIFICATION TESTS ---');

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

  // Test 1: Share post anonymously
  console.log('\n[2] Sharing a valid post anonymously (POST /)...');
  const postPayload = {
    title: 'Finding Peace in Daily Routine',
    content: 'Today I woke up and walked 5km. It really helped clear my mind. Small achievements keep us moving forward!',
    moodTag: 'Motivation'
  };

  const createRes = await fetch(communityUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify(postPayload)
  });

  console.log(`Create post status: ${createRes.status}`);
  const createData = await createRes.json();
  const createdPost = createData.data.post;

  console.log(`Generated Anonymous Name: "${createdPost.anonymousName}"`);
  console.log(`Identity Check: userId present in response? ${createdPost.userId !== undefined ? 'FAIL' : 'PASS (Not returned)'}`);
  
  if (createdPost.title === postPayload.title && createdPost.content === postPayload.content) {
    console.log('PASS: Post successfully created with anonymized display variables.');
  } else {
    console.log('FAIL: Created post content mismatch.');
  }

  const targetPostId = createdPost._id;

  // Test 2: Verify Safety Moderation blocks personal details and inappropriate speech
  console.log('\n[3] Testing Safety Moderation Blocks (should fail with 400)...');
  
  const badPayloads = [
    {
      title: 'Contact me',
      content: 'Hey, email me at spam_user@gmail.com for help!',
      moodTag: 'Advice',
      reason: 'Email block check'
    },
    {
      title: 'Call me',
      content: 'You can call me on 123-456-7890 if you need to talk.',
      moodTag: 'Support',
      reason: 'Phone number block check'
    },
    {
      title: 'Crisis',
      content: 'I want to commit suicide right now, it is too hard.',
      moodTag: 'Anxiety',
      reason: 'Self-harm keywords block check'
    },
    {
      title: 'Hate speech',
      content: 'Those people are retards and I hate them.',
      moodTag: 'Stress',
      reason: 'Harassment/hate slurs block check'
    }
  ];

  for (const item of badPayloads) {
    const res = await fetch(communityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify(item)
    });
    const resBody = await res.json();
    console.log(`- ${item.reason} -> Status Code (Expected 400): ${res.status}, Message: "${resBody.message}"`);
    if (res.status === 400) {
      console.log(`  PASS: Blocked successfully.`);
    } else {
      console.log(`  FAIL: Safety block bypassed!`);
    }
  }

  // Test 3: Add support reactions
  console.log('\n[4] Adding reactions (POST /:id/reaction)...');
  
  const reactRes = await fetch(`${communityUrl}/${targetPostId}/reaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({ reactionType: 'support' })
  });
  console.log(`Add ❤️ Support reaction status: ${reactRes.status}`);
  const reactData = await reactRes.json();
  console.log(`Post reactions count: Support: ${reactData.data.supportCount}, Hug: ${reactData.data.hugCount}, StayStrong: ${reactData.data.stayStrongCount}`);
  
  // Add stayStrong
  await fetch(`${communityUrl}/${targetPostId}/reaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({ reactionType: 'stayStrong' })
  });

  // Test 4: Verify feed filters and sorting
  console.log('\n[5] Fetching community feed (GET /)...');
  const feedRes = await fetch(communityUrl, {
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const feedData = await feedRes.json();
  const feedPosts = feedData.data.posts;
  console.log(`Total feed items found: ${feedPosts.length}`);
  
  const feedItem = feedPosts.find(p => p._id === targetPostId);
  if (feedItem) {
    console.log(`Found target post in feed: "${feedItem.title}"`);
    console.log(`- Reaction checks: isSupported=${feedItem.isSupported}, isStayStronged=${feedItem.isStayStronged}`);
    console.log(`- Reaction counts: Support=${feedItem.supportCount}, StayStrong=${feedItem.stayStrongCount}`);
    if (feedItem.isSupported && feedItem.isStayStronged && feedItem.supportCount === 1 && feedItem.stayStrongCount === 1) {
      console.log('PASS: Reaction toggle and aggregate counters successfully checked in feed.');
    } else {
      console.log('FAIL: Reaction checks failed.');
    }
  }

  // Test 5: Add comment
  console.log('\n[6] Adding an anonymous reply comment (POST /:id/comment)...');
  const commentPayload = { content: 'That walks sound amazing! I will try to incorporate it into my morning schedule too.' };
  const commentRes = await fetch(`${communityUrl}/${targetPostId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify(commentPayload)
  });
  console.log(`Comment creation status: ${commentRes.status}`);
  const commentData = await commentRes.json();
  const createdComment = commentData.data.comment;
  console.log(`Generated Anonymous Replier Name: "${createdComment.anonymousName}"`);
  console.log(`Identity Check: userId present in comment response? ${createdComment.userId !== undefined ? 'FAIL' : 'PASS (Not returned)'}`);

  // Test 6: Get Single Post detail
  console.log('\n[7] Querying post details with comments (GET /:id)...');
  const detailRes = await fetch(`${communityUrl}/${targetPostId}`, {
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const detailData = await detailRes.json();
  const detailPost = detailData.data.post;
  const detailComments = detailData.data.comments;
  
  console.log(`Retrieved Post Title: "${detailPost.title}"`);
  console.log(`Reactions count: Support: ${detailPost.supportCount}, CommentsCount: ${detailPost.commentsCount}`);
  console.log(`Replies list count: ${detailComments.length}`);
  
  if (detailPost.commentsCount === 1 && detailComments.length === 1 && detailComments[0].content === commentPayload.content) {
    console.log('PASS: Comments list rendering and counter increments verified successfully.');
  } else {
    console.log('FAIL: Comments counter or list query check mismatch.');
  }

  // Test 7: Trending sorted query
  console.log('\n[8] Querying feed sorted by Trending (GET /?sort=trending)...');
  const trendRes = await fetch(`${communityUrl}?sort=trending`, {
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const trendData = await trendRes.json();
  const trendPosts = trendData.data.posts;
  console.log(`Trending list returned count: ${trendPosts.length}`);
  if (trendPosts.length > 0) {
    console.log(`PASS: Trending sort calculation aggregation run completed successfully.`);
  }

  // Test 8: Unlike/Unreact post
  console.log('\n[9] Unreacting to support reaction (DELETE /:id/reaction)...');
  const unreactRes = await fetch(`${communityUrl}/${targetPostId}/reaction`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({ reactionType: 'support' })
  });
  console.log(`Unreact status: ${unreactRes.status}`);
  const unreactData = await unreactRes.json();
  console.log(`Reaction count after unreacting: Support: ${unreactData.data.supportCount}`);
  
  if (unreactData.data.supportCount === 0) {
    console.log('PASS: Reaction cleanup and count decrement verified.');
  } else {
    console.log('FAIL: Reaction count decrement mismatch.');
  }

  console.log('\n--- ANONYMOUS COMMUNITY SUPPORT FEED MODULE VERIFICATION TESTS COMPLETED ---');
}

runCommunityTests().catch(err => {
  console.error("Community tests execution failed with error:", err);
});
