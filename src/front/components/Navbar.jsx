import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container text-center">
				<span className="text-center">logo</span>
				<div className="ml-auto">
					<Link to="/demo">
						<span className="buttons justify-content:">
							<button className="btn btn-light">Log In</button>
							<button className="btn btn-primary">Register</button>
						</span>
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default Navbar