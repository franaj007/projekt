function checkValue() 
{
    let isCorrect = false;
    let inputs = document.querySelectorAll("input");
    inputs.forEach(inp => 
    {
        if ((inp.type === "text" && inp.value != "") || (inp.type === "checkbox" && inp.checked)) 
        {
            isCorrect = true;
        }
    });
    return isCorrect;
}

function getApiUrl()
{
    const dietsData = [...document.querySelectorAll("#dietsCollapse > input:checked")].map(e => e.value);
    const intolerancesData = [...document.querySelectorAll("#intolerancesCollapse > input:checked")].map(e => e.value);
    const titleMatch = document.querySelector("#byRecipeInput").value;
    let ingredients = document.querySelector("#byIngInput").value;
    ingredients.replace(", ", ",");

    let apiUrl = "https://api.spoonacular.com/recipes/complexSearch?";

    let criteriaArray = [];
    if (titleMatch)
        criteriaArray.push(`titleMatch=${titleMatch}`);
    if (ingredients)
        criteriaArray.push(`includeIngredients=${ingredients}`);
    if (intolerancesData.length > 0)
        criteriaArray.push(`intolerances=${intolerancesData.join(",")}`);
    if (dietsData.length > 0)
        criteriaArray.push(`diet=${dietsData.join(",")}`);
    criteriaArray.push(`apiKey=${apiKey}`);
    apiUrl += criteriaArray.join("&");
    return apiUrl;
}

async function fetchRecipes(apiUrl, number)
{
    apiUrl += `&number=${number}`;
    let data = await fetch(apiUrl);
    let dataJson = await data.json(); 
    console.log(dataJson);   
    return dataJson;
}

class Slider
{
    constructor()
    {
        this.arrowForward = document.querySelector("#forwardBtn");
        this.arrowBack = document.querySelector("#backBtn");
        this.fullRecipeBtn = document.querySelector("#seeFullRecipeBtn")
        this.imageElement = document.querySelector("#recipeImage");
        this.nameElement = document.querySelector("#recipeName")
    }   
    
    newSlider(recipes, apiUrl)
    {
        this.recipes = recipes;
        this.recipeIndex = 0;
        this.apiUrl = apiUrl;
        this.arrowClick();
        this.imageElement.src = this.recipes.results[this.recipeIndex].image;
    }

    arrowClick()
    {
        this.arrowForward.addEventListener("click", () => this.updateRecipe(1))
        this.arrowBack.addEventListener("click", () => this.updateRecipe(-1))
    }
    
    updateRecipe = (value) =>
    {
        if (this.recipeIndex + value > this.recipes.results.length - 1)
        {
            if (this.recipes.totalResults - this.recipes.results.length >= 5)
                this.updateRecipeList();
            else
                this.recipeIndex = 0;
        }
        else if (this.recipeIndex + value < 0)
            this.recipeIndex = this.recipes.results.length - 1;
        else
            this.recipeIndex += value;

        this.imageElement.src = this.recipes.results[this.recipeIndex].image;
        this.imageElement.alt = this.recipes.results[this.recipeIndex].title;
        this.nameElement.innerText = this.recipes.results[this.recipeIndex].title;
    }

    disableBtns()
    {
        $("#sliderHeader > button, footer > button").attr("disabled", "true");
    }

    enableBtns()
    {
        $("#sliderHeader > button, footer > button").removeAttr("disabled");
    }

    updateRecipeList()
    {
        this.recipes = fetchRecipes(this.apiUrl, (this.recipes.totalResults - this.recipes.results.length) % 6);
    }
}


const apiKey = "9efeb48f9d814e97a83035634c5f4df9";
const byRecipeBtn = document.getElementById("byRecipeBtn");
const byRecipeInput = document.getElementById("byRecipeInput");
const byIngBtn = document.getElementById("byIngBtn");
const byIngInput = document.getElementById("byIngInput");
const btn = document.getElementById("searchBtn");
let inputs = [byIngInput, byRecipeInput];


let recipeSlider = new Slider();
byRecipeInput.focus();


btn.addEventListener("click", function()
{
    if (checkValue())
    {
        let apiUrl = getApiUrl();
        fetchRecipes(apiUrl, 10)
            .then(recipes => recipeSlider.newSlider(recipes));
    }
    else
        alert("Enter correct data");
});
inputs.forEach(input => input.addEventListener("keydown", async function(e)
{
    if (e.key === "Enter")
    {
        if (checkValue())
        {
            let apiUrl = getApiUrl();
            let recipes = await fetchRecipes(apiUrl, 10);
            recipeSlider.newSlider(recipes);
        }
        else
            alert("Enter correct data");
    }
    else if (e.key === "Escape")
    {
        this.value = "";
    }
}));

let collappseMenus = document.querySelectorAll(".collapsible");
collappseMenus.forEach(coll => coll.addEventListener("click", function()
{
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.maxHeight)
    {
        content.style.maxHeight = null;
        this.firstElementChild.src = "forward.svg";
    } 
    else
    {
        content.style.maxHeight = content.scrollHeight + "px";
        this.firstElementChild.src = "down.svg";
    } 
}));


