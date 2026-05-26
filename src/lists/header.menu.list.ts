import { PAGES } from '../constants/url.constants'

interface IHeaderMenu {
	id: number
	label: string
	url: string
}

export const headerMenu: IHeaderMenu[] = [
	{
		id: 1,
		label: 'Home',
		url: PAGES.HOME,
	},
	{
		id: 2,
		label: 'Rooms',
		url: PAGES.ALLROOMS,
	},
	{
		id: 3,
		label: 'Tables',
		url: PAGES.TABLES,
	},
	{
		id: 4,
		label: 'Call rooms',
		url: PAGES.CALLROOMS,
	},
	{
		id: 5,
		label: 'Account',
		url: PAGES.LOGIN,
	},
]
