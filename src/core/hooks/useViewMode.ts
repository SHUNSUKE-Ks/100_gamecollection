import { useState } from 'react';

export type ViewMode = 'list' | 'gallery' | 'kanban' | 'custom';

export function useViewMode(initialMode: ViewMode = 'list') {
    const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
    return { viewMode, setViewMode };
}
