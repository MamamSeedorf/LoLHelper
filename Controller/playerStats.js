// Function for getting users RiotId and their Tagline. The functions spilts the RiotID and tagLine by "#". 420 is the queueId (Gamemode), for Ranked Solo
async function searchAndPlotStats() {
    const riotID = document.getElementById('usernameInput').value;
    const parts = riotID.split('#');
    let username = parts[0];
    const userTagLine = parts[1] || '';
    let PUUID;
    document.getElementById("spinnerOverlay").style.display = "flex";

    try{
         PUUID = await getPUUIDFromRiotID(username, userTagLine);
        await loadSpiderWeb(PUUID, 420);
        await plotPlayerStats(PUUID, 420, username);
    }catch{
        let games = await plotPlayerStats(PUUID, 420, username);
        await loadSpiderWeb(username, 420, games);
    }
    document.getElementById("spinnerOverlay").style.display = "none";

}

document.getElementById('searchButton').addEventListener('click', searchAndPlotStats);

// Adds a click event listener to all elements with the class 'tab', enabling the user to select different queueId's
async function addTabClickHandlers() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', async function () {
            // Clears any existing 'active-tab' class and sets the clicked tab as 'active'
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active-tab'));
            this.classList.add('active-tab');

            const riotID = document.getElementById('usernameInput').value;
            const parts = riotID.split('#');
            const username = parts[0];
            const userTagLine = parts[1] || '';
            const PUUID = await getPUUIDFromRiotID(username, userTagLine);

            const queueId = this.getAttribute('data-queue-id');

            plotPlayerStats(PUUID, queueId, username);
        });
    });
}
addTabClickHandlers();

// Function displays player statistics, fetches match data, creates element for each match ID and displays tabs
async function plotPlayerStats(PUUID, queueId, username) {
    document.getElementById("spinnerOverlay").style.display = "flex";

    // Clear the content of the element with the ID "elementResult"
    const elementResult = document.getElementById("elementResult");
    elementResult.innerHTML = '';

    try{
        const gamesFromAPIResult = await getMatchIdsFromPUUID(PUUID, 0, "20", 420);
        if(gamesFromAPIResult){
            gamesFromAPI(PUUID, queueId, elementResult);
        }
    }catch{
        let games =  await gamesFromDB(username, elementResult);
        document.getElementById("spinnerOverlay").style.display = "none";
        document.querySelector('.tabs').style.display = 'flex';
        return games; 
    }
    
    document.getElementById("spinnerOverlay").style.display = "none";
    document.querySelector('.tabs').style.display = 'flex';
}

// Fetches game data from the API used for playerstats
async function gamesFromAPI(PUUID, queueId, elementResult){
    const matchIds = await getMatchIdsFromPUUID(PUUID, 0, "20", queueId);
    for (let i = 0; i < matchIds.length; i++) {
        const specificMatchId = matchIds[i];
        const matchData = await getMatchDetailsFromMatchID(specificMatchId);
        let resultDisplay = document.createElement("div");
        resultDisplay.className = "resultDisplay";
        const participantData = matchData.info.participants.find(participant => participant.puuid === PUUID);
    
        if (participantData) {
            const displayResult = displayMatchResults(participantData, matchData);
                
            elementResult.appendChild(displayResult);
        }
    }

}
// Fetches games from the database, this is used when the api does not work
async function gamesFromDB(username, elementResult){
    let matches = await loadStatsFromDB(); 
    for (let i = 0; i < matches.length-1; i++) {
        let matchData = matches[i];
        let resultDisplay = document.createElement("div");
        resultDisplay.className = "resultDisplay";
        const participantData = matchData.participants.find(participant => participant.riotIdGameName === username);

        if (participantData) {
            const displayResult = displayMatchResults(participantData, matchData);
            elementResult.appendChild(displayResult);
        }
    }
    return matches; 
}


// Function that calculates a participants KDA
function displayKDA(displayResult, participantData) {
    let KDA;
    if (participantData.deaths === 0) {
        KDA = participantData.kills + participantData.assists;
    } else {
        KDA = (participantData.kills + participantData.assists) / participantData.deaths;
    }

    displayResult.appendChild(createStatisticsElement("p", "kdaDisplay", `KDA: ${KDA.toFixed(2)}`));
}

// Function calculates a participants critical score "cs", and appends it to the displayResult area
function displayCS(displayResult, participantData, matchData) {
    const minionKilledInMatch = createStatisticsElement("div", "minionKilledInMatch");
    let totalMissionInAMatch = participantData.neutralMinionsKilled + participantData.totalMinionsKilled + participantData.dragonKills; 

    if(matchData.info === undefined){
        minionKilledInMatch.append(document.createTextNode(`${participantData.totalMinionsKilled} `));
        displayResult.appendChild(minionKilledInMatch);
    }else{
        const totalGameDuration = Number(((matchData.info.gameEndTimestamp - matchData.info.gameCreation) / 60000).toFixed(1));
        const participantCSPrMinut = Number((totalMissionInAMatch / totalGameDuration).toFixed(1));;

        minionKilledInMatch.append(document.createTextNode(`${totalMissionInAMatch}`), createStatisticsElement("span", "csText", `(${participantCSPrMinut})`));
        
        displayResult.appendChild(minionKilledInMatch);
    }

}

