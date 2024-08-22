import {IconUser, IconBookmark, IconMessageCircle, IconNews} from '@tabler/icons-react'

export const data = [
    {
        id: 1,
        name: 'Posts',
        count: '1000'
    },
        {
        id: 2,
        name: 'Followers',
        count: '1000'
    },
    {
        id: 3,
        name: 'Following',
        count: '1000'
    },
]

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
        name: 'Direct',
        icon: <IconMessageCircle />,
        url: '/'
    },
    {
        id: 4,
        name: 'Profile',
        icon: <IconUser />,
        url: '/profile'
    },
    
]