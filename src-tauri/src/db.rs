use rusqlite::{backup::Backup, params, Connection};
use serde_json::Value;
use std::{fs, path::PathBuf, time::{SystemTime, UNIX_EPOCH}};
use tauri::{AppHandle, Manager};

fn db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("historia-clinica.sqlite3"))
}

#[tauri::command]
pub fn init_database(app: AppHandle) -> Result<String, String> {
    let path = db_path(&app)?;
    let conn = Connection::open(&path).map_err(|e| e.to_string())?;
    conn.execute_batch(include_str!("../../database/migrations/001_initial/up.sql")).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn backup_database(app: AppHandle, destination: String) -> Result<(), String> {
    let source = db_path(&app)?;
    let from = Connection::open(source).map_err(|e| e.to_string())?;
    let mut to = Connection::open(destination).map_err(|e| e.to_string())?;
    let mut backup = Backup::new(&from, &mut to).map_err(|e| e.to_string())?;
    let result = backup
        .run_to_completion(100, std::time::Duration::from_millis(10), None)
        .map_err(|e| e.to_string());
    // Drop the backup before the borrowed database connections leave scope.
    drop(backup);
    result
}

#[tauri::command]
pub fn restore_database(app: AppHandle, source: String) -> Result<(), String> {
    let destination = db_path(&app)?;
    let from = Connection::open(source).map_err(|e| e.to_string())?;
    let mut to = Connection::open(&destination).map_err(|e| e.to_string())?;
    let mut backup = Backup::new(&from, &mut to).map_err(|e| e.to_string())?;
    let result = backup
        .run_to_completion(100, std::time::Duration::from_millis(10), None)
        .map_err(|e| e.to_string());
    // Drop the backup before the borrowed database connections leave scope.
    drop(backup);
    result
}

/// A JSON application snapshot and, when the local database exists, its paired SQLite copy.
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SafetyBackupResult {
    pub path: String,
    pub sqlite_path: Option<String>,
    pub confirmed_at: u64,
    pub reused: bool,
}

/// Writes a restorable JSON snapshot and a native SQLite snapshot as an atomic logical pair.
/// The app retains the 30 newest completed pairs in its private application-data directory.
#[tauri::command]
pub fn create_safety_backup(app: AppHandle, payload: String, force: bool) -> Result<SafetyBackupResult, String> {
    let mut parsed: Value = serde_json::from_str(&payload).map_err(|e| format!("El respaldo no es JSON válido: {e}"))?;
    if !parsed.is_object() {
        return Err("El contenido del respaldo debe ser un objeto JSON.".to_string());
    }
    let directory = app.path().app_data_dir().map_err(|e| e.to_string())?.join("automatic-backups");
    fs::create_dir_all(&directory).map_err(|e| format!("No se pudo crear la carpeta de respaldos: {e}"))?;
    let database_source = db_path(&app)?;
    if !database_source.is_file() {
        return Err("No se encontró la base SQLite de la aplicación; no se confirmó el respaldo completo.".to_string());
    }
    let sqlite_expected = true;

    let mut json_files: Vec<PathBuf> = fs::read_dir(&directory)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.file_name().and_then(|name| name.to_str()).is_some_and(|name| name.starts_with("nefrohc-auto-") && name.ends_with(".json")))
        .collect();
    json_files.sort_by(|a, b| b.file_name().cmp(&a.file_name()));
    if !force {
        if let Some(latest) = json_files.first() {
            let sqlite_path = latest.with_extension("sqlite3");
            if (!sqlite_expected || sqlite_path.is_file()) {
                if let Ok(content) = fs::read_to_string(latest) {
                    if let Ok(mut previous) = serde_json::from_str::<Value>(&content) {
                        if let Some(object) = parsed.as_object_mut() { object.remove("exportedAt"); }
                        if let Some(object) = previous.as_object_mut() { object.remove("exportedAt"); }
                        if previous == parsed {
                            return Ok(SafetyBackupResult {
                                path: latest.to_string_lossy().into_owned(),
                                sqlite_path: sqlite_path.is_file().then(|| sqlite_path.to_string_lossy().into_owned()),
                                confirmed_at: SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or_default(),
                                reused: true,
                            });
                        }
                    }
                }
            }
        }
    }

    let stamp = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or_default();
    let base = format!("nefrohc-auto-{stamp:020}");
    let json_path = directory.join(format!("{base}.json"));
    let json_temp = directory.join(format!("{base}.json.tmp"));
    let sqlite_path = sqlite_expected.then(|| directory.join(format!("{base}.sqlite3")));
    let sqlite_temp = sqlite_expected.then(|| directory.join(format!("{base}.sqlite3.tmp")));

    let write_result = (|| -> Result<(), String> {
        if let (Some(temp), Some(final_path)) = (sqlite_temp.as_ref(), sqlite_path.as_ref()) {
            let from = Connection::open(&database_source).map_err(|e| format!("No se pudo abrir SQLite para respaldar: {e}"))?;
            let mut to = Connection::open(temp).map_err(|e| format!("No se pudo crear la copia SQLite: {e}"))?;
            let mut backup = Backup::new(&from, &mut to).map_err(|e| format!("No se pudo iniciar la copia SQLite: {e}"))?;
            let copy_result = backup.run_to_completion(100, std::time::Duration::from_millis(10), None).map_err(|e| e.to_string());
            drop(backup);
            drop(to);
            drop(from);
            copy_result.map_err(|e| format!("Falló la copia SQLite: {e}"))?;
            fs::rename(temp, final_path).map_err(|e| format!("No se pudo finalizar la copia SQLite: {e}"))?;
        }
        use std::io::Write;
        let mut file = fs::File::create(&json_temp).map_err(|e| format!("No se pudo crear el respaldo JSON temporal: {e}"))?;
        file.write_all(payload.as_bytes()).map_err(|e| format!("No se pudo escribir el respaldo JSON: {e}"))?;
        file.sync_all().map_err(|e| format!("No se pudo confirmar el respaldo JSON: {e}"))?;
        drop(file);
        fs::rename(&json_temp, &json_path).map_err(|e| format!("No se pudo finalizar el respaldo JSON: {e}"))?;
        Ok(())
    })();
    if let Err(error) = write_result {
        let _ = fs::remove_file(&json_temp);
        if let Some(path) = sqlite_temp.as_ref() { let _ = fs::remove_file(path); }
        if let Some(path) = sqlite_path.as_ref() { let _ = fs::remove_file(path); }
        return Err(error);
    }

    let mut completed: Vec<PathBuf> = fs::read_dir(&directory)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.file_name().and_then(|name| name.to_str()).is_some_and(|name| name.starts_with("nefrohc-auto-") && name.ends_with(".json")))
        .collect();
    completed.sort_by(|a, b| b.file_name().cmp(&a.file_name()));
    for old_json in completed.into_iter().skip(30) {
        let old_sqlite = old_json.with_extension("sqlite3");
        let _ = fs::remove_file(old_json);
        let _ = fs::remove_file(old_sqlite);
    }
    Ok(SafetyBackupResult {
        path: json_path.to_string_lossy().into_owned(),
        sqlite_path: sqlite_path.map(|path| path.to_string_lossy().into_owned()),
        confirmed_at: SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or_default(),
        reused: false,
    })
}

