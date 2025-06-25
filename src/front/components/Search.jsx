import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'

export const Search = () => {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate()
    //grab recipe id from url
    const { id } = useParams()

    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Title"); // default filter

    const handleFilter = (e) => {
        const searchWord = e.target.value.toLowerCase();
        setSearch(searchWord);

        if (searchWord === "") {
            setFilteredData([]);
        } else {

            //set empty result to store based on the filter used
            let result = [];

            if (filter === 'Title') {
                result = store.recipes?.filter((value) => {
                    return value.title.toLowerCase().includes(searchWord);
                });
            } else if (filter === 'Allergens') {
                result = store.recipes?.filter((value) => {
                    return !value.allergens?.some((allergen) =>
                        allergen.toLowerCase().includes(searchWord)
                    );
                });
            } else if (filter === 'Diets') {
                result = store.recipes?.filter((value) => {
                    return value.diet_label?.toLowerCase().includes(searchWord);
                });
            }
            setFilteredData(result);
        }
    }

    const clearInput = () => {
        setFilteredData([])
        setSearch("")
    }

    const handleSearch = (e) => {
        e.preventDefault();

    };

    useEffect(() => {

    }, []);

    return (

        // OnBlur will make when we click out of search bar to lose focus and clear data to close results
        <div className="mx-auto position-relative searchBar">
            <form onSubmit={handleSearch} className=" d-flex align-items-center p-1 rounded-pill 
            border-0 search_box_bg w-100">
                <input
                    className="form-control me-2 p-2 m-1 ms-2 search_input_bg border-0 rounded-pill fs-5"
                    value={search}
                    type="search"
                    placeholder={` Search by ${filter}`}
                    onChange={handleFilter}
                    onBlur={() => setTimeout(() => clearInput(), 400)} />
                {search.length === 0 ? null
                    :
                    <button type="button" className="btn-close" aria-label="Close" onClick={clearInput}></button>
                }
                {store.user?.id ?
                    <div className="dropdown border-start ps-2">
                        <button
                            className="btn border-0 dropdown-toggle"
                            type="button"
                            id="filterDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <FontAwesomeIcon icon={faFilter} className="me-1" />
                            <span className="ms-1 text-capitalize fs-5 m-1">{filter}</span>
                        </button>

                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="filterDropdown">
                        <li className="m-2">
                            <button className="dropdown-item fs-5" onClick={() => setFilter('Title')}>Title</button>
                        </li>
                        <li className="m-2">
                            <button className="dropdown-item fs-5" onClick={() => setFilter('Allergens')}>Allergens</button>
                        </li>
                        <li className="m-2">
                            <button className="dropdown-item fs-5" onClick={() => setFilter('Diets')}>Diets</button>
                        </li>
                        <li className="m-2">
                            <button className="dropdown-item text-danger fs-5" onClick={() => navigate('/search')}>Advance Search</button>
                        </li>
                    </ul>
                </div>
                :
                null}
                
            </form>

            {/* Results from search: will check if there is any match to show mapped data */}
            {filteredData?.length != 0 && (
                <div className="position-absolute bg-white shadow rounded mt-2 searchResult ">

                    {/* we will only show first 10 matches from results to avoid showing too much data */}
                    {filteredData.slice(0, 10).map((value, key) => {
                        return (
                            <Link key={value.id}
                                to={"/recipes/" + value.id}
                                className="dataItem active text-decoration-none fs-5"
                                onClick={() => clearInput}
                            >
                                <p className="ms-3">{value.title} </p>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    )
}