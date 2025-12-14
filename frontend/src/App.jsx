import { useState } from 'react'
import { Video, Loader2, Download, Copy, Check, Youtube, Instagram } from 'lucide-react'
import TranscriptViewer from './components/TranscriptViewer'
import PlatformDetector from './components/PlatformDetector'
import './App.css'

function App() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [transcript, setTranscript] = useState(null)
    const [error, setError] = useState(null)
    const [platform, setPlatform] = useState(null)
    const [translateToEnglish, setTranslateToEnglish] = useState(false)

    const detectPlatform = (videoUrl) => {
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            return 'youtube'
        } else if (videoUrl.includes('instagram.com')) {
            return 'instagram'
        } else if (videoUrl.includes('tiktok.com')) {
            return 'tiktok'
        }
        return null
    }

    const handleUrlChange = (e) => {
        const newUrl = e.target.value
        setUrl(newUrl)
        setPlatform(detectPlatform(newUrl))
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!url.trim()) {
            setError('Please enter a video URL')
            return
        }

        if (!platform) {
            setError('Please enter a valid YouTube, Instagram, or TikTok URL')
            return
        }

        setLoading(true)
        setError(null)
        setProgress(0)
        setTranscript(null)

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return 90
                }
                return prev + 10
            })
        }, 500)

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
            const response = await fetch(`${apiUrl}/api/transcribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    translate: translateToEnglish
                }),
            })

            clearInterval(progressInterval)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to transcribe video')
            }

            const data = await response.json()
            setTranscript(data)
            setProgress(100)
        } catch (err) {
            clearInterval(progressInterval)
            setError(err.message || 'An error occurred while processing the video')
            setProgress(0)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app">
            <div className="container">
                {/* Header */}
                <header className="header fade-in">
                    <div className="logo">
                        <Video size={32} />
                        <h1>Video Transcript Generator</h1>
                    </div>
                    <p className="subtitle">
                        Generate accurate AI-powered transcripts from Instagram, YouTube, and TikTok videos
                    </p>
                </header>

                {/* Main Form */}
                <div className="main-card glass-card fade-in">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="input"
                                placeholder="Paste your video URL here (YouTube, Instagram, or TikTok)"
                                value={url}
                                onChange={handleUrlChange}
                                disabled={loading}
                            />
                            {platform && <PlatformDetector platform={platform} />}
                        </div>

                        <div className="options-group">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={translateToEnglish}
                                    onChange={(e) => setTranslateToEnglish(e.target.checked)}
                                    disabled={loading}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-label">Translate to English</span>
                            </label>
                        </div>

                        {error && (
                            <div className="error-message fade-in">
                                <p>{error}</p>
                            </div>
                        )}

                        {loading && (
                            <div className="progress-container fade-in">
                                <div className="progress-info">
                                    <span className="text-muted">Processing video...</span>
                                    <span className="text-muted">{progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-large"
                            disabled={loading || !url.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="spinner" size={20} />
                                    Generating Transcript...
                                </>
                            ) : (
                                <>
                                    <Video size={20} />
                                    Generate Transcript
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Transcript Display */}
                {transcript && (
                    <TranscriptViewer transcript={transcript} platform={platform} />
                )}

                {/* Features */}
                {!transcript && !loading && (
                    <div className="features fade-in">
                        <div className="feature-card glass-card">
                            <Youtube size={24} className="feature-icon youtube" />
                            <h3>YouTube</h3>
                            <p>Extract transcripts from any public YouTube video</p>
                        </div>
                        <div className="feature-card glass-card">
                            <Instagram size={24} className="feature-icon instagram" />
                            <h3>Instagram</h3>
                            <p>Generate transcripts from Instagram Reels and videos</p>
                        </div>
                        <div className="feature-card glass-card">
                            <svg className="feature-icon tiktok" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                            <h3>TikTok</h3>
                            <p>Convert TikTok videos into searchable text</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
