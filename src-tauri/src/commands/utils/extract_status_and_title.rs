use regex::Regex;

/// Возвращает (статус, остаток строки), если первый символ — emoji.
/// Иначе статус — пустая строка, остаток — вся строка.
pub fn extract_status_and_title(file_stem: &str) -> (String, String) {
    let emoji_regex = Regex::new(r"^\p{Emoji}$").unwrap();

    let mut chars = file_stem.chars();
    if let Some(first_char) = chars.next() {
        let first_str = first_char.to_string();

        if emoji_regex.is_match(&first_str) {
            let remainder = &file_stem[first_str.len()..];
            return (first_str, remainder.to_string());
        }
    }

    ("".to_string(), file_stem.to_string())
}