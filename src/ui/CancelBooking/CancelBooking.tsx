import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'react-toastify'
import { roomService } from '../../services/rooms.service'
import { ICancelBooking } from '../../types/rooms.type'

interface ICancelBookingProps {
	open: boolean
	onClose: () => void
	bookingId: string | null
}

const CancelBooking: React.FC<ICancelBookingProps> = ({
	open,
	onClose,
	bookingId,
}) => {
	const queryClient = useQueryClient()

	const { mutate } = useMutation({
		mutationKey: ['cancelBooking'],
		mutationFn: (data: ICancelBooking) => roomService.cancelBooking(data),
		onSuccess: () => {
			toast.success('You have canceled booking successfully')
			queryClient.invalidateQueries({ queryKey: ['userBookings'] })
		},
		onError: () => {
			toast.error('Error during cancelling booking')
		},
	})

	const handleCancelBooking = () => {
		onClose()
		mutate({ bookingId: bookingId })
	}

	return (
		<Dialog
			open={open}
			aria-labelledby='alert-dialog-title'
			aria-describedby='alert-dialog-description'
		>
			<DialogTitle id='alert-dialog-title'>{'Cancel booking?'}</DialogTitle>
			<DialogContent>
				<DialogContentText id='alert-dialog-description'>
					Are you sure you want to cancel booking?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button sx={{ color: '#0d7377', fontSize: '16px' }} onClick={onClose}>
					Disagree
				</Button>
				<Button
					sx={{ color: '#0d7377', fontSize: '16px' }}
					onClick={handleCancelBooking}
					autoFocus
				>
					Agree
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default CancelBooking
