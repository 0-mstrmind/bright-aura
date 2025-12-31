// main loader for site page transitions
import React from 'react'
const Circles = () => {
    return (
        <div className="flex flex-col justify-center items-center h-screen w-screen animate-pulse text-white poppins-regular bg-black">
            <div className="w-8 h-8 md:w-14 md:h-14 border-4 border-(--color-primary)/90 border-dashed rounded-full animate-spin"></div>
            <p>Please wait!</p>
        </div>
    )
};

export default Circles;