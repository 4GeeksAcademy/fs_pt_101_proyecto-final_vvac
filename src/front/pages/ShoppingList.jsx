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
