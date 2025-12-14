#!/usr/bin/env python3
"""
Video downloader with SSL error handling for TikTok and other platforms
"""
import sys
import os
import ssl
import certifi
import yt_dlp

# Force legacy SSL for OpenSSL 3.0+ compatibility with TikTok
os.environ['OPENSSL_CONF'] = '/dev/null'

def download_video(url, output_path):
    """
    Download video with SSL workarounds
    """
    # Create SSL context with legacy support
    try:
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        # Enable legacy renegotiation
        ssl_context.options |= 0x4  # OP_LEGACY_SERVER_CONNECT
    except Exception as e:
        print(f"SSL context creation warning: {e}", file=sys.stderr)
        ssl_context = None
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': output_path,
        'quiet': False,
        'no_warnings': False,
        'nocheckcertificate': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Sec-Fetch-Mode': 'navigate',
        },
        'socket_timeout': 30,
        'retries': 3,
        'fragment_retries': 3,
    }
    
    # Add referer for TikTok
    if 'tiktok.com' in url or 'vt.tiktok.com' in url:
        ydl_opts['http_headers']['Referer'] = 'https://www.tiktok.com/'
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Downloading from: {url}", file=sys.stderr)
            ydl.download([url])
            print("Download completed successfully", file=sys.stderr)
            return 0
    except Exception as e:
        print(f"Error downloading video: {str(e)}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python download_video.py <url> <output_path>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    output_path = sys.argv[2]
    
    exit_code = download_video(url, output_path)
    sys.exit(exit_code)
