import image1 from '../assets/home/services/1.jpg'
import image2 from '../assets/home/services/2.jpg'
import image3 from '../assets/home/services/3.webp'
interface ILabelList {
	label: string
}

export interface IServisesList {
	id: number
	title: string
	image: string
	list: ILabelList[]
}
export const servicesList: IServisesList[] = [
	{
		id: 1,
		title: 'Romantic package',
		image: image1,
		list: [
			{
				label: 'Rose petals, candles, lighting',
			},
			{
				label: 'Champagne or wine arrival',
			},
			{
				label: 'Luxurious bedding, oils',
			},
		],
	},
	{
		id: 2,
		title: 'Family resort',
		image: image3,
		list: [
			{
				label: 'Family dining options',
			},
			{
				label: 'Family entertainment, activities',
			},
			{
				label: 'Kid-friendly decor, toys',
			},
		],
	},
	{
		id: 3,
		title: 'Relax package',
		image: image2,
		list: [
			{
				label: 'Meditation, relaxation sessions',
			},
			{
				label: 'Calm music, ambiance',
			},
			{
				label: 'Herbal tea, snacks',
			},
		],
	},

]
