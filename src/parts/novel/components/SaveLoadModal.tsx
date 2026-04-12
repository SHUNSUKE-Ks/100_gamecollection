// ============================================
// NanoNovel - Save/Load Modal Component (Overhaul)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
    SaveManager,
    type SaveSlotInfo,
    type SaveData
} from '@/core/managers/SaveManager';
import { useGameStore } from '@/core/stores/gameStore';
import './SaveLoadModal.css';

// Background Image Import
import bgImage from '@/assets/bg/campfire1.jpg';

type ModalMode = 'save' | 'load';

interface SaveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: ModalMode;
}

export function SaveLoadModal({
    isOpen,
    onClose,
    initialMode = 'save'
}: SaveLoadModalProps) {
    const [mode, setMode] = useState<ModalMode>(initialMode);
    const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
    const [confirmSlot, setConfirmSlot] = useState<number | null>(null);
    const [confirmAction, setConfirmAction] = useState<'overwrite' | 'delete' | null>(null);
    const [selectedSlotConfig, setSelectedSlotConfig] = useState<number>(0);

    // Game state
    const { currentStoryID, flags, inventory, setStoryID } = useGameStore();
    const [playTime] = useState(0);

    // Load slot info
    const refreshSlots = useCallback(() => {
        setSlots(SaveManager.listSaves());
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshSlots();
            setMode(initialMode);
        }
    }, [isOpen, initialMode, refreshSlots]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (confirmSlot !== null) {
                    setConfirmSlot(null);
                    setConfirmAction(null);
                } else if (isOpen) {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, confirmSlot]);

    // Save to slot
    const handleSave = (slot: number) => {
        const slotInfo = slots[slot];

        if (slotInfo && !slotInfo.isEmpty) {
            setConfirmSlot(slot);
            setConfirmAction('overwrite');
            return;
        }

        executeSave(slot);
    };

    const executeSave = (slot: number) => {
        const saveData: SaveData = {
            storyID: currentStoryID,
            flags: flags as Record<string, unknown>,
            inventory: inventory.map(item => ({ itemID: item.itemId, count: item.count })),
            playTime,
            savedAt: new Date().toISOString(),
            chapterTitle: '第1章 旅立ちの朝', // Should be dynamic
        };

        const success = SaveManager.save(slot, saveData);
        if (success) {
            refreshSlots();
            setConfirmSlot(null);
            setConfirmAction(null);
        }
    };

    // Load from slot
    const handleLoad = (slot: number) => {
        const data = SaveManager.load(slot);
        if (!data) return;

        setStoryID(data.storyID);
        Object.entries(data.flags).forEach(([key, value]) => {
            useGameStore.getState().setFlag(key, value);
        });

        onClose();
    };

    // Delete save
    const handleDeleteClick = (slot: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmSlot(slot);
        setConfirmAction('delete');
    };

    const executeDelete = (slot: number) => {
        SaveManager.delete(slot);
        refreshSlots();
        setConfirmSlot(null);
        setConfirmAction(null);
    };

    const cancelConfirm = () => {
        setConfirmSlot(null);
        setConfirmAction(null);
    };

    if (!isOpen) return null;

    return (
        <div className="slm-overlay" style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            {/* Dark tint overlay */}
            <div className="slm-backdrop"></div>

            <div className="slm-container">
                <header className="slm-header">
                    <h2 className="slm-title">
                        {mode === 'save' ? '冒険の記録をつける' : '冒険を再開する'}
                    </h2>
                    <div className="slm-tabs">
                        <button
                            className={`slm-tab ${mode === 'save' ? 'active' : ''}`}
                            onClick={() => setMode('save')}
                        >
                            Save
                        </button>
                        <button
                            className={`slm-tab ${mode === 'load' ? 'active' : ''}`}
                            onClick={() => setMode('load')}
                        >
                            Load
                        </button>
                    </div>
                    <button className="slm-close" onClick={onClose}>
                        CLOSE
                    </button>
                </header>

                <div className="slm-content">
                    {/* List of Save Slots */}
                    <div className="slm-slot-list">
                        {slots.map((slot) => (
                            <div
                                key={slot.slot}
                                className={`slm-slot-item ${selectedSlotConfig === slot.slot ? 'selected' : ''}`}
                                onClick={() => setSelectedSlotConfig(slot.slot)}
                            >
                                <span className="slm-slot-number">No.{slot.slot + 1}</span>
                                <div className="slm-slot-overview">
                                    {slot.isEmpty ? (
                                        <span className="text-gray-500">No Data</span>
                                    ) : (
                                        <>
                                            <span className="slm-data-title">{slot.data?.chapterTitle || 'Unknown'}</span>
                                            <span className="slm-data-date">{SaveManager.formatDate(slot.data!.savedAt)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Preview of Selected Slot */}
                    <div className="slm-preview-panel">
                        {slots[selectedSlotConfig] && (
                            <div className="slm-preview-content">
                                <h3 className="slm-preview-header">
                                    DATA {selectedSlotConfig + 1}
                                </h3>

                                {slots[selectedSlotConfig].isEmpty ? (
                                    <div className="slm-empty-state">
                                        <p>このスロットにはデータがありません</p>
                                        {mode === 'save' && (
                                            <button className="slm-action-btn primary" onClick={() => handleSave(selectedSlotConfig)}>
                                                ここにセーブする
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="slm-data-detail">
                                        <div className="slm-detail-row">
                                            <span className="label">LOCATION</span>
                                            <span className="value">始まりの村</span>
                                        </div>
                                        <div className="slm-detail-row">
                                            <span className="label">PLAY TIME</span>
                                            <span className="value">{SaveManager.formatPlayTime(slots[selectedSlotConfig].data!.playTime)}</span>
                                        </div>
                                        <div className="slm-detail-row">
                                            <span className="label">SCENARIO</span>
                                            <span className="value">{slots[selectedSlotConfig].data!.storyID}</span>
                                        </div>

                                        <div className="slm-action-area">
                                            {mode === 'save' ? (
                                                <button className="slm-action-btn primary" onClick={() => handleSave(selectedSlotConfig)}>
                                                    上書きセーブ
                                                </button>
                                            ) : (
                                                <button className="slm-action-btn primary" onClick={() => handleLoad(selectedSlotConfig)}>
                                                    ロードして再開
                                                </button>
                                            )}

                                            <button className="slm-action-btn danger" onClick={(e) => handleDeleteClick(selectedSlotConfig, e)}>
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Confirm Dialog Overlay */}
                {confirmSlot !== null && (
                    <div className="slm-confirm-overlay">
                        <div className="slm-confirm-box">
                            <p className="slm-confirm-text">
                                {confirmAction === 'overwrite'
                                    ? 'このデータに上書きしてもよろしいですか？'
                                    : '本当に削除しますか？取り消しはできません。'
                                }
                            </p>
                            <div className="slm-confirm-buttons">
                                <button
                                    className="slm-confirm-btn confirm"
                                    onClick={() => confirmAction === 'overwrite'
                                        ? executeSave(confirmSlot)
                                        : executeDelete(confirmSlot)
                                    }
                                >
                                    実行
                                </button>
                                <button
                                    className="slm-confirm-btn cancel"
                                    onClick={cancelConfirm}
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
