import { IChangeUserData, IUser } from '../types/user.type'
import axios from '../utils/axios'

class AuthService {

    async signup(user: IUser) {
        try {
            const { data } = await axios.post<IUser>(
                '/api/auth/signup',
                user
            )
            return data
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }, message?: string };
            console.error('Signup error:', err.response?.data || err.message)
            throw error
        }
    }

	async signupComplete(email: string, verificationCode: string) {
		try {
			const { data } = await axios.post(
				'/api/auth/signup/complete',
				{ email, verification_code: verificationCode }
			)

			if (data.token) {
				window.localStorage.setItem('jwt', data.token)
			}

			console.log(data)
			return data
		} catch (error: unknown) {
			const err = error as { response?: { data?: unknown }, message?: string };
			console.error(
				'Signup complete error:',
				err.response?.data || err.message
			)
			throw error
		}
	}

	async login(formData: IUser) {
		const { data } = await axios.post<IUser>(
			'/api/auth/login',
			formData
		)
		return data
	}

	async googleLogin(credential: string) {
		const { data } = await axios.post<{ token: string }>(
			'/api/auth/google',
			{ credential }
		)
		return data
	}

	async editUserData(formData: IChangeUserData | Record<string, string>) {
		try {
			const { data } = await axios.put('/api/auth/profile', formData)
			return data
		} catch (error: unknown) {
			console.log(error)
			const err = error as { response?: { data?: { error?: string } } };
			throw new Error(err.response?.data?.error || "Error")
		}
	}

	async updatePassword(formData: { currentPassword?: string, newPassword?: string }) {
		try {
			const { data } = await axios.put('/api/auth/password', formData)
			return data
		} catch (error: unknown) {
			console.log(error)
			const err = error as { response?: { data?: { error?: string } } };
			throw new Error(err.response?.data?.error || "Error updating password")
		}
	}

	async getMe() {
		try {
			const { data } = await axios.get(`/auth/me`)
			return data
		} catch (error) {
			console.error('Error fetching user data:', error)
			throw error
		}
	}

	async getUserData() {
		try {
			const { data } = await axios.get(`/api/auth/check`)
			return data
		} catch (error) {
			console.error('Error fetching user data:', error)
			throw error
		}
	}

	async logout() {
		return true;
	}
}

export const authService = new AuthService()
