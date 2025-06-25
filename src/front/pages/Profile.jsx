import { LinksMenu } from "../components/LinksMenu";

import useGlobalReducer from "../hooks/useGlobalReducer";
import { RightMenu } from "../components/RightMenu";
import { useNavigate } from "react-router-dom";
import userServices from "../services/recetea_API/userServices.js";
import { useState, useEffect, useRef } from "react";

export const Profile = () => {
    const navigate = useNavigate();
    const { dispatch, store } = useGlobalReducer();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        photo_url: ""
    });
    const [repeatPasswd, setRepeatPasswd] = useState("");
    const [profileImage, SetProfileImage] = useState(store.user?.photo_url || "");
    const fileInputRef = useRef(null);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState("");

    // Unified profile update function
    const handleProfileUpdate = async (updatedFields = {}) => {
        // Merge form data with any updated fields (e.g., photo_url)
        const mergedData = { ...formData, ...updatedFields };

        // Remove password if empty or only spaces
        if (!mergedData.password || mergedData.password.trim() === "") {
            delete mergedData.password;
        }

        try {
            console.log("Submitting merged formData:", mergedData);
            const res = await userServices.editUser(mergedData);

            if (res.success) {
                dispatch({ type: "updateUser", payload: { user: res.user, token: res.token } });
                window.alert("Your profile has been updated!");

                // Reset form data with fresh user info and clear password fields
                setFormData({
                    username: res.user.username || "",
                    email: res.user.email || "",
                    password: "",
                    photo_url: res.user.photo_url || ""
                });
                setRepeatPasswd("");
                SetProfileImage(res.user.photo_url || "");

            } else {
                window.alert(res.error || "Something went wrong while updating your profile.");
            }
        } catch (error) {
            console.error("Error in handleProfileUpdate:", error);
            window.alert("An error occurred: " + (error.message || error));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            SetProfileImage(base64Image);
            await handleProfileUpdate({ photo_url: base64Image }); // update photo only
            setShowUrlModal(false);
        };
        reader.readAsDataURL(file);
    };


    const toggleUrlModal = () => {
        if (!showUrlModal) {
            setTempImageUrl(profileImage.startsWith('http') ? profileImage : '');
        } else {
            setTempImageUrl("");
        }
        setShowUrlModal(!showUrlModal);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };


    // Función para guardar la URL escrita en el modal
    const handleSaveUrlImage = async (e) => {
        e.preventDefault(); // Previene la recarga de la página si es llamado por un submit

        if (tempImageUrl) {
            SetProfileImage(tempImageUrl); // Actualiza la vista previa del componente

            // Crea una copia de formData con la nueva photo_url
            const updatedFormData = {
                ...formData,
                photo_url: tempImageUrl
            };
            setFormData(updatedFormData); // Actualiza el estado formData en React

            console.log("Frontend: URL image confirmed from modal:", tempImageUrl);
            try {
                console.log("Frontend: Submitting formData with new photo_url (from URL input):", updatedFormData);
                // Llama a la API con el formData actualizado
                const res = await userServices.editUser(updatedFormData);
                console.log("Frontend: API response data (from URL save):", res);

                if (res.success) {
                    // *** CAMBIO PARA OPCIÓN 2 ***
                    // El payload es ahora un objeto que contiene 'user' y 'token'
                    dispatch({ type: "updateUser", payload: { user: res.user, token: res.token } });
                    window.alert("Your profile has been updated with the new image!");

                    // Opcional: Re-sincronizar formData con el user actualizado de la API
                    setFormData({
                        username: res.user.username || "",
                        email: res.user.email || "",
                        password: "",
                        photo_url: res.user.photo_url || ""
                    });

                } else {
                    window.alert(res.error || "Something went wrong while saving the URL, please try again.");
                }
            } catch (error) {
                console.error("Frontend: Error in handleSaveUrlImage!!!:", error);
                window.alert("An error occurred while saving the URL: " + (error.message || error));
            } finally {
                toggleUrlModal(); // Cierra el modal siempre, sin importar el éxito de la API
            }
        }
    };

    // Maneja cambios en los inputs del formulario (username, email, password)
    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== repeatPasswd) {
            window.alert("The password does not match");
            return;
        }

        // Crea una copia de formData para evitar enviar campos vacíos si no han sido modificados
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.password || dataToSubmit.password.trim() === "") {
            delete dataToSubmit.password;
        }

        if (!dataToSubmit.email || dataToSubmit.password.trim() === "") {
            delete dataToSubmit.email;
        }

        if (!dataToSubmit.username || dataToSubmit.password.trim() === "") {
            delete dataToSubmit.username;
        }


        try {
            console.log("Frontend: Submitting main formData:", dataToSubmit);
            const data = await userServices.editUser(dataToSubmit); // Envía solo los campos necesarios
            console.log("Frontend: API response data:", data);

            if (data.success) {
                // *** CAMBIO PARA OPCIÓN 2 ***
                // El payload es ahora un objeto que contiene 'user' y 'token'
                dispatch({ type: "updateUser", payload: { user: data.user, token: data.token } });
                window.alert("Your profile has been updated");

                // Resetear formData y repeatPasswd después de un update exitoso
                setFormData({
                    username: data.user.username || "",
                    email: data.user.email || "",
                    password: "", // Limpiar el campo de contraseña después de un envío exitoso
                    photo_url: data.user.photo_url || ""
                });
                setRepeatPasswd("");

            } else {
                window.alert(data.error || "Something went wrong, please try again.");
            }

        } catch (error) {
            console.error("Frontend: Error in handleSubmit:", error);
            window.alert("An error occurred: " + (error.message || error));
        }
    };

    // Borrar cuenta
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        try {
            const resultado = await userServices.deleteUser();
            if (resultado.success) {
                dispatch({ type: "logout" });
                window.alert("Your account has been deleted");
                navigate("/");
            } else {
                window.alert("Failed to delete account: " + (result.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error in handleDeleteAccount:", error);
            window.alert("An error occurred: " + (error.message || error));
        }
    };

    useEffect(() => {
        if (store.user) {
            setFormData({
                username: store.user.username || "",
                email: store.user.email || "",
                password: "",
                photo_url: store.user.photo_url || ""
            });
            SetProfileImage(store.user.photo_url || "");
            setRepeatPasswd("");
        }
    }, [store.user]);



    return (
        <>
            <div className="main-row-all">
                <div className="profile-container">
                    <div className="container text-center sidebar-left-profile">
                        <div className="row align-items-stretch g-0">
                            {/* COLUMNA IZQUIERDA */}
                            <div className="col-12 col-md-3">
                                {/* ——— TOGGLE (solo en xs y sm) ——— */}
                                <button
                                    className="btn btn-outline-secondary d-md-none mb-3"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#sidebarMenu"
                                    aria-controls="sidebarMenu"
                                    aria-expanded="false"
                                    aria-label="Toggle navigation"
                                >
                                    <i className="fa fa-bars"></i>
                                </button>

                                {/* ——— SIDEBAR: colapsa en xs/sm, siempre abierto en md+ ——— */}
                                <div className="collapse d-md-block" id="sidebarMenu">
                                    <div className="d-flex flex-column flex-lg-row align-items-start gap-3 p-3">
                                        <LinksMenu />
                                    </div>
                                </div>
                            </div>




                            {/* COLUMNA PRINCIPAL */}
                            <div className="col-6 main-column-content">
                                <div className="d-flex align-items-start flex-column mb-3 edit-perfil">

                                    {/* ÁREA DE IMAGEN DE PERFIL Y BOTÓN PARA ABRIR MODAL */}
                                    {/* Al hacer clic en esta área, se abrirá el modal de cambio de imagen */}
                                    <div className="change-picture mx-auto" data-mdb-ripple-color="light" onClick={toggleUrlModal}>
                                        <img src={profileImage} alt="Your profile pic" className="rounded-circle pic-perfil" />
                                        <div className="mask-change-pic">
                                            <h4><i className="fa-solid fa-camera"></i></h4>
                                            <p className="text-change">Edit</p>
                                        </div>
                                        {/* El input de tipo file ahora estará DENTRO DEL MODAL */}
                                    </div>

                                    {/* Formulario principal de edición de perfil */}
                                    <form className="text-start form-perfil w-75 mx-auto" onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="username" className="form-label my-3 fw-bold">Username</label>
                                            <input type="text"
                                                className="form-control"
                                                name="username"
                                                id="username"
                                                autoComplete="off"
                                                onChange={handleChange}
                                                placeholder={formData?.username || ""}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Email1" className="form-label my-3 fw-bold">Email address</label>
                                            <input type="email"
                                                className="form-control"
                                                name="email"
                                                id="Email1"
                                                autoComplete="off"
                                                onChange={handleChange}
                                                placeholder={formData?.email || ""}
                                            />
                                            {store.user?.success && (
                                                <div className="alert alert-info mt-2">
                                                    "Your email has been updated."
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group mb-4">
                                            <label className="form-label my-3 fw-bold">Change password</label>
                                            <input type="password"
                                                name="password"
                                                onChange={handleChange}
                                                className="form-control"
                                                id="password"
                                                placeholder="*Type new password"
                                            // value={formData?.password || ""} // Controla el input con el estado
                                            />
                                            <input type="password"
                                                name="repeatPasswd"
                                                onChange={e => setRepeatPasswd(e.target.value)}
                                                className="form-control"
                                                id="repeatPasswd"
                                                placeholder="*Repeat new password"
                                            // value={repeatPasswd || ""} // Controla el input con el estado
                                            />
                                        </div>
                                        <div className="actions-profile">
                                            <button type="submit" className="btn btn-secondary">Update</button>
                                            <button type="reset" className="btn btn-danger ms-2">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA */}
                            <div className="col-3 right-profile ps-3">
                                <div className="d-grid row-gap-2 b-grids-right h-100">
                                    <RightMenu />
                                    <div className="align-self-end">
                                        {/* Botón para abrir el modal de borrado de cuenta */}
                                        <button type="button" className="btn btn-secondary p-2 mt-2" data-bs-toggle="modal" data-bs-target="#modalDeleteAccount">Delete account</button>
                                    </div>
                                </div>
                        
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación para eliminar cuenta */}
            <div className="modal fade" id="modalDeleteAccount" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="modalDeleteAccountLabel">
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
                            {/* Asegúrate que handleDeleteAccount se llame correctamente */}
                            <button type="button" className="btn btn-danger p-0" data-bs-dismiss="modal" aria-label="Delete&Close" onClick={(e) => { document.activeElement?.blur(); handleDeleteAccount(e); }}>YES</button>
                            <button type="button" className="btn btn-secondary p-0 ms-3" data-bs-dismiss="modal" aria-label="Close" onClick={() => { document.activeElement?.blur(); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>


            {/* --- MODAL PARA CAMBIAR IMAGEN DE PERFIL --- */}
            {showUrlModal && (
                <div className="modal fade show" id="imageUrlModal" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="imageUrlModalLabel" aria-hidden={!showUrlModal}> {/* `aria-hidden` es dinámico */}
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="imageUrlModalLabel">Cambiar imagen de perfil</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={toggleUrlModal} // Llama a la función de toggle para cerrar
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="modalImageUrl" className="form-label">Pega la URL de la imagen:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="modalImageUrl"
                                        value={tempImageUrl} // Controla el input con el estado temporal
                                        onChange={(e) => setTempImageUrl(e.target.value)}
                                    />
                                    {tempImageUrl && (
                                        <div className="mt-3 text-center modal-url-profile">
                                            {/* Estilos inline para limitar el tamaño de la previsualización */}
                                            <img src={tempImageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} className="img-thumbnail" />
                                        </div>
                                    )}
                                </div>
                                <hr />
                                <div className="mb-3 text-center">
                                    <label className="form-label">O sube una imagen desde tu ordenador:</label>
                                    <button
                                        type="button"
                                        className="btn btn-primary mt-2"
                                        name="photo_url"
                                        onClick={triggerFileInput} // Activa el input de archivo oculto
                                    >
                                        Subir imagen
                                    </button>
                                    {/* Input de archivo oculto - AHORA DENTRO DEL MODAL */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }} // Input oculto
                                        accept="image/*" // Solo acepta archivos de imagen
                                        onChange={handleFileChange} // Maneja la selección del archivo
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={toggleUrlModal}>Cancelar</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveUrlImage}>Guardar URL</button> {/* Este botón guarda la URL y cierra el modal */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showUrlModal && <div className="modal-backdrop fade show"></div>} {/* Para el fondo oscuro del modal */}
            {/* --- FIN MODAL --- */}
        </>
    );
};