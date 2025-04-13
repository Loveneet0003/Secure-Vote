#!/usr/bin/env bash
# exit on error
set -o errexit

# Install root dependencies
npm install

# Navigate to server directory
cd server

# Install server dependencies
npm install

# Go back to root
cd ..

echo "Build script completed successfully" 