let ingredients = '';
let titleMatcher = '';
const maxRecipes = 1; 
const apiKey = '3611510279734103a44c257d8dfa11ab'


const btn1 = document.getElementById("btn1");
const userInput1 = document.getElementById("userInput1");
const output1 = document.getElementById("output1");

const btn2 = document.getElementById("btn2");
const userInput2 = document.getElementById("userInput2");
const output2 = document.getElementById("output2");


btn1.addEventListener("click", function()
{
  output1.innerHTML = "";
    ingredients = userInput1.value;
    let apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${maxRecipes}&apiKey=${apiKey}`;

    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
    // Handle the data (e.g., display recipe titles, images, etc.)
    console.log(data);

    output1.innerHTML =
    "<h2>" + "Recipe:" + "</h2>" + data[0].title +
      "<img src="+data[0].image+ " alt='recipe image' id='outputImg1'>";
    
  
    })



    .catch((error) => {
    console.error('Error fetching data:', error);
  });
  
  

});


btn2.addEventListener("click", function()
{
  output2.innerHTML = " ";
    titleMatcher = userInput2.value;
    let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${titleMatcher}&number=${maxRecipes}&apiKey=${apiKey}`;

    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
    // Handle the data (e.g., display recipe titles, images, etc.)
    console.log(data);
    output2.innerHTML =
    "<h2>" + "Recipe:" + "</h2>" + data.results[0].title +
      "<img src="+data.results[0].image+ " alt='recipe image' id='outputImg2'>";



    })
    .catch((error) => {
    console.error('Error fetching data:', error);
  });


});
