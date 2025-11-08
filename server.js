const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Database setup
const dbPath = path.join(__dirname, 'database', 'jobquest.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database with schema
function initializeDatabase() {
    const initSQL = fs.readFileSync(path.join(__dirname, 'database', 'init.sql'), 'utf8');

    db.exec(initSQL, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully');
        }
    });
}

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root directory

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API Routes

// Get all jobs with their tasks
app.get('/api/jobs', (req, res) => {
    const jobsQuery = `
        SELECT id, name, status, progress, start_time, created_at, updated_at
        FROM jobs
        ORDER BY created_at DESC
    `;

    db.all(jobsQuery, [], (err, jobs) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Get tasks for each job
        const tasksQuery = `
            SELECT id, job_id, name, status, duration, task_order
            FROM tasks
            WHERE job_id = ?
            ORDER BY task_order ASC
        `;

        let completed = 0;
        const jobsWithTasks = [];

        if (jobs.length === 0) {
            res.json([]);
            return;
        }

        jobs.forEach((job, index) => {
            db.all(tasksQuery, [job.id], (err, tasks) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                jobsWithTasks.push({
                    ...job,
                    tasks: tasks || []
                });

                completed++;
                if (completed === jobs.length) {
                    res.json(jobsWithTasks);
                }
            });
        });
    });
});

// Get a specific job
app.get('/api/jobs/:id', (req, res) => {
    const jobQuery = `
        SELECT id, name, status, progress, start_time, created_at, updated_at
        FROM jobs
        WHERE id = ?
    `;

    const tasksQuery = `
        SELECT id, job_id, name, status, duration, task_order
        FROM tasks
        WHERE job_id = ?
        ORDER BY task_order ASC
    `;

    db.get(jobQuery, [req.params.id], (err, job) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        db.all(tasksQuery, [req.params.id], (err, tasks) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({
                ...job,
                tasks: tasks || []
            });
        });
    });
});

// Create a new job
app.post('/api/jobs', (req, res) => {
    const { id, name, status = 'pending', progress = 0 } = req.body;

    if (!id || !name) {
        res.status(400).json({ error: 'id and name are required' });
        return;
    }

    const query = `
        INSERT INTO jobs (id, name, status, progress, start_time)
        VALUES (?, ?, ?, ?, datetime('now'))
    `;

    db.run(query, [id, name, status, progress], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(201).json({
            id,
            name,
            status,
            progress,
            message: 'Job created successfully'
        });
    });
});

// Update a job
app.put('/api/jobs/:id', (req, res) => {
    const { name, status, progress } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
    }
    if (progress !== undefined) {
        updates.push('progress = ?');
        params.push(progress);
    }

    if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    const query = `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        res.json({ message: 'Job updated successfully' });
    });
});

// Create a task for a job
app.post('/api/jobs/:jobId/tasks', (req, res) => {
    const { id, name, status = 'pending', duration = '--', task_order = 0 } = req.body;
    const jobId = req.params.jobId;

    if (!id || !name) {
        res.status(400).json({ error: 'id and name are required' });
        return;
    }

    const query = `
        INSERT INTO tasks (id, job_id, name, status, duration, task_order)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [id, jobId, name, status, duration, task_order], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(201).json({
            id,
            job_id: jobId,
            name,
            status,
            duration,
            task_order,
            message: 'Task created successfully'
        });
    });
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    const { name, status, duration, task_order } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
    }
    if (duration !== undefined) {
        updates.push('duration = ?');
        params.push(duration);
    }
    if (task_order !== undefined) {
        updates.push('task_order = ?');
        params.push(task_order);
    }

    if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        res.json({ message: 'Task updated successfully' });
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const query = `
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM jobs
    `;

    db.get(query, [], (err, stats) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json(stats);
    });
});

// Delete a job (and its tasks via CASCADE)
app.delete('/api/jobs/:id', (req, res) => {
    const query = 'DELETE FROM jobs WHERE id = ?';

    db.run(query, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        res.json({ message: 'Job deleted successfully' });
    });
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const query = 'DELETE FROM tasks WHERE id = ?';

    db.run(query, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        res.json({ message: 'Task deleted successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Job Quest Monitor API running on http://localhost:${PORT}`);
    console.log(`View the app at http://localhost:${PORT}/index.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