/// Persists a complete history document in the local SQLite database.
/// The UI also keeps a localStorage copy so the web preview remains usable.
#[tauri::command]
pub fn save_history_json(app: AppHandle, payload: String) -> Result<String, String> {
    let value: Value = serde_json::from_str(&payload).map_err(|e| e.to_string())?;
    let id = value
        .get("_id")
        .and_then(Value::as_str)
        .filter(|v| !v.is_empty())
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| {
            let millis = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_millis())
                .unwrap_or_default();
            format!("hc-{millis}")
        });
    let patient_name = value
        .get("nombre")
        .and_then(Value::as_str)
        .unwrap_or("Paciente sin nombre")
        .trim()
        .to_owned();
    let path = db_path(&app)?;
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO local_history_documents (id, patient_name, document_json, updated_at) VALUES (?1, ?2, ?3, datetime('now')) ON CONFLICT(id) DO UPDATE SET patient_name=excluded.patient_name, document_json=excluded.document_json, updated_at=datetime('now')",
        params![id, patient_name, payload],
    ).map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn save_prescription_json(app: AppHandle, payload: String) -> Result<String, String> {
    let value: Value = serde_json::from_str(&payload).map_err(|e| e.to_string())?;
    let id = value.get("id").and_then(Value::as_str).unwrap_or("rx-unknown").to_owned();
    let patient_key = value.get("patientKey").and_then(Value::as_str).unwrap_or("").to_owned();
    let patient_name = value.get("patientName").and_then(Value::as_str).unwrap_or("Paciente").to_owned();
    let document = value.get("document").and_then(Value::as_str).unwrap_or("").to_owned();
    let prescription_date = value.get("date").and_then(Value::as_str).unwrap_or("").to_owned();
    let diagnosis = value.get("diagnosis").and_then(Value::as_str).unwrap_or("").to_owned();
    let path = db_path(&app)?;
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO local_prescriptions (id, patient_key, patient_name, document, prescription_date, diagnosis, prescription_json, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now')) ON CONFLICT(id) DO UPDATE SET patient_key=excluded.patient_key, patient_name=excluded.patient_name, document=excluded.document, prescription_date=excluded.prescription_date, diagnosis=excluded.diagnosis, prescription_json=excluded.prescription_json, updated_at=datetime('now')",
        params![id, patient_key, patient_name, document, prescription_date, diagnosis, payload],
    ).map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn load_prescriptions_json(app: AppHandle) -> Result<Vec<String>, String> {
    let path = db_path(&app)?;
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    let mut statement = conn.prepare("SELECT prescription_json FROM local_prescriptions ORDER BY prescription_date DESC, updated_at DESC").map_err(|e| e.to_string())?;
    let rows = statement.query_map([], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_prescription_json(app: AppHandle, id: String) -> Result<(), String> {
    let path = db_path(&app)?;
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM local_prescriptions WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_history_json(app: AppHandle, id: String) -> Result<(), String> {
    let path = db_path(&app)?;
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM local_history_documents WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_history_json(app: AppHandle) -> Result<Vec<String>, String> {
    let path = db_path(&app)?;
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    let mut statement = conn
        .prepare("SELECT document_json FROM local_history_documents ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Replaces the SQLite mirror from a portable JSON application snapshot.
/// Only mirrors histories and prescriptions, matching the current localStorage-backed UI.
#[tauri::command]
pub fn restore_snapshot_mirror(app: AppHandle, payload: String) -> Result<(), String> {
    let parsed: Value = serde_json::from_str(&payload).map_err(|e| format!("El respaldo no es JSON válido: {e}"))?;
    let path = db_path(&app)?;
    let mut conn = Connection::open(path).map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    if let Some(histories) = parsed.get("hcs").and_then(Value::as_array) {
        tx.execute("DELETE FROM local_history_documents", []).map_err(|e| e.to_string())?;
        for (index, item) in histories.iter().enumerate() {
            let id = item.get("_id").or_else(|| item.get("history_id")).and_then(Value::as_str).filter(|value| !value.is_empty()).map(ToOwned::to_owned)
                .unwrap_or_else(|| format!("hc-restore-{}-{index}", SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or_default()));
            let patient_name = item.get("nombre").and_then(Value::as_str).unwrap_or("Paciente sin nombre").trim().to_owned();
            tx.execute(
                "INSERT INTO local_history_documents (id, patient_name, document_json, updated_at) VALUES (?1, ?2, ?3, datetime('now')) ON CONFLICT(id) DO UPDATE SET patient_name=excluded.patient_name, document_json=excluded.document_json, updated_at=datetime('now')",
                params![id, patient_name, item.to_string()],
            ).map_err(|e| e.to_string())?;
        }
    }

    if let Some(prescriptions) = parsed.get("recetas").and_then(Value::as_array) {
        tx.execute("DELETE FROM local_prescriptions", []).map_err(|e| e.to_string())?;
        for (index, item) in prescriptions.iter().enumerate() {
            let id = item.get("id").or_else(|| item.get("prescriptionId")).and_then(Value::as_str).filter(|value| !value.is_empty()).map(ToOwned::to_owned)
                .unwrap_or_else(|| format!("rx-restore-{}-{index}", SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or_default()));
            let patient_key = item.get("patientKey").and_then(Value::as_str).unwrap_or("").to_owned();
            let patient_name = item.get("patientName").or_else(|| item.get("patient_name")).and_then(Value::as_str).unwrap_or("Paciente").to_owned();
            let document = item.get("document").and_then(Value::as_str).unwrap_or("").to_owned();
            let prescription_date = item.get("date").or_else(|| item.get("prescriptionDate")).and_then(Value::as_str).unwrap_or("").to_owned();
            let diagnosis = item.get("diagnosis").and_then(Value::as_str).unwrap_or("").to_owned();
            tx.execute(
                "INSERT INTO local_prescriptions (id, patient_key, patient_name, document, prescription_date, diagnosis, prescription_json, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now')) ON CONFLICT(id) DO UPDATE SET patient_key=excluded.patient_key, patient_name=excluded.patient_name, document=excluded.document, prescription_date=excluded.prescription_date, diagnosis=excluded.diagnosis, prescription_json=excluded.prescription_json, updated_at=datetime('now')",
                params![id, patient_key, patient_name, document, prescription_date, diagnosis, item.to_string()],
            ).map_err(|e| e.to_string())?;
        }
    }

    tx.commit().map_err(|e| e.to_string())
}
