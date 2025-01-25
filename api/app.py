from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import os
import uuid
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5000", "https://your-netlify-app.netlify.app"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Create static directory for audio files
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
AUDIO_DIR = os.path.join(STATIC_DIR, 'audio')

# Ensure directories exist
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

@app.route('/api/text-to-speech', methods=['POST', 'OPTIONS'])
def text_to_speech():
    """Convert text to speech in Hindi"""
    if request.method == 'OPTIONS':
        return '', 204

    try:
        logger.info("Received text-to-speech request")
        
        # Validate request data
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify({
                'error': 'Invalid request format. Please send JSON data.',
                'detail': 'Content-Type must be application/json'
            }), 400

        data = request.get_json()
        if not data:
            logger.error("No JSON data received")
            return jsonify({
                'error': 'Invalid request data',
                'detail': 'Request body is empty'
            }), 400

        text = data.get('text', '').strip()
        if not text:
            logger.error("Empty text received")
            return jsonify({
                'error': 'टेक्स्ट खाली नहीं हो सकता | Text cannot be empty',
                'detail': 'The text field must not be empty'
            }), 400

        logger.info(f"Processing text: {text[:50]}...")

        # Generate unique filename
        filename = f'speech_{uuid.uuid4()}.mp3'
        audio_path = os.path.join(AUDIO_DIR, filename)

        try:
            # Generate speech
            logger.info("Initializing gTTS")
            tts = gTTS(text=text, lang='hi', slow=False)
            
            logger.info(f"Saving audio file to {audio_path}")
            tts.save(audio_path)
            
            if not os.path.exists(audio_path):
                logger.error("Audio file was not created")
                return jsonify({
                    'error': 'Audio file generation failed',
                    'detail': 'Failed to create audio file on server'
                }), 500
            
            file_size = os.path.getsize(audio_path)
            logger.info(f"Audio file created successfully. Size: {file_size} bytes")

            try:
                response = send_file(
                    audio_path,
                    mimetype='audio/mpeg',
                    as_attachment=True,
                    download_name='speech.mp3'
                )
                response.headers['Access-Control-Allow-Origin'] = '*'
                return response
            finally:
                # Clean up in a separate try block to ensure it happens
                try:
                    if os.path.exists(audio_path):
                        os.remove(audio_path)
                        logger.info("Audio file deleted after sending")
                except Exception as cleanup_error:
                    logger.error(f"Failed to delete audio file: {cleanup_error}")

        except Exception as gtts_error:
            logger.error(f"gTTS Error: {str(gtts_error)}")
            logger.error(traceback.format_exc())
            
            # Clean up file if it exists
            if os.path.exists(audio_path):
                try:
                    os.remove(audio_path)
                except:
                    pass

            error_message = str(gtts_error).lower()
            if "429" in error_message or "too many requests" in error_message:
                return jsonify({
                    'error': 'सर्वर व्यस्त है, कृपया कुछ देर बाद प्रयास करें | Server is busy, please try again later',
                    'detail': 'Rate limit exceeded'
                }), 429
            elif "403" in error_message or "forbidden" in error_message:
                return jsonify({
                    'error': 'सेवा अनुपलब्ध है | Service unavailable',
                    'detail': 'Access forbidden'
                }), 403
            else:
                return jsonify({
                    'error': f'टेक्स्ट को स्पीच में बदलने में समस्या | Error in text to speech conversion',
                    'detail': str(gtts_error)
                }), 500

    except Exception as e:
        logger.error(f"Unexpected Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': f'अप्रत्याशित त्रुटि | Unexpected error occurred',
            'detail': str(e)
        }), 500

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Text to Speech API is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
