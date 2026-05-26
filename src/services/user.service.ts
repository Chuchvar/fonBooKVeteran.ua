import axios from '../utils/axios';

class UserService {
    async toggleBan(userId: number, banned: boolean) {
        try {
            const { data } = await axios.put(`/api/admin/users/${userId}/ban`, null, {
                params: { banned }
            });
            return data;
        } catch (error: unknown) {
            console.error('Error toggling ban status:', error);
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Помилка при зміні статусу блокування');
        }
    }
}

export const userService = new UserService();
