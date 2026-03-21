#!/usr/bin/env bash
set -o errexit

# Install ffmpeg for audio conversion
apt-get update -qq && apt-get install -y -qq ffmpeg

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input