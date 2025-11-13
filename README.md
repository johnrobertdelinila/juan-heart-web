# Juan Heart Web Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)

> Clinical management platform for the Philippine Heart Center (PHC) - Monitor and coordinate cardiovascular health data from the Juan Heart mobile app.

## Overview

Comprehensive digital cardiovascular health intelligence platform for the Philippines.

### Key Features
- 🏥 Real-time assessment validation and clinical review of AI-generated CVD risk assessments
- 🔄 Intelligent referral system routing patients to appropriate healthcare facilities
- 📊 Population health analytics for public health decision-making
- 🔒 Enterprise security (HIPAA-compliant, Philippine Data Privacy Act adherence)
- 📱 Seamless sync with Juan Heart mobile app (Flutter)
- 🌐 Multi-facility management supporting 100+ healthcare facilities nationwide

### Technology Stack
**Backend:** Laravel 11 | PHP 8.3+ | MySQL 8.0 | Redis 7.0+ | Elasticsearch 8.0+
**Frontend:** Next.js 14 (App Router) | TypeScript 5.0+ | Tailwind CSS 3.4+ | shadcn/ui
**Infrastructure:** Docker | Kubernetes | AWS (EC2, RDS, S3, CloudFront) | GitHub Actions | Prometheus & Grafana

---

## Prerequisites

### Required Software
- **PHP 8.2+** (Download: https://www.php.net/downloads | Windows: XAMPP https://www.apachefriends.org/ | Mac: `brew install php`)
- **Composer** (Download: https://getcomposer.org/download/)
- **Node.js 20+** (Download: https://nodejs.org/ - LTS version)
- **MySQL 8.0+** (Included in XAMPP | Mac: `brew install mysql` | Download: https://dev.mysql.com/downloads/mysql/)

### Optional
- **Docker Desktop** (Download: https://www.docker.com/products/docker-desktop/ - recommended for consistent setup)

---

## Quick Start

### Option A: Traditional Setup (XAMPP/WAMP)

#### 1. Clone & Start MySQL
```bash
git clone https://github.com/johnrobertdelinila/juan-heart-web.git
cd juan-heart-web
```
Start XAMPP/WAMP → Enable Apache and MySQL

#### 2. Create Database
Via phpMyAdmin (http://localhost/phpmyadmin):
- Click "New" → Database name: `juan_heart` → Collation: `utf8mb4_unicode_ci` → Create

Or via command line:
```bash
mysql -u root -p
CREATE DATABASE juan_heart;
EXIT;
```

#### 3. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=juan_heart
DB_USERNAME=root
DB_PASSWORD=          # Leave blank for XAMPP or enter MySQL password

CACHE_STORE=file
QUEUE_CONNECTION=database
```

```bash
php artisan migrate --seed
php artisan serve  # Backend available at http://127.0.0.1:8000
```

#### 4. Frontend Setup
Open new terminal:
```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:6001
NEXTAUTH_SECRET=your-random-secret-key-here
```

```bash
npm run dev  # Frontend available at http://localhost:3000
```

---

### Option B: Docker Setup (Recommended)

Provides consistent, reliable setup with automatic database persistence and health checks.

#### Prerequisites
Install Docker Desktop (https://www.docker.com/products/docker-desktop/) and ensure it's running.

#### Quick Start
```bash
git clone https://github.com/johnrobertdelinila/juan-heart-web.git
cd juan-heart-web
./start-docker.sh  # Automated startup: stops conflicts, starts containers, runs migrations, checks health
```

After script completes, open:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Health Check:** http://localhost:8000/api/v1/health

#### Monitoring
```bash
./health-check.sh  # Check status of all services
```

Shows: Docker container status | Database connectivity | Redis connectivity | API health | Table count

#### Troubleshooting Docker
```bash
# Script not executable
chmod +x start-docker.sh health-check.sh
./start-docker.sh

# Port conflicts
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
./start-docker.sh

# Database connection errors
docker-compose restart
# Or full reset
docker-compose down
./start-docker.sh

# View logs
docker-compose logs -f           # All services
docker-compose logs -f backend   # Specific service
```

---

## Development Workflow

### Daily Development

**Docker Setup:**
```bash
./start-docker.sh           # Start everything
./health-check.sh           # Check status anytime
docker-compose logs -f      # View logs
docker-compose down         # Stop when done
```

**Traditional Setup:**
```bash
# Terminal 1: Start XAMPP/WAMP MySQL
# Terminal 2: Backend
cd backend && php artisan serve
# Terminal 3: Frontend
cd frontend && npm run dev
```

---

## Common Issues

### "composer: command not found"
Install Composer from https://getcomposer.org/download/

### "php artisan migrate" database connection error
- Ensure MySQL is running (XAMPP/WAMP started or Docker running)
- Verify database `juan_heart` exists
- Check `backend/.env` credentials are correct

### "Class Redis not found"
Add to `backend/.env`:
```env
CACHE_STORE=file
QUEUE_CONNECTION=database
```

### "Port 3000 already in use"
Next.js will auto-use port 3001. Use http://localhost:3001 instead.

### "npm install" slow/fails
- Ensure stable internet connection
- Try: `npm cache clean --force` then `npm install` again

### Permission errors (Mac/Linux)
```bash
cd backend
chmod -R 775 storage bootstrap/cache
```

### Docker won't start
- Ensure Docker Desktop is installed and running
- Restart Docker Desktop
- Alternative: Use Option A (Traditional Setup)

---

## Project Structure

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
└── docs/                 # Documentation
```

---

## Available Commands

### Backend
```bash
php artisan serve              # Start dev server
php artisan migrate            # Run migrations
php artisan migrate:fresh --seed  # Fresh database with seeds
php artisan test               # Run tests
./vendor/bin/pint              # Format code
php artisan optimize           # Cache config/routes/views
```

### Frontend
```bash
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production server
npm run test                   # Run tests
npm run lint                   # Run ESLint
npm run type-check            # TypeScript checking
npm run format                 # Format with Prettier
```

### Docker
```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f app     # View logs
docker-compose exec backend php artisan migrate  # Execute commands
```

---

## Testing

**Backend:**
```bash
cd backend
php artisan test                              # All tests
php artisan test --testsuite=Feature          # Feature tests only
php artisan test --coverage                   # With coverage
```

**Frontend:**
```bash
cd frontend
npm run test                                  # Unit tests
npm run test:e2e                              # E2E tests
npm run test:coverage                         # Coverage report
```

---

## Documentation

- **API Documentation:** http://localhost:8000/api/documentation (when backend running)
- **Laravel Documentation:** https://laravel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **shadcn/ui Documentation:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Team

**Core Team:** Philippine Heart Center | University of the Cordilleras DIT | UC DIT Students
**Partners:** Philippine Heart Center (PHC) | Department of Health (DOH) | University of the Cordilleras

---

## Support

**Documentation:** Check [docs/](docs/) directory
**Issues:** Create issue on GitHub
**Email:** dev@juanheart.ph

When reporting bugs, include: Bug description | Steps to reproduce | Expected vs actual behavior | Screenshots | Environment (OS, browser, versions)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Version:** 1.0.0 | **Last Updated:** October 2025 | **Status:** Active Development

Made with ❤️ for better cardiovascular health in the Philippines
