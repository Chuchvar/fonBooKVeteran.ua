import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	FormControlLabel,
	Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { roomService } from '../../services/rooms.service'
import { IAddServices } from '../../types/rooms.type'

interface IAddServicesProps {
	open: boolean
	onClose: () => void
	extraServices: string[] | null
	bookingId: string | null
}

const predefinedServices = [
	{ name: 'Romantic package', price: 180 },
	{ name: 'Family resort', price: 220 },
	{ name: 'Relax package', price: 200 },
]

const AddServices: React.FC<IAddServicesProps> = ({
	open,
	onClose,
	extraServices,
	bookingId,
}) => {
	const [selectedServices, setSelectedServices] = useState<string[]>([])
	const [price, setPrice] = useState(0)
	const queryClient = useQueryClient()

	const isAllServices = predefinedServices.every(service =>
		extraServices?.includes(service.name)
	)

	const { mutate } = useMutation({
		mutationKey: ['addServices'],
		mutationFn: (data: IAddServices) => roomService.addServices(data),
		onSuccess: () => {
			toast.success('Adding services was completed successfully')
			queryClient.invalidateQueries({ queryKey: ['userBookings'] })
		},
		onError: () => {
			toast.error('Adding services failed. Try again')
		},
	})

	const onSubmit = () => {
		const addServicesData = {
			bookingId: bookingId,
			services: selectedServices,
			price: price
		}
		if (isAllServices) {
			toast.error('You already have all packages')
		} else {
			onClose()
			mutate(addServicesData)
		}
	}

	const handleServiceChange = (service: string, servicePrice: number) => {
		setSelectedServices(prev => {
			if (prev.includes(service)) {
				setPrice(prevPrice => prevPrice - servicePrice)
				return prev.filter(item => item !== service)
			} else {
				setPrice(prevPrice => prevPrice + servicePrice)
				return [...prev, service]
			}
		})
	}

	const handleClose = () => {
		onClose()
		setSelectedServices([])
	}

	return (
		<Dialog
			open={open}
			PaperProps={{
				sx: {
					width: '100%',
					maxWidth: '500px',
					margin: '0 auto',
					minHeight: '300px',
				},
			}}
		>
			<DialogContent>
				<DialogContentText
					sx={{
						textAlign: 'center',
						fontSize: '25px',
						fontWeight: '500',
						marginBottom: '20px',
					}}
				>
					Add services
				</DialogContentText>
				<Box>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: '250px 1fr',
							padding: '0 20px',
						}}
					>
						{extraServices && extraServices.length > 0 && (
							<Box sx={{ marginBottom: '20px' }}>
								<Typography
									variant='h6'
									sx={{ fontWeight: '500', marginBottom: '10px' }}
								>
									Active Services:
								</Typography>
								{extraServices.map(service => (
									<Typography
										key={service}
										sx={{ fontSize: '16px', color: '#555' }}
									>
										- {service}
									</Typography>
								))}
							</Box>
						)}

						<Box>
							<Typography
								variant='h6'
								sx={{ fontWeight: '500', marginBottom: '10px' }}
							>
								You should add:
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column' }}>
								{predefinedServices.some(
									service => !extraServices?.includes(service.name)
								) ? (
									predefinedServices.map(service => {
										if (!extraServices?.includes(service.name)) {
											return (
												<FormControlLabel
													key={service.name}
													control={
														<Checkbox
															checked={selectedServices.includes(service.name)}
															onChange={() =>
																handleServiceChange(service.name, service.price)
															}
														/>
													}
													label={`${service.name} `}
												/>
											)
										}
										return null
									})
								) : (
									<>
										
										<Typography sx={{ fontSize: '16px', color: '#555' }}>
											You have all packages
										</Typography>
									</>
								)}
							</Box>
						</Box>
					</Box>
					<p style={{ color: '#0d7377', fontSize: '20px', marginTop: '30px' }}>
						Total price:
						<span
							style={{
								paddingLeft: '10px',
								fontSize: '20px',
								fontWeight: '300',
								color: '#4d4d4d',
							}}
						>
							{price}$
						</span>
					</p>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					sx={{ color: '#0d7377', fontSize: '16px' }}
				>
					Cancel
				</Button>
				<Button
					onClick={onSubmit}
					sx={{ color: '#0d7377', fontSize: '16px' }}
					type='submit'
				>
					Add services
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default AddServices
