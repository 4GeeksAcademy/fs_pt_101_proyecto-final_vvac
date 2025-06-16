import { useState } from "react";
import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { RightMenu } from "../components/RightMenu";
import { useNavigate } from "react-router-dom";

export const MealPlanner = () => {

    const navigate = useNavigate();

    // const { store, dispatch } = useGlobalReducer() ---> verificar si queda pendiente incorporar acciones.

    // Funciones para incorporar fecha y meal: 

    const [startDate, setStartDate] = useState("2025-06-02");
    const [endDate, setEndDate] = useState("2025-06-08");

    const [editingDate, SetEditingDate] = useState(false);

    const [tempStart, setTempStart] = useState(startDate);
    const [tempEnd, setTempEnd] = useState(endDate);


    // Función para el planner inicial, sin fecha establecida:

    const initialPlanner = {
        monday: { breakfast: null, lunch: null, dinner: null },
        tuesday: { breakfast: null, lunch: null, dinner: null },
        wednesday: { breakfast: null, lunch: null, dinner: null },
        thursday: { breakfast: null, lunch: null, dinner: null },
        friday: { breakfast: null, lunch: null, dinner: null },
        saturday: { breakfast: null, lunch: null, dinner: null },
        sunday: { breakfast: null, lunch: null, dinner: null },
    };
    const [planner, setPlanner] = useState(initialPlanner);

    //Funciones para modal! Queda PENDIENTE incorporar buscador... Con API solo? 

    const [showModal, setShowModal] = useState(false);
    const [modalDay, setModalDay] = useState("");
    const [modalMeal, setModalMeal] = useState("");
    const [recetaName, setRecetaName] = useState("");
    const [recetaImage, setRecetaImage] = useState("");

    const openModal = (dia, mealType) => {
        setModalDay(dia);
        setModalMeal(mealType);

        const existing = planner[dia][mealType];
        if (existing) {
            setRecetaName(existing.name);
            setRecetaImage(existing.imageUrl || "");
        } else {
            setRecetaName("");
            setRecetaImage("");
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalDay("");
        setModalMeal("");
        setRecetaName("");
        setRecetaImage("");
    };

    const handleSave = () => {
        if (!recetaName.trim()) {
            alert("You must enter a recipe name.");
            return;
        }

        setPlanner((prev) => ({
            ...prev,
            [modalDay]: {
                ...prev[modalDay],
                [modalMeal]: {
                    name: recetaName.trim(),
                    imageUrl: recetaImage.trim() || null,
                },
            },
        }));
        closeModal();
    };

    //Función para días de la semana!

    const weekDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",

    ];

    //Para guardar o cancelar la edición de fechas:

    const handleSaveDates = () => {

        if (tempStart > tempEnd) {
            alert("The start date must be less than or equal to the end date.");
            return;
        }
        setStartDate(tempStart);
        setEndDate(tempEnd);
        setEditingDate(false);
    };

    const handleCancelDates = () => {

        setTempStart(startDate);
        setTempEnd(endDate);
        setEditingDate(false);
    };

    //Ayuda para ISO date, formato español

    const formatoEspanol = (isoDate) => {
        const dateObj = new Date(isoDate);
        const options = { day: "numeric", month: "long", year: "numeric" };
        return dateObj.toLocaleDateString("es-ES", options);
    };

    //Función para las cards que están en cada cuadrado de la tabla/calendario:

    const renderCells = (dia) => {

        const tipos = ["breakfast", "lunch", "dinner"];
        return tipos.map((mealType) => (
            <td className="cell-meal" key={mealType}>
                {planner[dia][mealType] ? (
                    <div className="meal-card" onClick={() => openModal(dia, mealType)}>
                        {planner[dia][mealType].imageUrl && (
                            <img src={planner[dia][mealType].imageUrl} alt={planner[dia][mealType].name} className="meal-img" />
                        )}
                        <span className="meal-name"> {planner[dia][mealType].name} </span>
                    </div>
                ) : (
                    <div className="empty-cell" onClick={() => openModal(dia, mealType)}></div>
                )}
            </td>
        ));
    };



    return (

        <div className="main-row-all vh-100">

            <div className="profile-container">

                {/* COLUMNA LATERAL IZQ */}

                <div className="container text-center sidebar-left-profile">
                    <div className="row align-items-start">
                        
                        <div className="col-12 col-md-3">

                            <div className="d-flex align-items-start">
                                <TurnHome />
                                <LinksMenu />
                            </div>

                        </div>

                        {/* COLUMNA PRINCIPAL  */}
                        <div className="col-6 planner-page">

                            <div className="d-flex align-items-start flex-column mb-3 planner-header">

                                <h2 className="mb-3">Meal Planner</h2>
                                <p>Your weekly meal planner </p>


                                {/* // Modo “solo lectura”: clicable para entrar en edición */}

                                {!editingDate ? (<p className="date-range-text" onClick={() => setEditingDate(true)}>
                                    Week from date &nbsp;
                                    <strong>{formatoEspanol(startDate)}</strong>
                                    &nbsp; to &nbsp;
                                    <strong>{formatoEspanol(endDate)}</strong>
                                </p>
                                ) : (
                                    <div className="date-edit-container">
                                        <div className="date-field">
                                            <label htmlFor="start-date" className="modal-label">
                                                Start date
                                            </label>
                                            <input id="start-date" type="date" className="date-input" value={tempStart} onChange={(e) => setTempStart(e.target.value)} />
                                        </div>
                                        <div className="date-buttons">
                                            <button className="btn-add" onClick={handleSaveDates}>
                                                Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelDates}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tabla/calendario 7x4 */}

                            <div className="table-container">
                                <table className="planner-table">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>Breakfast</th>
                                            <th>Lunch</th>
                                            <th>Dinner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weekDays.map((dia) => (
                                            <tr key={dia}>
                                                <td className="cell-day">
                                                    {/* Para capitalizar dia de la semana: */}
                                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                                </td>
                                                {renderCells(dia)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MODAL para añadir o modificar la receta */}

                            {showModal && (
                                <div className="modal-overlay">
                                    <div className="modal-content">

                                        <button className="close-button" onClick={closeModal}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>

                                        <h3>Add/Modify custom recipe</h3>

                                        {/* Form del MODAL */}

                                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>

                                            {/* Campo “Buscar receta (icono lupa)” */}

                                            <label htmlFor="receta-input" className="modal-label">
                                                Find a recipe&nbsp; <i className="fa-solid fa-magnifying-glass"></i>
                                            </label>
                                            <input id="receta-input" type="text" className="modal-input" placeholder="Write the name..." value={recetaName} onChange={(e) => setRecetaName(e.target.value)} autoFocus />

                                            {/* Día de la semana (solo lectura) */}
                                            <label htmlFor="dia-input" className="modal-label">
                                                Week day
                                            </label>
                                            <input id="dia-input" type="text" className="modal-input" value={modalDay.charAt(0).toUpperCase() + modalDay.slice(1)} readOnly />

                                            {/* Horario (solo lectura) */}
                                            <label htmlFor="meal-input" className="modal-label">
                                                Timetable
                                            </label>
                                            <input id="meal-input" type="text" className="modal-input"
                                                value={
                                                    modalMeal === "breakfast"
                                                        ? "Breakfast"
                                                        : modalMeal === "lunch"
                                                            ? "Lunch"
                                                            : "Dinner"
                                                }
                                                readOnly
                                            />

                                            <div className="modal-actions">
                                                <button type="submit" className="btn-add">
                                                    Add
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-cancel"
                                                    onClick={closeModal}
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-3 right-profile">

                            <div className="d-grid row-gap-5 b-grids-right h-100">
                                <RightMenu />

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}


