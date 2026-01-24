use lopdf::Document;
use rayon::prelude::*;
use fs2::FileExt;
use file_id;
use std::fs::OpenOptions;
use std::path::Path;
use std::collections::BTreeMap;

#[derive(Debug)]
pub struct FileInfo {
    pub is_locked: bool,
    pub file_id: Option<String>,
    pub pdf_title: Option<String>,
    pub pdf_author: Option<String>,
    pub pdf_creator: Option<String>,
}

pub fn get_file_info(path_str: &str) -> FileInfo {
    let path = Path::new(path_str);
    
    let is_locked = match std::panic::catch_unwind(|| {
        if let Ok(file) = OpenOptions::new().write(true).open(path) {
            file.try_lock_exclusive().is_err()
        } else {
            true
        }
    }) {
        Ok(result) => result,
        Err(_) => false,
    };

    let file_index = file_id::get_low_res_file_id(path)
        .ok()
        .and_then(|id| {
            if let file_id::FileId::LowRes { file_index, .. } = id {
                Some(file_index.to_string())
            } else {
                None
            }
        });

    let file_id = match file_index {
        Some(index) => Some(index),
        None => None,
    };

    // Получаем PDF метаданные только для PDF файлов
    let (pdf_title, pdf_author, pdf_creator) = if path_str.to_lowercase().ends_with(".pdf") {
        match get_pdf_metadata_fast(path_str) {
            Ok((title, author, creator)) => (title, author, creator),
            Err(_) => (None, None, None),
        }
    } else {
        (None, None, None)
    };

    FileInfo { 
        is_locked, 
        file_id, 
        pdf_title,
        pdf_author,
        pdf_creator,
    }
}

fn get_pdf_metadata_fast(path_str: &str) -> Result<(Option<String>, Option<String>, Option<String>), Box<dyn std::error::Error>> {
    let doc = Document::load(path_str)?;
    
    let mut title = None;
    let mut author = None;
    let mut creator = None;

    // Исправление 1: Правильное получение ObjectId из trailer
    if let Ok(info_ref) = doc.trailer.get(b"Info") {
        if let lopdf::Object::Reference(object_id) = info_ref {
            // Исправление 2: Правильное получение объекта по ObjectId
            if let Ok(info_obj) = doc.get_object(*object_id) {
                if let lopdf::Object::Dictionary(ref dict) = info_obj {
                    title = extract_string_fast(dict, b"Title");
                    author = extract_string_fast(dict, b"Author");
                    creator = extract_string_fast(dict, b"Creator");
                }
            }
        }
    }

    Ok((title, author, creator))
}

// Исправление 3: Правильный тип для словаря lopdf
fn extract_string_fast(dict: &lopdf::Dictionary, key: &[u8]) -> Option<String> {
    dict.get(key).ok().and_then(|obj| {
        match obj {
            lopdf::Object::String(bytes, _) => {
                Some(String::from_utf8_lossy(bytes).into_owned())
            }
            _ => None,
        }
    })
}