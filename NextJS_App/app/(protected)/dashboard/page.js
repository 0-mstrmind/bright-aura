// procted- user dashboard page
"use client";
import React from "react";
import MAP from "@/components/map";

import Navbar from "@/components/Header";

const Dashboard = () => {
    return (
        <div className="w-screen h-screen flex flex-col">
            {/* navbar components with protected navigation routes */}
            <Navbar showHamburger={true} />
            <div className="grow relative">
                {/*actual Map compnent */}
                <MAP />
            </div>
        </div>
    );
};

export default Dashboard;
