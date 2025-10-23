# Juan Heart Web Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)

> **Clinical management platform for the Philippine Heart Center (PHC)** - Monitor and coordinate cardiovascular health data from the Juan Heart mobile app.

## 🎯 Project Overview

Juan Heart Web Application is a comprehensive digital cardiovascular health intelligence platform designed to bridge the gap between community-level screening and specialist care in the Philippines.

### Key Features

- 🏥 **Real-time Assessment Validation** - Clinical review and validation of AI-generated CVD risk assessments
- 🔄 **Intelligent Referral System** - Automated patient referral routing to appropriate healthcare facilities
- 📊 **Population Health Analytics** - Comprehensive dashboards for public health decision-making
- 🔒 **Enterprise Security** - HIPAA-compliant with Philippine Data Privacy Act adherence
- 📱 **Mobile Integration** - Seamless sync with Juan Heart mobile app (Flutter)
- 🌐 **Multi-facility Management** - Support for 100+ healthcare facilities nationwide

### Technology Stack

**Backend:**
- Laravel 11 (PHP 8.3+)
- MySQL 8.0 / Aurora
- Redis 7.0+
- Elasticsearch 8.0+

**Frontend:**
- Next.js 14 (App Router)
- TypeScript 5.0+
- Tailwind CSS 3.4+
- shadcn/ui components

**Infrastructure:**
- Docker & Kubernetes
- AWS (EC2, RDS, S3, CloudFront)
- GitHub Actions (CI/CD)
- Prometheus & Grafana (Monitoring)

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start Guide

This guide will help you set up the project on your local machine. **Don't worry if you're new to some of these tools** - we'll walk you through everything step by step!

---

## 📋 What You Need to Install

### Required Software (You MUST have these)

1. **PHP 8.2 or higher**
   - Download from: https://www.php.net/downloads
   - **Windows users:** Install XAMPP (includes PHP, MySQL, and phpMyAdmin): https://www.apachefriends.org/
   - **Mac users:** PHP is pre-installed, but update via Homebrew: `brew install php`

2. **Composer** (PHP package manager)
   - Download from: https://getcomposer.org/download/
   - Think of this as npm but for PHP

3. **Node.js 20 or higher** (includes npm)
   - Download from: https://nodejs.org/ (choose LTS version)
   - This is needed for the frontend

4. **MySQL 8.0 or higher** (Database)
   - **If using XAMPP:** MySQL is already included!
   - **Mac users:** Install via Homebrew: `brew install mysql`
   - **Standalone download:** https://dev.mysql.com/downloads/mysql/

### Optional Software (Makes development easier, but NOT required)

5. **Docker Desktop** (OPTIONAL - only if you want an easier setup)
   - Download from: https://www.docker.com/products/docker-desktop/
   - **What is Docker?** It automatically sets up MySQL, Redis, and other tools for you
   - **Do you need it?** No! You can use XAMPP/WAMP/MAMP or your existing MySQL setup instead

---

## 🎯 Choose Your Setup Method

We provide **TWO** ways to set up this project. Choose the one you're most comfortable with:

- **Option A:** Traditional Setup (XAMPP/WAMP + Manual MySQL) - **Recommended if you're already familiar with these tools**
- **Option B:** Docker Setup - **Easier but requires learning Docker**

---

## Option A: Traditional Setup (Using XAMPP/WAMP or existing MySQL)

**Best for:** Teammates familiar with XAMPP, WAMP, phpMyAdmin, or traditional Laravel development.

### Step 1: Clone the Project

```bash
# Open your terminal/command prompt and run:
git clone https://github.com/johnrobertdelinila/juan-heart-web.git
cd juan-heart-web
```

### Step 2: Start Your MySQL Server

- **XAMPP users:** Open XAMPP Control Panel → Start Apache and MySQL
- **WAMP users:** Start WAMP → Make sure MySQL is green/running
- **Mac Homebrew users:** `brew services start mysql`

### Step 3: Create the Database

**Option 1 - Using phpMyAdmin (Easiest):**
1. Open http://localhost/phpmyadmin (or http://localhost:8080/phpmyadmin)
2. Click "New" on the left sidebar
3. Database name: `juan_heart`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Option 2 - Using MySQL Command Line:**
```bash
mysql -u root -p
CREATE DATABASE juan_heart;
EXIT;
```

### Step 4: Set Up the Backend (Laravel)

```bash
# Navigate to backend folder
cd backend

# Install PHP dependencies (this may take a few minutes)
composer install

# Create your configuration file
cp .env.example .env

# Generate security key
php artisan key:generate
```

### Step 5: Configure Database Connection

Open the file `backend/.env` in any text editor and update these lines:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=juan_heart
DB_USERNAME=root
DB_PASSWORD=           # Leave blank if using XAMPP, or enter your MySQL password

# Important: Set these to avoid Redis errors
CACHE_STORE=file
QUEUE_CONNECTION=database
```

### Step 6: Set Up Database Tables

```bash
# Still in the backend folder, run:
php artisan migrate

