// src/lib.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use tauri::{AppHandle, Manager, State};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
