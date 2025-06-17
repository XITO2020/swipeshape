#!/usr/bin/env bash

echo "Building Docker image..."
docker build -t swipeshape:latest .

echo "Starting container..."
docker run -d \
  -p 8080:3000 \                # expose 3000 du conteneur sur 8080 de la VM
  --env-file .env \             # charge ton .env existant
  --name swipeshape-app \
  swipeshape:latest

echo "Done! App is running at http://localhost:8080 (ou http://91.99.110.166:8080 en prod)"
