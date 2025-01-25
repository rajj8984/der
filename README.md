# Hindi Text-to-Speech Converter | हिंदी टेक्स्ट टू स्पीच कनवर्टर

A modern web application that converts Hindi text to speech using Google's Text-to-Speech (gTTS) service. The application features a beautiful user interface with a glass-effect design and supports Hindi text input.

## Features | विशेषताएं

- 🎯 Convert Hindi text to natural-sounding speech
- 🎨 Modern, responsive user interface
- 🌈 Beautiful gradient background with glass effect
- 📱 Mobile-friendly design
- ⚡ Fast and efficient conversion
- 🔊 Instant audio playback
- 🎭 Bilingual interface (Hindi/English)

## Prerequisites | आवश्यकताएं

Before running this application, make sure you have:

- Python 3.10 or higher
- pip (Python package manager)
- Internet connection (required for gTTS service)

## Installation | इंस्टालेशन

1. Clone this repository or download the files:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install the required packages:
```bash
pip install -r requirements.txt
```

## Usage | उपयोग

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and visit:
```
http://localhost:5000
```

3. Enter Hindi text in the text area
4. Click "टेक्स्ट को स्पीच में बदलें" to convert
5. The audio will play automatically

## API Endpoints | API एंडपॉइंट्स

### Convert Text to Speech
- **URL**: `/api/text-to-speech`
- **Method**: `POST`
- **Body**:
```json
{
    "text": "आपका टेक्स्ट यहाँ"
}
```

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**: Returns API health status

## Dependencies | डिपेंडेंसी

- Flask==2.0.1
- Werkzeug==2.0.1
- gTTS==2.5.4
- flask-cors==3.0.10
- requests==2.31.0
- click==8.1.8

## Browser Support | ब्राउज़र सपोर्ट

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Contributing | योगदान

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License | लाइसेंस

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments | आभार

- Google Text-to-Speech (gTTS) for the speech conversion service
- Tailwind CSS for the beautiful UI components
