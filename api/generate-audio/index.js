const fetch = require('node-fetch');

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

    const text = data.text;

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No text provided' })
      };
    }

    // Forward the request to Google's TTS API
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_API_KEY
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'hi-IN',
          name: 'hi-IN-Standard-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: 0,
          speakingRate: 1
        }
      })
    });

    const audioData = await response.json();

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg'
      },
      body: audioData.audioContent,
      isBase64Encoded: true
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
