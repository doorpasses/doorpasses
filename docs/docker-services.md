# Docker Services for Local Development

The Epic Stack uses Docker Compose to manage local development services,
ensuring offline development capabilities without manual service setup.

## Services Included

### MongoDB

- **Purpose**: Database for Payload CMS
- **Port**: 27017
- **Database**: `epic-cms`
- **Connection String**: `mongodb://localhost:27017/epic-cms`

## Prerequisites

1. **Docker Desktop** must be installed:
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **Docker Desktop must be running** before starting development

## Automatic Startup

Docker services start automatically when you run:

```bash
npm run dev
```

The dev script will:

1. Check if Docker is installed and running
2. Start MongoDB container in the background
3. Wait for MongoDB to be healthy
4. Start all application services

## Manual Control

If you need to manage Docker services separately:

```bash
# Start services
npm run dev:services

# Stop services
npm run dev:services:stop

# View logs
npm run dev:services:logs
```

## Direct Docker Commands

You can also use Docker Compose directly:

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Restart a service
docker compose restart mongodb
```

## Troubleshooting

### Docker Not Installed

```
❌ Docker is not installed.
   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
```

**Solution**: Install Docker Desktop and restart your terminal.

### Docker Not Running

```
❌ Docker is not running.
   Please start Docker Desktop and try again.
```

**Solution**: Open Docker Desktop application and wait for it to start.

### MongoDB Connection Issues

If the CMS can't connect to MongoDB:

1. Check if MongoDB is running:

   ```bash
   docker compose ps
   ```

2. Check MongoDB logs:

   ```bash
   npm run dev:services:logs
   ```

3. Restart MongoDB:

   ```bash
   docker compose restart mongodb
   ```

4. Reset MongoDB (deletes all data):
   ```bash
   docker compose down -v
   npm run dev:services
   ```

### Port Already in Use

If port 27017 is already in use:

1. Find what's using the port:

   ```bash
   lsof -i :27017
   ```

2. Stop the conflicting service or change the port in `docker-compose.yml`:

   ```yaml
   ports:
     - '27018:27017' # Use 27018 instead
   ```

3. Update connection string in `.env` files:
   ```
   MONGODB_URI=mongodb://localhost:27018/epic-cms
   ```

## Data Persistence

MongoDB data is stored in a Docker volume named `mongo-data`. This means:

- Data persists between container restarts
- Data survives `docker compose down`
- Data is deleted with `docker compose down -v` (volume flag)

## Production vs Development

- **Development**: Uses Docker Compose with local MongoDB
- **Production**: Uses managed MongoDB service (MongoDB Atlas, etc.)

Configure production MongoDB via environment variables in your deployment
platform.

## Offline Development

Once Docker images are pulled, you can develop completely offline:

- MongoDB runs locally in Docker
- No external service dependencies
- All data stored locally

First-time setup requires internet to pull Docker images (~400MB for MongoDB).
