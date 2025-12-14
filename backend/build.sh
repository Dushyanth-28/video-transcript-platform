# Build script for Render.com
# This script installs all dependencies needed for the backend

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Install yt-dlp (if not already installed via pip)
which yt-dlp || pip install yt-dlp
