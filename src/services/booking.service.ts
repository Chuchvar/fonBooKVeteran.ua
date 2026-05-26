import axios from '../utils/axios';

class BookingService {
    async createBooking(formData: FormData) {
        try {
            const { data } = await axios.post('/api/bookings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error: unknown) {
            console.error('Error creating booking:', error);
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Помилка при створенні заявки');
        }
    }

    async getUserBookings() {
        try {
            const { data } = await axios.get('/api/user/bookings');
            return data;
        } catch (error: unknown) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    }

    async getAllBookings() {
        try {
            const { data } = await axios.get('/api/bookings/all');
            return data;
        } catch (error: unknown) {
            console.error('Error fetching all bookings:', error);
            throw error;
        }
    }

    async updateBookingStatus(id: number, status: string, reason?: string) {
        try {
            const { data } = await axios.put(`/api/bookings/${id}/status`, null, {
                params: { status, reason }
            });
            return data;
        } catch (error: unknown) {
            console.error('Error updating booking status:', error);
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Помилка при оновленні статусу');
        }
    }

    async payBooking(id: number) {
        try {
            const { data } = await axios.put(`/api/bookings/${id}/pay`);
            return data;
        } catch (error: unknown) {
            console.error('Error paying booking:', error);
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Помилка при оплаті');
        }
    }
}

export const bookingService = new BookingService();
