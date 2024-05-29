let uniqueIdCounter = 0; // Global counter for unique IDs


// Function creates and displays match outcome, user statistics, game particpants and when the match was played
function displayMatchResults(participantData, matchData) {
    // Creating displayResult element with its content
    let displayResult = document.createElement("div");
    displayResult.className = "resultDisplay";

    let expandButton = document.createElement("input");
    expandButton.className = "expandButton";
    expandButton.type = "button";
    expandButton.value = "Expand";

    // Assign a unique ID to the expand button
    let expandButtonId = `expandButton-${uniqueIdCounter}`;
    expandButton.id = expandButtonId;

    const matchResultColor = document.createElement("p");
    matchResultColor.className = "matchResultColor";

    if (participantData.win) {
        displayResult.style.backgroundColor = "rgba(42, 52, 79, 255)";
        expandButton.style.backgroundColor = "rgba(42, 52, 79, 255)";
        matchResultColor.textContent = "Win";
    } else {
        displayResult.style.backgroundColor = "rgba(86, 52, 59, 255)";
        expandButton.style.backgroundColor = "rgba(86, 52, 59, 255)";
        matchResultColor.textContent = "Loss";
    }

    displayResult.appendChild(matchResultColor);

    // Calling the different function with required parameters.  
    plotUserStats(displayResult, participantData, matchData);

    if(matchData.info === undefined){
        showMatchParticipants(displayResult, matchData.participants);
    }else{
        showMatchParticipants(displayResult, matchData.info.participants);
    }
    timeSinceLastMatch(displayResult, matchData);
    getParticipantSummonerSpells(displayResult, participantData);
    displayParticipantItemSet(displayResult, participantData);

    // Creating resultDisplayElement and appending displayResult to it
    let resultDisplayElement = document.createElement("div");
    resultDisplayElement.className = "displayElement";
    resultDisplayElement.appendChild(displayResult);
    resultDisplayElement.appendChild(expandButton);

    expandButton.addEventListener('click', (event) => {
        toggleExpandWrap(resultDisplayElement, expandButton, participantData, matchData, expandButtonId);
    });

    // Increment the unique ID counter
    uniqueIdCounter++;

    return resultDisplayElement;
}

function toggleExpandWrap(resultDisplayElement, expandButton, participantData, matchData, uniqueId) {
    let expandWrap = document.createElement("div");
    expandWrap.className = "expandWrap";
    
    // Use the unique ID for the expandWrap, to display different match data
    expandWrap.id = `expandWrap-${uniqueId}`;

    resultDisplayElement.replaceChild(expandWrap, expandButton);
    expandButton.value = "Close";

    // Adding input here
    if(matchData.info === undefined){
        extendedPlayerStats(matchData.participants, expandWrap.id);
    }else{
        extendedPlayerStats(matchData.info.participants, expandWrap.id);
    }    
    expandWrap.appendChild(expandButton);

    expandButton.addEventListener("click", () => {
        expandButton.value = "Close";
        resultDisplayElement.replaceChild(expandButton, expandWrap);
        expandButton.value = "Expand";
    });
}

async function extendedPlayerStats(participantData, containerId) {
    // Fetch the main container where the player details will be appended
    const container = document.getElementById(containerId);
    const teamWrap = createStatisticsElement("div","teamWrap");
    const winningTeam = document.createElement("div");
    winningTeam.className = "winningTeam";
    const losingTeam = document.createElement("div");
    losingTeam.className = "losingTeam";

    // Iterate over participant data (expecting 10 participants)
    for (let i = 0; i < 10; i++) {
        const createMatchDisplay = await displayAllMatchStats(participantData[i]);
        if (participantData[i].win) {
            winningTeam.appendChild(createMatchDisplay);
        } else {
            losingTeam.appendChild(createMatchDisplay);
        }
    }

    // Append the containers for both teams to the main container
    teamWrap.appendChild(winningTeam);
    teamWrap.appendChild(losingTeam);
    container.appendChild(teamWrap);
}

async function extendedPlayerStats(participantData, containerId) {
    // Fetch the main container where the player details will be appended
    const container = document.getElementById(containerId);
    const teamWrap = createStatisticsElement("div","teamWrap");
    const winningTeam = document.createElement("div");
    winningTeam.className = "winningTeam";
    const losingTeam = document.createElement("div");
    losingTeam.className = "losingTeam";

    // Iterate over participant data
    for (let i = 0; i < 10; i++) {
        const createMatchDisplay = await displayAllMatchStats(participantData[i]);
        if (participantData[i].win) {
            winningTeam.appendChild(createMatchDisplay);
        } else {
            losingTeam.appendChild(createMatchDisplay);
        }
    }

    // Append the containers for both teams to the main container
    teamWrap.appendChild(winningTeam);
    teamWrap.appendChild(losingTeam);
    container.appendChild(teamWrap);
}


