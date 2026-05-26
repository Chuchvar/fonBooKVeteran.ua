/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from '../../../utils/axios';
import { verificationService } from '../../../services/verification.service';
import styles from '../AdminPanel.module.scss';

const VerificationsTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [rejectingVerificationId, setRejectingVerificationId] = useState<number | null>(null);
    const [rejectVerificationReason, setRejectVerificationReason] = useState('');

    const { data: verifications, isLoading: isVerificationsLoading } = useQuery({
        queryKey: ['adminVerifications'],
        queryFn: () => verificationService.getPendingVerifications(),
    });

    const updateVerificationStatusMutation = useMutation({
        mutationFn: ({ id, status, message }: { id: number, status: string, message?: string }) => 
            verificationService.updateVerificationStatus(id, status, message),
        onSuccess: () => {
            toast.success('Статус верифікації змінено');
            setRejectingVerificationId(null);
            setRejectVerificationReason('');
            queryClient.invalidateQueries({ queryKey: ['adminVerifications'] });
        },
        onError: (error: any) => toast.error(`Помилка: ${error.message}`),
    });

    const handleViewVerificationFile = async (userId: number, type: string) => {
        try {
            const response = await axios.get(`/api/admin/verifications/${userId}/file?type=${type}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Не вдалося завантажити файл верифікації');
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Заявки на верифікацію акаунтів</h2>
            </div>
            
            {isVerificationsLoading ? (
                <div className={styles.loading}>Завантаження...</div>
            ) : verifications && verifications.length > 0 ? (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ім'я та Email</th>
                                <th>Фото (Селфі)</th>
                                <th>Документ (УБД)</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {verifications.map((user: any) => (
                                <tr key={user.id}>
                                    <td>
                                        <strong>{user.name}</strong><br/>
                                        <small style={{color: '#888'}}>{user.email}</small>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleViewVerificationFile(user.id, 'photo')}
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                        >
                                            📷 Переглянути
                                        </button>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleViewVerificationFile(user.id, 'document')}
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                        >
                                            📄 Переглянути
                                        </button>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.approve}`}
                                                onClick={() => {
                                                    if (window.confirm('Схвалити верифікацію для цього користувача?')) {
                                                        updateVerificationStatusMutation.mutate({ id: user.id, status: 'APPROVED' })
                                                    }
                                                }}
                                            >
                                                Схвалити
                                            </button>
                                            <button 
                                                className={`${styles.actionBtn} ${styles.reject}`}
                                                onClick={() => setRejectingVerificationId(user.id)}
                                            >
                                                Відхилити
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#555' }}>Немає нових заявок на верифікацію.</p>
            )}

            {/* Модальне вікно для відхилення верифікації */}
            {rejectingVerificationId !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                        <h3>Відхилити верифікацію</h3>
                        <p style={{ marginBottom: '15px', color: '#555' }}>
                            Вкажіть причину відмови, щоб користувач міг виправити помилку.
                        </p>
                        
                        <div className={styles.formGroup}>
                            <label>Причина відмови (обов'язково)</label>
                            <textarea
                                value={rejectVerificationReason}
                                onChange={(e) => setRejectVerificationReason(e.target.value)}
                                placeholder="Наприклад: 'Фото документа нечітке, будь ласка, завантажте ще раз.'"
                                style={{ padding: '10px', width: '100%', minHeight: '80px', marginBottom: '15px' }}
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button 
                                type="button" 
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setRejectingVerificationId(null);
                                    setRejectVerificationReason('');
                                }}
                            >
                                Скасувати
                            </button>
                            <button 
                                type="button" 
                                className={styles.submitBtn}
                                style={{ backgroundColor: '#c62828' }}
                                disabled={updateVerificationStatusMutation.isPending || rejectVerificationReason.trim() === ''}
                                onClick={() => updateVerificationStatusMutation.mutate({ 
                                    id: rejectingVerificationId, 
                                    status: 'REJECTED',
                                    message: rejectVerificationReason
                                })}
                            >
                                {updateVerificationStatusMutation.isPending ? 'Відхилення...' : 'Відхилити заявку'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationsTab;
