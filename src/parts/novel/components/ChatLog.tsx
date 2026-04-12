// ============================================
// NanoNovel - Chat Log Component
// ============================================

import { useEffect, useRef } from 'react';
import './ChatLog.css';

interface LogEntry {
    storyID: string;
    speaker: string;
    text: string;
}

interface ChatLogProps {
    logs: LogEntry[];
    isOpen: boolean;
    onClose: () => void;
}

export function ChatLog({ logs, isOpen, onClose }: ChatLogProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when opened
    useEffect(() => {
        if (isOpen && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [isOpen, logs]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="chat-log-overlay" onClick={onClose}>
            <div className="chat-log-modal" onClick={(e) => e.stopPropagation()}>
                <header className="chat-log-header">
                    <h2 className="chat-log-title">会話ログ</h2>
                    <button className="chat-log-close" onClick={onClose}>
                        ✕
                    </button>
                </header>

                <div className="chat-log-content" ref={contentRef}>
                    {logs.length === 0 ? (
                        <p className="text-muted text-center">ログがありません</p>
                    ) : (
                        logs.map((entry, index) => (
                            <div key={`${entry.storyID}-${index}`} className="chat-log-item">
                                <p className={`chat-log-speaker ${!entry.speaker ? 'narrator' : ''}`}>
                                    {entry.speaker || 'ナレーション'}
                                </p>
                                <p className="chat-log-text">{entry.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