// Function displaying participant champion image
function displayChampionImage(displayResult, participantData) {
    const summonerChampionImage = createImageElement("summonerChampionImage", getChampionImage(participantData.championName));
    displayResult.appendChild(summonerChampionImage);
}

// Function displaying a participants level in a match
function displayLevel(displayResult, participantData) {
    displayResult.appendChild(createStatisticsElement("p", "levelText", participantData.champLevel));
}

// Function displays participants stats for a game 
function displayKillsDeathsAssists(displayResult, participantData) {
    const statsText = createStatisticsElement("div", "statsText");
    const deathsText = createStatisticsElement("span", "participantDeathText", participantData.deaths);

    if (participantData.deaths === 0) {
        deathsText.textContent = '0';
    } else {
        deathsText.textContent = participantData.deaths;
    }

    statsText.append(document.createTextNode(`${participantData.kills}/`), deathsText, document.createTextNode(`/${participantData.assists}`));
    displayResult.appendChild(statsText);
}


// Function for running all functions, which displays information from a specific match
function plotUserStats(displayResult, participantData, matchData) {
    displayChampionImage(displayResult, participantData);
    displayLevel(displayResult, participantData);
    displayKillsDeathsAssists(displayResult, participantData);
    displayKDA(displayResult, participantData);
    displayCS(displayResult, participantData, matchData);
}

// Function creates an HTML element to display participant match information
function createStatisticsElement(htmlTagName, className, textContent) {
    const element = document.createElement(htmlTagName);
    element.className = className;
    element.textContent = textContent;
    return element;
}

// Function creates an HTML element to display Champion Image
function createImageElement(className, src) {
    const img = document.createElement('img');
    img.className = className;
    img.src = src;
    return img;
}

// Function retrieves the image of a champion based on the variable "championName" and returns it
function getChampionImage(championName) {
    if (championName === "FiddleSticks") {
        championName === "Fiddlesticks"
    }
    return `http://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${championName}.png`;
}

// Function to display match participants name and champion image, which is grouped by team in a given element
function showMatchParticipants(displayResult, participants) {
    let matchParticipants = document.createElement("div");
    matchParticipants.className = "participants";

    let participantWasOnWinningTeam = document.createElement("div");
    participantWasOnWinningTeam.className = "gameParticipantsWIN";

    let participantWasOnLosingTeam = document.createElement("div");
    participantWasOnLosingTeam.className = "gameParticipantsLOSS";

    let verticalLine = document.createElement("div");
    verticalLine.className = "verticalLine";

    findMatchParticipants(participants,participantWasOnWinningTeam,participantWasOnLosingTeam);

    matchParticipants.appendChild(participantWasOnWinningTeam);
    matchParticipants.appendChild(verticalLine);
    matchParticipants.appendChild(participantWasOnLosingTeam);

    displayResult.appendChild(matchParticipants);
}

// Function for creating and retrieving data from each participant in a match
function createParticipantNameImage(participant, participantWasOnWinningTeam, participantWasOnLosingTeam){
    let participantDiv = document.createElement('div');
        participantDiv.className = 'participant';
    
        let summonerNameText = document.createElement('span');
        summonerNameText.textContent = participant.summonerName.length > 6 ? participant.summonerName.slice(0, 6) + '...' : participant.summonerName;
    
        if (participant.summonerName === "") {
            summonerNameText.textContent = participant.riotIdGameName.length > 6 ? participant.riotIdGameName.slice(0, 6) + '...' : participant.riotIdGameName;
        }
        participantDiv.appendChild(summonerNameText);
    
        if (participant.championName === "FiddleSticks") {
            participant.championName = "Fiddlesticks"
        }
    
        let championIMG = document.createElement('img');
        championIMG.className = 'championIMG';
        championIMG.src = `http://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${participant.championName}.png`;
        championIMG.alt = `Champion: ${participant.championName}`;
        participantDiv.insertBefore(championIMG, summonerNameText);
    
        if (participant.win) {
            participantDiv.classList.add('winner');
            participantWasOnWinningTeam.appendChild(participantDiv);
        } else {
            participantDiv.classList.add('loser');
            participantWasOnLosingTeam.appendChild(participantDiv);
        }
}
// Function creates element, retrieves summoner spell image and displays
function displaySummonerSpells(displayResult, summoner1Key, summoner2Key){
    const createSummonerSpell1Element = document.createElement('img');
    createSummonerSpell1Element.src = `https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${summoner1Key}.png`;
    createSummonerSpell1Element.className = 'summonerSpell1';

    const createSummonerSpell2Element = document.createElement('img');
    createSummonerSpell2Element.src = `https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${summoner2Key}.png`;
    createSummonerSpell2Element.className = 'summonerSpell2';

    displayResult.appendChild(createSummonerSpell1Element);
    displayResult.appendChild(createSummonerSpell2Element);

}

