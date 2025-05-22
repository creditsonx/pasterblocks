/**
 * Test function for API endpoints
 * This function helps diagnose if the API endpoints are working correctly
 */
export const handler = async (event, context) => {
  // Only allow this endpoint with the correct admin token or in development
  const token = event.queryStringParameters?.token;
  const adminToken = process.env.ADMIN_TOKEN;
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && (!token || token !== adminToken)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized access' })
    };
  }

  try {
    const baseUrl = process.env.URL || 'http://localhost:8888';
    const apiBase = `${baseUrl}/.netlify/functions/`;

    // Test leaderboard API endpoint
    let leaderboardResponse = null;
    let error = null;

    try {
      // We're making a request from the server side to the leaderboard function
      // This is just for testing and will tell us if the API is accessible
      const response = await fetch(`${apiBase}leaderboard`);
      const data = await response.json();

      leaderboardResponse = {
        status: response.status,
        ok: response.ok,
        data: data
      };
    } catch (fetchError) {
      error = {
        message: fetchError.message,
        stack: fetchError.stack
      };
    }

    // Check if the client might have CORS issues
    const corsInfo = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      notes: 'These are the CORS headers that should be set on API responses'
    };

    // Return results
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        apiEndpoints: {
          leaderboard: `${apiBase}leaderboard`,
          initDb: `${apiBase}init-db`,
          debugDb: `${apiBase}debug-db`
        },
        leaderboardTest: leaderboardResponse,
        error: error,
        cors: corsInfo,
        clientTroubleshooting: {
          apiUrl: '/api',
          apiRedirect: 'API requests to /api should be redirected to /.netlify/functions/',
          netlifyToml: 'Check netlify.toml for the redirect configuration',
          clientUrl: `${baseUrl}`,
          notes: 'Make sure the client is using the correct API URL and the redirects are working'
        }
      }, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'An error occurred running API tests',
        message: error.message,
        stack: error.stack
      }, null, 2)
    };
  }
};
