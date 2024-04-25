function addElement(elementToAdd, target)
{
    const element = document.createElement(elementToAdd);
    if (target == "body")
        document.body.appendChild(element);
    else
        document.body.querySelector(target).appendChild(element);
    return element;
}


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
    const dietsData = [...document.querySelectorAll("#dietsCollapse > label > input:checked")].map(e => e.value);
    const intolerancesData = [...document.querySelectorAll("#intolerancesCollapse > label > input:checked")].map(e => e.value);
    const titleMatch = document.querySelector("#byRecipeInput").value;
    let ingredients = document.querySelector("#byIngInput").value;
    ingredients.replace(", ", ",");

    let apiUrl = "https://api.spoonacular.com/recipes/complexSearch?";
//criteriaArray
    let helpMeNiggaImDying = [];
    if (titleMatch)
        helpMeNiggaImDying.push(`titleMatch=${titleMatch}`);
    if (ingredients)
        helpMeNiggaImDying.push(`includeIngredients=${ingredients}`);
    if (intolerancesData.length > 0)
        helpMeNiggaImDying.push(`intolerances=${intolerancesData.join(",")}`);
    if (dietsData.length > 0)
        helpMeNiggaImDying.push(`diet=${dietsData.join(",")}`);
    helpMeNiggaImDying.push(`apiKey=${apiKey}`);
    apiUrl += helpMeNiggaImDying.join("&");
    return apiUrl;
}

async function fetchRecipes(apiUrl, number)
{
    apiUrl += `&number=${number}`;
    let data = await fetch(apiUrl);
    if (!data.ok) 
    {
        console.error(`HTTP error! status: ${data.status}`);
        return;
    }
    let dataJson = await data.json(); 
    return dataJson;
}

class Slider
{
    static isRecipeHidden = true;
    static isRecipeGenerated = false;
    static initialImgHeight;

    constructor()
    {
        this.arrowForward = document.querySelector("#forwardBtn");
        this.arrowBack = document.querySelector("#backBtn");
        this.seeRecipeBtn = document.querySelector("#seeRecipeBtn")
        this.imageElement = document.querySelector("#recipeImage");
        this.nameElement = document.querySelector("#recipeName")
        this.arrowClick();
    }   
    
    newSlider(recipes, apiUrl)
    {
        Slider.isRecipeHidden = true;
        Slider.isRecipeGenerated = false;
        this.clearRecipe();
        this.recipes = recipes;
        this.recipeIndex = 0;
        this.apiUrl = apiUrl;
        this.imageElement.src = this.recipes.results[this.recipeIndex].image;
        this.nameElement.innerText = this.recipes.results[this.recipeIndex].title;
        this.imageElement.alt = this.recipes.results[this.recipeIndex].title;
        if (this.recipes.results.length > 1)
        {
            this.arrowForward.classList.remove("hidden");
            this.arrowBack.classList.remove("hidden");
        }
        this.seeRecipeBtn.classList.remove("hidden");
        document.querySelector("#slider").classList.remove("hidden");
        $(document).ready(function()
        {
            Slider.initialImgHeight = $("#recipeImage").height();
            console.log(Slider.initialImgHeight);
        });
    }
    
    arrowClick()
    {
        this.arrowForward.addEventListener("click", () => this.updateRecipe(1));
        this.arrowBack.addEventListener("click", () => this.updateRecipe(-1));
        this.seeRecipeBtn.addEventListener("click", () => 
        {
            if (Slider.isRecipeHidden)
            {
                this.fetchFullRecipe(this.recipes.results[this.recipeIndex].id).then(() =>
                {
                    Slider.showRecipe();
                    this.seeRecipeBtn.innerText = "Hide full recipe";
                });
            }
            else
            {
                Slider.hideRecipe();
                this.seeRecipeBtn.innerText = "Show full recipe";
            }
        });
    }

