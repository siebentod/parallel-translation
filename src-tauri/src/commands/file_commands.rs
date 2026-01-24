use chrono::{DateTime, TimeZone, Utc};
use everything_rs::{Everything, EverythingRequestFlags, EverythingSort};
use fs2::FileExt;
use rayon::prelude::*;
use regex::Regex;
use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::fs::OpenOptions;
use std::io;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::command;
use tokio::time::sleep;

lazy_static::lazy_static! {
    static ref EVERYTHING_LOCK: Arc<Mutex<()>> = Arc::new(Mutex::new(()));
    static ref LAST_SEARCH_TIME: Arc<Mutex<Option<Instant>>> = Arc::new(Mutex::new(None));
}

const MIN_SEARCH_INTERVAL_MS: u64 = 100;

use super::utils::extract_status_and_title::extract_status_and_title;
use super::utils::filetime_to_datetime::filetime_to_datetime;
use super::utils::get_file_info::get_file_info;
use super::utils::get_file_info_all_meta::get_file_info_all_meta;
use super::utils::set_creator::set_creator;

// Определяем FileMetadata здесь, так как она тесно связана с операциями с файлами
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileMetadata {
    pub file_name: String,
    pub full_path: String,
    pub status: String,
    pub title: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileResult {
    pub file_name: String,
    pub full_path: String,
    pub status: String,
    pub title: String,

    pub size: Option<u64>,
    pub created_date: String,
    pub modified_date: String,
    pub extension: Option<String>,
    pub is_locked: bool,
    pub id: Option<String>,
    pub pdf_title: Option<String>,
    pub pdf_author: Option<String>,
    pub pdf_creator: Option<String>,
}

#[command]
pub async fn get_everything(query: String) -> Result<Vec<FileResult>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    match everything_search(query.as_str(), false).await {
        Some(results) => Ok(results),
        None => Err("Ошибка выполнения поиска".to_string()),
    }
}

#[command]
pub async fn get_everything_with_meta(query: String) -> Result<Vec<FileResult>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    match everything_search(query.as_str(), true).await {
        Some(results) => Ok(results),
        None => Err("Ошибка выполнения поиска".to_string()),
    }
}

// Второй параметр false -> быстрый поиск без метаданных, true - с метаданными
async fn everything_search(query: &str, use_full_meta: bool) -> Option<Vec<FileResult>> {
    let total_timer = Instant::now();

    let sleep_duration = {
        let last_time = LAST_SEARCH_TIME.lock().unwrap();
        if let Some(last) = *last_time {
            let elapsed = last.elapsed();
            if elapsed < Duration::from_millis(MIN_SEARCH_INTERVAL_MS) {
                Some(Duration::from_millis(MIN_SEARCH_INTERVAL_MS) - elapsed)
            } else {
                None
            }
        } else {
            None
        }
    };

    if let Some(duration) = sleep_duration {
        sleep(duration).await;
    }

    let files = {
        let _lock = EVERYTHING_LOCK.lock().ok()?;

        {
            let mut last_time = LAST_SEARCH_TIME.lock().unwrap();
            *last_time = Some(Instant::now());
        }

        let everything = Everything::new();
        everything.set_search(query);
        everything.set_max_results(300);
        everything.set_request_flags(
            EverythingRequestFlags::FullPathAndFileName
                | EverythingRequestFlags::DateCreated
                | EverythingRequestFlags::DateModified
                | EverythingRequestFlags::Size
                | EverythingRequestFlags::Extension
                | EverythingRequestFlags::FileListFileName,
        );
        everything.set_sort(EverythingSort::DateModifiedDescending);

        if let Err(e) = everything.query() {
            eprintln!("Ошибка запроса: {}", e);
            return None;
        }

        let num_results = everything.get_result_count();
        let results: Vec<FileResult> = (0..num_results)
            .into_par_iter()
            .filter_map(|idx| {
                if let Ok(path) = everything.get_result_full_path(idx) {
                    use std::path::Path;

                    let path_ref = Path::new(&path);
                    let file_name = path_ref
                        .file_name()
                        .map(|s| s.to_string_lossy().into_owned())
                        .unwrap_or_default();
                    let file_stem = path_ref
                        .file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or_default();
                    let (status, title) = extract_status_and_title(file_stem);

                    let info = if use_full_meta {
                        get_file_info_all_meta(&path)
                    } else {
                        get_file_info(&path)
                    };

                    Some(FileResult {
                        file_name,
                        full_path: path.clone(),
                        status: status.to_string(),
                        title: title.to_string(),
                        size: everything.get_result_size(idx).ok(),
                        created_date: everything
                            .get_result_created_date(idx)
                            .ok()
                            .map_or(String::new(), filetime_to_datetime),
                        modified_date: everything
                            .get_result_count_modified_date(idx)
                            .ok()
                            .map_or(String::new(), filetime_to_datetime),
                        extension: everything.get_result_extension(idx).ok(),
                        is_locked: info.is_locked,
                        id: info.file_id,
                        pdf_title: info.pdf_title,
                        pdf_author: info.pdf_author,
                        pdf_creator: info.pdf_creator,
                    })
                } else {
                    None
                }
            })
            .collect();

        Some(results)
    };

    sleep(Duration::from_millis(10)).await;
    
    let elapsed = total_timer.elapsed();
    println!("Поиск занял: {:.2?}", elapsed);

    files
}

