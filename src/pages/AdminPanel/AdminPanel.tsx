import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '../../constants/url.constants';
import { authService } from '../../services/auth.service';
import DashboardTab from './components/DashboardTab';
import BookingsTab from './components/BookingsTab';
import SupportTab from './components/SupportTab';
import VerificationsTab from './components/VerificationsTab';
import SanatoriumsTab from './components/SanatoriumsTab';
import AuditLogsTab from './components/AuditLogsTab';
import AdminsTab from './components/AdminsTab';
import styles from './AdminPanel.module.scss';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'sanatoriums' | 'bookings' | 'support' | 'verifications' | 'audit' | 'admins'>('dashboard');
    const navigate = useNavigate();

    // Перевірка прав адміністратора
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ['userData'],
        queryFn: () => authService.getUserData(),
    });



    // Рендер
    if (isUserLoading) {
        return <div className={styles.loading}>Перевірка прав доступу...</div>;
    }

    if (userData?.user?.role !== 'ADMIN') {
        return (
            <div className={styles.error}>
                <h1>Доступ заборонено</h1>
                <p>Ця сторінка доступна лише для адміністраторів.</p>
                <button className={styles.addButton} onClick={() => navigate(PAGES.HOME)}>На головну</button>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Панель адміністратора</h1>
                </div>

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Дашборд
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'sanatoriums' ? styles.active : ''}`}
                        onClick={() => setActiveTab('sanatoriums')}
                    >
                        Управління санаторіями
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'bookings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        Управління заявками
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'support' ? styles.active : ''}`}
                        onClick={() => setActiveTab('support')}
                    >
                        Підтримка
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'verifications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('verifications')}
                    >
                        Верифікація
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'audit' ? styles.active : ''}`}
                        onClick={() => setActiveTab('audit')}
                    >
                        Журнал аудиту
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'admins' ? styles.active : ''}`}
                        onClick={() => setActiveTab('admins')}
                    >
                        Адміністратори
                    </button>
                </div>

                {/* Вкладка: Дашборд */}
                {activeTab === 'dashboard' && <DashboardTab />}

                {/* Вкладка: Санаторії */}
                {activeTab === 'sanatoriums' && <SanatoriumsTab />}

                {/* Вкладка: Заявки */}
                {activeTab === 'bookings' && <BookingsTab />}

                {/* Вкладка: Верифікації */}
                {activeTab === 'verifications' && <VerificationsTab />}



                {/* Вкладка: Підтримка */}
                {activeTab === 'support' && <SupportTab />}

                {/* Вкладка: Аудит */}
                {activeTab === 'audit' && <AuditLogsTab />}

                {/* Вкладка: Адміністратори */}
                {activeTab === 'admins' && <AdminsTab />}
            </div>
        </div>
    );
};

export default AdminPanel;
