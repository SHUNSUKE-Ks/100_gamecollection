// ============================================
// NanoNovel - Battle Screen
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import enemyData from "@/data/collection/enemies.json";
import skillData from "@/data/collection/skills.json";
import type { Enemy, Skill } from '@/core/types';
import './BattleScreen.css';

// Type assertions
const enemies = (enemyData as unknown as { enemies: Enemy[] }).enemies;
const skills = (skillData as unknown as { skills: Skill[] }).skills;

// Battle state types
interface Combatant {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    str: number;
    dex: number;
    int: number;
    isDefending: boolean;
}

interface BattleLog {
    message: string;
    type: 'damage' | 'heal' | 'info';
}

type BattlePhase = 'player' | 'enemy' | 'victory' | 'defeat';

export function BattleScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const addItem = useGameStore((state) => state.addItem);

    // Battle state
    const [turn, setTurn] = useState(1);
    const [phase, setPhase] = useState<BattlePhase>('player');
    const [logs, setLogs] = useState<BattleLog[]>([]);

    // Get a random enemy for this battle
    const [currentEnemy] = useState<Enemy>(() => enemies[Math.floor(Math.random() * enemies.length)]);

    // Player combatant
    const [player, setPlayer] = useState<Combatant>({
        id: 'hero',
        name: '主人公',
        hp: 100,
        maxHp: 100,
        mp: 30,
        maxMp: 30,
        str: 12,
        dex: 10,
        int: 8,
        isDefending: false,
    });

    // Enemy combatant
    const [enemy, setEnemy] = useState<Combatant>(() => ({
        id: currentEnemy.id,
        name: currentEnemy.name,
        hp: currentEnemy.status.hp,
        maxHp: currentEnemy.status.hp,
        mp: currentEnemy.status.mp,
        maxMp: currentEnemy.status.mp,
        str: currentEnemy.status.str,
        dex: currentEnemy.status.dex,
        int: currentEnemy.status.int,
        isDefending: false,
    }));

    // Player skills
    const playerSkills = skills.filter(s => ['slash', 'guard', 'heal'].includes(s.id));

    // Add to log
    const addLog = useCallback((message: string, type: BattleLog['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-9), { message, type }]);
    }, []);

    // Calculate damage
    const calculateDamage = (attacker: Combatant, skill: Skill, defender: Combatant): number => {
        const scaleStat = skill.power.scale === 'str' ? attacker.str
            : skill.power.scale === 'int' ? attacker.int
                : attacker.dex;

        let damage = skill.power.base + Math.floor(scaleStat * 0.5);

        // Randomize slightly
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

        // Defense reduction
        if (defender.isDefending) {
            damage = Math.floor(damage * 0.5);
        }

        return Math.max(1, damage);
    };

    // Player uses skill
    const useSkill = useCallback((skill: Skill) => {
        if (phase !== 'player') return;

        // Check MP cost
        if (player.mp < skill.cost.mp) {
            addLog('MPが足りない！', 'info');
            return;
        }

        // Consume MP
        setPlayer(prev => ({ ...prev, mp: prev.mp - skill.cost.mp, isDefending: false }));

        if (skill.target === 'self') {
            // Self-target skill
            if (skill.id === 'guard') {
                setPlayer(prev => ({ ...prev, isDefending: true }));
                addLog(`${player.name}は防御の構えをとった！`, 'info');
            } else if (skill.id === 'heal') {
                const healAmount = skill.power.base + Math.floor(player.int * 0.5);
                setPlayer(prev => ({
                    ...prev,
                    hp: Math.min(prev.maxHp, prev.hp + healAmount)
                }));
                addLog(`${player.name}は${healAmount}回復した！`, 'heal');
            }
        } else {
            // Attack skill
            const damage = calculateDamage(player, skill, enemy);
            setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
            addLog(`${player.name}の${skill.name}！ ${enemy.name}に${damage}のダメージ！`, 'damage');
        }

        // Switch to enemy phase
        setPhase('enemy');
    }, [phase, player, enemy, addLog]);

    // Enemy AI action
    useEffect(() => {
        if (phase !== 'enemy') return;

        // Check if enemy is defeated
        if (enemy.hp <= 0) {
            setPhase('victory');
            addLog(`${enemy.name}を倒した！`, 'info');
            return;
        }

        // Enemy acts after delay
        const timer = setTimeout(() => {
            // Get enemy skill
            const enemySkillId = currentEnemy.skills[Math.floor(Math.random() * currentEnemy.skills.length)];
            const enemySkill = skills.find(s => s.id === enemySkillId) || skills.find(s => s.id === 'scratch')!;

            // Calculate and apply damage
            const damage = calculateDamage(enemy, enemySkill, player);

            setPlayer(prev => {
                const newHp = Math.max(0, prev.hp - damage);
                if (newHp <= 0) {
                    setPhase('defeat');
                    addLog(`${player.name}は倒れた...`, 'damage');
                }
                return { ...prev, hp: newHp, isDefending: false };
            });

            addLog(`${enemy.name}の${enemySkill.name}！ ${player.name}に${damage}のダメージ！`, 'damage');

            // Check if player is still alive
            if (player.hp - damage > 0) {
                setTurn(prev => prev + 1);
                setPhase('player');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [phase, enemy, player, currentEnemy, addLog]);

    // Handle battle end
    const handleBattleEnd = () => {
        if (phase === 'victory') {
            // Add rewards
            currentEnemy.drop.items.forEach(itemId => addItem(itemId, 1));
            setScreen('NOVEL');
        } else {
            setScreen('TITLE');
        }
    };

    return (
        <div className="battle-screen">
            {/* Header */}
            <header className="battle-header">
                <span className="battle-turn">Turn {turn}</span>
                <span className="battle-turn">{phase === 'player' ? 'あなたのターン' : '敵のターン'}</span>
            </header>

            {/* Battle Log */}
            <div className="battle-log">
                {logs.map((log, i) => (
                    <div key={i} className={`battle-log-item battle-log-${log.type}`}>
                        {log.message}
                    </div>
                ))}
            </div>

            {/* Main Battle Area */}
            <main className="battle-main">
                {/* Enemy Display */}
                <div className="battle-enemy-area">
                    <div className="battle-enemy">
                        <div className="battle-enemy-image">
                            {currentEnemy.imageTag || enemy.name}
                        </div>
                        <h3 className="battle-enemy-name">{enemy.name}</h3>
                        <div className="battle-hp-bar">
                            <div
                                className="battle-hp-fill"
                                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                            />
                            <span className="battle-hp-text">{enemy.hp}/{enemy.maxHp}</span>
                        </div>
                    </div>
                </div>

                {/* Player Status */}
                <div className="battle-player-area">
                    <div className="battle-player-status">
                        <span className="battle-player-name">{player.name}</span>
                        <div className="battle-player-bars">
                            <div className="battle-stat-row">
                                <span className="battle-stat-label">HP</span>
                                <div className="battle-stat-bar">
                                    <div
                                        className="battle-stat-fill-hp"
                                        style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                                    />
                                    <span className="battle-stat-text">{player.hp}/{player.maxHp}</span>
                                </div>
                            </div>
                            <div className="battle-stat-row">
                                <span className="battle-stat-label">MP</span>
                                <div className="battle-stat-bar">
                                    <div
                                        className="battle-stat-fill-mp"
                                        style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                                    />
                                    <span className="battle-stat-text">{player.mp}/{player.maxMp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skill Buttons */}
                <div className="battle-actions">
                    {playerSkills.map(skill => (
                        <button
                            key={skill.id}
                            className="battle-skill-btn"
                            onClick={() => useSkill(skill)}
                            disabled={phase !== 'player' || player.mp < skill.cost.mp}
                        >
                            {skill.name}
                            {skill.cost.mp > 0 && (
                                <div className="battle-skill-cost">MP: {skill.cost.mp}</div>
                            )}
                        </button>
                    ))}
                </div>
            </main>

            {/* Victory/Defeat Overlay */}
            {(phase === 'victory' || phase === 'defeat') && (
                <div className="battle-result-overlay">
                    <div className="battle-result">
                        <h1 className={`battle-result-title ${phase}`}>
                            {phase === 'victory' ? 'VICTORY！' : 'DEFEAT...'}
                        </h1>
                        {phase === 'victory' && (
                            <div className="battle-result-rewards">
                                <p>獲得報酬:</p>
                                <p>EXP: {currentEnemy.drop.exp}</p>
                                <p>Gold: {currentEnemy.drop.gold}</p>
                            </div>
                        )}
                        <button className="btn btn-primary battle-result-btn" onClick={handleBattleEnd}>
                            {phase === 'victory' ? '続ける' : 'タイトルへ'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
