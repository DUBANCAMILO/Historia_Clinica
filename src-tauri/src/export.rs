use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

/// Opens a native Save As dialog and writes an export only to the path the user selected.
#[tauri::command]
pub async fn save_export_file(app: AppHandle, file_name: String, content: String, extension: String) -> Result<Option<String>, String> {
    let extension = extension.to_ascii_lowercase();
    if extension != "json" && extension != "csv" {
        return Err("Solo se permiten exportaciones JSON o CSV.".to_string());
    }
    let safe_name = Path::new(&file_name).file_name().and_then(|name| name.to_str()).filter(|name| !name.is_empty()).unwrap_or("NefroHC_export").to_string();
    let app_for_dialog = app.clone();
    let dialog_extension = extension.clone();
    let selected = tauri::async_runtime::spawn_blocking(move || {
        let label = if dialog_extension == "json" { "Respaldo NefroHC (JSON)" } else { "Historias NefroHC (CSV)" };
        app_for_dialog.dialog().file().set_file_name(safe_name).add_filter(label, &[dialog_extension.as_str()]).blocking_save_file()
    }).await.map_err(|error| format!("No se pudo abrir el diálogo para guardar: {error}"))?;
    let Some(selected) = selected else { return Ok(None); };
    let path: PathBuf = selected.into_path().map_err(|error| error.to_string())?;
    let actual_extension = path.extension().and_then(|value| value.to_str()).unwrap_or("");
    if !actual_extension.eq_ignore_ascii_case(&extension) {
        return Err(format!("El archivo debe conservar la extensión .{extension}."));
    }
    fs::write(&path, content.as_bytes()).map_err(|error| format!("No se pudo escribir el archivo: {error}"))?;
    Ok(Some(path.to_string_lossy().into_owned()))
}
