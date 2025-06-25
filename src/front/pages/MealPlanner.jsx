// src/front/pages/MealPlanner.jsx

import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { RightMenu } from "../components/RightMenu";
import { MealPlannerCalendar } from "../components/MealPlannerCalendar";

export const MealPlanner = () => {
  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* Left Sidebar (same as SearchPage) */}
        <div className="col-12 col-sm-3 col-md-2 p-2 d-flex flex-column">
          <LinksMenu />
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
