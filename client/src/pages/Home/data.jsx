import {IconUser, IconBookmark, IconNews, IconSearch} from '@tabler/icons-react'

export const links = [
    {
        id: 1,
        name: 'Feed',
        icon: <IconNews />,
        url: '/'
    },
    {
        id: 2,
        name: 'Saved',
        icon: <IconBookmark />,
        url: '/'
    },
    {
        id: 3,
        name: 'Explore',
        icon: <IconSearch />,
        url: '/explore'
    },
    {
        id: 4,
        name: 'Profile',
        icon: <IconUser />,
        url: '/profile'
    },
    
]