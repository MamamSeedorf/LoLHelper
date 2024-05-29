// The function loadSpiderWeb uses the PUUID and queueId to determine the player and data
// It uses 3 arrays, playerStats (The total amount of stats for the searched player), totalStats (The total amount of stats for everyone in the player's games)
// and averageStats(How many stats the player has compared to the average of everyone else). >1 means more than average
// The function is used to calculate and fill the averageStats array, and uses it when creating the chart
async function loadSpiderWeb (PUUID, queueId, games) {
    let matchIds = [];

    if(games === undefined){
        matchIds = await getMatchIdsFromPUUID(PUUID, 0, "20", queueId);
    }else{
        matchIds = games.map(x => x.game_id);
    }

    
    // Initialize playerStats. Array used to find the total number of the given stats for the player
    let playerStats = {
        kills: 0,
        deaths: 0,
        assists: 0,
        goldEarned: 0,
        totalDamageDealtToChampions: 0,
        visionScore: 0,
        totalMinionsKilled: 0 
    };

    // Initialize totalStats. Gets the sum of stats for every player in the players games
    let totalStats = {};
    for (const key of Object.keys(playerStats)) {
        totalStats[key] = 0;
    }

    // For loop that loops through each of the 20 matches, and fetches the data for each match.
    // Used to fill 2 arrays, playerStats and totalStats, with the total number of stats for the player and everyone respectively.
    for(let i = 0; i < matchIds.length-1; i++){
        
        // Finds the matchId for the specific match and gets the data from the "getMatchDetailsFromMatchID" function in fetchData.js
        const specificMatchId = matchIds[i];  
        let matchData = undefined;
        if(games === undefined){
            matchData = await getMatchDetailsFromMatchID(specificMatchId);

        } else{
            matchData = games[i];
        }
      
        // Put the player's data into a constant.
        let playerData; 
        if(matchData.info === undefined){
            playerData = matchData.participants.find(participant => participant.riotIdGameName === PUUID);
        }else{
            playerData = matchData.info.participants.find(participant => participant.puuid === PUUID);
        }

  

        // Fills playerStats with the total stats for the player. Works recursively by adding to the array one game at a time
        if(playerData){
            Object.keys(playerStats).forEach(key => playerStats[key] += playerData[key]);
        }

        // Double loop that goes through each stat and finds the average stat value of all the participants in the game for each stat. Gets put into "totalStats"
        // Keeps adding to the array for each game, so we get the average total stat value of all the participants in the game, for each stat
        if(matchData.info === undefined){
            matchData.participants.forEach(participant => {
                Object.keys(totalStats).forEach(key => {
                    totalStats[key] += participant[key]/matchData.participants.length;
                })
            });
        }else{
            matchData.info.participants.forEach(participant => {
                Object.keys(totalStats).forEach(key => {
                    totalStats[key] += participant[key]/matchData.info.participants.length;
                })
            });
        }

    }

    // Initialize averageStats. Array that gets filled with the player's stats compared to the average stats of all players in the player's games
    let averageStats = {};
    for (const key of Object.keys(playerStats)) {
        averageStats[key] = 0;
    }

    // Fills the "averageStats" array by dividing the player's total stats by the average total stats, to give a number that reprecents how much 
    // better/worse the player is in each stat compared to the average stats for all players in the player's games
    for (let key in playerStats) {
        averageStats[key] = playerStats[key] / totalStats[key];
    }
    
    // The function that creates the chart is run using the "averageStats" array
    renderChart(averageStats);
    return averageStats;
}

