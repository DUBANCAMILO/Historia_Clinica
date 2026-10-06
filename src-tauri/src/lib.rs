mod db;
mod export;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            export::save_export_file,
            db::init_database,
            db::backup_database,
            db::restore_database,
            db::create_safety_backup,
            db::save_history_json,
            db::load_history_json,
            db::delete_history_json,
            db::save_prescription_json,
            db::load_prescriptions_json,
            db::delete_prescription_json,
            db::restore_snapshot_mirror,
        ])
        .setup(|app| {
            db::init_database(app.handle().clone()).map_err(std::io::Error::other)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Historia Clínica");
}