// Function for finding each participant in a specific match and retrieving their champion and account name
function findMatchParticipants(participants, participantWasOnWinningTeam, participantWasOnLosingTeam){
    participants.forEach(participant => {
        createParticipantNameImage(participant, participantWasOnWinningTeam, participantWasOnLosingTeam)
    });
}

// Function to determine match age, displays hours if under a day, else days
function timeSinceLastMatch(displayResult, matchData) {
    const currentDate = new Date().getTime();
    const timeSinceMatch = document.createElement("p");
    timeSinceMatch.className = "lastPlayedGame";
    let matchEndedTime;

    if(matchData.info === undefined){
        timeSinceMatch.textContent = ``;
    }else{
        matchEndedTime = matchData.info.gameEndTimestamp;
        const timeDiff = currentDate - matchEndedTime;

        const hoursDiff = timeDiff / (1000 * 60 * 60);
    
        if (hoursDiff < 24) {
            timeSinceMatch.textContent = `${Math.round(hoursDiff)} hours ago`;
        } else {
            const daysDiff = Math.floor(hoursDiff / 24);
            timeSinceMatch.textContent = `${daysDiff} days ago`;
        }
    
        displayResult.appendChild(timeSinceMatch);
    }
}

// Function for getting participant summoner spells in a match
async function getParticipantSummonerSpells(displayResult, participantData) {
    const summonerSpellDataUrl = `https://ddragon.leagueoflegends.com/cdn/14.9.1/data/en_US/summoner.json`;

    const response = await fetch(summonerSpellDataUrl);
    const data = await response.json();
    const summonerSpells = data.data;

    // Finding the key id in Riot object, which matches with the participant.summoner1Id and 2
    const summonerSpellKeys = Object.keys(summonerSpells)
    const summoner1Key = summonerSpellKeys.find(key => summonerSpells[key].key == participantData.summoner1Id);
    const summoner2Key = summonerSpellKeys.find(key => summonerSpells[key].key == participantData.summoner2Id);

    displaySummonerSpells(displayResult, summoner1Key, summoner2Key);

}

// Function to display extended player stats for two teams under each match
async function displayAllMatchStats(data) {
    const championContainer = document.createElement("div");
    championContainer.className = "champion-container";

    // Create and append an image element for the champion
    const championImage = createImageElement("champion-image", getChampionImage(data.championName));
    championImage.alt = `${data.championName}`;

    championContainer.appendChild(championImage);

    const summonerTag = createStatisticsElement("div", "summoner-Tag");
    summonerTag.textContent = data.riotIdGameName || "riotIdGameName";
    championContainer.appendChild(summonerTag);

    // Container for a champion's KDA and CS stats
    const championStats = createStatisticsElement("div", "champion-stats");

    const kda = createStatisticsElement("span", "kda");
    kda.textContent = `${data.kills}/${data.deaths}/${data.assists}`;

    const cs = createStatisticsElement("span", "cs");
    totalCS = data.totalMinionsKilled + data.neutralMinionsKilled + data.dragonKills; 

    if(data.neutralMinionsKilled === undefined){
        cs.textContent = `CS: ${data.totalMinionsKilled}`;
    }else{
        cs.textContent = `CS: ${totalCS}`;
    }

    championStats.appendChild(kda);
    championStats.appendChild(cs);
    championContainer.appendChild(championStats);

    // Creating a container for displaying all the champion's items
    const allItemsContainer = createStatisticsElement("div", "all-items-container");
    for (let j = 0; j < 7; j++) {
        const itemNumber = "item" + j;
        // Creating a container for displaying a single item
        const itemContainer = createStatisticsElement("div", "single-item-container");
        const itemImage = createStatisticsElement("img", "item-image2");
        if(data[itemNumber]){
            itemImage.src = `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${data[itemNumber]}.png`;
            itemContainer.appendChild(itemImage);
        }
        allItemsContainer.appendChild(itemContainer);
        championContainer.appendChild(allItemsContainer);

    }

    // Creating a container for displaying the champion's summoner spells
    const allSumSpellsContainer = createStatisticsElement("div", "all-summoner-spells-container");
    const sumSpellData = await fetchSummonerSpellData();
    for (let i = 1; i < 3; i++) {
        const sumSpellNumber = "summoner" + i + "Id";
        const summonerSpells = Object.values(sumSpellData.data).find(sum => sum.key == data[sumSpellNumber]);
        const summonerSpellId = summonerSpells.id;

        const sumSpellContainer = createStatisticsElement("div", "single-sum-spell-container");
        const sumSpellImg = createStatisticsElement("img", "sum-spell-image");
        sumSpellImg.src = `http://ddragon.leagueoflegends.com/cdn/14.6.1/img/spell/${summonerSpellId}.png`;

        sumSpellContainer.appendChild(sumSpellImg);
        allSumSpellsContainer.appendChild(sumSpellContainer);
        championContainer.appendChild(allSumSpellsContainer);
    }

    return championContainer;
}