    static hideRecipe()
    {
        $("#recipe").slideUp(750);
        $("#recipeImage").animate({height: `${Slider.initialImgHeight}px`});
        Slider.isRecipeHidden = true;
    }
    static showRecipe()
    {
        
        $("#recipeImage").animate({height: "12em"}, function () 
        {
            $("#recipe").slideDown(750)
        });
        $("#recipe > div > h3").removeClass("hidden");
        Slider.isRecipeGenerated = true;
        Slider.isRecipeHidden = false;
    }

    clearRecipe()
    {
        document.querySelector("#ingContainer > h3").classList.add("hidden");
        document.querySelector("#recipeList").innerHTML = "";
        document.querySelector("#recipeIng").innerHTML = "";
        $("#recipeImage").animate({height: `${Slider.initialImgHeight}px`}, 0);
        Slider.isRecipeGenerated = false;
        Slider.isRecipeHidden = true;
        this.seeRecipeBtn.innerText = "Show full recipe";
    }
    
    async fetchFullRecipe(id)
    {
        if (Slider.isRecipeGenerated)
        {
            return;
        }
        $("#recipe").slideUp(0);
        const fullRecipeURL = `https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=${apiKey}`;
        let fullRecipeSteps = await fetch(fullRecipeURL);
        fullRecipeSteps = await fullRecipeSteps.json();
        fullRecipeSteps = fullRecipeSteps[0].steps;
        
        let ingredientsArray = fullRecipeSteps.reduce((accumulator, step) => 
        {
            step.ingredients.forEach(ingredient => accumulator.add(ingredient.name));
            return accumulator;
        }, new Set());
        ingredientsArray = Array.from(ingredientsArray);
        
        let liElement;
        ingredientsArray.forEach(ingredient => 
        {
            liElement = addElement("li", "#recipeIng");
            liElement.innerText = ingredient;
        });

        for(let i = 0; i < fullRecipeSteps.length; i++)
        {
            liElement = addElement("li", "#recipeList");
            let step = fullRecipeSteps[i].step;
            step = step.replace(/\.([A-Z])/g, ". $1");
            liElement.innerText = step;
        }

    }


    updateRecipe = (value) =>
    {
        this.clearRecipe();
        if (this.recipeIndex + value == this.recipes.results.length - 1)
        {
            if (this.recipes.totalResults - this.recipes.results.length >= 1)
            {
                this.updateRecipeList();
            }
            this.recipeIndex += value;
        }
        else if (this.recipeIndex + value > this.recipes.results.length -1)
            this.recipeIndex = 0;
        else if (this.recipeIndex + value < 0)
            this.recipeIndex = this.recipes.results.length - 1;
        else
            this.recipeIndex += value;

        this.imageElement.src = this.recipes.results[this.recipeIndex].image;
        this.imageElement.alt = this.recipes.results[this.recipeIndex].title;
        this.nameElement.innerText = this.recipes.results[this.recipeIndex].title;
    }

    async updateRecipeList()
    {
        let number = this.recipes.results.length;
        if (this.recipes.totalResults - this.recipes.results.length > 0)
        {
            number += Math.min(5, this.recipes.totalResults - this.recipes.results.length);
        }
        this.recipes = await fetchRecipes(this.apiUrl, number);
    }
}

//const apiKey = "0eec5fc087174e60a52eac2f9d233fbe";
const apiKey = "9efeb48f9d814e97a83035634c5f4df9";
//const apiKey = "e3f134f9f86248e1af1152b093b005f8";
const byRecipeInput = document.getElementById("byRecipeInput");
const byIngInput = document.getElementById("byIngInput");
const searchBtn = document.getElementById("searchBtn");
let inputs = [byIngInput, byRecipeInput];


let recipeSlider = new Slider();
byRecipeInput.focus();


searchBtn.addEventListener("click", async function()
{
    if (checkValue())
    {
        let apiUrl = getApiUrl();
        let recipes = await fetchRecipes(apiUrl, 10);
        recipeSlider.newSlider(recipes, apiUrl);
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
            recipeSlider.newSlider(recipes, apiUrl);
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
    this.classList.toggle("activeButton");
    let content = this.nextElementSibling;
    content.classList.toggle("activeContent");
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



