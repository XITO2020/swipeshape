#!/bin/bash

# Script to build and deploy SwipeShape app

# Build the Docker image
echo "Building Docker image..."
docker build -t swipeshape:latest .

# Run the container
echo "Starting container..."
docker run -d -p 3000:3000 \
  --env-file .env.production \
  --name swipeshape-app \
  swipeshape:latest

echo "Deployment complete! App is running at http://localhost:3000"
