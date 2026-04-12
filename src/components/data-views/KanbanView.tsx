interface KanbanViewProps {
    data: any[];
}

export function KanbanView({ data }: KanbanViewProps) {
    // For wireframe, just grouping by a dummy 'Status' since characters.json doesn't represent workflow state
    // We'll simulate columns like "To Do", "In Progress" (conceptually for Database) or Categories
    const columns = [
        { id: 'all', title: 'All Items', items: data },
        { id: 'favorite', title: 'Favorites', items: [] }, // Dummy
    ];

    return (
        <div className="flex gap-6 p-4 overflow-x-auto h-full">
            {columns.map(col => (
                <div key={col.id} className="min-w-[300px] bg-gray-900/50 rounded-lg p-2 flex flex-col h-full border border-gray-800">
                    <header className="p-3 font-bold text-gray-400 flex justify-between items-center mb-2">
                        <span>{col.title}</span>
                        <span className="bg-gray-800 px-2 py-0.5 rounded text-xs">{col.items.length}</span>
                    </header>

                    <div className="flex-1 overflow-y-auto space-y-3 p-1">
                        {col.items.map((item, idx) => (
                            <div key={idx} className="bg-gray-800 p-3 rounded border border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-750">
                                <h4 className="font-medium text-gray-200">{item.name}</h4>
                                <div className="flex gap-1 mt-2">
                                    <span className="text-xs bg-gray-900 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700">
                                        ID: {item.id}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {col.items.length === 0 && (
                            <div className="text-center py-10 text-gray-600 text-xs italic border-2 border-dashed border-gray-800 rounded">
                                No items
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
