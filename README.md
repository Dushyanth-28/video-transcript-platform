# Video Transcript Generator 🎥📝

A modern web platform that generates accurate AI-powered transcripts from Instagram, YouTube, and TikTok videos using **local faster-whisper model** (completely free, no API keys required!).

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![AI](https://img.shields.io/badge/AI-Local%20Whisper-orange)

## ✨ Features

- 🎯 **Multi-Platform Support**: Works with YouTube, Instagram, and TikTok
- 🤖 **Local AI Model**: Uses faster-whisper (4x faster than original Whisper!)
- 💰 **Completely Free**: No API keys, no costs, runs locally
- ⏱️ **Timestamped Transcripts**: Get precise timestamps for each segment
- 🔍 **Search Functionality**: Search within transcripts
- 📥 **Multiple Export Formats**: Download as TXT, SRT, or VTT
- 🎨 **Premium UI**: Beautiful dark mode with glassmorphism effects
- ⚡ **Fast Processing**: Optimized for quick results

## 🚀 Quick Start

### Prerequisites

- Node.js (v20 or higher)
- Python 3.x
- Homebrew (for macOS) or package manager of your choice

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd video-transcript-platform
   ```

2. **Install system dependencies**
   ```bash
   # macOS
   brew install yt-dlp ffmpeg
   
   # Or using pip for yt-dlp
   pip install yt-dlp
   ```

3. **Install faster-whisper** (local AI model)
   ```bash
   pip3 install faster-whisper
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

5. **Set up the backend**
   ```bash
   cd ../backend
   npm install
   ```

### Running the Application

1. **Start the backend server** (in one terminal)
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:3001`

2. **Start the frontend** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

> **Note**: The first time you run a transcription, faster-whisper will download the AI model (about 150MB for the base model). This only happens once.

## 📖 Usage

1. Paste a video URL from YouTube, Instagram, or TikTok
2. Click "Generate Transcript"
3. Wait for the AI to process your video
4. View, search, and download your transcript!

### Supported URL Formats

- **YouTube**: `https://www.youtube.com/watch?v=...` or `https://youtu.be/...`
- **Instagram**: `https://www.instagram.com/reel/...` or `https://www.instagram.com/p/...`
- **TikTok**: `https://www.tiktok.com/@user/video/...`

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Lucide React** - Icons
- **CSS3** - Styling with custom design system

### Backend
- **Express.js** - Web server
- **faster-whisper** - Local AI transcription (Python)
- **yt-dlp** - Video downloading
- **FFmpeg** - Audio extraction

### AI Model
- **faster-whisper** - 4x faster than original Whisper
- **CTranslate2** - Optimized inference engine
- **No API costs** - Runs completely locally

## 📁 Project Structure

```
video-transcript-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TranscriptViewer.jsx
│   │   │   ├── TranscriptViewer.css
│   │   │   ├── PlatformDetector.jsx
│   │   │   └── PlatformDetector.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── server.js
│   ├── videoProcessor.js
│   ├── transcriptionService.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## ⚙️ Configuration

### Model Selection

By default, the platform uses the **base** model for faster processing. You can change this in `backend/whisper_transcribe.py`:

```python
# Options: "tiny", "base", "small", "medium", "large-v3"
model = WhisperModel("base", device="cpu", compute_type="int8")
```

**Model sizes:**
- `tiny` - Fastest, least accurate (~75MB)
- `base` - Good balance (~150MB) **[Default]**
- `small` - Better accuracy (~500MB)
- `medium` - High accuracy (~1.5GB)
- `large-v3` - Best accuracy (~3GB)

### Performance Notes

- First run downloads the model (one-time, ~150MB for base model)
- CPU processing is optimized with int8 quantization
- For GPU acceleration, change `device="cpu"` to `device="cuda"` (requires CUDA)

## 🔧 Troubleshooting

### "yt-dlp is not installed"
Install yt-dlp using:
```bash
brew install yt-dlp  # macOS
# or
pip install yt-dlp   # Any platform
```

### "faster-whisper is not installed"
Install the Python package:
```bash
pip3 install faster-whisper
```

### "ffmpeg not found"
Install FFmpeg:
```bash
brew install ffmpeg  # macOS
# or use your package manager
```

### "Audio file is too large"
Unlike the API version, the local model has no hard file size limit! However, very large files may take longer to process.

### Video download fails
- Ensure the video is public
- Check that the URL is correct
- Some private or restricted videos may not be accessible

### Slow transcription
- Use a smaller model (tiny or base)
- Consider upgrading to a faster CPU
- For GPU acceleration, install CUDA and change device to "cuda"

## 🎨 Features in Detail

### Transcript Viewer
- **Timestamped segments**: Each line shows when it was spoken
- **Search**: Find specific words or phrases
- **Highlight**: Search results are highlighted
- **Copy**: One-click copy to clipboard

### Export Formats
- **TXT**: Plain text transcript
- **SRT**: Standard subtitle format
- **VTT**: WebVTT format for web videos

## 🚧 Future Enhancements

- [ ] Support for longer videos (chunking)
- [ ] AssemblyAI integration option
- [ ] Speaker diarization
- [ ] Multiple language support
- [ ] Batch processing
- [ ] User authentication
- [ ] Transcript history

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 💡 Tips

- Use public videos for best results
- Shorter videos (< 10 minutes) process faster
- Clear audio produces better transcripts
- Check video privacy settings if download fails

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Check the console for error messages
4. Ensure your API key is valid

---

Built with ❤️ using React, Express, and OpenAI Whisper
