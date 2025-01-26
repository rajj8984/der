exports.handler = async function(event, context) {
  const body = JSON.parse(event.body);

  // Check if text is provided
  if (!body.text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Text not provided!" }),
    };
  }

  // Process text (for example, send to TTS system)
  const responseText = `You sent: ${body.text}`;

  return {
    statusCode: 200,
    body: JSON.stringify({ message: responseText }),
  };
};
