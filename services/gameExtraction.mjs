import axios from 'axios';
import axiosRetry from 'axios-retry';
import { GameData, Participant} from '../models/gameData.mjs';
import { promises as fs } from 'fs';
import path from 'path';
// Configuration of axios to retry failed attempts
axiosRetry(axios, {
    retries: 5,
    retryDelay: (retryCount) => {
        return axiosRetry.exponentialDelay(retryCount);
    },
    retryCondition: (error) => {
        // Retry on 500, 503 in case of service being unavailable or network errors. 
        return error.response?.status === 500 || error.response?.status === 503 || axiosRetry.isNetworkOrIdempotentRequestError(error);
    }
});

// Array to hold the api keys used to extract games
const apiKeys =["xxx"];

// Array that holds PUUIDs so we dont run out of games to check
const discoveredPUUIDs = []

// Gets the 20 latest match Ids for a specific player
async function getLast20MatchIdsFromPUUID(PUUID, apiKey){
    const queueId = 420;
    const start = 0;
    const count = 20;
    const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?queue=${queueId}&start=${start}&count=${count}`;
    try {
        const response = await axios.get(url, {
            headers: {
                "X-Riot-Token": apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.log('Failed to retrieve data: ', {message: error.message});
        return [];
    }
}

// Gets match data from a specific match (matchId)
async function getMatchFromMatchId(matchId, apiKey){
    const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
    try {
        const response = await axios.get(url, {
            headers: {
                "X-Riot-Token": apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.log('Failed to retrieve data:', {message: error.message});       
         return [];  
    }
}

// Gets the match timeline to know when a player buys a certain item
// And when a player levels up a certain skill
async function getMatchTimelineFromMatchId(matchId, apiKey) {
    const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}/timeline`;
    try {
        const response = await axios.get(url, {
            headers: {
                "X-Riot-Token": apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.log('Failed to retrieve timeline data:', { message: error.message });
        return [];
    }
}


// Extracts relevant events from the game timeline as in when a player upgrades a certain ability
// Aswell as when a player buys a certain item
function extractEventsFromTimeline(timelineData) {
    const playerEvents = {};

    timelineData.info.frames.forEach(frame => {
        frame.events.forEach(event => {
            if (event.type === 'ITEM_PURCHASED' || event.type === 'ITEM_UNDO' || event.type === 'SKILL_LEVEL_UP') {
                const participantId = event.participantId;
                if (!playerEvents[participantId]) {
                    playerEvents[participantId] = { itemEvents: [], skillEvents: [], levelEvents: [] };
                }

                if (event.type === 'ITEM_PURCHASED') {
                    playerEvents[participantId].itemEvents.push(event);
                } 
                // If an item is undone the event is irrelevant to the game and will be ignored
                else if (event.type === 'ITEM_UNDO') {
                    const index = playerEvents[participantId].itemEvents.findIndex(
                        previousEvent => previousEvent.type === 'ITEM_PURCHASED' && previousEvent.itemId === event.beforeId
                    );
                    if (index !== -1) {
                        playerEvents[participantId].itemEvents.splice(index, 1);
                    }
                }
                 else if (event.type === 'SKILL_LEVEL_UP') {
                    playerEvents[participantId].skillEvents.push(event);
                }
            }
        });
    });

    return playerEvents;
}

// Parses the JSON game data to the desired format that is used to store games in games.json
async function parseGameDataToGameObject(gameDataJson, timelineData) {
    let gameData = new GameData(0, gameDataJson.metadata.matchId);
    const events = extractEventsFromTimeline(timelineData);

    gameDataJson.info.participants.forEach(participantData => {
        const participantId = participantData.participantId;
        const participant = new Participant(participantData);

        if (events[participantId]) {
            participant.itemEvents = events[participantId].itemEvents;
            participant.skillEvents = events[participantId].skillEvents;
            participant.levelEvents = events[participantId].levelEvents;
        }

        gameData.addParticipant(participant);
    });

    return gameData;
}


// Writes the gathered game data to games.json
async function writeGameDataToJsonDB(gameData) {
    const filePath = path.join('dataFiles', 'localJsonData', 'games.json');

    try {
        let currentData = [];
        try {
            const data = await fs.readFile(filePath, { encoding: 'utf-8' });
            if (data) {
                currentData = JSON.parse(data);
            }

            // Check if the parsed data is an array, if not its because the file is empty
            // If the file is empty, create an array to store the games
            if (!Array.isArray(currentData)) {
                currentData = [];
            }

        } catch (error) {
            console.error('Error reading or parsing file:', error);
            return;
        }

        // Checks whether the game is already stored in games.json to avoid duplicates
        if (currentData.some(entry => entry.matchId === gameData.matchId)) {
            console.log('Match already exists:', gameData.matchId);
            return 'Match already exists';
        }

        // Append the new game data to the array
        currentData.push(gameData);

        // Write the updated data back to the file
        await fs.writeFile(filePath, JSON.stringify(currentData, null, 2));
    } catch (writeErr) {
        console.error('Failed to write to file:', writeErr);
    }
    return;
}


// Stores the PUUIDs from all players in the game
function storePUUIDsInGlobalArray(matchData){
    matchData.metadata.participants.forEach(PUUID => {
        discoveredPUUIDs.push(PUUID);
    });
}


// Takes a PUUID and gets 20 latest games from that player, and stores it in games.json
async function getAndWriteLast20GamesFromPUUID(PUUID, apiKey){
    const matchIds = await getLast20MatchIdsFromPUUID(PUUID, apiKey);
    let apiKeyIndex = 0; 

    for (let i = 0; i < matchIds.length; i++) {
        const apiKey = apiKeys[apiKeyIndex];

        let matchData = await getMatchFromMatchId(matchIds[i], apiKey);
        let timelineData = await getMatchTimelineFromMatchId(matchIds[i], apiKey);

        // If matchdata is empty array and error occured with that game and it should be skipped
        if (matchData.length === 0) {
            continue;
        }
        if (timelineData.length === 0){
            continue;
        }

        // To ensure that the only PUUIDs stored are gathered by the same api key due to attribute-based access control
        if (apiKeyIndex == 0) {
            storePUUIDsInGlobalArray(matchData);
        }

        let parsedGameData = await parseGameDataToGameObject(matchData, timelineData);
        await writeGameDataToJsonDB(parsedGameData);

        // Chooses the next api key such that the program circles through api keys,
        // which allows for use of multiple api keys to increase amount of requests
        apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length; 
    }
    return;
}

// The general function that continually goes through the discoveredPUUID to fetch games
async function getAndWriteGamesFromStorePUUIDs(){
    let puuidIndex = 0;

    // Calculation of the sleeping timer that ensures the program does not exceed the api rate limits
    let apiRequestsPer2Minutes = 100;
    let amountOfApiKeys = apiKeys.length;
    let totalApiRequestsPerMinute = amountOfApiKeys * (apiRequestsPer2Minutes / 2);
    let apiCallsPerCycle = 41;
    let cyclesPerMinute = totalApiRequestsPerMinute / apiCallsPerCycle;
    let minimumDelayBetweenCycles = 60000 / cyclesPerMinute;
    let safetyMargin = 1.4;
    let delayBetweenCycles = minimumDelayBetweenCycles * safetyMargin;

    // Ensures the same api key is always used when fetching data that contains PUUID due to attribute-based access control
    const apiKey = apiKeys[0];

    while (puuidIndex < discoveredPUUIDs.length) {
        const PUUID = discoveredPUUIDs[puuidIndex];

        await getAndWriteLast20GamesFromPUUID(PUUID, apiKey);
        puuidIndex++; 

        // Sets a sleeping timer to ensure the program doesn't exceed the api rate limits
        await new Promise(resolve => setTimeout(resolve, delayBetweenCycles));
    }
}


// Gets the initial 20 games to gather further PUUIDs to fetch games from
await getAndWriteLast20GamesFromPUUID("sQmiHNsTVBIKm4vzjXSz6UzeknU_oQVMTd_YAYiaz_jer7nZmlBCfzmos1lPe5hOW6cePEHOg2tMOw", apiKeys[0]);

// Runs the main function that continually fetches games
await getAndWriteGamesFromStorePUUIDs();


