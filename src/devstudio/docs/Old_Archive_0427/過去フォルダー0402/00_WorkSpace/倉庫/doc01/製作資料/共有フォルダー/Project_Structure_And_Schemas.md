# NanoNovel Project Snapshot (v1.4)

## 📊 Development Stats

*   **Engine**: React 19 + Vite
*   **Language**: TypeScript
*   **State Management**: Zustand
*   **Routing**: React Router
*   **Architecture**: JSON-Driven, Component-Based (Screens & Parts)
*   **Design Pattern**: v1.4 Folder Structure

## 📂 Folder Structure (v1.4)

```text
src/
├── app/                  # App configuration
├── assets/               # Raw assets (images, sounds)
│   ├── bg/
│   ├── chara/
│   └── ...
├── core/                 # Core logic (Managers, Hooks, Stores)
├── data/                 # ★ JSON Data (Source of Truth)
│   ├── novel/            # Scenario data
│   │   └── scenario.json
│   ├── battle/           # Battle data
│   ├── collection/       # Library DB
│   │   ├── characters.json
│   │   ├── enemies.json
│   │   ├── npcs.json
│   │   └── ...
│   └── result/
├── parts/                # Feature-specific components
│   ├── novel/
│   ├── battle/
│   └── collection/
└── screens/              # Screen components (Page-level)
    ├── 01_Title/
    ├── 02_Novel/
    ├── 03_Battle/
    └── 11_Collection/
```

## 📝 JSON Schemas

### Scenario ID Format
Format: `EP_CH_TXT` (e.g., `01_01_01`)

### Character Data (`src/data/collection/characters.json`)
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "defaultTags": ["string"],
  "portraitTag": "string",
  "status": {
    "hp": "number",
    "mp": "number"
  }
}
```

### Enemy Data (`src/data/collection/enemies.json`)
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": {
      "hp": "number",
      "mp": "number",
      "str": "number",
      "dex": "number",
      "int": "number"
  },
  "skills": ["string"]
}
```

### NPC Data (`src/data/collection/npcs.json`)
```json
{
  "id": "string",
  "name": "string",
  "role": "string",
  "location": "string",
  "description": "string",
  "defaultTags": ["string"]
}
```
