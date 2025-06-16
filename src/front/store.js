
export const initialStore=()=>{
  return{
    token: localStorage.getItem("token") || null,
    user:localStorage.getItem("user") || null,
    recipes: [],
    recipe: null,
    collections: [],
    scores: [],
    shoppingList: [
      "Cauliflower, 1000, g",
    ],
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'logout':

    //remove the client token and user info from local
      localStorage.removeItem('token')

      //remove the client token and user info from local
      localStorage.removeItem('user')
      return {
        ...store,
        user: null
      };
    
    case 'logIn':
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user
      };

    case 'get_user':
      return {
        ...store,
        user: action.payload
      };
    
    case 'add_user':
      return {
        ...store,
        user: action.payload
      };
      
      case 'change_email':
        return {
          ...store,
          user: action.payload 
        };

    case 'get_all_recipes':
      return {
        ...store,
        recipes: action.payload
      };
      
    case 'get_one_recipe':
      return {
        ...store,
        recipe: action.payload
      };

    case 'get_recipe_score': {
      const { recipe_id, scores } = action.payload;
      return {
        ...store,
        scores: {
          ...store.scores,
          [recipe_id]: scores,
        }
      };
    }

    case 'like': {

      //take data from action payload
      //we use recipe_id to create an element on the list and store data 
      // because we need to know how many liked the recipe
      const { recipe_id, user_id } = action.payload;
      const newScoreEntry = {
        recipe_id: recipe_id,
        user_id: user_id,
        score: 1
      };
      return {
        ...store,
        scores: {
        ...store.scores,
        // Filter out the old entry for this user/recipe if it existed, then add the new one
        [recipe_id]: [...(store.scores[recipe_id] ?? []).filter(
            (scoreItem) => String(scoreItem.user_id) !== String(user_id)
        ), newScoreEntry]
        }
      };
    }
    
    case 'unlike': {
      const { recipe_id, user_id } = action.payload;
      return {
        ...store,
        scores: {
          ...store.scores,
          [recipe_id]: (store.scores[recipe_id] ?? []).filter(score => score.user_id !== user_id)
        }
      }
    };

    case 'remove_ingredient': 
      return {
        ...store,
        shoppingList: store.shoppingList.filter((_, i) => i !== action.payload)
      };

    case 'reset_shopping_list':
      return {
        ...store,
        shoppingList: []
      };

    case 'get_user_collection': {
      return {
        ...store,
        collections: action.payload || []
      };
    }

    case 'add_recipe': {
      return {
      ...store,
        collections: action.payload
      };
    }

    case 'remove_recipe': {
      return {
        ...store, collections: action.payload
      }
    }

    case 'get_all_comments': {
      return {
        ...store, 
        comments: action.payload || []
      }
    }

    case 'add_user':
      return {
        ...store,
        user: action.payload
      };

    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
      
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };

      case 'get_user_collections':
      return {
        ...store,
        collections: action.payload
      };

      case 'add_to_collection':
        return {
          ...store,
          collections: [...store.collections, action.payload]
        };
        
      case 'remove_from_collection':
        return {
        ...store,
        collections: store.collections.filter(id => id !== action.payload)
      };

    default:
      throw Error('Unknown action.');
  }    
}
