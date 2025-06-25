// src/front/pages/MealPlanner.jsx

import { LinksMenu } from "../components/LinksMenu";
import { RightMenu } from "../components/RightMenu";
import { MealPlannerCalendar } from "../components/MealPlannerCalendar";

export const MealPlanner = () => {
  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* Left Sidebar (same as SearchPage) */}
        <div className="col-12 col-sm-3 col-md-2 p-2 d-flex flex-column">
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

        {/* Main Content: Calendar (center, max space) */}
        <div className="col-12 col-sm-6 col-md-8 p-2 d-flex flex-column">
          <MealPlannerCalendar />
        </div>

        {/* Right Sidebar: occupies the minimum */}
        <div className="col-12 col-sm-3 col-md-2 p-2 d-flex flex-column align-items-end">
          <RightMenu />
        </div>
      </div>
    </div>
  );
};
