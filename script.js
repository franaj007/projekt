const ingredients = 'apples,flour,sugar';
const maxRecipes = 2; // You can adjust this as needed
const apiKey = '3611510279734103a44c257d8dfa11ab'
const apiUrl = 
`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${maxRecipes}&apiKey=${apiKey}`;

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    // Handle the data (e.g., display recipe titles, images, etc.)
    console.log(data);
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
