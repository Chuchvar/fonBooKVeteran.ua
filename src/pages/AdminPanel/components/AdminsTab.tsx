import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../utils/axios';
import styles from '../AdminPanel.module.scss';

const AdminsTab: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleMakeAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Будь ласка, введіть email');
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post('/api/admin/make-admin', { email: email.trim() });
            toast.success(response.data.message || 'Користувачу успішно надано права адміністратора');
            setEmail('');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Сталася помилка при додаванні адміністратора');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.tabContent}>
            <div className={styles.header}>
                <h2 className={styles.title}>Управління адміністраторами</h2>
            </div>

            <div className={styles.formContainer} style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', marginTop: '20px' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Додати нового адміністратора</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    Введіть email існуючого користувача, щоб надати йому права адміністратора.
                </p>
                <form onSubmit={handleMakeAdmin} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email користувача" 
                        required
                        style={{
                            flex: 1,
                            padding: '12px 15px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            fontSize: '16px'
                        }}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{
                            background: 'linear-gradient(135deg, #0a5c5f, #0d7377, #14a3a8)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Завантаження...' : 'Додати адміністратора'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminsTab;
