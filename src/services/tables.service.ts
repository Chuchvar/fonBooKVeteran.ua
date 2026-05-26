import { toast } from 'react-toastify'
import { IEndBooking, IReserveTable } from '../types/tables.type'
import axios from '../utils/axios'

class TablesService {

	async makeReservation(makeResData: IReserveTable) {
		try {
			const { data } = await axios.post('/api/booking/table', makeResData)
			return data
		} catch (error: unknown) {
			console.log(error)
			const err = error as { response?: { data?: { error?: string } } };
			throw new Error(err.response?.data?.error || "Error")
		}
	}

	async endBooking(endData: IEndBooking) {
		try {
			const { data } = await axios.put('/api/booking/table/end', endData)
			return data
		} catch (error: unknown) {
			console.log(error)
			const err = error as { response?: { data?: { error?: string } } };
			toast.error(err.response?.data?.error || "Error")
		}
	}

}

export const tableService = new TablesService()
