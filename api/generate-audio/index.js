const { Readable } = require('stream');
const textToSpeech = require('@google-cloud/text-to-speech');

// Netlify serverless function
exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Get text from query parameter
    const text = event.queryStringParameters?.text || '';

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No text provided' })
      };
    }

    // Create gTTS instance
    const gtts = require('node-gtts')('en');
    
    // Convert text to audio buffer
    const buffer = gtts.stream(text);
    
    // Convert buffer to base64
    let audioData = '';
    const chunks = [];
    
    buffer.on('data', (chunk) => chunks.push(chunk));
    
    await new Promise((resolve, reject) => {
      buffer.on('end', resolve);
      buffer.on('error', reject);
    });
    
    const audioBuffer = Buffer.concat(chunks);
    audioData = audioBuffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mp3',
        'Content-Disposition': 'attachment; filename="audio.mp3"'
      },
      body: audioData,
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate audio' })
    };
  }
};
