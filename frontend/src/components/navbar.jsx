import {NavLink} from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import { supabase } from '../supabaseClient';


const Navbar=({onHistoryOpen}) => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        alert("Logged out successfully");
        navigate('/');
    };
    return <div className="flex justify-between mx-10 mt-5 items-center">
            <p className="w-15 h-10 text-2xl font-medium prata-regular">safeSpend</p>
            <div className="gap-5  hidden md:flex text-md  text-gray-800 ">
                <NavLink to='/home' className='flex flex-col items-center gap-1'>
                <p>Home</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-800 hidden'/>
                </NavLink>
                {user && <><button  className='flex flex-col items-center gap-1 cursor-pointer' onClick={handleLogout}>
                <p>Logout</p>
                </button></>}
                <NavLink to='/docs' className='flex flex-col items-center gap-1'>
                <p>Docs</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-800 hidden'/>
                </NavLink>
                {user && (
                    <button onClick={onHistoryOpen} className='flex flex-col items-center gap-1 cursor-pointer'>
                        <p>History</p>
                    </button>
                )}
                
            </div></div>
}
export default Navbar;
