let ingredients = '';
const maxRecipes = 2; 
const apiKey = '3611510279734103a44c257d8dfa11ab'


const btn = document.getElementById("btn");
const userInput = document.getElementById("userInput");
const out = document.getElementById("out");


btn.addEventListener("click", function()
{
    ingredients = userInput.value;
    let apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${maxRecipes}&apiKey=${apiKey}`;

    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
    // Handle the data (e.g., display recipe titles, images, etc.)
    console.log(data);
    })
    .catch((error) => {
    console.error('Error fetching data:', error);
  });
});