# You should see messages about creating tables
# If you see "Migration table created successfully" - you're good!
```

### Step 7: Start the Laravel Server

```bash
# In the backend folder:
php artisan serve

# You should see: "Server running on [http://127.0.0.1:8000]"
# Keep this terminal window open!
```

✅ **Backend is now running!** Test it by opening http://127.0.0.1:8000 in your browser.

### Step 8: Set Up the Frontend (Next.js)

Open a **NEW** terminal window (keep the backend running in the other one):

```bash
# Navigate to frontend folder
cd frontend

# Install Node.js dependencies (this may take a few minutes)
npm install

# Create your configuration file
cp .env.example .env.local
```

### Step 9: Configure Frontend Environment

Open the file `frontend/.env.local` in any text editor and add:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:6001
NEXTAUTH_SECRET=your-secret-key-here-change-this-to-any-random-string
```

**Tip:** For `NEXTAUTH_SECRET`, you can use any random string, like: `my-super-secret-key-12345`

### Step 10: Start the Frontend Server

```bash
# Still in the frontend folder:
npm run dev

# You should see: "Ready - started server on 0.0.0.0:3000"
# Keep this terminal window open too!
```

✅ **Frontend is now running!** Open http://localhost:3000 in your browser.

### Step 11: Verify Everything Works

You should now have:
- ✅ Frontend: http://localhost:3000
- ✅ Backend API: http://127.0.0.1:8000
- ✅ phpMyAdmin: http://localhost/phpmyadmin (to view your database)

**🎉 Congratulations! Your development environment is ready!**

---

## Option B: Docker Setup (Alternative Method)

**Best for:** Teammates who want everything automated and don't want to manually configure MySQL.

