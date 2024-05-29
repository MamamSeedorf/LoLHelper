import { GameData, Participant} from '../gameData.mjs';
import { OptimalBuild} from '../optimalBuild.mjs';
import {ensureGameRelatedTablesExist, createConnection, insertGamesData, fetchGameData, calculateOptimalItemsFromdDB, calculateOptimalSkillOrderFromDB, calculateOptimalSummonerSpellsFromDB, calculateOptimalRunesFromDB, getGeneralChampionStats, ensureUserTableExists } from './dataBaseHelpers.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
// Used to calculate and return an object of the optimal build stats. This is called by express server
// when user opens championBuilds for a given champion
export async function calculateOptimalBuild(userChampion, opponentChampion, teamPosition){
    let connection;
    try {
        const connection = await createConnection();
        await ensureGameRelatedTablesExist(connection);
        const bestBuild = await calculateOptimalItemsFromdDB(connection, userChampion, opponentChampion, teamPosition);
        const bestSkillOrder = await calculateOptimalSkillOrderFromDB(connection, userChampion);
        const bestSummonerSpellCombination = await calculateOptimalSummonerSpellsFromDB(connection, userChampion);
        const bestRunes = await calculateOptimalRunesFromDB(connection, userChampion);
        const generalChampionStats = await getGeneralChampionStats(connection, userChampion, opponentChampion, teamPosition)
        connection.close();
    return new OptimalBuild(bestBuild, bestSkillOrder, bestSummonerSpellCombination, bestRunes, generalChampionStats);
    } 
    catch (error) {
        return new OptimalBuild();
    }finally{
        if (connection) {
            connection.close();
        }
    }
}

async function insertGamesDataToDB(){
    let connection;
    try {
        connection = await createConnection();
        await ensureGameRelatedTablesExist(connection);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const dbFilePath = path.resolve(__dirname, '../../dataFiles/localJsonData/games.json');
        const dataString = await fs.promises.readFile(dbFilePath, 'utf8');
        const jsonData = JSON.parse(dataString);
        const gamesData = await createGameDataObject(jsonData);
        console.log("Inserting data to database");
        await insertGamesData(gamesData, connection);
        console.log("Finished inserting data to database");
        connection.close();

    } catch (error) {
        console.log("Error occured: " + error);
    }
    finally{
        if (connection) {
            connection.close();
        }
    }
}
// Parses the stored games in games.json to the game dataclass for easier data handling
async function createGameDataObject(jsonData) {
    let gamesData = [];
    for (const game of jsonData) {
        let gameData = new GameData(game.gameId, game.matchId);
        game.participants.forEach(participantData => {
            let participant = new Participant(participantData);
            participant.itemEvents = participantData.itemEvents || [];
            participant.skillEvents = participantData.skillEvents || [];
            participant.levelEvents = participantData.levelEvents || [];
            gameData.addParticipant(participant);
        });
        gamesData.push(gameData);
    }
    return gamesData;
}

// Following can be uncommented if user wishess to insert the games.json file to the database
// await insertGamesDataToDB()