#!/bin/bash

# Xander Lab Frontend - Docker Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="xander-lab-frontend"
CONTAINER_NAME="xander-lab-frontend"
PORT=30001
ENVIRONMENT=${1:-production}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Xander Lab Frontend Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Warning: Docker Compose is not installed${NC}"
    echo -e "${YELLOW}Falling back to docker commands${NC}"
    USE_COMPOSE=false
else
    USE_COMPOSE=true
fi

echo -e "${YELLOW}Step 1: Stopping existing container...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo -e "${YELLOW}Step 2: Building Docker image...${NC}"
if [ "$USE_COMPOSE" = true ]; then
    docker-compose build --no-cache
else
    docker build -t $IMAGE_NAME:latest .
fi

echo -e "${YELLOW}Step 3: Starting container...${NC}"
if [ "$USE_COMPOSE" = true ]; then
    docker-compose up -d
else
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:$PORT \
        -e NODE_ENV=$ENVIRONMENT \
        $IMAGE_NAME:latest
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Container Name: ${GREEN}$CONTAINER_NAME${NC}"
echo -e "Port: ${GREEN}$PORT${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo ""
echo -e "Access your application at: ${GREEN}http://localhost:$PORT${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:        ${GREEN}docker logs -f $CONTAINER_NAME${NC}"
echo -e "  Stop container:   ${GREEN}docker stop $CONTAINER_NAME${NC}"
echo -e "  Restart:          ${GREEN}docker restart $CONTAINER_NAME${NC}"
echo -e "  Remove:           ${GREEN}docker rm -f $CONTAINER_NAME${NC}"
echo ""

# Wait for container to be healthy
echo -e "${YELLOW}Waiting for container to be healthy...${NC}"
sleep 5

# Check container status
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✓ Container is running${NC}"
    
    # Test the endpoint
    if curl -f http://localhost:$PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is responding${NC}"
    else
        echo -e "${YELLOW}⚠ Application may still be starting up${NC}"
    fi
else
    echo -e "${RED}✗ Container failed to start${NC}"
    echo -e "${RED}Check logs with: docker logs $CONTAINER_NAME${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
