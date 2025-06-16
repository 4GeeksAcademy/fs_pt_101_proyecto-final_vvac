import { useState, useEffect } from "react"
import { TurnHome } from "../components/buttons/TurnHome"
import { LinksMenu } from "../components/LinksMenu"
import { RightMenu } from "../components/RightMenu"
import { RecipeCard } from "../components/RecipeCard"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import recipeServices from "../services/recetea_API/recipeServices.js"
import collectionServices from "../services/recetea_API/collectionServices.js"
import { useNavigate } from "react-router-dom"

export const CollectionFav = () => {
  const navigate = useNavigate()
  const { dispatch, store } = useGlobalReducer()

  const [activeTab, setActiveTab] = useState("all")

  // crudos/minimales
  const [recipeItemsRaw, setRecipeItemsRaw] = useState([])
  const [collectionItemsRaw, setCollectionItemsRaw] = useState([])

  // para “All” con detalles completos
  const [allRecipes, setAllRecipes] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    const fetchYourRaw = async () => {
      const resp = await recipeServices.getAllUserRecipes()
      const arr = Array.isArray(resp) ? resp : resp.recipes || []
      return arr.map(r => ({
        id: r.id,
        name: r.title,
        imageUrl: r.media?.[0]?.url || "",
        nutriScore: r.nutri_score ?? null,
      }))
    }

    const fetchCollectionsRaw = async () => {
      const data = await collectionServices.getUserCollections()
      console.log("DESDE DENTRO DE LA FUNCION: " + JSON.stringify(data.data))
      const formatted = (Array.isArray(data.data) ? data.data : data || []).map(item => ({
        id: item.recipe_id,               // aquí recipe_id
        userId: item.user_id,
      }))
      dispatch({ type: "get_user_collections", payload: formatted })
      return formatted
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        if (activeTab === "all") {
          // 1) traemos los crudos
          const [yourRaw, collRaw] = await Promise.all([
            fetchYourRaw(),
            fetchCollectionsRaw(),
          ])
          setRecipeItemsRaw(yourRaw)
          setCollectionItemsRaw(collRaw)
          console.log("--------------------> " + JSON.stringify(collRaw))

          // 2) extraemos IDs y deduplicamos
          const ids = [
            ...yourRaw.map(r => r.id),
            ...collRaw.map(c => c.id),
          ]
          const uniqueIds = Array.from(new Set(ids))

          // 3) por cada id, getOneRecipe
          const full = await Promise.all(
            uniqueIds.map(id => recipeServices.getOneRecipe(id))
          )
          setAllRecipes(full)
        }
        else if (activeTab === "your-recipes") {
          const yourRaw = await fetchYourRaw()
          setRecipeItemsRaw(yourRaw)
        }
        else if (activeTab === "collections") {
          const collRaw = await fetchCollectionsRaw()
          const ids = [
            ...collRaw.map(c => c.id),
          ]
          const uniqueIds = Array.from(new Set(ids))
          const fullColl = await Promise.all(
            uniqueIds.map(id => recipeServices.getOneRecipe(id))
          )
          setCollectionItemsRaw(fullColl)

        }
      } catch (err) {
        console.error(err)
        setError("Error cargando datos")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab, dispatch])

  const renderAllCards = () => {
    if (loading) return <p>Cargando todas tus recetas…</p>
    if (error) return <p className="text-danger">{error}</p>
    if (!allRecipes.length)
      return <p>No hay recetas para mostrar en “All”.</p>

    return (
      <div className="cards-grid">
        {allRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            name={recipe.title}
            url={recipe.media?.[0]?.url || ""}
            nutriScore={recipe.nutriScore}
            isSaved={false}
            onClick={() => console.log("Detalle", recipe.id)}
          />
        ))}
      </div>
    )
  }

  const renderYourRecipes = () => {
    if (loading) return <p>Cargando tus recetas de usuario…</p>
    if (error) return <p className="text-danger">{error}</p>
    if (!recipeItemsRaw.length)
      return <p>No tienes recetas personales todavía.</p>

    return (
      <div className="cards-grid">
        {recipeItemsRaw.map((r, idx) => (
          <RecipeCard
            // key={`your-${r.id}-${idx}`}
            key={r.id}
            id={r.id}
            name={r.name}
            url={r.imageUrl}
            nutriScore={r.nutriScore}
            isSaved={false}
            onClick={() => console.log("Detalle usuario", r.id)}
          />
        ))}
      </div>
    )
  }

  const renderCollectionCards = () => {
    if (loading) return <p>Cargando tus collections…</p>
    if (error) return <p className="text-danger">{error}</p>
    if (!collectionItemsRaw.length)
      return <p>No tienes elementos en tu colección.</p>
      
    return (
      <div className="cards-grid">
        {collectionItemsRaw.map((c, idx) => (
          <RecipeCard
            key={c.id}
            id={c.id}
            name={c.title}
            url={c.media?.[0]?.url || ""}
            nutriScore={c.nutriScore}
            isSaved={true}
            onClick={() => console.log("Colección detalle", c.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="main-row-all vh-100">
      <div className="profile-container">
        <div className="container text-center sidebar-left-profile">
          <div className="row align-items-start">
            <div className="col-12 col-md-3">
              <div className="d-flex align-items-start">
                <TurnHome />
                <LinksMenu />
              </div>
            </div>

            <div className="col-6 main-column-content">
              <div className="d-flex align-items-start flex-column mb-3 edit-perfil">
                <h2 className="mb-3">Collection</h2>
                <p>All, Your Recipes & Collections</p>

                <ul className="nav nav-tabs">
                  {["all", "your-recipes", "collections"].map(tab => (
                    <li className="nav-item" key={tab}>
                      <button
                        className={`nav-link ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === "all" ? "All" : tab === "your-recipes" ? "Your Recipes" : "Collections"}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content">
                  {activeTab === "all" && <div className="tab-pane active">{renderAllCards()}</div>}
                  {activeTab === "your-recipes" && (
                    <div className="tab-pane active">{renderYourRecipes()}</div>
                  )}
                  {activeTab === "collections" && (
                    <div className="tab-pane active">{renderCollectionCards()}</div>
                  )}
                </div>
              </div>
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
