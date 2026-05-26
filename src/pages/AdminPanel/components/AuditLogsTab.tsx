import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService, IAuditLog } from '../../../services/auditLog.service';
import styles from '../AdminPanel.module.scss';

const AuditLogsTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('');

    const { data: auditLogs, isLoading: isLogsLoading } = useQuery({
        queryKey: ['adminAuditLogs'],
        queryFn: () => auditLogService.getAuditLogs(),
    });

    const uniqueActions = Array.from(new Set(auditLogs?.map(log => log.action) || []));

    const filteredLogs = auditLogs?.filter((log: IAuditLog) => {
        const matchesSearch = 
            log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesAction = filterAction === '' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Журнал аудиту</h2>
            </div>

            <div className={styles.filtersContainer}>
                <input 
                    type="text" 
                    placeholder="Пошук за email або деталями..." 
                    className={styles.filterInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className={styles.filterSelect}
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                >
                    <option value="">Всі дії</option>
                    {uniqueActions.map(action => (
                        <option key={action} value={action}>{action}</option>
                    ))}
                </select>
            </div>

            {isLogsLoading ? (
                <div className={styles.loading}>Завантаження логів...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Час</th>
                                <th>Адміністратор (Email)</th>
                                <th>Дія</th>
                                <th>ID Об'єкта</th>
                                <th>Деталі</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs && filteredLogs.length > 0 ? (
                                filteredLogs.map((log: IAuditLog) => (
                                    <tr key={log.id}>
                                        <td style={{ fontSize: '13px', color: '#555' }}>
                                            {new Date(log.timestamp).toLocaleString('uk-UA')}
                                        </td>
                                        <td>
                                            <strong>{log.adminEmail}</strong>
                                        </td>
                                        <td>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '4px 8px', 
                                                background: '#f0f0f0', 
                                                borderRadius: '4px', 
                                                fontSize: '12px', 
                                                fontWeight: 'bold',
                                                color: '#333'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>{log.entityId || '-'}</td>
                                        <td style={{ fontSize: '14px', maxWidth: '300px', wordWrap: 'break-word' }}>
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                        Логів не знайдено.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLogsTab;
