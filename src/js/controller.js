import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1)

    if(!id) return;
    recipeView.renderSpinner();

    // update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())
    bookmarksView.update(model.state.bookmarks)
    
    // Loading recipe 
    await model.loadRecipe(id)
    const { recipe } = model.state;
    // Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError()
  }
};

const controlSearchResults = async function() {
  try{
    resultsView.renderSpinner()
    // Get search query
    const query = searchView.getQuery();
    if(!query) return;
    // load the search results
    await model.loadSearchResults(query)
    // render results
    //resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage());

    //render initial pagination button
    paginationView.render(model.state.search)
  } catch(err){
    console.log(err)
  }
}

const controlpagination = function(goToPage) {
  //render new resulta
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render new pagination button
  paginationView.render(model.state.search)
}

const controlServings = function(newServings){
  // update the recipe servings (in state)
  model.updateServings(newServings)

  //update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlBookmark = function(){
  // Add or remove bookmark
  if(!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe);
  else
    model.deleteBookmark(model.state.recipe.id);
  // update recipe view
  recipeView.update(model.state.recipe)
  //render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  try{

    // show loading spinner
    addRecipeView.renderSpinner()

    //upload new recipe data
    await model.uploadRecipe(newRecipe)

    //render recipe
    recipeView.render(model.state.recipe)

    //success message
    addRecipeView.renderSuccess()

    //render bookmark view
    bookmarksView.render(model.state.bookmarks)

    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    //close form window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    },MODAL_CLOSE_SEC * 1000)
  } catch(err){
    console.error('😣',err);
    addRecipeView.renderError(err.message)
  }
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlpagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init()
