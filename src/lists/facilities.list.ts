import image1 from "../assets/home/facilities/1.png"
import image2 from "../assets/home/facilities/2.png"
import image3 from "../assets/home/facilities/3.png"
import image4 from "../assets/home/facilities/4.png"
import image5 from "../assets/home/facilities/5.png"
import image6 from "../assets/home/facilities/6.png"

interface IFacilitiesList {
	id: number
	label: string
	image: string
}
export const facilitiesList:IFacilitiesList[] = [
	{
		id: 1,
		label: "Fast Wifi",
		image: image1,
	},
	{
		id: 2,
		label: "Coffee",
		image: image2,
	},
	{
		id: 3,
		label: "Safe",
		image: image3,
	},
	{
		id: 4,
		label: "Bath",
		image: image4,
	},
	{
		id: 5,
		label: "Parking",
		image: image5,
	},
	{
		id: 6,
		label: "Alarm",
		image: image6,
	},
]