export interface IUser {
	_id?: number
	name: string
	email: string
	password: string
	phone?: string

	role?: string
	verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'
	verificationMessage?: string

	token?: string
	termsAccepted?: boolean
}

export interface IChangeUserData {
	name?: string
	email?: string
	phone?: string
	oldPassword?: string
	newPassword?: string
}
