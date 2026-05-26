import dayjs from 'dayjs'

export interface IReserveTable {
	checkInDate: dayjs.Dayjs
	capacity: number
}

export interface ICheck {
	receipt: {
		price: string
		capacity: string
		checkInDate: string
		tableId: string
	}
}

export interface IEndBooking {
	bookingId: string
}
