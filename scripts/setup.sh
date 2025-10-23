#!/bin/bash

# Juan Heart Web Application - Setup Script
# This script sets up the development environment for the Juan Heart project

set -e

echo "=========================================="
echo "Juan Heart Web Application Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is installed"
echo -e "${GREEN}✓${NC} Docker Compose is installed"
echo ""

# Copy environment files
echo "Setting up environment files..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created root .env file"
else
    echo -e "${YELLOW}!${NC} Root .env file already exists"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓${NC} Created backend .env file"
else
    echo -e "${YELLOW}!${NC} Backend .env file already exists"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✓${NC} Created frontend .env.local file"
else
    echo -e "${YELLOW}!${NC} Frontend .env.local file already exists"
fi

echo ""

# Generate Laravel application key
echo "Generating Laravel application key..."
if ! grep -q "APP_KEY=base64:" backend/.env; then
    cd backend
    php artisan key:generate
    cd ..
    echo -e "${GREEN}✓${NC} Laravel application key generated"
else
    echo -e "${YELLOW}!${NC} Laravel application key already exists"
fi

echo ""

# Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

# Install backend dependencies
echo "Installing backend dependencies..."
docker-compose exec -T backend composer install

# Run migrations
echo "Running database migrations..."
docker-compose exec -T backend php artisan migrate --force

# Seed database
echo "Seeding database..."
docker-compose exec -T backend php artisan db:seed || echo "No seeders found"

# Publish vendor assets
echo "Publishing vendor assets..."
docker-compose exec -T backend php artisan vendor:publish --tag=laravel-assets --force || true

# Install frontend dependencies (if not already installed)
echo "Installing frontend dependencies..."
docker-compose exec -T frontend npm install || true

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "🎉 Juan Heart Web Application is ready for development!"
echo ""
echo "Access your application:"
echo "  - Frontend:    http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs:    http://localhost:8000/api/documentation"
echo "  - phpMyAdmin:  http://localhost:8080"
echo "  - Mailhog:     http://localhost:8025"
echo "  - Horizon:     http://localhost:8000/horizon"
echo ""
echo "Useful commands:"
echo "  docker-compose up -d      # Start all services"
echo "  docker-compose down       # Stop all services"
echo "  docker-compose logs -f    # View logs"
echo ""
echo "For more information, see README.md"
echo ""
