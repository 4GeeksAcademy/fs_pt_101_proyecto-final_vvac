import { Link } from "react-router-dom"

export const LinksMenu = () => {

    return (

        <nav className="links-menu">
            <ul>
                <li>
                    <Link to="/profile" className="menu-link">
                        <i className="fa-regular fa-user"></i>
                        <span>Profile</span>
                    </Link>
                </li>
                <li>
                    <Link to="/your-collection" className="menu-link">
                        <i className="fa-solid fa-book-bookmark"></i>
                        <span>Your collection</span>
                    </Link>
                </li>
                <li>
                    <Link to="/shopping-list" className="menu-link">
                        <i className="fa-solid fa-cart-shopping"></i>
                        <span className="mt-2">Shopping list</span>
                    </Link>
                </li>
                <li>
                    <Link to="/meal-planner" className="menu-link">
                        <i className="fa-solid fa-calendar-days"></i>
                        <span>Meal planner</span>
                    </Link>
                </li>
            </ul>
        </nav>

    )
}