import json
import os
from pathlib import Path

def generate_album_metadata(folder_path, album_id, label):
    """Generate album metadata JSON"""
    tracks = []
    
    # Get all audio files
    audio_files = []
    for file in os.listdir(folder_path):
        if file.endswith(('.mp3', '.m4a', '.wav')):
            audio_files.append(file)
    
    # Sort files
    audio_files.sort()
    
    # Create track list
    for filename in audio_files:
        # Use filename as title (remove extension)
        title = os.path.splitext(filename)[0]
        tracks.append({
            "filename": filename,
            "title": title
        })
    
    # Create metadata object
    metadata = {
        "id": album_id,
        "label": label,
        "description": f"{label} album",
        "artworkPath": f"src/assets/sound/bgm/{album_id}/artwork.jpg",
        "tracks": tracks
    }
    
    return metadata

# Generate ect album
ect_metadata = generate_album_metadata(
    "src/assets/sound/bgm/ect",
    "ect",
    "ect"
)

# Generate Unnamed Memory album
unnamed_metadata = generate_album_metadata(
    "src/assets/sound/bgm/Unnamed Memory",
    "Unnamed Memory",
    "Unnamed Memory"
)

# Write to files
with open("src/assets/sound/bgm/ect/ect.json", "w", encoding="utf-8") as f:
    json.dump(ect_metadata, f, ensure_ascii=False, indent=2)

with open("src/assets/sound/bgm/Unnamed Memory/Unnamed Memory.json", "w", encoding="utf-8") as f:
    json.dump(unnamed_metadata, f, ensure_ascii=False, indent=2)

print(f"✓ ect.json created with {len(ect_metadata['tracks'])} tracks")
print(f"✓ Unnamed Memory.json created with {len(unnamed_metadata['tracks'])} tracks")
