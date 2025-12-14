import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// Create temp directory if it doesn't exist
const TEMP_DIR = path.join(__dirname, 'temp')
await fs.mkdir(TEMP_DIR, { recursive: true })

/**
 * Download video and extract audio using yt-dlp
 * @param {string} url - Video URL
 * @param {string} platform - Platform name (youtube, instagram, tiktok)
 * @returns {Promise<string>} - Path to extracted audio file
 */
export async function downloadAndExtractAudio(url, platform) {
    const timestamp = Date.now()
    const videoPath = path.join(TEMP_DIR, `video_${timestamp}`)
    const audioPath = path.join(TEMP_DIR, `audio_${timestamp}.mp3`)

    try {
        // Check if yt-dlp is installed
        try {
            await execAsync('yt-dlp --version')
        } catch (error) {
            throw new Error('yt-dlp is not installed. Please install it using: pip install yt-dlp or brew install yt-dlp')
        }

        console.log(`Downloading video from ${platform}...`)

        // Use Python script with yt-dlp library for better SSL handling
        const pythonScript = path.join(__dirname, 'download_video.py')
        const downloadCommand = `python3 "${pythonScript}" "${url}" "${videoPath}"`

        await execAsync(downloadCommand, {
            maxBuffer: 1024 * 1024 * 50 // 50MB buffer
        })

        console.log('Video downloaded successfully')

        // Find the downloaded file (yt-dlp might add extension)
        const files = await fs.readdir(TEMP_DIR)
        const downloadedFile = files.find(f => f.startsWith(`video_${timestamp}`) || f.startsWith(`audio_${timestamp}`))

        if (!downloadedFile) {
            throw new Error('Downloaded file not found')
        }

        const downloadedPath = path.join(TEMP_DIR, downloadedFile)

        // If it's already an mp3, just rename it
        if (downloadedFile.endsWith('.mp3')) {
            await fs.rename(downloadedPath, audioPath)
            return audioPath
        }

        // Otherwise, extract audio using ffmpeg
        console.log('Extracting audio...')
        await extractAudioWithFFmpeg(downloadedPath, audioPath)

        // Clean up video file
        try {
            await fs.unlink(downloadedPath)
        } catch (err) {
            console.warn('Failed to delete video file:', err.message)
        }

        return audioPath

    } catch (error) {
        // Clean up on error
        await cleanupFiles([videoPath, audioPath])
        throw new Error(`Failed to download/extract audio: ${error.message}`)
    }
}

/**
 * Extract audio from video file using ffmpeg
 */
function extractAudioWithFFmpeg(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('mp3')
            .audioBitrate('128k')
            .on('end', () => {
                console.log('Audio extraction complete')
                resolve()
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err)
                reject(err)
            })
            .save(outputPath)
    })
}

/**
 * Clean up temporary files
 */
export async function cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
        try {
            // Try to delete files with various extensions
            const extensions = ['', '.mp4', '.webm', '.mp3', '.m4a', '.wav']
            for (const ext of extensions) {
                try {
                    await fs.unlink(filePath + ext)
                } catch (err) {
                    // File doesn't exist, continue
                }
            }
        } catch (error) {
            console.warn(`Failed to cleanup file ${filePath}:`, error.message)
        }
    }
}

/**
 * Get file size in MB
 */
export async function getFileSizeMB(filePath) {
    try {
        const stats = await fs.stat(filePath)
        return stats.size / (1024 * 1024)
    } catch (error) {
        return 0
    }
}
