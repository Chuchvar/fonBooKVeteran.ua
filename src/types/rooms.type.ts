import dayjs from 'dayjs'

export interface IMakeReservation {
	checkInDate: string
	checkOutDate: string
	capacity: number
	extraServices?: string[]
}

export interface IRoom {
	Reviews: null | number
	capacity: string
	description: string
	number: string
	price: string
	type: string
}

export interface IBooking {
	capacity: string
	checkInDate: string
	checkOutDate: string
	extraServices: string[]
	createdAt: string
	id: string
	price: string
	roomId: string
	tableId: string
	status: string
	userId: string
	room: IRoom
}

export interface IFeedback {
	roomId: string
	rating: number
	comment: string
}

export interface ICancelBooking {
	bookingId: string | null
}

export interface IUser {
	name: string
}

export interface IReview {
	comment: string
	id: string
	rating: string
	roomId: string
	roomType: string
	userId: string
	user: IUser
}

export interface IBookingFeedbacks {
	averageRating: number
	reviews: IReview[]
}

export interface IExtendBooking {
	bookingId: string
	price: string
	checkOutDate: string
}

export interface IAddServices {
	bookingId: string | null
	services: string[]

}

export interface IGetFreeRooms {
	type: string
	capacity: number
	checkInDate: dayjs.Dayjs | null
	checkOutDate: dayjs.Dayjs | null
}

export interface IFreeRooms {
	capacity: string
	id: string
	number: string
	type: string
}

