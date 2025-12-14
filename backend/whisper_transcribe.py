#!/usr/bin/env python3
"""
Whisper transcription script using faster-whisper
This script transcribes audio files and outputs JSON with segments
Supports translation to English via --translate flag
"""

import sys
import json
import argparse
from faster_whisper import WhisperModel

def transcribe_audio(audio_path, translate=False):
    """
    Transcribe audio file using faster-whisper
    
    Args:
        audio_path: Path to audio file
        translate: If True, translate to English
        
    Returns:
        dict: Transcription result with text, segments, language, and duration
    """
    try:
        # Initialize model (base model for speed, can use 'small', 'medium', 'large-v3' for better accuracy)
        # Using CPU with int8 quantization for efficiency
        model = WhisperModel("base", device="cpu", compute_type="int8")
        
        # Determine task: translate to English or just transcribe
        task = "translate" if translate else "transcribe"
        
        # Transcribe
        segments, info = model.transcribe(
            audio_path,
            task=task,
            beam_size=5,
            word_timestamps=True,
            vad_filter=True,  # Voice Activity Detection to filter out silence
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        # Collect segments
        transcript_segments = []
        full_text = []
        
        for segment in segments:
            transcript_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })
            full_text.append(segment.text.strip())
        
        # Build result
        result = {
            "text": " ".join(full_text),
            "language": info.language,
            "duration": round(info.duration, 2),
            "segments": transcript_segments,
            "translated": translate
        }
        
        # Output JSON to stdout
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "text": "",
            "segments": []
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Transcribe audio using faster-whisper')
    parser.add_argument('audio_path', help='Path to audio file')
    parser.add_argument('--translate', action='store_true', help='Translate to English')
    
    args = parser.parse_args()
    transcribe_audio(args.audio_path, args.translate)
