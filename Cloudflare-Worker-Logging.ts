export default {
  async fetch(request, env) {
    const requestBody = await request.text();
    let response;

    try {
      // Make the fetch request to the original destination
      response = await fetch(request);
    } catch (error) {
      // Capture any errors from the fetch request and log them
      response = new Response(`Error: ${error.message}`, { status: 500 });
    }

    // Read the response body
    const responseBody = await response.text();

    // Log the request and response
    const log = {
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers),
        body: requestBody,
      },
      response: {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: responseBody,
      },
    };

    // Prettify the log for readability
    const prettifiedLog = JSON.stringify(log, null, 2);

    // Send the prettified log to the R2 bucket
    const logKey = `logs/${new Date().toISOString()}.json`;
    await env.LOGS.put(logKey, prettifiedLog, {
      httpMetadata: { contentType: "application/json" },
    });

    // Return the response to the user
    return new Response(responseBody, {
      status: response.status,
      headers: response.headers,
    });
  },
};
