const maxRecipes = 0; 
const apiKey = '9efeb48f9d814e97a83035634c5f4df9'

const ingredientsEle = document.getElementById("ingredients");
const titleEle = document.getElementById("title");
const intolerancesEle = document.getElementById("intolerances");
const veganEle = document.getElementById("vegan");
const vegeEle = document.getElementById("vege");
const glutenEle = document.getElementById("vegan");
const diaryEle = document.getElementById("diary");

const search = document.getElementById("search");
const output = document.getElementById("output");


search.addEventListener("click", function()
{

    let ingredients = ingredientsEle.value;
    let title = titleEle.value;

    let vegan = veganEle.value ? "vegan" : "";
    let vege = vegeEle.value ? "vege" : "";
    let gluten = glutenEle.value ? "gluten" : "";
    let diary = diaryEle.value ? "diary" : "";

    let intolerances = intolerancesEle.value; 

    let diet = gluten +","+ diary+","+vege+","+vegan;

    let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?titleMatch=${title}&ingredients=${ingredients}&intolerances=${intolerances}&diet=${diet}&apiKey=${apiKey}`;

    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
    // Handle the data (e.g., display recipe titles, images, etc.)
    console.log(data);
    
  
    })



    .catch((error) => 
    {
      console.error('Error fetching data:', error);
    });
});

