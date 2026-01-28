# ParallelTranslation

Desktop/Web application for parallel text translation with Markdown editing.

## Features
- В браузерной версии данные хранятся в браузере. Когда-нибудь возможна синхронизация по личному аккаунту.
- Работает Markdown разметка. В Desktop версии переводы хранятся как обычные md-файлы.
- Текст сохраняется по вводу с задержкой 1 сек. и мгновенно при выходе (через кнопку).
- При нажатии левой кнопкой мыши на номер строки, происходит скролл противоположного окна к соответствующей строке.
- Нажатием правой кнопкой мыши на номер можно помечать строку цветом.

## Installation
1. Clone the repo: `git clone https://github.com/siebentod/paralleltranslation.git`
2. Install dependencies: `npm install`
3. For web development: `npm run dev`
4. For desktop development: `npm run tauri dev`
5. Build for production: `npm run build` then `npm run tauri build`

## Switching Between Browser and Desktop Modes
To switch between web (browser) and desktop (Tauri) builds, manually toggle the imports in the following files:
- `src/lib/fs/index.ts`: Comment/uncomment the `BrowserFileSystem` or `TauriFileSystem` import.
- `src/lib/storage/index.ts`: Comment/uncomment the `BrowserStorage` or `TauriStorage` import.

For browser mode, use `BrowserFileSystem` and `BrowserStorage`. For desktop mode, use `TauriFileSystem` and `TauriStorage`.

## Technologies
- React, TypeScript, Vite
- Tauri for desktop
- CodeMirror, TailwindCSS, Zustand