#[command]
pub async fn edit_filename(
    original_full_path: String,
    new_filename: String,
) -> Result<String, String> {
    let original_path = PathBuf::from(&original_full_path);

    // Проверяем, существует ли оригинальный файл
    if !original_path.exists() {
        return Err(format!(
            "Оригинальный файл не найден: {}",
            original_full_path
        ));
    }

    // Создаем полный путь к новому файлу в той же директории
    let parent_dir = original_path
        .parent()
        .ok_or_else(|| "Не удалось получить родительскую директорию файла".to_string())?;
    let new_full_path = parent_dir.join(&new_filename);

    // Проверяем, существует ли файл с новым именем (чтобы избежать перезаписи)
    if new_full_path.exists() {
        return Err(format!(
            "Файл с именем '{}' уже существует в этой директории.",
            new_filename
        ));
    }

    // Переименовываем файл
    match fs::rename(&original_path, &new_full_path) {
        Ok(_) => Ok(new_full_path.to_string_lossy().into_owned()),
        Err(e) => {
            // Обработка конкретных ошибок для более информативных сообщений
            if e.kind() == io::ErrorKind::PermissionDenied {
                Err(format!("Ошибка доступа при переименовании файла: {}. Убедитесь, что у приложения есть необходимые разрешения.", e))
            } else {
                Err(format!("Не удалось переименовать файл: {}", e))
            }
        }
    }
}

#[command]
pub async fn open_file(path: String) -> Result<(), String> {
    // Попробуем открыть файл с помощью стандартного средства ОС
    #[cfg(target_os = "windows")]
    let result = Command::new("explorer").arg(path).spawn();

    #[cfg(target_os = "macos")]
    let result = Command::new("open").arg(&path).spawn();

    #[cfg(target_os = "linux")]
    let result = Command::new("xdg-open").arg(&path).spawn();

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Ошибка при открытии файла: {}", e)),
    }
}

// Не используется
pub fn parse_file_metadata(path: &std::path::Path) -> Option<FileMetadata> {
    if !path.is_file() {
        return None;
    }

    // everything_search(query.as_str());

    if let Some(file_name) = path.file_stem().and_then(|s| s.to_str()) {
        let parts: Vec<&str> = file_name.splitn(4, ' ').collect();
        if parts.len() != 4 {
            return None;
        }

        return Some(FileMetadata {
            file_name: path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .into(),
            full_path: path.to_string_lossy().into(), // Сохраняем полный путь
            status: parts[0].to_string(),
            title: parts[3].to_string(),
        });
    }
    None
}

#[command]
pub async fn show_in_explorer(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| format!("Не удалось открыть проводник: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| format!("Не удалось открыть Finder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Для Linux используем xdg-open или nautilus
        let parent = Path::new(&path)
            .parent()
            .ok_or("Не удалось получить родительскую директорию")?;

        Command::new("xdg-open")
            .arg(parent)
            .spawn()
            .map_err(|e| format!("Не удалось открыть файловый менеджер: {}", e))?;
    }

    Ok(())
}

// Можно удалить, оно все равно не работает
#[command]
pub async fn open_file_with(path: String) -> Result<(), String> {
    use std::process::Command;

    #[cfg(target_os = "windows")]
    {
        Command::new("rundll32")
            .args(["shell32.dll,OpenAs_RunDLL", &path])
            .spawn()
            .map_err(|e| format!("Не удалось открыть диалог 'Открыть с помощью': {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-a", "Choose Application", &path])
            .spawn()
            .map_err(|e| format!("Не удалось открыть диалог выбора приложения: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Для Linux можно использовать различные команды в зависимости от DE
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Не удалось открыть файл: {}", e))?;
    }

    Ok(())
}

#[command]
pub fn set_metadata(file_path: String) -> Result<String, String> {
    set_creator(&file_path).map_err(|e| e.to_string())
}

#[command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err("Файл не существует".to_string());
    }

    if file_path.is_file() {
        fs::remove_file(&path).map_err(|e| format!("Не удалось удалить файл: {}", e))?;
    } else if file_path.is_dir() {
        fs::remove_dir_all(&path).map_err(|e| format!("Не удалось удалить папку: {}", e))?;
    }

    Ok(())
}
