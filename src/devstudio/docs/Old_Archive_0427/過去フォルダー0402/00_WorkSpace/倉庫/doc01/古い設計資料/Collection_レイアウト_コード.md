# Collection レイアウト実装コード
## Character & NPC Layout (JSX)

---

## 1. Character Layout
**ファイル**: `src/screens/11_Collection/CollectionScreen.jsx`

```jsx
{/* Main Content Area */}
<div className="collection-content">
    {activeCategory === 'library' && activeSubCategory === 'character' ? (
        <div className="character-encyclopedia">
            {/* Character List Sidebar */}
            <div className="character-list">
                <h3>キャラクター一覧</h3>
                <ul>
                    {characterData.map(char => (
                        <li
                            key={char.id}
                            className={selectedCharacterId === char.id ? 'active' : ''}
                            onClick={() => setSelectedCharacterId(char.id)}
                        >
                            {char.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Character Detail View */}
            <div className="character-detail">
                {selectedCharacter ? (
                    <div className="detail-grid">
                        {/* 1. 左上: キャラクターカード */}
                        <div className="card-section">
                            <h4>キャラクターカード</h4>
                            <div className="char-card">
                                <img src={resolveAssetUrl(selectedCharacter.image)} alt={selectedCharacter.name} />
                                <div className="char-info">
                                    <h2>{selectedCharacter.name}</h2>
                                    <div className="tags">
                                        {selectedCharacter.tags?.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                    <p>{selectedCharacter.dict}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. 右上: アセット（アイコン・立ち絵） */}
                        <div className="assets-section">
                            <div className="icons-section">
                                <h4>表情アイコン (60x60)</h4>
                                <div className="icon-grid">
                                    {getCharacterVariants(selectedCharacter.name).map(variant => (
                                        <div key={variant} className="icon-item">
                                            <img src={getCharacterIconUrl(selectedCharacter.name, variant)} alt={variant} />
                                            <span>{variant}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="standing-section">
                                <h4>立ち絵ギャラリー</h4>
                                <div className="standing-gallery">
                                    {selectedCharacter.standing?.map((url, idx) => (
                                        <img key={idx} src={resolveAssetUrl(url)} alt="Standing" className="standing-img" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. 下段: CGギャラリー */}
                        <div className="cg-section">
                            <h4>CGギャラリー (1920x1080)</h4>
                            <div className="cg-gallery">
                                {selectedCharacter.cgs?.length > 0 ? (
                                    selectedCharacter.cgs.map((url, idx) => (
                                        <img key={idx} src={resolveAssetUrl(url)} alt="CG" className="cg-img" />
                                    ))
                                ) : (
                                    <div className="no-cg">CGがありません</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-selection">キャラクターを選択してください</div>
                )}
            </div>
        </div>
    ) : null}
</div>
```

---

## 2. CSS Reference (collection.css)

レイアウトを再現するための主要CSS構造です。

```css
/* Layout Containers */
.character-encyclopedia {
    display: flex;
    height: 100%;
    overflow: hidden;
}

.character-list {
    width: 250px;
    background: rgba(0, 0, 0, 0.2);
    border-right: 1px solid #333;
    overflow-y: auto;
    flex-shrink: 0;
}

.character-detail {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.1);
}

/* Detail Grid Layout */
.detail-grid {
    display: grid;
    grid-template-columns: 350px 1fr; /* Left: Card, Right: Assets */
    grid-template-rows: auto auto;    /* Row1: Main, Row2: CGs */
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

/* Character Card */
.char-card {
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid #444;
    border-radius: 12px;
    overflow: hidden;
}

.char-card img {
    width: 100%;
    height: auto;
    display: block;
    border-bottom: 1px solid #333;
}

.char-info {
    padding: 1.5rem;
}

/* Grid Cell Placements */
.card-section {
    grid-column: 1;
    grid-row: 1;
}

.assets-section {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.cg-section {
    grid-column: 1 / -1; /* Span full width */
    grid-row: 2;
    margin-top: 1rem;
    padding-top: 2rem;
    border-top: 1px solid #333;
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-17
