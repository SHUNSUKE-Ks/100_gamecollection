import { Edit, Trash2 } from 'lucide-react';

export interface TableColumn {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
}

interface TableViewProps {
    data: any[];
    columns: TableColumn[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

const styles = {
    container: {
        width: '100%',
        overflowX: 'auto' as const,
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid #334155',
    },
    table: {
        width: '100%',
        textAlign: 'left' as const,
        fontSize: '13px',
        color: '#94a3b8',
        borderCollapse: 'collapse' as const,
    },
    thead: {
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        textTransform: 'uppercase' as const,
        fontWeight: 600,
        fontSize: '11px',
        letterSpacing: '0.05em',
    },
    th: {
        padding: '12px 16px',
        borderBottom: '2px solid #334155',
    },
    tbody: {},
    tr: {
        borderBottom: '1px solid #1e293b',
        transition: 'background-color 0.15s',
    },
    trHover: {
        backgroundColor: '#1e293b',
    },
    td: {
        padding: '10px 16px',
        whiteSpace: 'nowrap' as const,
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    actionTd: {
        padding: '10px 16px',
        textAlign: 'right' as const,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
    },
    actionBtn: {
        padding: '6px',
        background: '#334155',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#94a3b8',
        transition: 'all 0.15s',
    },
    editBtn: {
        ':hover': { color: '#60a5fa', background: '#1e40af' },
    },
    deleteBtn: {
        ':hover': { color: '#f87171', background: '#991b1b' },
    },
    emptyState: {
        padding: '24px',
        textAlign: 'center' as const,
        color: '#64748b',
    },
    idCell: {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#64748b',
        backgroundColor: '#1e293b',
        padding: '2px 8px',
        borderRadius: '4px',
    },
};

export function TableView({ data, columns, onEdit, onDelete }: TableViewProps) {
    if (!data || data.length === 0) {
        return <div style={styles.emptyState}>データがありません</div>;
    }

    return (
        <div style={styles.container}>
            <table style={styles.table}>
                <thead style={styles.thead}>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} style={styles.th}>{col.label}</th>
                        ))}
                        {(onEdit || onDelete) && (
                            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr
                            key={idx}
                            style={styles.tr}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            {columns.map(col => (
                                <td key={col.key} style={styles.td}>
                                    {col.key === 'id' ? (
                                        <span style={styles.idCell}>{item[col.key]}</span>
                                    ) : col.render ? (
                                        col.render(item[col.key], item)
                                    ) : (
                                        String(item[col.key] || '-')
                                    )}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td style={styles.actionTd as any}>
                                    {onEdit && (
                                        <button
                                            style={styles.actionBtn}
                                            onClick={() => onEdit(item)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#60a5fa';
                                                e.currentTarget.style.backgroundColor = '#1e3a5f';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#94a3b8';
                                                e.currentTarget.style.backgroundColor = '#334155';
                                            }}
                                        >
                                            <Edit size={14} />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            style={styles.actionBtn}
                                            onClick={() => onDelete(item)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#f87171';
                                                e.currentTarget.style.backgroundColor = '#5f1e1e';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#94a3b8';
                                                e.currentTarget.style.backgroundColor = '#334155';
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

