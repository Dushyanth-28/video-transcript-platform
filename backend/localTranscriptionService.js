import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Transcribe audio using faster-whisper Python library
 * @param {string} audioPath - Path to audio file
 * @param {boolean} translate - Whether to translate to English
 * @returns {Promise<Object>} - Transcript with text and segments
 */
export async function transcribeWithFasterWhisper(audioPath, translate = false) {
    try {
        console.log(`Transcribing with faster-whisper${translate ? ' (with translation to English)' : ''}...`)

        // Create Python script path
        const pythonScriptPath = path.join(__dirname, 'whisper_transcribe.py')

        // Build command with optional --translate flag
        const translateFlag = translate ? '--translate' : ''
        const command = `python3 "${pythonScriptPath}" "${audioPath}" ${translateFlag}`.trim()

        // Run Python script with faster-whisper
        const { stdout, stderr } = await execAsync(
            command,
            { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
        )

        if (stderr && !stderr.includes('UserWarning')) {
            console.warn('Whisper stderr:', stderr)
        }

        // Parse JSON output from Python script
        const result = JSON.parse(stdout)

        const translationInfo = result.translated ? ' (translated to English)' : ''
        console.log(`Transcription complete! Language: ${result.language}, Duration: ${result.duration}s${translationInfo}`)

        return result

    } catch (error) {
        if (error.message.includes('python3: command not found')) {
            throw new Error('Python 3 is not installed. Please install Python 3 to use local transcription.')
        } else if (error.message.includes('No module named')) {
            throw new Error('faster-whisper is not installed. Please run: pip install faster-whisper')
        }

        throw new Error(`Transcription error: ${error.message}`)
    }
}

/**
 * Check if faster-whisper is installed
 */
export async function checkFasterWhisperInstalled() {
    try {
        await execAsync('python3 -c "import faster_whisper"')
        return true
    } catch (error) {
        return false
    }
}
