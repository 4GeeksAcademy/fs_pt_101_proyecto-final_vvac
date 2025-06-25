import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { RightMenu } from "../components/RightMenu";
import { ShoppingListContent } from "../components/ShoppingListContent";

export const ShoppingList = () => {
  return (
    <div className="main-row-all">
      <div className="profile-container">
        <div className="container text-center sidebar-left-profile">
          <div className="row align-items-start">
            <div className="col-12 col-md-3">
              <div className="d-flex align-items-start">
                <TurnHome />
                <LinksMenu />
              </div>
            </div>

            <div className="col-6 main-column-content shopping-page">
              <ShoppingListContent />
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
  );
};
