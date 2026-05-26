/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supportService, ISupportChat, ISupportMessage } from '../../../services/support.service';
import styles from '../AdminPanel.module.scss';

const SupportTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeSupportChat, setActiveSupportChat] = useState<ISupportChat | null>(null);
    const [supportMessages, setSupportMessages] = useState<ISupportMessage[]>([]);
    const [supportReply, setSupportReply] = useState('');

    const { data: supportChats, isLoading: isSupportLoading } = useQuery({
        queryKey: ['adminSupportChats'],
        queryFn: () => supportService.getAllChats(),
        refetchInterval: 10000,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filteredChats = supportChats?.filter((chat: ISupportChat) => {
        const matchesSearch = 
            chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            chat.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || chat.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const loadSupportMessages = async (chat: ISupportChat) => {
        setActiveSupportChat(chat);
        const msgs = await supportService.getChatMessages(chat.id);
        setSupportMessages(msgs);
    };

    const handleSupportReply = async () => {
        if (!activeSupportChat || !supportReply.trim()) return;
        await supportService.sendMessage(activeSupportChat.id, supportReply);
        setSupportReply('');
        const msgs = await supportService.getChatMessages(activeSupportChat.id);
        setSupportMessages(msgs);
    };

    const handleCloseChat = async (chatId: number) => {
        await supportService.closeChat(chatId);
        queryClient.invalidateQueries({ queryKey: ['adminSupportChats'] });
        if (activeSupportChat?.id === chatId) {
            setActiveSupportChat(null);
            setSupportMessages([]);
        }
    };

    const handleDeleteChat = async (chatId: number) => {
        if (window.confirm("Ви впевнені, що хочете видалити цю переписку назавжди?")) {
            try {
                await supportService.deleteChat(chatId);
                toast.success('Переписку видалено');
                queryClient.invalidateQueries({ queryKey: ['adminSupportChats'] });
                if (activeSupportChat?.id === chatId) {
                    setActiveSupportChat(null);
                    setSupportMessages([]);
                }
            } catch (error: any) {
                toast.error(`Помилка: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const takeChatMutation = useMutation({
        mutationFn: (chatId: number) => supportService.takeChat(chatId),
        onSuccess: (data) => {
            toast.success('Ви взяли цю переписку. Тепер ви можете відповідати.');
            queryClient.invalidateQueries({ queryKey: ['adminSupportChats'] });
            setActiveSupportChat(data);
        },
        onError: (error: any) => toast.error(`Помилка: ${error.response?.data?.error || error.message}`),
    });

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Звернення підтримки</h2>
            </div>

            <div className={styles.filtersContainer}>
                <input 
                    type="text" 
                    placeholder="Пошук за іменем або темою..." 
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
                    <option value="OPEN">Відкриті</option>
                    <option value="CLOSED">Закриті</option>
                </select>
            </div>

            {isSupportLoading ? (
                <div className={styles.loading}>Завантаження...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: activeSupportChat ? '300px 1fr' : '1fr', gap: '20px' }}>
                    {/* Список чатів */}
                    <div>
                        {filteredChats && filteredChats.length > 0 ? (
                            filteredChats.map((chat: ISupportChat) => (
                                <div 
                                    key={chat.id}
                                    onClick={() => loadSupportMessages(chat)}
                                    style={{
                                        padding: '14px',
                                        border: activeSupportChat?.id === chat.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        marginBottom: '8px',
                                        cursor: 'pointer',
                                        background: activeSupportChat?.id === chat.id ? 'var(--input-bg)' : 'var(--bg-secondary)',
                                        color: 'var(--text-main)',
                                        transition: '0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <strong style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '14px', color: 'var(--text-main)' }}>{chat.userName}</strong>
                                        <div>
                                            {!chat.adminId && <span className={`${styles.statusBadge} ${styles.statusPending}`} style={{ marginRight: '6px', zoom: 0.85 }}>Новий</span>}
                                            <span className={`${styles.statusBadge} ${chat.status === 'OPEN' ? styles.statusConfirmed : styles.statusCancelled}`} style={{ zoom: 0.85 }}>
                                                {chat.status === 'OPEN' ? 'Відкритий' : 'Закритий'}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>{chat.subject}</p>
                                    <span style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '11px', color: 'var(--text-muted)', opacity: 0.8 }}>
                                        {new Date(chat.createdAt).toLocaleString('uk-UA')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p style={{ fontFamily: 'Josefin Sans, sans-serif', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Немає звернень, що відповідають пошуку</p>
                        )}
                    </div>

                    {/* Повідомлення */}
                    {activeSupportChat && (
                        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                            {/* Header */}
                            <div style={{ padding: '14px 20px', background: 'var(--btn-gradient)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 600, fontSize: '15px' }}>{activeSupportChat.subject}</div>
                                    <div style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '12px', opacity: 0.8 }}>від {activeSupportChat.userName}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {activeSupportChat.status === 'OPEN' && (
                                        <button 
                                            onClick={() => handleCloseChat(activeSupportChat.id)}
                                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Josefin Sans, sans-serif', fontSize: '12px' }}
                                        >
                                            Закрити тікет
                                        </button>
                                    )}
                                    {supportMessages.some(m => m.senderRole === 'ADMIN') && (
                                        <button 
                                            onClick={() => handleDeleteChat(activeSupportChat.id)}
                                            style={{ background: '#d32f2f', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Josefin Sans, sans-serif', fontSize: '12px', fontWeight: 'bold' }}
                                            title="Видалити переписку назавжди"
                                        >
                                            Видалити
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: 'var(--bg-color)', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {supportMessages.map((msg) => (
                                    <div 
                                        key={msg.id}
                                        style={{
                                            alignSelf: msg.senderRole === 'ADMIN' ? 'flex-end' : 'flex-start',
                                            maxWidth: '75%',
                                            padding: '10px 14px',
                                            borderRadius: msg.senderRole === 'ADMIN' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            background: msg.senderRole === 'ADMIN' ? 'linear-gradient(135deg, #0a5c5f, #0d7377, #14a3a8)' : 'var(--bg-secondary)',
                                            color: msg.senderRole === 'ADMIN' ? '#fff' : 'var(--text-main)',
                                            border: msg.senderRole === 'ADMIN' ? 'none' : '1px solid var(--border-color)',
                                        }}
                                    >
                                        <div style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '11px', fontWeight: 600, marginBottom: '3px', opacity: 0.75 }}>
                                            {msg.senderRole === 'ADMIN' ? '🛡️ Ви' : msg.senderName}
                                        </div>
                                        <div style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                            {msg.message}
                                        </div>
                                        <div style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '10px', textAlign: 'right', marginTop: '4px', opacity: 0.6 }}>
                                            {new Date(msg.createdAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Reply */}
                            {activeSupportChat.status === 'OPEN' && (
                                <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                    {!activeSupportChat.adminId ? (
                                        <div style={{ textAlign: 'center', padding: '10px' }}>
                                            <p style={{ fontFamily: 'Josefin Sans, sans-serif', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                                Цей чат ще ніхто не взяв. Візьміть його, щоб почати переписку.
                                            </p>
                                            <button 
                                                onClick={() => takeChatMutation.mutate(activeSupportChat.id)}
                                                disabled={takeChatMutation.isPending}
                                                style={{ 
                                                    padding: '10px 20px',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    background: 'linear-gradient(135deg, #0a5c5f, #0d7377)', 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {takeChatMutation.isPending ? 'Зачекайте...' : 'Взяти переписку'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                type="text"
                                                placeholder="Введіть відповідь..."
                                                value={supportReply}
                                                onChange={(e) => setSupportReply(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSupportReply()}
                                                style={{ flex: 1, padding: '10px 16px', border: '1px solid var(--input-border)', borderRadius: '25px', fontFamily: 'Josefin Sans, sans-serif', fontSize: '14px', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                            />
                                            <button 
                                                onClick={handleSupportReply}
                                                style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #0a5c5f, #0d7377, #14a3a8)', color: '#fff', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                ➤
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupportTab;
