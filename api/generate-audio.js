// Netlify serverless function
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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
        body: JSON.stringify({ error: 'No text provided' })
      };
    }

    // Return HTML that will automatically speak the text
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TTS</title>
          <script>
            window.onload = function() {
              const text = ${JSON.stringify(text)};
              const utterance = new SpeechSynthesisUtterance(text);
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
        'Content-Type': 'text/html',
      },
      body: html
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};
