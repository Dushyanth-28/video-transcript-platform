import fs from 'fs/promises'
import { downloadAndExtractAudio, cleanupFiles, getFileSizeMB } from './videoProcessor.js'
import { transcribeWithFasterWhisper, checkFasterWhisperInstalled } from './localTranscriptionService.js'

const MAX_FILE_SIZE_MB = 25 // Whisper API limit

/**
 * Transcribe video using local faster-whisper model
 * @param {string} url - Video URL
 * @param {string} platform - Platform name
 * @param {boolean} translate - Whether to translate to English
 * @returns {Promise<Object>} - Transcript object with text and segments
 */
export async function transcribeVideo(url, platform, translate = false) {
    let audioPath = null

    try {
        // Check if faster-whisper is installed
        const isInstalled = await checkFasterWhisperInstalled()
        if (!isInstalled) {
            throw new Error(
                'faster-whisper is not installed. Please install it using:\n' +
                'pip install faster-whisper\n\n' +
                'Or install with conda:\n' +
                'conda install -c conda-forge faster-whisper'
            )
        }

        // Step 1: Download video and extract audio
        console.log('Step 1: Downloading and extracting audio...')
        audioPath = await downloadAndExtractAudio(url, platform)

        // Step 2: Check file size (informational, no hard limit for local processing)
        const fileSizeMB = await getFileSizeMB(audioPath)
        console.log(`Audio file size: ${fileSizeMB.toFixed(2)} MB`)

        // Step 3: Transcribe using local faster-whisper
        console.log('Step 2: Transcribing audio with faster-whisper (local model)...')
        const transcript = await transcribeWithFasterWhisper(audioPath, translate)

        console.log('Transcription complete!')
        return transcript

    } catch (error) {
        console.error('Transcription error:', error)
        throw error
    } finally {
        // Clean up audio file
        if (audioPath) {
            await cleanupFiles([audioPath])
        }
    }
}

/**
 * Alternative: Transcribe using AssemblyAI (for future implementation)
 */
export async function transcribeWithAssemblyAI(audioPath) {
    // TODO: Implement AssemblyAI integration
    throw new Error('AssemblyAI integration not yet implemented')
}
