import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { transcribeVideo } from './transcriptionService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://video-transcript-platform-fkj0e7hu7.vercel.app'
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Video Transcript API is running' })
})

// Main transcription endpoint
app.post('/api/transcribe', async (req, res) => {
    try {
        const { url, translate } = req.body

        if (!url) {
            return res.status(400).json({ error: 'Video URL is required' })
        }

        // Validate URL format
        const urlPattern = /^https?:\/\/.+/
        if (!urlPattern.test(url)) {
            return res.status(400).json({ error: 'Invalid URL format' })
        }

        // Detect platform
        const platform = detectPlatform(url)
        if (!platform) {
            return res.status(400).json({
                error: 'Unsupported platform. Please provide a YouTube, Instagram, or TikTok URL'
            })
        }

        const translateInfo = translate ? ' (with translation to English)' : ''
        console.log(`Processing ${platform} video${translateInfo}: ${url}`)

        // Process video and generate transcript
        const transcript = await transcribeVideo(url, platform, translate || false)

        res.json({
            success: true,
            platform,
            ...transcript
        })

    } catch (error) {
        console.error('Transcription error:', error)
        res.status(500).json({
            error: error.message || 'Failed to transcribe video',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})

// Helper function to detect platform
function detectPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube'
    } else if (url.includes('instagram.com')) {
        return 'instagram'
    } else if (url.includes('tiktok.com')) {
        return 'tiktok'
    }
    return null
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err)
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    })
})

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📝 API endpoint: http://localhost:${PORT}/api/transcribe`)
    console.log(`🤖 Using local faster-whisper model (no API key required!)`)
    console.log(`⚡ Make sure you have installed: pip install faster-whisper`)
})
