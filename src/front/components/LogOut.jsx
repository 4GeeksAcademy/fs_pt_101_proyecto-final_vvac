import { useNavigate} from "react-router-dom";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const LogOut = () => {

    const {store, dispatch} = useGlobalReducer();
    const navigate = useNavigate()
    
    const handleLogout = () => {
        dispatch({type: 'logout'})
        navigate('/')
    }


    return(
        <button className="btn btn-danger" onClick={handleLogout}>Log Out</button>
    );
}