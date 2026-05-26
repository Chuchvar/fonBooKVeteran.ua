import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService, ISupportChat, ISupportMessage } from '../../services/support.service';
import styles from './SupportChat.module.scss';

const SupportChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState<ISupportChat | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newFirstMessage, setNewFirstMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Отримати чати користувача
    const { data: chats } = useQuery({
        queryKey: ['supportChats'],
        queryFn: () => supportService.getMyChats(),
        enabled: isOpen,
        refetchInterval: isOpen ? 10000 : false,
    });

    // Отримати повідомлення активного чату
    const { data: messages } = useQuery({
        queryKey: ['supportMessages', activeChat?.id],
        queryFn: () => supportService.getChatMessages(activeChat!.id),
        enabled: !!activeChat,
        refetchInterval: activeChat ? 5000 : false,
    });

    // Створити чат
    const createChatMutation = useMutation({
        mutationFn: () => supportService.createChat(newSubject || 'Загальне питання', newFirstMessage),
        onSuccess: (newChat) => {
            queryClient.invalidateQueries({ queryKey: ['supportChats'] });
            setActiveChat(newChat);
            setShowNewChat(false);
            setNewSubject('');
            setNewFirstMessage('');
        }
    });

    // Надіслати повідомлення
    const sendMutation = useMutation({
        mutationFn: () => supportService.sendMessage(activeChat!.id, newMessage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supportMessages', activeChat?.id] });
            setNewMessage('');
        }
    });

    // Автоскрол
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMutation.mutate();
    };

    const handleCreateChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFirstMessage.trim()) return;
        createChatMutation.mutate();
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Плаваюча кнопка */}
            <button
                className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Панель чату */}
            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        {activeChat ? (
                            <>
                                <button className={styles.backBtn} onClick={() => setActiveChat(null)}>←</button>
                                <div className={styles.headerInfo}>
                                    <span className={styles.headerTitle}>{activeChat.subject}</span>
                                    <span className={`${styles.headerStatus} ${activeChat.status === 'OPEN' ? styles.statusOpen : styles.statusClosed}`}>
                                        {activeChat.status === 'OPEN' ? '● Відкритий' : '● Закритий'}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <span className={styles.headerTitle}>Технічна підтримка</span>
                        )}
                    </div>

                    <div className={styles.panelBody}>
                        {!activeChat && !showNewChat && (
                            <>
                                <div className={styles.chatList}>
                                    {chats && chats.length > 0 ? (
                                        chats.map(chat => (
                                            <button
                                                key={chat.id}
                                                className={styles.chatItem}
                                                onClick={() => setActiveChat(chat)}
                                            >
                                                <div className={styles.chatItemTop}>
                                                    <span className={styles.chatSubject}>{chat.subject}</span>
                                                    <span className={`${styles.chatBadge} ${chat.status === 'OPEN' ? styles.badgeOpen : styles.badgeClosed}`}>
                                                        {chat.status === 'OPEN' ? 'Відкритий' : 'Закритий'}
                                                    </span>
                                                </div>
                                                <span className={styles.chatDate}>{formatTime(chat.createdAt)}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className={styles.emptyText}>У вас поки немає звернень</p>
                                    )}
                                </div>
                                <button className={styles.newChatBtn} onClick={() => setShowNewChat(true)}>
                                    + Нове звернення
                                </button>
                            </>
                        )}

                        {!activeChat && showNewChat && (
                            <form className={styles.newChatForm} onSubmit={handleCreateChat}>
                                <label className={styles.formLabel}>Тема</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="напр. Питання по бронюванню"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                />
                                <label className={styles.formLabel}>Повідомлення</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="Опишіть ваше питання..."
                                    value={newFirstMessage}
                                    onChange={(e) => setNewFirstMessage(e.target.value)}
                                    rows={4}
                                    required
                                />
                                <div className={styles.formActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setShowNewChat(false)}>
                                        Скасувати
                                    </button>
                                    <button type="submit" className={styles.submitBtn} disabled={createChatMutation.isPending}>
                                        {createChatMutation.isPending ? 'Надсилаємо...' : 'Надіслати'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeChat && (
                            <>
                                <div className={styles.messagesArea}>
                                    {messages && messages.map((msg: ISupportMessage) => (
                                        <div
                                            key={msg.id}
                                            className={`${styles.bubble} ${msg.senderRole === 'USER' ? styles.bubbleUser : styles.bubbleAdmin}`}
                                        >
                                            <div className={styles.bubbleName}>
                                                {msg.senderRole === 'ADMIN' ? '🛡️ Підтримка' : msg.senderName}
                                            </div>
                                            <div className={styles.bubbleText}>{msg.message}</div>
                                            <div className={styles.bubbleTime}>{formatTime(msg.createdAt)}</div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                {activeChat.status === 'OPEN' ? (
                                    <form className={styles.inputArea} onSubmit={handleSend}>
                                        <input
                                            className={styles.messageInput}
                                            type="text"
                                            placeholder="Введіть повідомлення..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button type="submit" className={styles.sendBtn} disabled={sendMutation.isPending}>
                                            ➤
                                        </button>
                                    </form>
                                ) : (
                                    <div className={styles.closedBanner}>Це звернення закрито</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SupportChat;
