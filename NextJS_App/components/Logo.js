// Site  logo
import { Lightbulb } from "lucide-react";
const Logo = () => {
    return (
        <div className="text-white lg:text-xl text-[0.9rem] flex gap-2 items-center select-none">
            <Lightbulb className="stroke-white" /> <span>Bright</span>
            <span className="text-[var(--color-primary)] -ml-1.5">Aura</span>
        </div>
    );
};

export default Logo;
