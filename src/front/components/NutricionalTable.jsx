//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const NutricionalTable = () =>{

    const {store, dispatch} = useGlobalReducer();
    const portions = store.recipe?.portions;

    // Loops through the ingredients nutricional values and stores it to return the total of each
    //If value is null or none will be 0. Otherwise, will provide a sum of the values stored.
    const totalNutrition = store.recipe?.ingredients
    ? store.recipe.ingredients.reduce(
        (acc, item) => {
            acc.calories += item.calories || 0;
            acc.fat += item.fat || 0;
            acc.saturated_fat += item.saturated_fat || 0;
            acc.carbs += item.carbs || 0;
            acc.sugars += item.sugars || 0;
            acc.fiber += item.fiber || 0;
            acc.protein += item.protein || 0;
            acc.salt += item.salt || 0;
            acc.sodium += item.sodium || 0;
            return acc;
        },
        { 
            calories: 0, 
            fat: 0, 
            saturated_fat: 0,
            carbs: 0, 
            sugars: 0, 
            fiber: 0, 
            protein: 0, 
            salt: 0, 
            sodium: 0 
        }
    )
    : { 
        calories: 0, 
        fat: 0, 
        saturated_fat: 0,
        carbs: 0, 
        sugars: 0, 
        fiber: 0, 
        protein: 0, 
        salt: 0, 
        sodium: 0 
    };


    return(

        <div className="card p-2 ms-auto my-3 my-md-0 mt-md-3">
            <div className="card-body">
                <div className="card-title">
                    <h5 className="nutricional_title fs-3">Nutricional Vaue</h5>
                </div>

                <div className="border-bottom my-2 bg-secondary my-3"></div>

                <ul className="list-group list-group-flush">
                    <li className="text-end text-danger fw-bold fst-italic fs-5">
                        {(totalNutrition.calories / portions).toFixed(0)} Kcal
                    </li>
                    <div className="row g-0 mt-3 fs-5">
                        <div className="col-12 col-md-6">
                        <li className="list-group-item bg-light d-flex justify-content-between">
                            <span className="fw-bold">Total carbs:</span>
                            {(totalNutrition.carbs / portions).toFixed(1)}
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="fw-bold">Total fat:</span>
                            {(totalNutrition.fat / portions).toFixed(1)}
                        </li>
                        <li className="list-group-item bg-light d-flex justify-content-between">
                            <span className="fw-bold">Saturated fat:</span>
                            {(totalNutrition.saturated_fat / portions).toFixed(1)}
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="fw-bold">Sugars:</span>
                            {(totalNutrition.sugars / portions).toFixed(1)}
                        </li>
                        </div>
                        <div className="col-12 col-md-6">
                        <li className="list-group-item bg-light d-flex justify-content-between">
                            <span className="fw-bold">Fiber:</span>
                            {(totalNutrition.fiber / portions).toFixed(1)}
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="fw-bold">Protein:</span>
                            {(totalNutrition.protein / portions).toFixed(1)}
                        </li>
                        <li className="list-group-item bg-light d-flex justify-content-between">
                            <span className="fw-bold">Salt:</span>
                            {(totalNutrition.salt / portions).toFixed(2)}
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="fw-bold">Sodium:</span>
                            {(totalNutrition.sodium / portions).toFixed(2)}
                        </li>
                        </div>
                    </div>
                </ul>

            </div>
        </div>
        
    );
}