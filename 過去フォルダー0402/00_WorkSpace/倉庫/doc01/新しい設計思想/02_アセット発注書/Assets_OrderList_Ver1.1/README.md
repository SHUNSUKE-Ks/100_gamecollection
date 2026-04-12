# 🎨 Asset Order List Ver1.1

This directory contains standardized JSON templates for ordering various game assets.
All files follow the **JSON-Driven Development** philosophy.

## Supported Types (`TYPE`)

The `ORDER_INFO` section in each JSON file includes a `TYPE` field to categorize the request.

| TYPE | Description | Corresponding File |
| :--- | :--- | :--- |
| **`CHARACTER`** | Main characters (Standing, Faces, CGs) | `character_order.json` |
| **`NPC`** | Non-Player Characters (Standing, Faces) | `npc_order.json` |
| **`ENEMY_SPRITE`** | Enemy/Monster images | `enemy_order.json` |
| **`BACKGROUND`** | Location backgrounds (Scenery) | `bg_order.json` |
| **`ITEM_ICON`** | Item/Equipment icons | `item_order.json` |
| **`TIPS_IMAGE`** | Concept art for Loading Screens | `tips_order.json` |
| **`CG_GALLERY`** | Event CGs, Cut-ins, Movies | `cg_gallery_order.json` |

## Extensibility

### Arrays for Scalability
All asset definitions are stored in arrays (e.g., `"CHARACTERS": []`, `"FACES": []`).
To add a new character or expression, simply append a new object to the respective array.

### Schema Template

```json
{
    "ORDER_INFO": {
        "ORDER_DATE": "YYYY-MM-DD",
        "TYPE": "CHARACTER",
        "STATUS": "PENDING"
    },
    "DATA_LIST": [
        {
            "ID": "unique_id",
            "VISUAL_REFERENCE": { ... },
            "ASSETS": { ... }
        }
    ]
}
```
