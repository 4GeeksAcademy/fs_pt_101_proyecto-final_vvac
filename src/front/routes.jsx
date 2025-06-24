// Import necessary components and functions from react-router-dom.

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { LogInPage } from "./pages/LogInPage";
import { ForgotPasswd } from "./pages/ForgotPasswd";
import { ChangePasswd } from "./pages/ChangePasswd";
import { RegisterPage } from "./pages/RegisterPage";
import { RecipeDetails } from "./pages/RecipeDetails";
import { Profile } from "./pages/Profile";
import { ShoppingList } from "./pages/ShoppingList";
import { MealPlanner } from "./pages/MealPlanner";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { CreateRecipe } from "./pages/CreateRecipe";
import { EditRecipe } from "./pages/EditRecipe";
import { MyRecipes } from "./pages/MyRecipes";





export const router = createBrowserRouter(
    createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path= "/" element={<Home />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswd />} />
        <Route path="/change-password" element={<ChangePasswd />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/your-collection" element={<MyRecipes />} />
        <Route path="/meal-planner" element={<MealPlanner />} />
        <Route path="/single/:theId" element={ <Single />} />  {/* Dynamic route for single items */}
        <Route path="/recipes/new" element={<CreateRecipe />} />
        <Route path="/recipes/edit/:id" element={<EditRecipe />} />
        <Route path="/demo" element={<Demo />} />
        
        
      </Route>
    ),
    {
      future: {
        v7_relativeSplatPath: true,
      },
    }
);