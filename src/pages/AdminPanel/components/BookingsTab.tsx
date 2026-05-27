import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../../utils/axios';
import { PAGES } from '../../../constants/url.constants';
import { bookingService } from '../../../services/booking.service';
import { userService } from '../../../services/user.service';
import styles from '../AdminPanel.module.scss';

const BookingsTab: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [rejectingBookingId, setRejectingBookingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectPredefinedReason, setRejectPredefinedReason] = useState('');
    const [historyUser, setHistoryUser] = useState<any | null>(null);

    const { data: bookings, isLoading: isBookingsLoading } = useQuery({
        queryKey: ['allBookings'],
        queryFn: () => bookingService.getAllBookings(),
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filteredBookings = bookings?.filter((b: any) => {
        const matchesSearch = 
            b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            b.user?.phone?.includes(searchTerm) || 
            b.sanatorium?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const updateBookingStatusMutation = useMutation({
        mutationFn: ({ id, status, reason }: { id: number, status: string, reason?: string }) => 
            bookingService.updateBookingStatus(id, status, reason),
        onSuccess: () => {
            toast.success('Статус заявки змінено');
            setRejectingBookingId(null);
            setRejectReason('');
            setRejectPredefinedReason('');
            queryClient.invalidateQueries({ queryKey: ['allBookings'] });
        },
        onError: (error: Error) => toast.error(`Помилка: ${error.message}`),
    });

    const toggleBanMutation = useMutation({
        mutationFn: ({ id, isBanned }: { id: number, isBanned: boolean }) => 
            userService.toggleBan(id, isBanned),
        onSuccess: (data) => {
            toast.success(data.message);
            if (historyUser) {
                setHistoryUser({ ...historyUser, banned: data.isBanned });
            }
            queryClient.invalidateQueries({ queryKey: ['allBookings'] });
        },
        onError: (error: Error) => toast.error(`Помилка: ${error.message}`),
    });

    const handleViewDocument = async (bookingId: number) => {
        try {
            const response = await axios.get(`/api/bookings/${bookingId}/document`, {
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
            console.error(error);
            toast.error('Не вдалося завантажити документ');
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Розглядається';
            case 'CONFIRMED': return 'Очікує оплати';
            case 'PAID': return 'Оплачено';
            case 'REJECTED': return 'Відхилено';
            case 'CANCELLED': return 'Скасовано';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PENDING': return styles.statusPending;
            case 'CONFIRMED': return styles.statusConfirmed;
            case 'PAID': return styles.statusPaid;
            case 'REJECTED': return styles.statusRejected;
            case 'CANCELLED': return styles.statusCancelled;
            default: return '';
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Всі заявки на бронювання</h2>
            </div>

            <div className={styles.filtersContainer}>
                <input 
                    type="text" 
                    placeholder="Пошук за ветераном, email, телефоном або санаторієм..." 
                    className={styles.filterInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className={styles.filterSelect}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">Всі статуси</option>
                    <option value="PENDING">Розглядається (PENDING)</option>
                    <option value="CONFIRMED">Очікує оплати (CONFIRMED)</option>
                    <option value="PAID">Оплачено (PAID)</option>
                    <option value="REJECTED">Відхилено (REJECTED)</option>
                    <option value="CANCELLED">Скасовано (CANCELLED)</option>
                </select>
            </div>
            
            {isBookingsLoading ? (
                <div className={styles.loading}>Завантаження заявок...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ветеран (Клікніть для історії)</th>
                                <th>Санаторій</th>
                                <th>Заїзд / Виїзд</th>
                                <th>Документ</th>
                                <th>Статус</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings?.length > 0 ? (
                                filteredBookings.map((booking: any) => (
                                    <tr key={booking.id}>
                                        <td 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setHistoryUser(booking.user)}
                                        >
                                            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#1565c0', textDecoration: 'underline', fontWeight: 'bold' }}>{booking.user?.name}</a><br/>
                                            <small style={{color: '#888'}}>{booking.user?.email}</small><br/>
                                            <small style={{color: '#888'}}>📞 {booking.user?.phone || 'Не вказано'}</small>
                                            {booking.user?.banned && <div style={{ fontSize: '11px', color: '#c62828', fontWeight: 'bold', marginTop: '4px' }}>ЗАБЛОКОВАНИЙ</div>}
                                        </td>
                                        <td>
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`${PAGES.SANATORIUM_DETAIL}/${booking.sanatorium?.id}`);
                                                }}
                                                style={{ color: '#1565c0', textDecoration: 'underline' }}
                                            >
                                                {booking.sanatorium?.name}
                                            </a>
                                        </td>
                                        <td>
                                            {booking.checkInDate} — <br/> {booking.checkOutDate}
                                        </td>
                                        <td>
                                            {booking.documentPath ? (
                                                <button 
                                                    onClick={() => handleViewDocument(booking.id)}
                                                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                    title="Документ, прикріплений до цієї заявки"
                                                >
                                                    📄 Переглянути
                                                </button>
                                            ) : (
                                                <span style={{color: '#999', fontSize: '13px'}}>Без документа</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.status === 'PENDING' ? (
                                                <div className={styles.actions}>
                                                    <button 
                                                        className={`${styles.actionBtn} ${styles.approve}`}
                                                        onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: 'CONFIRMED' })}
                                                    >
                                                        Підтвердити
                                                    </button>
                                                    <button 
                                                        className={`${styles.actionBtn} ${styles.reject}`}
                                                        onClick={() => setRejectingBookingId(booking.id)}
                                                    >
                                                        Відхилити
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{color: '#888', fontSize: '13px'}}>Оброблено</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                        Нічого не знайдено за вашим запитом.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Модальне вікно для відхилення заявки */}
            {rejectingBookingId !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                        <h3>Відхилити заявку #{rejectingBookingId}</h3>
                        <p style={{ marginBottom: '15px', color: '#555' }}>
                            Вкажіть причину відмови, щоб ветеран розумів, чому заявка не прийнята.
                        </p>
                        
                        <div className={styles.formGroup}>
                            <label>Швидка причина (часто повторювані)</label>
                            <select 
                                className={styles.addSpecSelect} 
                                value={rejectPredefinedReason}
                                onChange={(e) => {
                                    setRejectPredefinedReason(e.target.value);
                                    if (e.target.value) setRejectReason(e.target.value);
                                }}
                                style={{ padding: '10px', width: '100%', marginBottom: '15px' }}
                            >
                                <option value="">- Оберіть або напишіть свою -</option>
                                <option value="Немає вільних місць на обрані дати">Немає вільних місць на обрані дати</option>
                                <option value="Профіль санаторію не співпадає з медичною потребою">Профіль санаторію не співпадає з медичною потребою</option>
                                <option value="Документи заповнено неправильно / неповний пакет">Документи заповнено неправильно / неповний пакет</option>
                                <option value="Вам необхідно пройти додаткове обстеження">Вам необхідно пройти додаткове обстеження</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Або опишіть детальну причину відмови</label>
                            <textarea 
                                value={rejectReason}
                                onChange={(e) => {
                                    setRejectReason(e.target.value);
                                    setRejectPredefinedReason('');
                                }}
                                placeholder="Напишіть докладну причину тут..."
                                style={{ width: '100%', minHeight: '80px', padding: '10px' }}
                            />
                        </div>

                        <div className={styles.formActions} style={{ marginTop: '20px' }}>
                            <button 
                                type="button" 
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setRejectingBookingId(null);
                                    setRejectReason('');
                                    setRejectPredefinedReason('');
                                }}
                                disabled={updateBookingStatusMutation.isPending}
                            >
                                Скасувати
                            </button>
                            <button 
                                type="button" 
                                className={styles.submitBtn}
                                style={{ background: '#d32f2f' }}
                                onClick={() => {
                                    if (!rejectReason.trim()) {
                                        toast.error('Будь ласка, вкажіть причину відмови');
                                        return;
                                    }
                                    updateBookingStatusMutation.mutate({ 
                                        id: rejectingBookingId, 
                                        status: 'REJECTED', 
                                        reason: rejectReason.trim() 
                                    });
                                }}
                                disabled={updateBookingStatusMutation.isPending}
                            >
                                {updateBookingStatusMutation.isPending ? 'Зачекайте...' : 'Підтвердити відмову'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальне вікно профілю користувача: Історія заявок та Бан */}
            {historyUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Профіль: {historyUser.name}</h3>
                            <button 
                                className={`${styles.actionBtn} ${historyUser.banned ? styles.approve : styles.reject}`}
                                onClick={() => toggleBanMutation.mutate({ id: historyUser.id, isBanned: !historyUser.banned })}
                                disabled={toggleBanMutation.isPending}
                            >
                                {toggleBanMutation.isPending ? 'Зачекайте...' : (historyUser.banned ? '🟢 Розблокувати акаунт' : '🔴 Заблокувати акаунт')}
                            </button>
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: '20px', 
                            background: 'var(--bg-color)', 
                            border: '1px solid var(--border-color)', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            marginBottom: '25px',
                            alignItems: 'center'
                        }}>
                            {historyUser.photoPath ? (
                                <img 
                                    src={`http://localhost:8080/${historyUser.photoPath.replace(/\\/g, '/').replace(/^\//, '')}`} 
                                    alt="Аватар" 
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
                                />
                            ) : (
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: 'var(--text-muted)' }}>
                                    👤
                                </div>
                            )}
                            <div style={{ flex: 1, color: 'var(--text-main)', fontSize: '15px' }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', fontFamily: "'Cormorant Garamond', serif" }}>
                                    {historyUser.name}
                                </p>
                                <p style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ✉️ {historyUser.email}
                                </p>
                                <p style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📱 {historyUser.phone || 'Не вказано'}
                                </p>
                                {historyUser.documentPath && (
                                    <a 
                                        href={`http://localhost:8080/${historyUser.documentPath.replace(/\\/g, '/').replace(/^\//, '')}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '10px', background: 'var(--primary-color)', color: 'white', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}
                                    >
                                        📄 Документ ветерана
                                    </a>
                                )}
                            </div>
                            {historyUser.banned && (
                                <div style={{ padding: '10px 15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #ffcdd2', textAlign: 'center' }}>
                                    ⚠️ Заблокований
                                </div>
                            )}
                        </div>

                        <h4 style={{ marginBottom: '10px' }}>Історія заявок</h4>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {bookings?.filter((b: any) => (b.user as any)?.id === historyUser.id).length > 0 ? (
                                bookings?.filter((b: any) => (b.user as any)?.id === historyUser.id).map((b: any) => (
                                    <div key={b.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <strong>{b.sanatorium?.name}</strong>
                                            <span className={`${styles.statusBadge} ${getStatusClass(b.status)}`} style={{ zoom: 0.8 }}>
                                                {getStatusLabel(b.status)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                            📅 {b.checkInDate} — {b.checkOutDate} <br/>
                                            {b.message && <div style={{ fontStyle: 'italic', marginTop: '4px' }}>"{b.message}"</div>}
                                            {b.status === 'REJECTED' && b.rejectionReason && (
                                                <div style={{ color: '#c62828', marginTop: '4px' }}>Відмова: {b.rejectionReason}</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#888' }}>Заявок не знайдено.</p>
                            )}
                        </div>

                        <div className={styles.formActions} style={{ marginTop: '20px' }}>
                            <button 
                                type="button" 
                                className={styles.cancelBtn}
                                onClick={() => setHistoryUser(null)}
                            >
                                Закрити вікно
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsTab;
