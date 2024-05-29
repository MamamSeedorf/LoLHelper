const championNames = [ "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios", "Ashe", "AurelionSol", "Azir", "Bard", "Belveth", "Blitzcrank", "Brand", "Braum", "Caitlyn", "Camille", "Cassiopeia", "Chogath", "Corki", "Darius", "Diana", "DrMundo", "Draven", "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger", "Illaoi", "Irelia", "Ivern", "Janna", "JarvanIV", "Jax", "Jayce", "Jhin", "Jinx", "Kaisa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Khazix", "Kindred", "Kled", "KogMaw", "KSante", "Leblanc", "LeeSin", "Leona", "Lillia", "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "MasterYi", "Milio", "MissFortune", "MonkeyKing", "Mordekaiser", "Morgana", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nocturne", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus", "RekSai", "Rell", "Renata", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Sona", "Soraka", "Swain", "Sylas", "Syndra", "TahmKench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "TwistedFate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Velkoz", "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Xayah", "Xerath", "XinZhao", "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra" ];

// The whole searchbar.
const matchupSearchWrapper = document.querySelector(".wrapper");
// Ved ikke hvad den her knap skal hedde...

// The select button that opens the seach bar.
openChampionSearchBtn = matchupSearchWrapper.querySelector(".select-button");

// The seach bar, where you can type in champion names.
matchupSearchBar = matchupSearchWrapper.querySelector("input");

// The matchup options, which are the champion names shown in the box below the seach bar.
matchupOptions = matchupSearchWrapper.querySelector(".championOptions");

// Function that fills the "matchupOptions" box with champion names when opening the search bar. Also gives
// each championName an onclick property, that updates the text on the first button to the champion name instead of
// Vs champion using the "updateName function".
function fillSearchWithChampionNames() {
    matchupOptions.innerHTML = "";
    championNames.forEach(champion => {     
        // Fills the box with each champion name and gives the onclick property. <li> </li> tags are used because the
        // HTML is structured as a list, and the <li> </li> tags makes each champion name a list item.
        // The onclick property runs the function "updateName", which changeres the name in the seachbar en the matchup.
        let championName = `<li onclick="updateName(this)">${champion}</li>`;
        // Inserts all the champion names inside the options box. 
        matchupOptions.insertAdjacentHTML("beforeend", championName);
    })
}
fillSearchWithChampionNames();

// Function that updates the name on the seachbar. When this runs, the site is supposed to update the stats
// depending on the chosen champion.
function updateName(selectedChampionName) {
    // Reset seach after selecting.
    matchupSearchBar.value = "";
    fillSearchWithChampionNames();

    insertVs(selectedChampionName.innerHTML);
    // From loadOptimalBuildForChampionScripts.js that updates the optimalBuild
    updateOptimalBuildByMatchup(selectedChampionName.innerHTML);
    matchupSearchWrapper.classList.remove("active");
    // Updates the name on the seachbar after selecting a champion name.
    openChampionSearchBtn.firstElementChild.innerText = selectedChampionName.innerHTML;
}


// Adds chosen champion to <div id="versusPlaceholder"> Appends picture and paragraph to said div. 
function insertVs(campeon) {
    let versusPlaceholder = document.querySelector('#versusChamp');    
    let championImageSrc = `http://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${campeon}.png`;

    // If the versusPlaceholder is active this if statement will replace the current champion with the new.
    if(versusPlaceholder.firstElementChild) {
        let championImageName = document.createElement('p');
        championImageName.innerText = campeon;
        versusPlaceholder.appendChild(championImageName);
        let newChampionImage = document.createElement('img');
        newChampionImage.src = championImageSrc;
        versusPlaceholder.replaceChild(championImageName,versusPlaceholder.children[0]);
        versusPlaceholder.replaceChild(newChampionImage,versusPlaceholder.children[1]);
    }else {
        
        let championImage = document.createElement('img');
        championImage.src = championImageSrc; 
        let championImageName = document.createElement('p');
        championImageName.innerText = campeon;
        versusPlaceholder.appendChild(championImageName);
        versusPlaceholder.appendChild(championImage);
    }
}

// Filters the champion options by filtering champion names when typing.
matchupSearchBar.addEventListener("keyup", () => {
    let arr = [];
    let searchedValue = matchupSearchBar.value.toLowerCase();
    
    // Fill array with the filtered champion names.
    // Filter using the "startsWith" function, which fills the array with the champion names, 
    // which start with the letters the user typed.
    arr = championNames.filter(championOptions => {
        return championOptions.toLowerCase().startsWith(searchedValue);     
    })
    // After filtering, .map fills the box of options again, like in the "fillSearchWithChampionNames" function
    // this time with the filtered champion names only.
    // Example: "he" has been typed. Hecarim and Heimerdinger is the new content of matchupOptions.
    // .join is used to only have champion names as options, and not have empty content.
    .map(championOptions => `<li onclick="updateName(this)">${championOptions}</li>`).join("");
    matchupOptions.innerHTML = arr ? arr : "<p>Champion not found</p>";
})

// Adds an eventlistener that toggles the search bar to be active. This is because all but the first button
// are hidden by default, and only shows when clicked on(when active)
openChampionSearchBtn.addEventListener("click", () =>{
    matchupSearchWrapper.classList.toggle("active");
});