### Prerequisites for Docker Setup

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. After installation, make sure Docker Desktop is running (you'll see a whale icon in your system tray)

### Step 1: Clone the Project

```bash
git clone https://github.com/johnrobertdelinila/juan-heart-web.git
cd juan-heart-web
```

### Step 2: Start Docker Services

```bash
# This will automatically set up MySQL, Redis, phpMyAdmin, and MailHog
docker-compose up -d

# Wait for about 30 seconds for everything to start
# Verify everything is running:
docker-compose ps
```

You should see these services running:
- ✅ MySQL (Database) - port 3306
- ✅ Redis (Cache) - port 6379
- ✅ PHPMyAdmin (Database manager) - port 8080
- ✅ MailHog (Email testing) - port 8025

### Step 3-10: Follow the Same Steps as Option A

Follow steps 4-10 from **Option A** above, but with these differences:

**In Step 5** (Database configuration), your `backend/.env` should have:
```env
DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=root        # Note: Password is 'root' for Docker setup
```

**Everything else is identical!**

---

## 🔄 Daily Development Workflow

After you've completed the initial setup, here's what you do each day:

### If using Traditional Setup (Option A):

```bash
# Terminal 1: Start XAMPP/WAMP MySQL (or your MySQL server)

# Terminal 2: Start Laravel backend
cd backend
php artisan serve

# Terminal 3: Start Next.js frontend
cd frontend
npm run dev
```

### If using Docker Setup (Option B):

```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start Laravel backend
cd backend
php artisan serve

# Terminal 3: Start Next.js frontend
cd frontend
npm run dev
```

---

## ❓ Common Problems and Solutions

### Problem: "composer: command not found"
**Solution:** You haven't installed Composer. Download it from https://getcomposer.org/download/

### Problem: "php artisan migrate" gives database connection error
**Solution:**
- Make sure your MySQL server is running (XAMPP/WAMP started, or Docker running)
- Check that the database `juan_heart` exists
- Verify your `backend/.env` file has correct database credentials

### Problem: "Class Redis not found"
**Solution:** Add these lines to your `backend/.env` file:
```env
CACHE_STORE=file
QUEUE_CONNECTION=database
```

### Problem: "Port 3000 is already in use"
**Solution:** Next.js will automatically use port 3001. Just use http://localhost:3001 instead.

### Problem: "npm install" takes forever or fails
**Solution:**
- Make sure you have a stable internet connection
- Try running: `npm cache clean --force` then `npm install` again

### Problem: Permission errors on Mac/Linux
**Solution:** Run this in the backend folder:
```bash
chmod -R 775 storage bootstrap/cache
```

### Problem: Docker won't start or "docker-compose: command not found"
**Solution:**
- Make sure Docker Desktop is installed and running
- On Windows: Restart Docker Desktop
- Alternative: Use Option A (Traditional Setup) instead

---

## 🆘 Need More Help?

If you're stuck or confused:
1. Check the error message carefully - it usually tells you what's wrong
2. Ask the team on Slack/Discord
3. Create an issue on GitHub with:
   - What you were trying to do
   - The exact error message
   - Screenshots if possible
   - Your operating system (Windows/Mac/Linux)

## 📦 Prerequisites

### Required Software

- **PHP** 8.3 or higher
  - Extensions: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, MySQL, Redis, GD
- **Node.js** 20 LTS or higher
- **Composer** 2.6+
- **MySQL** 8.0+ or MariaDB 10.6+
- **Redis** 7.0+
- **Docker** 24.0+ & Docker Compose 2.23+ (for containerized setup)

### Development Tools

- Git 2.40+
- Visual Studio Code (recommended) or PHPStorm
- Postman or Insomnia (API testing)
- MySQL Workbench or TablePlus (database management)

## 💻 Installation

### Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=juan_heart
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations and seeders
php artisan migrate --seed

# Install Passport for OAuth (if needed)
php artisan passport:install

# Start development server
php artisan serve
# Backend available at: http://localhost:8000
```

### Frontend Setup (Next.js)

```bash
cd frontend

# Install Node dependencies
npm install
# or
yarn install
# or
pnpm install

# Copy environment file
cp .env.example .env.local

# Configure API endpoint in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
# NEXT_PUBLIC_WS_URL=ws://localhost:6001

# Start development server
npm run dev
# Frontend available at: http://localhost:3000
```

## 🛠 Development

### Project Structure

```
juan-heart-web/
├── backend/              # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── ...
│   ├── database/
│   ├── routes/
│   └── tests/
├── frontend/             # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   └── public/
├── docker/               # Docker configurations
├── .github/              # CI/CD workflows
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

### Available Scripts

#### Backend

```bash
# Development
php artisan serve              # Start dev server
php artisan queue:work         # Start queue worker
php artisan horizon            # Start Horizon dashboard

# Database
php artisan migrate            # Run migrations
php artisan migrate:fresh --seed  # Fresh database with seeds
php artisan db:seed            # Run seeders

# Testing
php artisan test               # Run PHPUnit tests
./vendor/bin/phpstan analyse   # Static analysis

# Code Quality
./vendor/bin/pint              # Format code (Laravel Pint)
php artisan route:list         # List all routes
php artisan optimize           # Cache config, routes, views
```

#### Frontend

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production server

# Testing
npm run test                   # Run Jest tests
npm run test:e2e              # Run Playwright E2E tests
npm run lint                   # Run ESLint
npm run type-check            # TypeScript type checking

# Code Quality
npm run format                 # Format with Prettier
```

#### Docker

```bash
# Services
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f app     # View logs

# Execute commands
docker-compose exec backend php artisan migrate
docker-compose exec frontend npm run build
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/AuthenticationTest.php
```

### Frontend Testing

```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🚢 Deployment

### Production Deployment

See detailed deployment guide in [docs/deployment.md](docs/deployment.md)

**Quick deployment checklist:**

- [ ] Configure production environment variables
- [ ] Set up production database
- [ ] Configure SSL certificates
- [ ] Set up CDN (CloudFront)
- [ ] Configure monitoring and logging
- [ ] Run security audit
- [ ] Perform load testing
- [ ] Set up backup systems

### Environment Variables

#### Backend (.env)

```env
APP_NAME="Juan Heart Web"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://web.juanheart.ph

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=juan_heart_production
DB_USERNAME=your-username
DB_PASSWORD=your-password

REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password

# Add other production configs...
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_APP_NAME="Juan Heart"
NEXT_PUBLIC_API_URL=https://api.juanheart.ph/v1
NEXT_PUBLIC_WS_URL=wss://ws.juanheart.ph
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://web.juanheart.ph
```

## 📚 Documentation

### API Documentation

- [API Documentation](http://localhost:8000/api/documentation) - Swagger/OpenAPI docs (when backend is running)

### Framework Resources

- [Laravel Documentation](https://laravel.com/docs) - Backend framework
- [Next.js Documentation](https://nextjs.org/docs) - Frontend framework
- [shadcn/ui Documentation](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework

### Project Documentation

For detailed project documentation including architecture, planning, and development guides, please contact the project maintainers.

## 🤝 Contributing

We welcome contributions from the community!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Backend**: Follow PSR-12 coding standards
- **Frontend**: Follow Airbnb TypeScript/React style guide
- **Commits**: Use conventional commits format
- **Testing**: Maintain minimum 80% test coverage

## 👥 Team

### Core Team

- **Product Owner**: Philippine Heart Center
- **Technical Lead**: University of the Cordilleras DIT
- **Development Team**: UC DIT Students

### Partners

- Philippine Heart Center (PHC)
- Department of Health (DOH)
- University of the Cordilleras

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Create an issue on GitHub
- **Email**: dev@juanheart.ph
- **Slack**: Join our development Slack channel

### Reporting Bugs

Please use the GitHub issue tracker and include:

- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, versions)

## 🙏 Acknowledgments

- Philippine Heart Center for clinical expertise and partnership
- University of the Cordilleras for academic support
- Department of Health for policy guidance
- All contributors and beta testers

---

**Version**: 1.0.0
**Last Updated**: October 2025
**Status**: Active Development

---

Made with ❤️ for better cardiovascular health in the Philippines
