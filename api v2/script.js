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
    if (!data.ok) 
    {
        console.error(`HTTP error! status: ${data.status}`);
        return;
    }
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
        this.nameElement.innerText = this.recipes.results[this.recipeIndex].title;
        this.imageElement.alt = this.recipes.results[this.recipeIndex].title;
        //this.fullRecipeBtn.href = this.recipes.results[this.recipeIndex].sourceUrl;
    }

    arrowClick()
    {
        this.arrowForward.addEventListener("click", () => this.updateRecipe(1));
        this.arrowBack.addEventListener("click", () => this.updateRecipe(-1));
        this.fullRecipeBtn.addEventListener("click", () => this.seeFullRecipe(this.recipes.results[this.recipeIndex].title));
    }
    async seeFullRecipe()
    {
        fullRecipeList.innerHTML = "";
        let fullRecipeURL = `https://api.spoonacular.com/recipes/1096282/analyzedInstructions?apiKey=${apiKey}`;
        let data = await fetch(fullRecipeURL);
        let fullRecipeSteps = await data.json();
        let helpMeNiggaImDying = fullRecipeSteps;
        fullRecipeSteps = fullRecipeSteps[0].steps;
        console.log(fullRecipeSteps);
        let helper1;
        for(let i = 0; i < fullRecipeSteps.length; i++)
        {
            helper1 = addElement("li", "#fullRecipeList");
            helper1.innerText = fullRecipeSteps[i].step;
            let helper2;
            helper2 = addElement("li", "#ingredientsList");
            let helper3 = helpMeNiggaImDying;
            if(helper3[i].ingredients[0] != null)
            {
                for (let j = 0; j < helper3[i].ingredients.length; i++)
                {
                    helper2 = addElement("li", "#ingredientsList");
                    helper2.innerText = helper3[i].ingredients[j];
                }
            }

        }
        $("document").ready(function()
        {
            $("#recipeImage").animate({height: "12em"})
        })

    }


    updateRecipe = (value) =>
    {
        fullRecipeList.innerHTML = "";
        if (this.recipeIndex + value >= this.recipes.results.length - 1)
        {
            if (this.recipes.totalResults - this.recipes.results.length >= 5)
            {
                this.updateRecipeList();
                this.recipeIndex++;
            }
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

    async updateRecipeList()
    {
        let number = this.recipes.length;
        if (this.recipes.totalResults - this.results.length > 0)
        {
            number += Math.min(5, this.results.totalResults - this.recipes.length);
        }
        this.recipes = await fetchRecipes(this.apiUrl, number);
    }
}

const apiKey = "0eec5fc087174e60a52eac2f9d233fbe";
const apiKey2 = "9efeb48f9d814e97a83035634c5f4df9";
const byRecipeInput = document.getElementById("byRecipeInput");
const byIngInput = document.getElementById("byIngInput");
const btn = document.getElementById("searchBtn");
let inputs = [byIngInput, byRecipeInput];


let recipeSlider = new Slider();
byRecipeInput.focus();


btn.addEventListener("click", function()
{
    const seeFullRecipeBtn = document.getElementById("seeFullRecipeBtn");
    seeFullRecipeBtn.style.display = "inherit";
    seeFullRecipeBtn.style.height = "auto";
    seeFullRecipeBtn.style.width = "auto";

    const leftNigga = document.getElementById("niggaLeft");
    leftNigga.style.display = "inherit";
    const rightNigga = document.getElementById("niggaRight");
    rightNigga.style.display = "inherit";

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



