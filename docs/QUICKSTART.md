# Juan Heart Web Application - Quick Start Guide

This guide will help you get the Juan Heart Web Application up and running on your local machine in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (version 4.25+)
  - [Download for macOS](https://www.docker.com/products/docker-desktop)
  - [Download for Windows](https://www.docker.com/products/docker-desktop)
  - [Download for Linux](https://docs.docker.com/engine/install/)
- **Git** (version 2.40+)

## Quick Setup (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/juan-heart-web.git
cd juan-heart-web
```

### 2. Run the Setup Script

**For macOS/Linux:**
```bash
./scripts/setup.sh
```

**For Windows:**
```bash
# Open PowerShell or Git Bash
bash scripts/setup.sh
```

The script will:
- ✅ Create environment files
- ✅ Generate application keys
- ✅ Start Docker containers
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Seed the database

### 3. Access the Application

Once setup is complete, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js web application |
| **Backend API** | http://localhost:8000 | Laravel API |
| **API Documentation** | http://localhost:8000/api/documentation | Swagger/OpenAPI docs |
| **phpMyAdmin** | http://localhost:8080 | Database management |
| **Mailhog** | http://localhost:8025 | Email testing |
| **Horizon** | http://localhost:8000/horizon | Queue monitoring |

## Manual Setup (Alternative)

If you prefer to set up manually or encounter issues with the script:

### 1. Copy Environment Files

```bash
# Root environment
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

### 2. Generate Application Key

```bash
cd backend
php artisan key:generate
cd ..
```

### 3. Start Docker Services

```bash
docker-compose up -d
```

### 4. Install Dependencies

```bash
# Backend dependencies
docker-compose exec backend composer install

# Frontend dependencies
docker-compose exec frontend npm install
```

### 5. Run Database Migrations

```bash
docker-compose exec backend php artisan migrate --seed
```

## Development Workflow

### Starting the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Running Commands

**Backend (Laravel):**
```bash
# Run artisan commands
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed
docker-compose exec backend php artisan tinker

# Run tests
docker-compose exec backend php artisan test

# Run queue worker
docker-compose exec backend php artisan queue:work
```

**Frontend (Next.js):**
```bash
# Install new packages
docker-compose exec frontend npm install package-name

# Run type checking
docker-compose exec frontend npm run type-check

# Run linting
docker-compose exec frontend npm run lint
```

### Database Management

**Using phpMyAdmin:**
- Visit http://localhost:8080
- Server: `mysql`
- Username: `juan_heart` (or check your .env)
- Password: `secret` (or check your .env)

**Using Command Line:**
```bash
# Access MySQL CLI
docker-compose exec mysql mysql -ujuan_heart -psecret juan_heart

# Run migrations
docker-compose exec backend php artisan migrate

# Rollback migrations
docker-compose exec backend php artisan migrate:rollback

# Fresh database with seeds
docker-compose exec backend php artisan migrate:fresh --seed
```

## Common Issues & Solutions

### Docker Containers Won't Start

**Problem:** Port already in use
```
Error: Bind for 0.0.0.0:3306 failed: port is already allocated
```

**Solution:** Change the port in `.env` file
```env
DB_PORT=3307  # Instead of 3306
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Backend Shows "Connection Refused"

**Problem:** Database not ready

**Solution:** Wait for MySQL to fully start
```bash
# Check MySQL health
docker-compose ps

# Wait a few seconds, then retry
docker-compose exec backend php artisan migrate
```

### Frontend Shows Module Not Found

**Problem:** node_modules not installed

**Solution:**
```bash
docker-compose exec frontend npm install
# or
docker-compose restart frontend
```

### Permission Errors (Linux)

**Problem:** Permission denied errors

**Solution:**
```bash
# Fix Laravel storage permissions
sudo chown -R $USER:$USER backend/storage
sudo chown -R $USER:$USER backend/bootstrap/cache
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache
```

## Development Tools

### Recommended VS Code Extensions

- **Backend:**
  - Laravel Extension Pack
  - PHP Intelephense
  - PHP Debug

- **Frontend:**
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

- **General:**
  - Docker
  - GitLens
  - Thunder Client (API testing)

### API Testing

Use Thunder Client (VS Code) or Postman:

1. Import the API collection (coming soon)
2. Set base URL: `http://localhost:8000/api`
3. Add authentication token to headers

## Next Steps

Now that your development environment is ready:

1. ✅ Read [CLAUDE.md](../CLAUDE.md) for development guidelines
2. ✅ Check [TASKS.md](../TASKS.md) for the development roadmap
3. ✅ Review [CONTRIBUTING.md](../CONTRIBUTING.md) before making changes
4. ✅ Start with Milestone 2: Authentication & Authorization

## Getting Help

- **Documentation:** Check the [docs/](.) directory
- **Issues:** Create an issue on GitHub
- **Team Chat:** Join the development Slack/Discord
- **Email:** dev@juanheart.ph

## Useful Commands Cheat Sheet

```bash
# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose ps                 # List running services
docker-compose logs -f [service]  # View logs

# Laravel
php artisan serve                 # Start dev server
php artisan migrate               # Run migrations
php artisan db:seed              # Seed database
php artisan test                  # Run tests
php artisan route:list           # List all routes
php artisan tinker               # Interactive shell

# Next.js
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run lint                      # Run linter
npm run type-check               # Type checking
```

---

**Happy coding! 🚀**

For more detailed information, refer to the main [README.md](../README.md).
