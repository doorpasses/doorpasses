# DoorPasses API - Quick Start Guide

Get up and running with DoorPasses API in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- A code editor (VS Code recommended)

## Step 1: Clone and Setup (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd doorpasses

# Copy environment file
cp .env.example .env

# Generate secure secrets
openssl rand -hex 32  # Use this for ACCOUNT_ID_SALT
openssl rand -hex 32  # Use this for SHARED_SECRET_SALT

# Edit .env and paste the generated secrets
nano .env
```

## Step 2: Start Services (1 minute)

```bash
# Start all services (PostgreSQL, Redis, API)
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f api
```

## Step 3: Initialize Database (1 minute)

```bash
# Run database migrations
docker-compose exec api npx prisma migrate deploy

# (Optional) Open Prisma Studio to view database
docker-compose exec api npx prisma studio
```

## Step 4: Test the API (1 minute)

```bash
# Test health endpoint
curl http://localhost:3000/health

# You should see:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "service": "DoorPasses API",
#     "version": "1.0.0",
#     "region": "MENA"
#   }
# }
```

## Step 5: Create Your First Account

For testing, you'll need to create an account in the database:

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U doorpasses -d doorpasses_db

# Create a test account
INSERT INTO accounts (id, account_id, shared_secret, name, email, tier, is_active)
VALUES (
  'test_account_001',
  '0xtest123',
  'your_shared_secret_here',
  'Test Company',
  'test@company.com',
  'ENTERPRISE',
  true
);

# Exit psql
\q
```

## Step 6: Make Your First API Call

### Create a Card Template

```bash
# Generate signature (you'll need to implement this based on the docs)
# For quick testing, here's a curl example:

curl -X POST http://localhost:3000/v1/console/card-templates \
  -H "Content-Type: application/json" \
  -H "X-ACCT-ID: 0xtest123" \
  -H "X-PAYLOAD-SIG: YOUR_GENERATED_SIGNATURE" \
  -d '{
    "name": "Employee Badge",
    "platform": "APPLE",
    "use_case": "EMPLOYEE_BADGE",
    "protocol": "DESFIRE",
    "allow_on_multiple_devices": true
  }'
```

### Issue an Access Pass

```bash
curl -X POST http://localhost:3000/v1/access-passes \
  -H "Content-Type: application/json" \
  -H "X-ACCT-ID: 0xtest123" \
  -H "X-PAYLOAD-SIG: YOUR_GENERATED_SIGNATURE" \
  -d '{
    "card_template_id": "YOUR_TEMPLATE_ID",
    "full_name": "Ahmed Al-Mansouri",
    "email": "ahmed@company.com",
    "site_code": "123",
    "card_number": "45678",
    "start_date": "2025-01-01T00:00:00Z",
    "expiration_date": "2025-12-31T23:59:59Z"
  }'
```

## Common Commands

### Development

```bash
# Start development mode with hot reload
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Docker

```bash
# View all logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# Restart API service
docker-compose restart api

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Database

```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate -- --name migration_name

# Reset database (WARNING: deletes all data)
docker-compose exec api npx prisma migrate reset
```

## Troubleshooting

### Port Already in Use

```bash
# If port 3000 is already in use, change it in .env:
PORT=3001

# Or stop the conflicting service:
lsof -ti:3000 | xargs kill
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Redis Connection Error

```bash
# Check if Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

### API Not Starting

```bash
# Check API logs
docker-compose logs api

# Rebuild API container
docker-compose up -d --build api
```

## Next Steps

1. **Read the Full Documentation**
   - [README.md](./README.md) - Complete overview
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guide

2. **Implement Authentication Helper**
   - Create a script to generate signatures
   - See `src/utils/auth.ts` for reference implementation

3. **Explore the Codebase**
   - `src/routes/` - API endpoints
   - `src/services/` - Business logic
   - `src/controllers/` - Request handlers
   - `prisma/schema.prisma` - Database schema

4. **Set Up Your IDE**
   - Install ESLint and Prettier extensions
   - Configure auto-format on save
   - Enable TypeScript checking

5. **Start Building**
   - Create card templates for your use case
   - Issue access passes to users
   - Set up webhooks for real-time updates
   - Integrate with your existing systems

## Support

- **Documentation**: See README.md and API_DOCUMENTATION.md
- **Issues**: Report bugs via issue tracker
- **Questions**: Contact api-support@doorpasses.com

## Quick Reference

| What | Command |
|------|---------|
| Start services | `docker-compose up -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Run migrations | `docker-compose exec api npx prisma migrate deploy` |
| Open database | `npm run prisma:studio` |
| Run tests | `npm test` |
| Health check | `curl http://localhost:3000/health` |

---

**Happy Building! 🚀**

Your Gateway to Digital Access Control in MENA
