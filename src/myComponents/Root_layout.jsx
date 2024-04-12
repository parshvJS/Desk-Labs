import React from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'


const Root_layout = () => {
    return (
        <div className='h-full w-full'>
            <div className='bg-white'>
                <Topbar />
            </div>            
            <div className='pt-20'>
            <Outlet />
            </div>
        </div>

    )
}

export default Root_layout