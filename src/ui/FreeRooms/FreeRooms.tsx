import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@mui/material'
import React from 'react'
import { IFreeRooms } from '../../types/rooms.type'

interface IFreeRoomsProps {
	open: boolean
	onClose: () => void
	freeRooms: IFreeRooms[] | null
}

const FreeRooms: React.FC<IFreeRoomsProps> = ({ open, onClose, freeRooms }) => {
	const capitalizeFirstLetter = (text: string) => {
		if (!text) return ''
		return text.charAt(0).toUpperCase() + text.slice(1)
	}

	return (
		<Dialog
			open={open}
			aria-labelledby='alert-dialog-title'
			aria-describedby='alert-dialog-description'
			PaperProps={{
				sx: {
					width: '100%',
					maxWidth: '700px',
					margin: '0 auto',
					minHeight: "454px"
				},
			}}
		>
			<DialogTitle sx={{marginBottom: "20px", textAlign:"center", color: "#0d7377", fontSize: "25px"}} id='alert-dialog-title'>
				Found available rooms: {freeRooms?.length}
			</DialogTitle>
			<DialogContent sx={{padding: "0 50px"}}>
				<ul style={{display: "flex", flexDirection: "column", gap: "20px 0", marginBottom: "20px", fontFamily: "Josefin Sans"}}>
					{freeRooms?.map(item => (
						<li style={{display: "flex", justifyContent: "space-between", fontSize: "20px", gap: "0 40px", paddingBottom: "10px", borderBottom: "1px solid #0d7377"}} key={item.id}>
							<p>{capitalizeFirstLetter(item.type)} room</p>
							<p>Room number: {item.number}</p>
							<p>Room capacity: {item.capacity}</p>
						</li>
					))}
				</ul>
			</DialogContent>
			<DialogActions>
				<Button
					sx={{ color: '#0d7377', fontSize: '16px' }}
					onClick={() => onClose()}
					autoFocus
				>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default FreeRooms