// Function displaying item bought by the participant in a match. 
async function displayParticipantItemSet(displayResult, participantData) {
    const availableItems = 7;

    for (let i = 0; i < availableItems; i++) {
        const itemId = participantData[`item${i}`];
        const targetItem = await findItemById(itemId);

        if (targetItem) {
            // Creating a container, which holds each item 
            const container = document.createElement('div');
            container.className = "item-container";
            container.id = `container${i}`;

            // Ensures that the item is always to the left, by 35 px.
            container.style.left = `${i * 35}px`;
            displayResult.appendChild(container);

            const image = document.createElement('img');
            image.src = `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${targetItem.image}`;
            image.alt = targetItem.name;
            image.className = 'item-image';
            container.appendChild(image);

            const hoverBox = document.createElement('div');
            hoverBox.className = 'item-hover-box';
            populateHoverBox(hoverBox, targetItem);
            container.appendChild(hoverBox);

            addHoverEffect(image, hoverBox);
        }
    }
}

// Creating element for participants champion image
function appendChampionImage(container, championName) {
    const championImage = createImageElement("champion-image", getChampionImage(championName));
    championImage.alt = championName;
    container.appendChild(championImage);
}

// Creating element for participant name
function appendSummonerTag(container, summonerName) {
    const summonerTag = createStatisticsElement("div", "summoner-Tag");
    summonerTag.textContent = summonerName || "SummonerName";
    container.appendChild(summonerTag);
}

// Creating element for displaying participants KDA and CS
function appendChampionStats(container, data) {
    const championStats = createStatisticsElement("div", "champion-stats");

    const kda = createStatisticsElement("span", "kda");
    kda.textContent = `${data.kills}/${data.deaths}/${data.assists}`;

    const cs = createStatisticsElement("span", "cs");
    cs.textContent = `CS: ${data.totalMinionsKilled}`;

    championStats.appendChild(kda);
    championStats.appendChild(cs);
    container.appendChild(championStats);
}

// Displaying each particpant bought items
async function appendItems(container, data) {
    const allItemsContainer = createStatisticsElement("div", "all-items-container");

    for (let j = 0; j < 7; j++) {
        const itemNumber = "item" + j;
        const itemContainer = createStatisticsElement("div", "single-item-container");

        if (data[itemNumber]) {
            const itemImage = createStatisticsElement("img", "item-image2");
            itemImage.src = `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${data[itemNumber]}.png`;
            itemContainer.appendChild(itemImage);
        }

        allItemsContainer.appendChild(itemContainer);
    }

    container.appendChild(allItemsContainer);
}

// Finding and displaying each participant summoner spells 
async function appendSummonerSpells(container, data) {
    const allSumSpellsContainer = createStatisticsElement("div", "all-summoner-spells-container");
    const sumSpellData = await fetchSummonerSpellData();

    for (let i = 1; i < 3; i++) {
        const sumSpellNumber = "summoner" + i + "Id";
        const summonerSpells = Object.values(sumSpellData.data).find(sum => sum.key == data[sumSpellNumber]);

        if (summonerSpells) {
            const summonerSpellId = summonerSpells.id;
            const sumSpellContainer = createStatisticsElement("div", "single-sum-spell-container");
            const sumSpellImg = createStatisticsElement("img", "sum-spell-image");
            sumSpellImg.src = `http://ddragon.leagueoflegends.com/cdn/14.6.1/img/spell/${summonerSpellId}.png`;

            sumSpellContainer.appendChild(sumSpellImg);
            allSumSpellsContainer.appendChild(sumSpellContainer);
        }
    }

    container.appendChild(allSumSpellsContainer);
}
