import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import React from 'react'
import { ICheck } from '../../types/tables.type'

interface ITableCheckProps {
	open: boolean
	onClose: () => void
	tableCheck: ICheck | null
}

const formatDate = (dateString: string | undefined): string => {
	if (!dateString) return 'Invalid date'
	return dayjs(dateString).format('DD.MM.YYYY HH:mm')
}

const TableCheck: React.FC<ITableCheckProps> = ({
	open,
	onClose,
	tableCheck,
}) => {
	const queryClient = useQueryClient()

	const onSubmit = () => {
		onClose()
		queryClient.invalidateQueries({ queryKey: ['userBookings'] })
	}

	return (
		<Dialog
			open={open}
			PaperProps={{
				sx: {
					width: '100%',
					maxWidth: '300px',
					margin: '0 auto',
					minHeight: '300px',
				},
			}}
		>
			<DialogContent>
				<DialogContentText
					sx={{
						textAlign: 'center',
						fontSize: '20px',
						fontWeight: '500',
					}}
				>
					<Typography sx={{ marginBottom: '20px', fontSize: '20px' }}>
						Here is your check
					</Typography>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: '0 10px',
							marginBottom: '10px',
						}}
					>
						<Typography sx={{ fontSize: '16px', color: 'black' }}>
							Booking date:{' '}
						</Typography>
						<Typography sx={{ fontSize: '16px', color: 'black' }}>
							{' '}
							{formatDate(tableCheck?.receipt.checkInDate)}
						</Typography>
					</Box>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: '0 10px',
							marginBottom: '10px',
						}}
					>
						<Typography sx={{ fontSize: '16px', color: 'black' }}>
							Table number:{' '}
						</Typography>
						<Typography sx={{ fontSize: '16px', color: 'black' }}>
							{tableCheck?.receipt.tableId}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: '0 10px' }}>
						<Typography
							sx={{
								fontSize: '20px',
								color: '#0d7377',
								fontFamily: 'Josefin Sans',
							}}
						>
							Total price:{' '}
						</Typography>
						<Typography
							sx={{ fontSize: '20px', color: 'black', fontWeight: '300' }}
						>
							{30}$
						</Typography>
					</Box>
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onSubmit}
					sx={{ color: '#0d7377', fontSize: '16px' }}
					type='submit'
				>
					Pay orders
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default TableCheck
