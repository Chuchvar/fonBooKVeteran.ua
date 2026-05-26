import { IUser } from '../types/user.type';
import axios from '../utils/axios';

class VerificationService {
    async submitVerification(formData: FormData) {
        try {
            const { data } = await axios.post('/api/user/verify', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Помилка відправки верифікації');
        }
    }

    async getPendingVerifications(): Promise<IUser[]> {
        try {
            const { data } = await axios.get('/api/admin/verifications');
            return data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Помилка отримання заявок');
        }
    }

    async updateVerificationStatus(id: number, status: string, message?: string) {
        try {
            const { data } = await axios.put(`/api/admin/verifications/${id}/status`, null, {
                params: { status, message }
            });
            return data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Помилка оновлення статусу');
        }
    }
}

export const verificationService = new VerificationService();
