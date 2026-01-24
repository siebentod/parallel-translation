# ParallelTranslation

A cross-platform application (desktop and web) for parallel text translation with Markdown editing capabilities.

## Features
- Markdown text editor with CodeMirror
- Parallel translation sections
- File management and auto-save
- Responsive UI

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