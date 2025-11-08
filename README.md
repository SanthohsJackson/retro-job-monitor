# Job Quest Monitor

A retro game-inspired job monitoring system with SQLite database backend and REST API.

## Features

- SQLite database for persistent storage of jobs and tasks
- RESTful API for managing jobs and tasks
- Real-time updates every 2 seconds
- Retro gaming aesthetic with animated UI elements
- Full CRUD operations for jobs and tasks
- Docker support for easy deployment
- Health checks and auto-restart capabilities

## Project Structure

```
retro-job-monitor/
├── index.html          # Frontend UI
├── server.js           # Express API server
├── package.json        # Node.js dependencies
├── Dockerfile          # Docker container definition
├── docker-compose.yml  # Docker Compose configuration
├── .dockerignore       # Docker ignore file
├── database/
│   ├── init.sql       # Database schema and sample data
│   └── jobquest.db    # SQLite database (created automatically)
└── README.md          # This file
```

## Setup Instructions

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000/index.html`

The database will be persisted in the `./database` directory on your host machine.

**Manual Docker commands:**
```bash
# Build the image
docker build -t retro-job-monitor .

# Run the container
docker run -d -p 3000:3000 -v $(pwd)/database:/app/database --name job-monitor retro-job-monitor

# Stop and remove the container
docker stop job-monitor && docker rm job-monitor
```

### Option 2: Node.js (Local Development)

#### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework for the API
- `sqlite3` - SQLite database driver
- `nodemon` - Development tool for auto-restarting the server (optional)

#### 2. Start the Server

```bash
npm start
```

The server will:
- Start on http://localhost:3000
- Create the SQLite database automatically if it doesn't exist
- Initialize the database with the schema from `database/init.sql`
- Populate sample data (5 jobs with their tasks)

#### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000/index.html
```

## API Endpoints

### Jobs

- `GET /api/jobs` - Get all jobs with their tasks
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job
  ```json
  {
    "id": "QUEST-006",
    "name": "New Quest",
    "status": "pending",
    "progress": 0
  }
  ```
- `PUT /api/jobs/:id` - Update a job
  ```json
  {
    "status": "running",
    "progress": 50
  }
  ```
- `DELETE /api/jobs/:id` - Delete a job (also deletes associated tasks)

### Tasks

- `POST /api/jobs/:jobId/tasks` - Create a task for a job
  ```json
  {
    "id": "TASK-020",
    "name": "New Task",
    "status": "pending",
    "duration": "--",
    "task_order": 1
  }
  ```
- `PUT /api/tasks/:id` - Update a task
  ```json
  {
    "status": "completed",
    "duration": "5m 30s"
  }
  ```
- `DELETE /api/tasks/:id` - Delete a task

### Statistics

- `GET /api/stats` - Get job statistics
  ```json
  {
    "total": 5,
    "running": 3,
    "completed": 1,
    "failed": 1,
    "pending": 0
  }
  ```

## Database Schema

### Jobs Table
- `id` (TEXT, PRIMARY KEY) - Unique job identifier
- `name` (TEXT) - Job name
- `status` (TEXT) - One of: 'running', 'completed', 'failed', 'pending'
- `progress` (INTEGER) - Progress percentage (0-100)
- `start_time` (DATETIME) - When the job started
- `created_at` (DATETIME) - Record creation timestamp
- `updated_at` (DATETIME) - Last update timestamp

### Tasks Table
- `id` (TEXT, PRIMARY KEY) - Unique task identifier
- `job_id` (TEXT, FOREIGN KEY) - References jobs(id)
- `name` (TEXT) - Task name
- `status` (TEXT) - One of: 'running', 'completed', 'failed', 'pending'
- `duration` (TEXT) - Task duration (e.g., "5m 32s")
- `task_order` (INTEGER) - Order of task in the job
- `created_at` (DATETIME) - Record creation timestamp
- `updated_at` (DATETIME) - Last update timestamp

## Development

To run the server with auto-restart on file changes:

```bash
npm run dev
```

## Customization

### Adding New Jobs

You can add new jobs either:

1. Through the API:
   ```bash
   curl -X POST http://localhost:3000/api/jobs \
     -H "Content-Type: application/json" \
     -d '{"id":"QUEST-006","name":"My Quest","status":"pending","progress":0}'
   ```

2. By editing `database/init.sql` and restarting the server after deleting `database/jobquest.db`

### Modifying the UI

Edit `index.html` to customize:
- Colors and styling (CSS section)
- Update interval (default: 2000ms)
- Animation effects
- UI layout and components

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Styling**: Custom CSS with retro/pixel art aesthetic
- **Deployment**: Docker, Docker Compose

## Docker Details

### Container Features
- Based on Node.js 18 Alpine (lightweight)
- Health checks every 30 seconds
- Auto-restart on failure
- Volume mounting for database persistence
- Production-optimized build

### Environment Variables
- `NODE_ENV=production` - Set automatically in Docker

### Ports
- `3000` - HTTP server (mapped to host)

### Volumes
- `./database:/app/database` - Persists SQLite database on host

## License

MIT
