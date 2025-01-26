// Netlify serverless function
exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (e) {
      data = event.body;
    }

    const text = data.textToSpeak || data.text;

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No text provided' })
      };
    }

    // Return HTML that will automatically speak the text
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TTS</title>
          <meta charset="utf-8">
          <script>
            window.onload = function() {
              const text = ${JSON.stringify(text)};
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              utterance.volume = 1.0;
              utterance.onend = function() {
                // Signal that speech is complete
                window.parent.postMessage('speechComplete', '*');
              };
              window.speechSynthesis.speak(utterance);
            };
          </script>
        </head>
        <body>
          <div id="text" style="display: none;">${text}</div>
        </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
      },
      body: html
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};
