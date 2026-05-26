/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/booking.service';
import { verificationService } from '../../../services/verification.service';
import { supportService } from '../../../services/support.service';
import styles from '../AdminPanel.module.scss';

const DashboardTab: React.FC = () => {
    // Fetch data for statistics
    const { data: bookings } = useQuery({
        queryKey: ['allBookings'],
        queryFn: () => bookingService.getAllBookings(),
    });

    const { data: verifications } = useQuery({
        queryKey: ['adminVerifications'],
        queryFn: () => verificationService.getPendingVerifications(),
    });

    const { data: supportChats } = useQuery({
        queryKey: ['adminSupportChats'],
        queryFn: () => supportService.getAllChats(),
    });

    // Calculate statistics
    const newBookingsCount = bookings?.filter((b: any) => b.status === 'PENDING').length || 0;
    const pendingVerificationsCount = verifications?.length || 0;
    const newSupportChatsCount = supportChats?.filter((c: any) => !c.adminId && c.status === 'OPEN').length || 0;
    const yourActiveChatsCount = supportChats?.filter((c: any) => c.adminId && c.status === 'OPEN').length || 0;

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Огляд системи</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* Карточка 1 */}
                <div style={{ background: 'linear-gradient(135deg, #1565c0, #0d47a1)', borderRadius: '16px', padding: '20px', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: 0.9 }}>Нові заявки на путівки</h3>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{newBookingsCount}</div>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>Очікують на підтвердження</p>
                </div>

                {/* Карточка 2 */}
                <div style={{ background: 'linear-gradient(135deg, #e65100, #ef6c00)', borderRadius: '16px', padding: '20px', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: 0.9 }}>Верифікації</h3>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{pendingVerificationsCount}</div>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>Потребують перевірки документів</p>
                </div>

                {/* Карточка 3 */}
                <div style={{ background: 'linear-gradient(135deg, #00838f, #006064)', borderRadius: '16px', padding: '20px', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: 0.9 }}>Вільні чати підтримки</h3>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{newSupportChatsCount}</div>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>Очікують призначення оператора</p>
                </div>

                {/* Карточка 4 */}
                <div style={{ background: 'linear-gradient(135deg, #2e7d32, #1b5e20)', borderRadius: '16px', padding: '20px', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: 0.9 }}>Ваші активні чати</h3>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{yourActiveChatsCount}</div>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>У процесі спілкування</p>
                </div>

            </div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Короткі інструкції</h3>
                <ul style={{ color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '20px' }}>
                    <li><strong>Санаторії:</strong> Переконайтеся, що всі ціни та профілі лікування актуальні.</li>
                    <li><strong>Заявки:</strong> Зв'язуйтеся з санаторієм перед підтвердженням місця для ветерана.</li>
                    <li><strong>Верифікація:</strong> Уважно перевіряйте УБД. Якщо документ нечіткий — відхиліть із проханням завантажити краще фото.</li>
                    <li><strong>Підтримка:</strong> Відповідайте ввічливо та оперативно. Закривайте чат, тільки коли проблема повністю вирішена.</li>
                </ul>
            </div>
        </div>
    );
};

export default DashboardTab;
