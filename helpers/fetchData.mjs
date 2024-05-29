// Gets the PUUID of a player based on their riotID
async function getPUUIDFromRiotID(username, riotTag){
    const encodedUsername = encodeURIComponent(username);
     const encodedRiotTag = encodeURIComponent(riotTag);
    const url = `http://localhost:3000/getPlayerPUUIDFromRiotTag/${encodedUsername}/${encodedRiotTag}`;
     const response = await fetch(url);
     const data = await response.json();
    return data.puuid; 
}

// Calls the express server endpoint to get matchIds based on PUUID
async function getMatchIdsFromPUUID(puuid, start, count, queueId = 420) {
    const url = new URL(`http://localhost:3000/getMatchIds/${encodeURIComponent(puuid)}`);
    url.searchParams.append('start', start);
    url.searchParams.append('count', count);
    url.searchParams.append('queueId', queueId);
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
// Calls the express server endpoint to get match details from matchID
async function getMatchDetailsFromMatchID(specificMatchId) {
    const url = `http://localhost:3000/getMatchDetails/${encodeURIComponent(specificMatchId)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Calls the express server endpoint to get the optimal build for a given champion and potential opponent
async function loadOptimalBuildFromDatabase(userChamion, opponentChampion, teamPosition) {
    const url = `http://localhost:3000/loadOptimalDBBuild/${encodeURIComponent(userChamion)}/${encodeURIComponent(opponentChampion)}/${encodeURIComponent(teamPosition)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

async function loadStatsFromDB() {
    const url = `http://localhost:3000/fetchStatsFromDB`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
