// mini loader for login page
import React from 'react'
const MiniLoader = () => {
    return (
        <div className="h-max w-max animate-pulse bg-transparent">
            <div className='flex flex-col justify-center items-center mx-auto'>
                <p className="w-4 h-4 md:w-8 md:h-8 border-4 border-white border-dashed rounded-full animate-spin"></p>
                <p className='animate-pulse pt-2'>Authenticating...</p>
            </div>
        </div>
    )
}

export default MiniLoader
