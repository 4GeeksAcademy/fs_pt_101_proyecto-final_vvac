import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { RightMenu } from "../components/RightMenu";
import { useNavigate } from "react-router-dom";
import userServices from "../services/recetea_API/userServices.js"
import { useState, useEffect } from "react"

export const Profile = () => {
    const navigate = useNavigate();

    const { dispatch, store } = useGlobalReducer();


    //     // Si no estas logueado, fuera de aqui
    // const user = localStorage.getItem('user')
    // user == null || user == 'undefined' ? navigate("/") : ''
    // console.log("user al inicio es: " + JSON.stringify(user))

    // // const test = JSON.parse(localStorage.getItem('user')).username

    // try {
    //     const user = await userServices.getUser()
    //     console.log("------zzzzzz " + user)
    // }
    // catch {
    //     console.log("error")
    // }


    // Preparamos cambio de username
    const [NewUsername, setNewUsername] = useState([])

    // Preparamos cambio de email
    const [NewMail, setNewMail] = useState([])
    const [emailSuccess, setEmailSuccess] = useState("")

    // Preparamos el cambio de contraseña
    const [NewPasswd, setNewPasswd] = useState([])
    const [RepeatPasswd, setRepeatPasswd] = useState([])

    // Cambio de username
    const handleInputChangeUsername = (e) => {
        e.preventDefault();
        const target = e.target;
        setNewUsername(target.value)
    }

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        try {
            const userData = { "username": NewUsername }
            const resultado = await userServices.editUser(userData)
            resultado?.created_at ? window.alert("Your new username is: " + resultado.username) : window.alert("An ERROR has ocurred! Please try again later.")

        } catch (error) {
            window.alert("Something went wrong. Please try again: " + error)
        }
    }


    //Cambio de contraseña:
    const handleInputChangePass = (e) => {
        e.preventDefault();
        const target = e.target;
        target.name == 'NewPasswd' ? setNewPasswd(target.value) : setRepeatPasswd(target.value)
    }

    const handleSubmitUpdatePasswd = async (e) => {
        e.preventDefault();
        try {
            //Comprobar si la contraseña anterior es correcta <-- ToDo por falta de método de comprobacion de contraseña al usuario actual en la API.
            //Comprobar si las contraseñas son iguales --> ok
            //Actualizar la contraseña del usuario en la bdd. --> ok

            if (NewPasswd !== RepeatPasswd) {
                window.alert("Las contraseñas no coinciden. ")
            }
            else {
                const userData = { "password": NewPasswd.toString() }
                const resultado = await userServices.editUser(userData)
                resultado?.created_at ? window.alert("Your password has been changed.") : window.alert("An ERROR has ocurred! Please try again later.")
            }
        } catch (error) {
            window.alert("Something went wrong. Please try again: " + error)
        }
    }

    // Cambio de correo

    const changeEmail = async (userData) => userServices.editUser(userData).then(data => {
        dispatch({ type: 'change_email', payload: data });
    })

    const handleInputChangeMail = (e) => {
        e.preventDefault();
        setNewMail(e.target.value)
        setEmailSuccess("")
    }

    const handleChangeEmail = async (e) => {
        e.preventDefault()
        try {
            const userData = { "email": NewMail }
            const resultado = await userServices.editUser(userData)

            // despachamos al store global
            dispatch({ type: "change_email", payload: resultado })

            // mostramos mensaje
            setEmailSuccess(`Your new e-mail is: ${resultado.email}`)
            // opcional: limpiar input
            setNewMail("")
        } catch (error) {
            setEmailSuccess(`Error updating e-mail: ${error.message || error}`)
        }
    }

    useEffect(() => {
        if (store.user) {
            localStorage.setItem("user", JSON.stringify(store.user))
        }
    }, [store.user])



    // Borrar cuenta
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        try {
            const resultado = await userServices.deleteUser(test)
            window.alert("Resultado de la eliminación de la cuenta: " + resultado)
            navigate("/")
        } catch (error) {
            window.alert("Something went wrong. Please try again: " + error)
        }
    }
    // hasta aqui



    return (
        <>
            <div className="main-row-all vh-100">
                <div className="profile-container">
                    <div className="container text-center sidebar-left-profile">
                        <div className="row align-items-start g-0">
                            {/* COLUMNA IZQ */}

                            <div className="col-12 col-md-3">

                                <div className="d-flex align-items-start">
                                    <TurnHome />
                                    <LinksMenu />
                                </div>

                            </div>

                            {/* COLUMNA PRINCIPAL  */}
                            <div className="col-6 main-column-content">

                                <div className="d-flex align-items-start flex-column mb-3 edit-perfil">

                                    {/* Pendiente hook para cambiar imagen de perfil!!!*/}
                                    <div className="change-picture" data-mdb-ripple-color="light">
                                        <img src="https://thispersondoesnotexist.com/" alt="Your profile pic" className="rounded-circle pic-perfil" />

                                        <div className="mask-change-pic">

                                            <h4><i className="fa-solid fa-camera"></i></h4>
                                            <p className="text-change">Change</p>

                                        </div>
                                    </div>
                                    <form className="text-start form-perfil w-75">

                                        <div className="mb-3 ">
                                            <label htmlFor="username" className="form label mt-3">Username </label>
                                            <input type="text" className="form-control" id="username" onChange={handleInputChangeUsername} placeholder={store.user?.username} />
                                            <p className="change-email">
                                                {/* Link no existe aun! o sera solo un modal?? */}
                                                <Link to="/change-email" onClick={handleChangeUsername}>CHANGE USERNAME</Link>
                                            </p>

                                            <label htmlFor="Email1" className="form-label">Email address</label>
                                            <input type="email" className="form-control" id="Email1" onChange={handleInputChangeMail} placeholder={store.user?.email} />

                                            <p className="change-email">
                                                {/* Link no existe aun! o sera solo un modal?? */}
                                                <Link to="/change-email" onClick={handleChangeEmail}>CHANGE E-MAIL</Link>
                                            </p>
                                            {/* Mensaje de OK o error */}
                                            {emailSuccess && (
                                                <div className="alert alert-info mt-2">
                                                    {emailSuccess}
                                                </div>
                                            )}

                                        </div>
                                    </form>
                                    <form className="text-start form-perfil w-75" id="passwdchange">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Change password</label>
                                            {/* FALTARIA UN METODO EN LA API PARA COMPROBAR SI LA PASSW ANTIGUA COINCIDE CON LA INTRODUCIDA AQUI.... <input type="password" className="form-control" id="current-password" placeholder="*Current password" /> */}
                                            <input type="password" name="NewPasswd" onChange={handleInputChangePass} className="form-control" id="NewPasswd" placeholder="*Type new password" />
                                            <input type="password" name="RepeatPasswd" onChange={handleInputChangePass} className="form-control" id="RepeatPasswd" placeholder="*Repeat new password" />
                                        </div>
                                        <div className="actions-profile">

                                            <button type="submit" className="btn btn-secondary" onClick={handleSubmitUpdatePasswd}>Update</button>
                                            <button type="reset" className="btn btn-danger ms-2">Cancel</button>
                                        </div>
                                    </form>

                                </div>
                            </div>

                            {/* COLUMNA DERECHA */}

                            <div className="col-3 right-profile">

                                {/* Pendiente definir altura boton, cambiaría segun el footer. 
                        La mejor opción para que esté el buton [DELETE ACCOUNT] al final de la pagina sería con el viewport (vh) */}

                                <div className="d-grid row-gap-5 b-grids-right h-100">
                                    <RightMenu />

                                    <div className="align-self-end">
                                        {/* ABRIR MODAL PARA CONFIRMAR EL BORRADO DE LA CUENTA */}
                                        <button type="button" className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#modalDeleteAccount">Delete account</button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal setting here */}
            <div className="modal fade" id="modalDeleteAccount" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="modalDeleteAccountLabel" aria-hidden="true">
                <div className="modal-dialog w-75">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalDeleteAccountLabel">Are you sure?</h5>
                            <button type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={() => { document.activeElement?.blur(); }}></button>
                        </div>
                        <div className="modal-body">
                            <button type="button" className="btn btn-danger p-0" data-bs-dismiss="modal" aria-label="Delete&Close" onClick={handleDeleteAccount}>YES</button>
                            <button type="button" className="btn btn-secondary p-0 ms-3" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}