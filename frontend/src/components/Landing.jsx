import Hyperspeed from "./backgrounds/Hyperspeed";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();
    return (
        <div className='w-screen h-screen bg-black overflow-hidden'>
            <div className='w-full h-full absolute top-0 left-0 overflow-hidden'>
                <Hyperspeed />
            </div>
            <div className='relative z-10 flex flex-col items-center justify-center w-full h-full text-white geist text-6xl font-bold text-center'>
                Creating Solutions Faster Than Thoughts
                <button
                    className="inline-block mt-6 cursor-pointer items-center justify-center rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-2 text-base font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.25rem)] hover:shadow-lg"
                    onClick={() => navigate('/chat')}
                >
                    Start Now
                    <span className="text-slate-300/85"> & Harness AI</span>
                </button>
            </div>
        </div>
    );
}

export default Landing;
