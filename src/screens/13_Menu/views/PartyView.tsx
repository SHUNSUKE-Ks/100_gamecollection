// ============================================
// PartyView - Party Management View
// ============================================

import React, { useState } from 'react';
import { useGameStore, type PartyMember } from '@/core/stores/gameStore';
import characterData from '@/data/collection/characters.json';
import { Plus, X, Heart, Zap, Star } from 'lucide-react';

// Styles
const styles = {
    container: "space-y-6",
    partyGrid: "grid grid-cols-4 gap-4",
    slot: "aspect-[3/4] bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center transition-all hover:border-yellow-500/50 cursor-pointer",
    slotFilled: "border-solid border-slate-600 hover:border-yellow-400",
    slotEmpty: "hover:bg-slate-700/30",
    characterImage: "w-24 h-24 rounded-full bg-slate-700 mb-2 flex items-center justify-center text-4xl",
    characterName: "font-bold text-lg",
    levelBadge: "absolute top-2 right-2 bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full text-xs font-bold",
    statBar: "h-2 rounded-full bg-slate-700 overflow-hidden",
    statBarFill: "h-full rounded-full transition-all",
    hpBar: "bg-gradient-to-r from-green-500 to-green-400",
    mpBar: "bg-gradient-to-r from-blue-500 to-blue-400",
    sectionTitle: "text-lg font-bold text-slate-300 mb-3",
    availableGrid: "grid grid-cols-6 gap-2",
    availableCard: "bg-slate-800 rounded-lg p-2 text-center cursor-pointer hover:bg-slate-700 transition-colors",
};

interface PartySlotProps {
    member: PartyMember | null;
    index: number;
    onRemove: (characterId: string) => void;
}

const PartySlot: React.FC<PartySlotProps> = ({ member, index: _index, onRemove }) => {
    // Find character details from collection
    const characterInfo = member
        ? characterData.characters.find(c => c.id === member.characterId)
        : null;

    if (!member) {
        return (
            <div className={`${styles.slot} ${styles.slotEmpty}`}>
                <Plus size={32} className="text-slate-500" />
                <span className="text-sm text-slate-500 mt-2">空きスロット</span>
            </div>
        );
    }

    const hpPercent = (member.hp / member.maxHp) * 100;
    const mpPercent = (member.mp / member.maxMp) * 100;

    return (
        <div className={`${styles.slot} ${styles.slotFilled} relative p-4`}>
            {/* Level Badge */}
            <div className={styles.levelBadge}>
                Lv.{member.level}
            </div>

            {/* Remove Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(member.characterId); }}
                className="absolute top-2 left-2 text-slate-500 hover:text-red-400 transition-colors"
            >
                <X size={16} />
            </button>

            {/* Character Image */}
            <div className={styles.characterImage}>
                {characterInfo?.name?.charAt(0) || '?'}
            </div>

            {/* Name */}
            <div className={styles.characterName}>
                {characterInfo?.name || member.characterId}
            </div>

            {/* Stats */}
            <div className="w-full mt-4 space-y-2">
                {/* HP */}
                <div className="flex items-center gap-2">
                    <Heart size={14} className="text-green-400" />
                    <div className={`flex-1 ${styles.statBar}`}>
                        <div className={`${styles.statBarFill} ${styles.hpBar}`} style={{ width: `${hpPercent}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{member.hp}/{member.maxHp}</span>
                </div>

                {/* MP */}
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-blue-400" />
                    <div className={`flex-1 ${styles.statBar}`}>
                        <div className={`${styles.statBarFill} ${styles.mpBar}`} style={{ width: `${mpPercent}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{member.mp}/{member.maxMp}</span>
                </div>

                {/* EXP */}
                <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-xs text-slate-400">EXP: {member.exp}</span>
                </div>
            </div>
        </div>
    );
};

export const PartyView: React.FC = () => {
    const { party, maxPartySize, addToParty, removeFromParty } = useGameStore();
    const [showAddPanel, setShowAddPanel] = useState(false);

    // Get available characters (not in party)
    const availableCharacters = characterData.characters.filter(
        char => !party.some(p => p.characterId === char.id)
    );

    // Handle adding character to party
    const handleAddCharacter = (characterId: string) => {
        const newMember: PartyMember = {
            characterId,
            level: 1,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            exp: 0,
            equipment: {},
        };
        addToParty(newMember);
        setShowAddPanel(false);
    };

    // Create slots array (filled + empty)
    const slots: (PartyMember | null)[] = [
        ...party,
        ...Array(maxPartySize - party.length).fill(null)
    ];

    return (
        <div className={styles.container}>
            {/* Party Slots */}
            <section>
                <h3 className={styles.sectionTitle}>現在のパーティー ({party.length}/{maxPartySize})</h3>
                <div className={styles.partyGrid}>
                    {slots.map((member, index) => (
                        <div key={member?.characterId || `empty-${index}`} onClick={() => !member && setShowAddPanel(true)}>
                            <PartySlot
                                member={member}
                                index={index}
                                onRemove={removeFromParty}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Add Character Panel */}
            {showAddPanel && party.length < maxPartySize && (
                <section className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={styles.sectionTitle}>キャラクターを追加</h3>
                        <button
                            onClick={() => setShowAddPanel(false)}
                            className="text-slate-500 hover:text-slate-300"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className={styles.availableGrid}>
                        {availableCharacters.map(char => (
                            <button
                                key={char.id}
                                onClick={() => handleAddCharacter(char.id)}
                                className={styles.availableCard}
                            >
                                <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                                    {char.name.charAt(0)}
                                </div>
                                <div className="text-xs font-medium truncate">{char.name}</div>
                            </button>
                        ))}
                        {availableCharacters.length === 0 && (
                            <div className="col-span-6 text-center text-slate-500 py-4">
                                追加できるキャラクターがいません
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};
