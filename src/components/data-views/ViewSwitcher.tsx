import { Menu, Grid3x3, LayoutList, IdCard } from 'lucide-react';

export type CollectionViewType = 'list' | 'gallery' | 'kanban' | 'custom';

interface ViewSwitcherProps {
    currentView: CollectionViewType;
    onViewChange: (view: CollectionViewType) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    const views: { id: CollectionViewType; icon: typeof Menu; label: string }[] = [
        { id: 'list', icon: Menu, label: 'リスト表示' },
        { id: 'gallery', icon: Grid3x3, label: 'ギャラリー表示' },
        { id: 'kanban', icon: LayoutList, label: 'カンバン表示' },
        { id: 'custom', icon: IdCard, label: '詳細表示' }
    ];

    return (
        <div className="inline-flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
            {views.map((view) => {
                const Icon = view.icon;
                return (
                    <button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={`
              p-2 rounded transition-all flex items-center justify-center
              ${currentView === view.id
                                ? 'bg-gray-700 text-yellow-400'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                            }
            `}
                        title={view.label}
                        aria-label={view.label}
                    >
                        <Icon size={18} strokeWidth={2} />
                    </button>
                );
            })}
        </div>
    );
}
