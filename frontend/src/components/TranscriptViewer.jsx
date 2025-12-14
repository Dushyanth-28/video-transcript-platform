import { useState } from 'react'
import { Download, Copy, Check, FileText, Search, Globe, Languages } from 'lucide-react'
import './TranscriptViewer.css'

const TranscriptViewer = ({ transcript, platform }) => {
    const [copied, setCopied] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const copyToClipboard = () => {
        const text = transcript.text || transcript.segments?.map(s => s.text).join(' ') || ''
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadTranscript = (format = 'txt') => {
        let content = ''
        const langInfo = transcript.translated ? `_en-translated` : (transcript.language ? `_${transcript.language}` : '')
        const filename = `transcript${langInfo}_${Date.now()}.${format}`

        if (format === 'txt') {
            content = transcript.text || transcript.segments?.map(s => s.text).join('\n') || ''
        } else if (format === 'srt') {
            content = generateSRT(transcript.segments || [])
        } else if (format === 'vtt') {
            content = generateVTT(transcript.segments || [])
        }

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const generateSRT = (segments) => {
        return segments.map((seg, idx) => {
            const start = formatTimeSRT(seg.start || 0)
            const end = formatTimeSRT(seg.end || 0)
            return `${idx + 1}\n${start} --> ${end}\n${seg.text}\n`
        }).join('\n')
    }

    const generateVTT = (segments) => {
        let vtt = 'WEBVTT\n\n'
        vtt += segments.map((seg, idx) => {
            const start = formatTimeVTT(seg.start || 0)
            const end = formatTimeVTT(seg.end || 0)
            return `${idx + 1}\n${start} --> ${end}\n${seg.text}\n`
        }).join('\n')
        return vtt
    }

    const formatTimeSRT = (seconds) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        const ms = Math.floor((seconds % 1) * 1000)
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`
    }

    const formatTimeVTT = (seconds) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        const ms = Math.floor((seconds % 1) * 1000)
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`
    }

    const formatTimeDisplay = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${pad(mins)}:${pad(secs)}`
    }

    const pad = (num, size = 2) => String(num).padStart(size, '0')

    const highlightText = (text) => {
        if (!searchTerm) return text
        const regex = new RegExp(`(${searchTerm})`, 'gi')
        return text.replace(regex, '<mark>$1</mark>')
    }

    const segments = transcript.segments || []
    const filteredSegments = searchTerm
        ? segments.filter(seg => seg.text.toLowerCase().includes(searchTerm.toLowerCase()))
        : segments

    return (
        <div className="transcript-viewer glass-card fade-in">
            <div className="transcript-header">
                <div className="transcript-title-group">
                    <div className="transcript-title">
                        <FileText size={24} />
                        <h2>Transcript</h2>
                    </div>
                    <div className="badges">
                        {transcript.language && (
                            <div className="badge" title={`Detected Language: ${transcript.language}`}>
                                <Globe size={14} />
                                <span>{transcript.language.toUpperCase()}</span>
                            </div>
                        )}
                        {transcript.translated && (
                            <div className="badge translated" title="Translated to English">
                                <Languages size={14} />
                                <span>Translated to English</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="transcript-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={copyToClipboard}
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <div className="download-dropdown">
                        <button className="btn btn-secondary">
                            <Download size={18} />
                            Download
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={() => downloadTranscript('txt')}>Text (.txt)</button>
                            <button onClick={() => downloadTranscript('srt')}>Subtitles (.srt)</button>
                            <button onClick={() => downloadTranscript('vtt')}>WebVTT (.vtt)</button>
                        </div>
                    </div>
                </div>
            </div>

            {segments.length > 0 && (
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search in transcript..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            )}

            <div className="transcript-content">
                {segments.length > 0 ? (
                    <div className="transcript-segments">
                        {filteredSegments.map((segment, idx) => (
                            <div key={idx} className="transcript-line">
                                {segment.start !== undefined && (
                                    <span className="timestamp">
                                        {formatTimeDisplay(segment.start)}
                                    </span>
                                )}
                                <span
                                    className="segment-text"
                                    dangerouslySetInnerHTML={{
                                        __html: highlightText(segment.text)
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="transcript-text">
                        {transcript.text || 'No transcript available'}
                    </div>
                )}
            </div>

            {searchTerm && filteredSegments.length === 0 && (
                <div className="no-results">
                    <p>No results found for "{searchTerm}"</p>
                </div>
            )}
        </div>
    )
}

export default TranscriptViewer
