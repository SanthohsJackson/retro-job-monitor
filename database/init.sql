-- Job Quest Monitor Database Schema

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'failed', 'pending')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'failed', 'pending')),
    duration TEXT NOT NULL DEFAULT '--',
    task_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Insert sample jobs
INSERT INTO jobs (id, name, status, progress, start_time) VALUES
('QUEST-001', 'Data Dragon Slayer', 'running', 65, datetime('now', '-1 hour')),
('QUEST-002', 'Backup Fortress', 'completed', 100, datetime('now', '-2 hours')),
('QUEST-003', 'AI Wizard Training', 'running', 32, datetime('now', '-30 minutes')),
('QUEST-004', 'Report Scroll Generation', 'failed', 78, datetime('now', '-90 minutes')),
('QUEST-005', 'Database Dungeon Crawler', 'running', 45, datetime('now', '-45 minutes'));

-- Insert sample tasks for QUEST-001
INSERT INTO tasks (id, job_id, name, status, duration, task_order) VALUES
('TASK-001', 'QUEST-001', 'Extract Magic Stones', 'completed', '5m 32s', 1),
('TASK-002', 'QUEST-001', 'Transform Artifacts', 'running', '12m 15s', 2),
('TASK-003', 'QUEST-001', 'Store in Vault', 'pending', '--', 3),
('TASK-004', 'QUEST-001', 'Verify Power Level', 'pending', '--', 4);

-- Insert sample tasks for QUEST-002
INSERT INTO tasks (id, job_id, name, status, duration, task_order) VALUES
('TASK-005', 'QUEST-002', 'Compress Treasures', 'completed', '8m 45s', 1),
('TASK-006', 'QUEST-002', 'Transport to Cloud Castle', 'completed', '15m 22s', 2),
('TASK-007', 'QUEST-002', 'Verify Inventory', 'completed', '3m 10s', 3);

-- Insert sample tasks for QUEST-003
INSERT INTO tasks (id, job_id, name, status, duration, task_order) VALUES
('TASK-008', 'QUEST-003', 'Gather Spell Books', 'completed', '2m 18s', 1),
('TASK-009', 'QUEST-003', 'Practice Magic', 'running', '45m 07s', 2),
('TASK-010', 'QUEST-003', 'Test Abilities', 'pending', '--', 3),
('TASK-011', 'QUEST-003', 'Graduate Ceremony', 'pending', '--', 4);

-- Insert sample tasks for QUEST-004
INSERT INTO tasks (id, job_id, name, status, duration, task_order) VALUES
('TASK-012', 'QUEST-004', 'Collect Information', 'completed', '1m 52s', 1),
('TASK-013', 'QUEST-004', 'Draw Charts', 'completed', '4m 33s', 2),
('TASK-014', 'QUEST-004', 'Create Scroll', 'failed', '0m 15s', 3),
('TASK-015', 'QUEST-004', 'Send Messenger', 'pending', '--', 4);

-- Insert sample tasks for QUEST-005
INSERT INTO tasks (id, job_id, name, status, duration, task_order) VALUES
('TASK-016', 'QUEST-005', 'Enter Dungeon', 'completed', '3m 22s', 1),
('TASK-017', 'QUEST-005', 'Fight Corrupted Data', 'running', '18m 44s', 2),
('TASK-018', 'QUEST-005', 'Collect Loot', 'pending', '--', 3),
('TASK-019', 'QUEST-005', 'Exit Portal', 'pending', '--', 4);
