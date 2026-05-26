import axios from '../utils/axios';

export interface ISupportChat {
    id: number;
    userId: number;
    userName: string;
    subject: string;
    status: string;
    createdAt: string;
    adminId?: number;
}

export interface ISupportMessage {
    id: number;
    chatId: number;
    senderId: number;
    senderRole: string;
    senderName: string;
    message: string;
    createdAt: string;
}

class SupportService {
    async createChat(subject: string, message: string): Promise<ISupportChat> {
        const { data } = await axios.post('/api/support/chats', { subject, message });
        return data;
    }

    async getMyChats(): Promise<ISupportChat[]> {
        const { data } = await axios.get('/api/support/chats/my');
        return data;
    }

    async getAllChats(): Promise<ISupportChat[]> {
        const { data } = await axios.get('/api/support/chats');
        return data;
    }

    async getChatMessages(chatId: number): Promise<ISupportMessage[]> {
        const { data } = await axios.get(`/api/support/chats/${chatId}/messages`);
        return data;
    }

    async sendMessage(chatId: number, message: string): Promise<ISupportMessage> {
        const { data } = await axios.post(`/api/support/chats/${chatId}/messages`, { message });
        return data;
    }

    async takeChat(chatId: number): Promise<ISupportChat> {
        const { data } = await axios.put(`/api/support/chats/${chatId}/take`);
        return data;
    }

    async closeChat(chatId: number): Promise<void> {
        await axios.put(`/api/support/chats/${chatId}/close`);
    }

    async deleteChat(chatId: number): Promise<void> {
        await axios.delete(`/api/support/chats/${chatId}`);
    }
}

export const supportService = new SupportService();
