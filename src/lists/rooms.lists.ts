import standartRoom from '../assets/home/rooms/room1.jpg'
import deluxeRoom from '../assets/home/rooms/room2.jpg'
import presidentRoom from '../assets/home/rooms/room3.jpg'
import { PAGES } from '../constants/url.constants'

interface IRoomList {
	id: number
	label: string
	price: number
	url: string
	image: string
	description: string,
	descriptionBack: string
}
export const roomList: IRoomList[] = [
	{
		id: 1,
		label: 'Standart Room',
		price: 100,
		url: PAGES.STANDARTROOM,
		image: standartRoom,
		description: 'Standart facilities',
			descriptionBack: "A Standard Room offers a comfortable and cozy space, featuring essential amenities for a relaxing stay. It includes a queen-size bed, a private bathroom, and modern furnishings, making it ideal for both business and leisure travelers."
	},
	{
		id: 2,
		label: 'Deluxe Room',
		price: 150,
		url: PAGES.DELUXEROOM,
		image: deluxeRoom,
		description: 'Better facilities',
		descriptionBack: "A Luxury Room provides an elevated experience with premium amenities and sophisticated design. It features a king-size bed, spacious seating area, elegant bathroom with high-end fixtures, and stunning views, ensuring a truly indulgent stay."
	},
	{
		id: 3,
		label: 'President Room',
		price: 300,
		url: PAGES.PRESIDENTROOM,
		image: presidentRoom,
		description: 'Luxury facilities',
		descriptionBack: "The Presidential Room offers the ultimate in luxury and exclusivity. It boasts expansive space, a king-size bed, a private lounge area, a lavish bathroom with a Jacuzzi, and premium furnishings. With exceptional views and personalized services, it provides an unparalleled experience for the most discerning guests."
	
	},
]
