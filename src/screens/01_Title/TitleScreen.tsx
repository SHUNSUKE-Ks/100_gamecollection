// ============================================
// NanoNovel - Title Screen (with Save/Load)
// ============================================

import { useState } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { SaveManager } from '@/core/managers/SaveManager';
import { SaveLoadModal } from '@/parts/novel/components/SaveLoadModal';
import './TitleScreen.css';

export function TitleScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const resetGame = useGameStore((state) => state.resetGame);
    const setStoryID = useGameStore((state) => state.setStoryID);

    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

    // Check if continue is available
    const hasSaveData = SaveManager.hasSaveData();

    const handleNewGame = () => {
        resetGame();
        setScreen('CHAPTER');
    };

    const handleContinue = () => {
        // If we have save data, open load modal
        if (hasSaveData) {
            setIsLoadModalOpen(true);
        } else {
            // No save data, just go to novel (shouldn't happen if button is disabled)
            setScreen('NOVEL');
        }
    };

    // API Battle Test handler
    const handleApiBattleTest = () => {
        resetGame();
        setStoryID('API_TEST_01');
        setScreen('NOVEL');
    };

    return (
        <div className="title-screen">
            <div className="title-decoration title-decoration-top" />

            <div className="title-content">
                <div className="title-logo">
                    <img src="/src/assets/ui/logo.svg" alt="NanoNovel Logo" width="80" height="80" />
                </div>

                <h1 className="title-main">NanoNovel</h1>
                <p className="title-subtitle">AI駆動ノベルゲーム</p>

                <div className="title-menu">
                    <button
                        className="btn btn-primary btn-start"
                        onClick={handleNewGame}
                    >
                        New Game
                    </button>
                    <button
                        className={`btn ${!hasSaveData ? 'btn-disabled' : ''}`}
                        onClick={handleContinue}
                        disabled={!hasSaveData}
                    >
                        Continue
                    </button>
                    <button
                        className="btn"
                        onClick={() => setScreen('HOME')}
                    >
                        Home (Standby)
                    </button>
                    <button
                        className="btn"
                        onClick={() => setScreen('COLLECTION')}
                    >
                        Collection
                    </button>
                    <button
                        className="btn"
                        onClick={() => setScreen('MENU')}
                    >
                        Menu
                    </button>
                    <button className="btn">
                        Settings
                    </button>
                    <button
                        className="btn"
                        onClick={handleApiBattleTest}
                        style={{
                            background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                            border: '1px solid #ffd700',
                            color: '#ffd700',
                            marginTop: '0.5rem',
                        }}
                    >
                        🧪 API Battle Test
                    </button>
                </div>
            </div>

            <div className="title-decoration title-decoration-bottom" />

            <footer className="title-footer">
                © 2026 NanoNovel Project
            </footer>

            {/* Load Modal */}
            <SaveLoadModal
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                initialMode="load"
            />
        </div>
    );
}
