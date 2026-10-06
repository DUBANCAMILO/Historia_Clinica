PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = FULL;

CREATE TABLE IF NOT EXISTS roles (
 id TEXT PRIMARY KEY CHECK(length(id) > 0), name TEXT NOT NULL UNIQUE CHECK(length(name) BETWEEN 2 AND 50), description TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE CHECK(length(username) BETWEEN 3 AND 80), display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 1 AND 160), password_hash TEXT NOT NULL, role_id TEXT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS patients (
 id TEXT PRIMARY KEY, document TEXT NOT NULL UNIQUE CHECK(length(document) BETWEEN 3 AND 40), full_name TEXT NOT NULL CHECK(length(trim(full_name)) > 1), birth_date TEXT CHECK(birth_date IS NULL OR date(birth_date) IS NOT NULL), sex TEXT NOT NULL DEFAULT 'U' CHECK(sex IN ('M','F','O','U')), phone TEXT, eps TEXT, city TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS clinical_histories (
 id TEXT PRIMARY KEY, history_number TEXT NOT NULL UNIQUE, patient_id TEXT NOT NULL REFERENCES patients(id) ON UPDATE CASCADE ON DELETE RESTRICT, consultation_at TEXT NOT NULL, companion TEXT, reason TEXT, current_illness TEXT, nephrotoxic TEXT, family_history TEXT, weight REAL CHECK(weight IS NULL OR weight > 0), height REAL CHECK(height IS NULL OR height > 0), actual_weight REAL CHECK(actual_weight IS NULL OR actual_weight > 0), creatinine REAL CHECK(creatinine IS NULL OR creatinine >= 0), bun REAL CHECK(bun IS NULL OR bun >= 0), blood_pressure TEXT, heart_rate INTEGER CHECK(heart_rate IS NULL OR heart_rate BETWEEN 20 AND 300), glucose REAL CHECK(glucose IS NULL OR glucose >= 0), cardio_exam TEXT, abdominal_exam TEXT, labs TEXT, additional_labs TEXT, icd10 TEXT, analysis TEXT, lab_plan TEXT, treatment_plan TEXT, additional_notes TEXT, egfr REAL CHECK(egfr IS NULL OR egfr >= 0), bmi REAL CHECK(bmi IS NULL OR bmi >= 0), kdigo TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS medications (
 id TEXT PRIMARY KEY, history_id TEXT NOT NULL REFERENCES clinical_histories(id) ON UPDATE CASCADE ON DELETE CASCADE, drug TEXT NOT NULL CHECK(length(trim(drug)) > 0), dose TEXT, quantity TEXT, route TEXT, frequency TEXT, duration TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS risk_alerts (
 id TEXT PRIMARY KEY, history_id TEXT NOT NULL REFERENCES clinical_histories(id) ON UPDATE CASCADE ON DELETE CASCADE, type TEXT NOT NULL CHECK(type IN ('critical','warning','info')), category TEXT NOT NULL, message TEXT NOT NULL, triggered_at TEXT NOT NULL DEFAULT (datetime('now')), resolved_at TEXT
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id TEXT PRIMARY KEY, history_id TEXT REFERENCES clinical_histories(id) ON UPDATE CASCADE ON DELETE SET NULL, action TEXT NOT NULL CHECK(action IN ('CREATE','UPDATE','DELETE','LOGIN','EXPORT','BACKUP','RESTORE')), entity TEXT NOT NULL, entity_id TEXT NOT NULL, actor_user_id TEXT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL, before_json TEXT CHECK(before_json IS NULL OR json_valid(before_json)), after_json TEXT CHECK(after_json IS NULL OR json_valid(after_json)), created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS appointments (
 id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id) ON UPDATE CASCADE ON DELETE RESTRICT, scheduled_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','confirmed','completed','cancelled','no_show')), reason TEXT, notes TEXT, created_by TEXT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS backups (
 id TEXT PRIMARY KEY, file_path TEXT NOT NULL, checksum_sha256 TEXT, size_bytes INTEGER CHECK(size_bytes IS NULL OR size_bytes >= 0), created_by TEXT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), verified_at TEXT
);
CREATE TABLE IF NOT EXISTS local_history_documents (
 id TEXT PRIMARY KEY,
 patient_name TEXT NOT NULL,
 document_json TEXT NOT NULL CHECK(json_valid(document_json)),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_local_history_patient ON local_history_documents(patient_name);
CREATE TABLE IF NOT EXISTS local_prescriptions (
 id TEXT PRIMARY KEY,
 patient_key TEXT NOT NULL,
 patient_name TEXT NOT NULL,
 document TEXT,
 prescription_date TEXT NOT NULL,
 diagnosis TEXT,
 prescription_json TEXT NOT NULL CHECK(json_valid(prescription_json)),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_local_prescriptions_patient ON local_prescriptions(patient_key, prescription_date DESC);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_histories_patient_date ON clinical_histories(patient_id, consultation_at DESC);
CREATE INDEX IF NOT EXISTS idx_medications_history ON medications(history_id);
CREATE INDEX IF NOT EXISTS idx_alerts_history_type ON risk_alerts(history_id, type);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, scheduled_at);

CREATE TRIGGER IF NOT EXISTS roles_updated_at AFTER UPDATE OF name, description ON roles BEGIN UPDATE roles SET updated_at=datetime('now') WHERE id=NEW.id; END;
CREATE TRIGGER IF NOT EXISTS users_updated_at AFTER UPDATE OF username, display_name, password_hash, role_id, active, last_login_at ON users BEGIN UPDATE users SET updated_at=datetime('now') WHERE id=NEW.id; END;
CREATE TRIGGER IF NOT EXISTS patients_updated_at AFTER UPDATE OF document, full_name, birth_date, sex, phone, eps, city ON patients BEGIN UPDATE patients SET updated_at=datetime('now') WHERE id=NEW.id; END;
CREATE TRIGGER IF NOT EXISTS histories_updated_at AFTER UPDATE ON clinical_histories BEGIN UPDATE clinical_histories SET updated_at=datetime('now') WHERE id=NEW.id; END;
CREATE TRIGGER IF NOT EXISTS medications_updated_at AFTER UPDATE ON medications BEGIN UPDATE medications SET updated_at=datetime('now') WHERE id=NEW.id; END;
CREATE TRIGGER IF NOT EXISTS appointments_updated_at AFTER UPDATE ON appointments BEGIN UPDATE appointments SET updated_at=datetime('now') WHERE id=NEW.id; END;

INSERT OR IGNORE INTO roles(id,name,description) VALUES ('role-admin','Administrador','Acceso administrativo; cambiar credenciales antes de producción');
INSERT OR IGNORE INTO users(id,username,display_name,password_hash,role_id) VALUES ('user-admin-example','admin.example','Administrador de ejemplo','REPLACE_WITH_ARGON2ID_HASH','role-admin');
