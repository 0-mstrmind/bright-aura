// Footer component for landing page
import React from "react";
import Link from "next/link";
import { Github } from "lucide-react"
export default function Footer() {
    return (
        <div className="h-16 w-full flex justify-between items-center lg:text-xl text-sm px-6 lg:px-16 text-white bg-gray-950 fixed bottom-0  z-0 border-t border-gray-300/20">
            <p className="cursor-default select-none py-2">
                Made by ©{" "}
                <span className="hover:text-[var(--color-primary)] transition-colors"><Link href={"#"}>Team - EliteHack Squad</Link></span>
            </p>
            <div className="flex gap-x-6 md:gap-x-8 py-2">
                <Link
                    href="https://github.com/ElectrovillaYt/"
                    passHref
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="transition-colors cursor-pointer hover:text-gray-400"
                >
                    <Github size={24} />
                </Link>
            </div>
        </div>
    );
}
