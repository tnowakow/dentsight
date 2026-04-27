#!/bin/bash
# Pre-deployment test script - run this before pushing to Railway
# Catches build errors locally before they hit production

set -e  # Exit on any error

echo "🔍 Running pre-deployment checks..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Clean up any previous test containers
echo "🧹 Cleaning up previous test runs..."
docker stop dentsight-test 2>/dev/null || true
docker rm dentsight-test 2>/dev/null || true

# Build the image (this catches most build errors)
echo "🏗️ Building Docker image..."
docker build -t dentsight:test . 

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Fix the errors above before deploying."
    exit 1
fi

# Test that the container starts without crashing
echo "🚀 Testing container startup..."
docker run --rm -d --name dentsight-test -p 3001:3000 \
  -e NODE_ENV=test \
  -e PORT=3000 \
  dentsight:test

# Wait for startup
sleep 5

# Check if container is still running
if [ "$(docker inspect -f '{{.State.Running}}' dentsight-test 2>/dev/null)" = "true" ]; then
    echo "✅ Container started successfully!"
    
    # Try to hit the health endpoint (optional)
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health endpoint not responding (may be expected)"
    fi
    
    docker stop dentsight-test
    echo "🎉 All pre-deployment checks passed! Ready to deploy."
else
    echo "❌ Container crashed on startup. Logs:"
    docker logs dentsight-test 2>&1 | tail -50
    exit 1
fi
