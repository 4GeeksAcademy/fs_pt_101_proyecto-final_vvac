import { useNavigate } from "react-router-dom";


export const TurnHome = () => {

    const navigate = useNavigate();

    return (           



            <button onClick={() => navigate('/')} className="btn btn-circle" aria-label="Volver al inicio">
                <i className="fa-solid fa-chevron-left"></i>
            </button>

   
    );
}

