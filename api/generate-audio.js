export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    // Create an audio element and use the Web Speech API
    const audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    
    // Create a MediaRecorder to capture the audio
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    // When recording is complete, send the audio file
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
      res.setHeader('Content-Type', 'audio/mp3');
      res.send(audioBlob);
    };

    // Start recording
    mediaRecorder.start();

    // Use Web Speech API to generate speech
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);

    // When speech is done, stop recording
    utterance.onend = () => {
      mediaRecorder.stop();
      audioContext.close();
    };

  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
}
