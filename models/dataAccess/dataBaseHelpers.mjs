import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { startingItems, finishedItems, complexRunes } from '../itemRuneIds.mjs';
import { GameData, Participant } from '../gameData.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
// The function that creates the connection to the local sql db, to allow querys to be executed on the server
// Minimum amount of games for the data analysis to take
// A build into consideration. This is to prevent extreme outliars from influencing the data analysis
const minimumGames = 5;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, '../../dataFiles/SQLiteDB/lol_helper.db');
// The function that creates the connection to the local sql db, to allow querys to be executed on the server
export async function createConnection() {
    const db = await open({
        filename: dbFilePath,
        driver: sqlite3.Database
    });
    return db;
}

// Table that makes sure user information exists and can be accessed from sql database
export async function ensureUserTableExists() {
    const db = await createConnection();
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS User (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Username TEXT NOT NULL,
        Password TEXT NOT NULL,
        RiotId TEXT NOT NULL
        )
    `;

    await db.exec(createTableQuery);
    await db.close();
}

// Function that checks whether or not entered username is available 
export async function checkUsernameAvailability(db, username) {
    try {
        const query = "SELECT COUNT(*) AS count FROM User WHERE username = ?";
        const result = await db.get(query, [username]);
        return result.count === 0;

    } catch (error) {
        console.error("Error checking username availability:", error);
    }
}

// Creates account and pushes to sql database - helper function to CreateUser
export async function createAccount(db, username, password, riotId) {
    try {
        const insertToSql = `INSERT INTO User (username, password, riotId) VALUES (?, ?, ?)`;
        await db.run(insertToSql, [username, password, riotId]);
    } catch (error) {
        console.error("User creation failed:", error);
    }
}

// Ensures that all the tables which hold game related info exists and are ready to be used
// The function is only used in the initialisation of the database connection
export async function ensureGameRelatedTablesExist(db) {
    try {
        await db.exec(`
        CREATE TABLE IF NOT EXISTS Game (
            gameId INTEGER PRIMARY KEY AUTOINCREMENT,
            matchId TEXT
        );
        CREATE TABLE IF NOT EXISTS FinishedItems(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemId INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS StartingItems(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemId INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS ComplexRunes(
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            complexPerkId INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS Participant (
            participantId INTEGER PRIMARY KEY AUTOINCREMENT,
            gameId INTEGER NOT NULL,
            teamId INTEGER NOT NULL,
            summonerId TEXT NOT NULL,
            puuid TEXT NOT NULL,
            summonerName TEXT NOT NULL,
            championId INTEGER NOT NULL,
            championName TEXT NOT NULL,
            kills INTEGER NOT NULL,
            deaths INTEGER NOT NULL,
            assists INTEGER NOT NULL,
            riotIdGameName TEXT,
            lane TEXT NOT NULL,
            role TEXT NOT NULL,
            teamPosition TEXT NOT NULL,
            champLevel INTEGER NOT NULL,
            gameEndedInSurrender BOOLEAN NOT NULL,
            gameEndedInEarlySurrender BOOLEAN NOT NULL,
            damageDealtToBuildings INTEGER NOT NULL,
            damageDealtToObjectives INTEGER NOT NULL,
            damageDealtToTurrets INTEGER NOT NULL,
            turretKills INTEGER NOT NULL,
            detectorWardsPlaced INTEGER NOT NULL,
            enemyMissingPings INTEGER NOT NULL,
            goldEarned INTEGER NOT NULL,
            goldSpent INTEGER NOT NULL,
            individualPosition TEXT,
            longestTimeSpentLiving INTEGER NOT NULL,
            doubleKills INTEGER NOT NULL,
            tripleKills INTEGER NOT NULL,
            quadraKills INTEGER NOT NULL,
            pentaKills INTEGER NOT NULL,
            riotIdTagline TEXT NOT NULL,
            summoner1Id INTEGER,
            summoner2Id INTEGER,
            summoner1Casts INTEGER NOT NULL,
            summoner2Casts INTEGER NOT NULL,
            totalDamageDealtToChampions INTEGER NOT NULL,
            totalDamageTaken INTEGER NOT NULL,
            totalHeal INTEGER NOT NULL,
            totalMinionsKilled INTEGER NOT NULL,
            totalTimeCcDealt INTEGER NOT NULL,
            visionScore INTEGER NOT NULL,
            wardsKilled INTEGER NOT NULL,
            wardsPlaced INTEGER NOT NULL,
            win BOOLEAN NOT NULL,
            FOREIGN KEY (gameId) REFERENCES Game(gameId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS Item (
            participantId INTEGER NOT NULL,
            itemId INTEGER NOT NULL,
            slot INTEGER NOT NULL,
            FOREIGN KEY (participantId) REFERENCES Participant(participantId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS Perk (
            participantId INTEGER NOT NULL,
            perkId INTEGER NOT NULL,
            FOREIGN KEY (participantId) REFERENCES Participant(participantId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS ItemEvent (
            participantId INTEGER NOT NULL,
            itemId INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            eventType TEXT,
            FOREIGN KEY (participantId) REFERENCES Participant(participantId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS SkillEvent (
            participantId INTEGER NOT NULL,
            skillSlot INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            eventType TEXT,
            FOREIGN KEY (participantId) REFERENCES Participant(participantId) ON DELETE CASCADE
        );
    `);
        console.log('All necessary tables are ensured to exist or were created successfully.');
    } catch (error) {
        console.error('Failed to ensure tables exist:', error);
    } 
}

// Gets the totalGames and winrate for a given champion
export async function getGeneralChampionStats(db, championName, opponentChampion, teamPosition) {
    try {
        let totalGamesQuery = `
            SELECT COUNT(*) as totalGames
            FROM Participant
            WHERE championName = ?
        `;
        let totalWinsQuery = `
            SELECT COUNT(*) as totalWins
            FROM Participant
            WHERE championName = ? AND win = 1
        `;

        const totalGamesParams = [championName];
        const totalWinsParams = [championName];

        if (teamPosition !== "undefined") {
            totalGamesQuery += ' AND teamPosition = ?';
            totalWinsQuery += ' AND teamPosition = ?';
            totalGamesParams.push(teamPosition);
            totalWinsParams.push(teamPosition);
        }

        if (opponentChampion !== "undefined") {
            totalGamesQuery += `
                AND EXISTS (
                    SELECT 1 
                    FROM Participant AS opponent
                    WHERE opponent.gameId = Participant.gameId
                    AND opponent.teamId != Participant.teamId
                    AND opponent.teamPosition = Participant.teamPosition
                    AND opponent.championName = ?
                )
            `;
            totalWinsQuery += `
                AND EXISTS (
                    SELECT 1 
                    FROM Participant AS opponent
                    WHERE opponent.gameId = Participant.gameId
                    AND opponent.teamId != Participant.teamId
                    AND opponent.teamPosition = Participant.teamPosition
                    AND opponent.championName = ?
                )
            `;
            totalGamesParams.push(opponentChampion);
            totalWinsParams.push(opponentChampion);
        }

        // Get total games for the champion
        const totalGamesResult = await db.get(totalGamesQuery, totalGamesParams);
        const totalGames = totalGamesResult.totalGames;

        // Get total wins for the champion
        const totalWinsResult = await db.get(totalWinsQuery, totalWinsParams);
        const totalWins = totalWinsResult.totalWins;

        // Calculate win rate. If there are 0 games -> return 0 as winrate
        const winRate = totalGames > 0 ? (totalWins / totalGames) : 0;

        return {
            total: totalGames,
            generalWinRate: winRate
        };
    } catch (error) {
        console.error('Failed to calculate win rate:', error);
        throw error;
    }
}

// Function to adjust the win rate based on the number of games played. This is becaues
// a couple of outliar games isn't statistically significant enough, to be reccomended
// Example 1: (winrate: 0.63, totalGames: 11, weightedWinrate: 0.57)
// Example 2: (winrate: 0.66, totalGames: 3, weightedWinrate: 0.54)
// Example 3: (winrate: 1, totalGames: 1, weightedWinrate: 0.55)
// Despit example 1 having lowest winrate, it has the highest amount of games with a high winrate
// and will thus be prioritised

const smoothingParameter = 10; // Adjusting factor. Higher values give more weight to the global win rate
export function adjustedWinRate(wins, total, globalWinRate) {
    if (total === 0) return globalWinRate;
    const observedWinRate = wins / total;
    return ((total * observedWinRate) + (smoothingParameter * globalWinRate)) / (total + smoothingParameter);
}

// If any data points have more that 4 games all games with less will be excluded. Sort from best weighted winrate to worst
async function sortAndAdjustForMinimalGames(specificBuild){

    const hasMinimumGames = specificBuild.some(stats => stats.total >= minimumGames);

    const filteredBuildWinRates = hasMinimumGames 
        ? specificBuild.filter(stats => stats.total >= minimumGames)
        : specificBuild;

    const sortedBuilds = filteredBuildWinRates.sort((a, b) => b.weightedWinRate - a.weightedWinRate);
    return sortedBuilds[0];
}

// Gathers the stats for the specific part of the build either runes, summoner spells, skill order or items
// Then calculates the weighted winrate and return the object with stats like the keyArray, weighted winrate and total
export function createWinrateObject(buildStats, isSummonerSpell = false){
    // Calculats the totalWin and totalGames, used for calculating the bayesian inference
    const totalWins = Object.values(buildStats).reduce((sum, stats) => sum + stats.wins, 0);
    const totalGames = Object.values(buildStats).reduce((sum, stats) => sum + stats.total, 0);
    const globalWinRate = totalWins / totalGames;

    // Calculate the win rate and adjusted win rate for each unique rune set
    const buildWinRates = Object.entries(buildStats).map(([key, stats]) => {
        const keysArray = JSON.parse(key);
        
        // Calculate the adjusted win rate
        const weightedWinRate = adjustedWinRate(stats.wins, stats.total, globalWinRate);
        
        return {
            keysArray,
            winRate: stats.wins / stats.total,
            weightedWinRate,
            total: stats.total // The total number of games played with this rune set
        };
    });
    return buildWinRates;
}


function calculateOptimalSkillOrderWinRate(participantData, dataDisplayedOnPage) {
    let stats = {};
    for (const [, data] of Object.entries(participantData)) {
        if (data.data.length >= dataDisplayedOnPage) {
            const skillLevels = { 1: 0, 2: 0, 3: 0 };
            const maxOrder = [];
            for (const skill of data.data) {
                skillLevels[skill]++;
                if (skillLevels[skill] === 5) {
                    maxOrder.push(skill);
                }
            }
            // Include skills that did not reach level 5, sorted by highest to lowest level
            const remainingSkills = [1, 2, 3].filter(skill => !maxOrder.includes(skill));
            remainingSkills.sort((a, b) => skillLevels[b] - skillLevels[a]);
            maxOrder.push(...remainingSkills);
            const buildKey = JSON.stringify(maxOrder);
            if (!stats[buildKey]) {
                stats[buildKey] = {
                    wins: 0,
                    total: 0
                };
            }
            stats[buildKey].wins += data.win;
            stats[buildKey].total += 1;
        }
    }
    return stats;
}


// Helper function to calculate win rates, gathers the wins and total games
// for a given build path which is identified as jsonString
function calculateWinRates(participantData, amountOfDataDisplayedOnPage) {
    let stats = {};
    for (const [participantId, data] of Object.entries(participantData)) {
        if (data.data.length >= amountOfDataDisplayedOnPage) {
            const buildKey = JSON.stringify({
                finalData: data.data.slice(0, amountOfDataDisplayedOnPage)
            });

            if (!stats[buildKey]) {
                stats[buildKey] = {
                    wins: 0,
                    total: 0
                };
            }
            stats[buildKey].wins += data.win;
            stats[buildKey].total += 1;
        }
        
    }
    return createWinrateObject(stats);
}

// Helper function to process rows into structured participant data
function processParticipantData(rows, keys) {
    let participantData = {};
    for (const row of rows) {
        // Creates the participant object if it doesn't already exist
        if (!participantData[row.participantId]) {
            participantData[row.participantId] = {
                data: [],
                win: row[keys.winKey]
            };
        }
        // This is purely for retrieving the startingItemId. It adds the startingItemId, if the data is an empty set
        if (keys.startingKey && row[keys.startingKey] && participantData[row.participantId].data.length === 0) {
            participantData[row.participantId].data.push(row[keys.startingKey]);
        }
        if (row[keys.dataKey]&&participantData[row.participantId].data[participantData[row.participantId].data.length-1] != row[keys.dataKey]) {
            participantData[row.participantId].data.push(row[keys.dataKey]);
        }
    }
    return participantData;
}

// Same function as processParticipantData adapted to skillOrders
function processSkillOrderParticipantData(rows, keys) {
    let participantData = {};
    for (const row of rows) {
        if (!participantData[row.participantId]) {
            participantData[row.participantId] = {
                data: [],
                win: row[keys.winKey]
            };
        }
        if (row[keys.dataKey]) {
            participantData[row.participantId].data.push(row[keys.dataKey]);
        }
    }
    return participantData;
}

// Deletes all paths that contain a rune that is too complex
export async function removeComplexPerks(participantData, complexPerks){
    // Deletes all paths that contain a rune that is too complex
    for (const [participantId, dataValues] of Object.entries(participantData)) {
        if (dataValues.data.some(rune => complexPerks.includes(rune))) {
            delete participantData[participantId];
        }
    }
}

// Calculates the optimal runes for a given champion
export async function calculateOptimalRunesFromDB(db, userChampion) {
    // Fetches the complex perks to avoid analysing rune sets that
    // Contain complex perks / runes
    const complexPerksQuery = `
        SELECT complexPerkId
        FROM ComplexRunes
    `;
    const complexPerksRows = await db.all(complexPerksQuery);
    // Converts the rows of complex perks data to an array with the perkIds
    const complexPerks = complexPerksRows.map(row => row.complexPerkId);
    // Selects all the participants that played a given champion. By using a LEFT JOIN,
    // it creates a row for each perkId, resulting in multiple rows for each participantId,
    // each coupled with a perkId.
    const query = `
        SELECT 
            participant.participantId,
            perk.perkId AS runeId,
            participant.win
        FROM Participant AS participant
        LEFT JOIN Perk AS perk ON participant.participantId = perk.participantId
        WHERE participant.championName = ?
        ORDER BY participant.participantId, perk.perkId
    `;
    const rows = await db.all(query, [userChampion]);
    const keys = { dataKey: 'runeId', winKey: 'win'};
    let participantData = processParticipantData(rows, keys);
    await removeComplexPerks(participantData, complexPerks);
    const runeWinRates = calculateWinRates(participantData, 6);
    return sortAndAdjustForMinimalGames(runeWinRates);
}

// Calculate optimal skill leveling order for a given champion
export async function calculateOptimalSkillOrderFromDB(db, userChampion) {
    // Selects all the participants that played a given champion. By using a LEFT JOIN,
    // it creates a row for each skill event, resulting in multiple rows for each participantId,
    // each coupled with a skillSlot and timestamp
    const query = `
        SELECT 
            participant.participantId,
            skillEvent.skillSlot,
            skillEvent.timestamp,
            participant.win
        FROM Participant AS participant
        LEFT JOIN SkillEvent AS skillEvent ON participant.participantId = skillEvent.participantId
        WHERE participant.championName = ?
        ORDER BY participant.participantId, skillEvent.timestamp
    `;

    const rows = await db.all(query, [userChampion]);
    const keys = { dataKey: 'skillSlot', winKey: 'win'};

    const participantData = processParticipantData(rows, keys);
    let dataDisplayedOnPage = 3;
    let optimalSkillOrderWinRate = calculateOptimalSkillOrderWinRate(participantData, dataDisplayedOnPage);
    const skillOrderWinRates = createWinrateObject(optimalSkillOrderWinRate)

    return sortAndAdjustForMinimalGames(skillOrderWinRates);
}

// Calculates the optimal build path for a given player. 1 starting item and 4 finished items
export async function calculateOptimalItemsFromdDB(db, userChampion, opponentChampion, teamPosition) {
    // Selects all the participants that played a given champion. By using LEFT JOINs, 
    // it creates rows for each participantId coupled with their starting items and finished items. 
    // The subqueries filter item events to include only those items that are starting items or finished items.
    // This results in multiple rows for each participantId, each coupled with startingItemId and finishedItemId.
    let query = `
        SELECT 
            participant.participantId,
            startingItems.startingItemId,
            finishedItems.finishedItemId,
            participant.win
        FROM Participant AS participant
        LEFT JOIN (
            SELECT 
                itemEvent.participantId, 
                itemEvent.itemId AS startingItemId 
            FROM ItemEvent AS itemEvent 
            WHERE itemEvent.itemId IN (SELECT itemId FROM StartingItems)
        ) AS startingItems ON participant.participantId = startingItems.participantId
        LEFT JOIN (
            SELECT 
                itemEvent.participantId, 
                itemEvent.itemId AS finishedItemId,
                itemEvent.timestamp
            FROM ItemEvent AS itemEvent 
            WHERE itemEvent.itemId IN (SELECT itemId FROM FinishedItems)
        ) AS finishedItems ON participant.participantId = finishedItems.participantId
        WHERE participant.championName = ?
    `;
    const queryParams = [userChampion];
    if (teamPosition !== "undefined") {
        query += ' AND participant.teamPosition = ?';
        queryParams.push(teamPosition);
    }
    // If opponentChampion is specified, add the self-join to filter based on the opponent
    if (opponentChampion !== "undefined") {
        query += `
            AND EXISTS (
                SELECT 1 
                FROM Participant AS opponent
                WHERE opponent.gameId = participant.gameId
                AND opponent.teamId != participant.teamId
                AND opponent.teamPosition = participant.teamPosition
                AND opponent.championName = ?
            )
        `;
        queryParams.push(opponentChampion);
    }
    query += ' ORDER BY participant.participantId, finishedItems.timestamp';
    const rows = await db.all(query, queryParams);

    const keys = { startingKey: 'startingItemId', dataKey: 'finishedItemId', winKey: 'win', isSkillOrder: false };
    const participantData = processParticipantData(rows, keys);
    const buildWinRates = calculateWinRates(participantData, 5);
    return sortAndAdjustForMinimalGames(buildWinRates);
}



// Calculates the optimal summoner spell combination for a given champion
export async function calculateOptimalSummonerSpellsFromDB(db, userChampion) {
    // Simply selects all participants with the given champion, along their respective summoner spell
    // and whether they won
    const query = `
        SELECT 
            participant.participantId,
            participant.summoner1Id,
            participant.summoner2Id,
            participant.win
        FROM Participant as participant
        WHERE participant.championName = ?
    `;
    const rows = await db.all(query, [userChampion]);
    let summonerSpellStats = {};
    for (const row of rows) {
        // Important to sort because spell [3,4] is the same as [4,3]
        const sortedSummonerSpells = [row.summoner1Id, row.summoner2Id].sort((a, b) => a - b);
        if (!summonerSpellStats[row.participantId]) {
            summonerSpellStats[row.participantId] = {
                data: sortedSummonerSpells,
                win: row.win
            };
        }
    }
    let numberOfSummonerSpells = 2;
    const summonerWinRates = calculateWinRates(summonerSpellStats, numberOfSummonerSpells);
    return sortAndAdjustForMinimalGames(summonerWinRates);
}



// Iteratively inserts all the stored game data into their respective tables
export async function insertGamesData(gamesData, db) {
    try {
        await db.exec('BEGIN TRANSACTION');
        // Converts the defined sets of items and runes to arrays to make
        // them more manageable, and then inserts them into SQL 
        const startingItemsArray = Array.from(startingItems);
        const finishedItemsArray = Array.from(finishedItems);
        const complexRuneArray = Array.from(complexRunes);

        const startingItemInsertPromises = startingItemsArray.map(item => {
            const itemEventSql = `INSERT INTO StartingItems (itemId) VALUES (?)`;
            return db.run(itemEventSql, [item]);
        });
        await Promise.all(startingItemInsertPromises);

        const finishedItemInsertPromises = finishedItemsArray.map(item => {
            const itemEventSql = `INSERT INTO FinishedItems (itemId) VALUES (?)`;
            return db.run(itemEventSql, [item]);
        });
        await Promise.all(finishedItemInsertPromises);

        const complexRunesInsertPromises = complexRuneArray.map(rune => {
            const complexRuneSql = `INSERT INTO ComplexRunes (complexPerkId) VALUES (?)`;
            return db.run(complexRuneSql, [rune]);
        });
        await Promise.all(complexRunesInsertPromises);

        for (const game of gamesData) {
            // Insert game into Game table
            const gameSql = `INSERT INTO Game (matchId) VALUES (?)`;
            const gameResult = await db.run(gameSql, [game.matchId]);
            const gameId = gameResult.lastID;

            for (const participant of game.participants) {
                // Insert participant into Participant table
                const participantSql = `
                INSERT INTO Participant (
                    gameId,
                    teamId,
                    summonerId,
                    puuid,
                    summonerName,
                    championId,
                    championName,
                    kills,
                    deaths,
                    assists,
                    riotIdGameName,
                    lane,
                    role,
                    teamPosition,
                    champLevel,
                    gameEndedInSurrender,
                    gameEndedInEarlySurrender,
                    damageDealtToBuildings,
                    damageDealtToObjectives,
                    damageDealtToTurrets,
                    turretKills,
                    detectorWardsPlaced,
                    enemyMissingPings,
                    goldEarned,
                    goldSpent,
                    individualPosition,
                    longestTimeSpentLiving,
                    doubleKills,
                    tripleKills,
                    quadraKills,
                    pentaKills,
                    riotIdTagline,
                    summoner1Id,
                    summoner2Id,
                    summoner1Casts,
                    summoner2Casts,
                    totalDamageDealtToChampions,
                    totalDamageTaken,
                    totalHeal,
                    totalMinionsKilled,
                    totalTimeCcDealt,
                    visionScore,
                    wardsKilled,
                    wardsPlaced,
                    win
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;
                const participantParams = [
                    gameId,
                    participant.teamId,
                    participant.summonerId,
                    participant.puuid,
                    participant.summonerName,
                    participant.championId,
                    participant.championName,
                    participant.kills,
                    participant.deaths,
                    participant.assists,
                    participant.riotIdGameName,
                    participant.lane,
                    participant.role,
                    participant.teamPosition,
                    participant.champLevel,
                    participant.gameEndedInSurrender,
                    participant.gameEndedInEarlySurrender,
                    participant.damageDealtToBuildings,
                    participant.damageDealtToObjectives,
                    participant.damageDealtToTurrets,
                    participant.turretKills,
                    participant.detectorWardsPlaced,
                    participant.enemyMissingPings,
                    participant.goldEarned,
                    participant.goldSpent,
                    participant.individualPosition,
                    participant.longestTimeSpentLiving,
                    participant.doubleKills,
                    participant.tripleKills,
                    participant.quadraKills,
                    participant.pentaKills,
                    participant.riotIdTagline,
                    participant.summoner1Id,
                    participant.summoner2Id,
                    participant.summoner1Casts,
                    participant.summoner2Casts,
                    participant.totalDamageDealtToChampions,
                    participant.totalDamageTaken,
                    participant.totalHeal,
                    participant.totalMinionsKilled,
                    participant.totalTimeCCDealt,
                    participant.visionScore,
                    participant.wardsKilled,
                    participant.wardsPlaced,
                    participant.win
                ];
                const participantResult = await db.run(participantSql, participantParams);
                const participantId = participantResult.lastID;
                // Insert items for the participant

                const itemSql = `INSERT INTO Item (participantId, itemId, slot) VALUES (?, ?, ?)`;
                await db.run(itemSql, [participantId, participant.item0, 0]);
                await db.run(itemSql, [participantId, participant.item1, 1]);
                await db.run(itemSql, [participantId, participant.item2, 2]);
                await db.run(itemSql, [participantId, participant.item3, 3]);
                await db.run(itemSql, [participantId, participant.item4, 4]);
                await db.run(itemSql, [participantId, participant.item5, 5]);
                await db.run(itemSql, [participantId, participant.item6, 6]);


                // Insert perks for the participant
                const perkSql = `INSERT INTO Perk (participantId, perkId) VALUES (?, ?)`;
                participant.perks.styles.forEach(style=> {
                    style.selections.forEach(selection => {
                        db.run(perkSql, [participantId, selection.perk]);
    
                    });
                });

                // Insert item events into ItemEvent table
                for (const itemEvent of participant.itemEvents) {
                    const itemEventSql = `INSERT INTO ItemEvent (participantId, itemId, timestamp, eventType) VALUES (?, ?, ?, ?)`;
                    await db.run(itemEventSql, [participantId, itemEvent.itemId, itemEvent.timestamp, itemEvent.type]);
                }

                // Insert skill events into SkillEvent table
                for (const skillEvent of participant.skillEvents) {
                    const skillEventSql = `INSERT INTO SkillEvent (participantId, skillSlot, timestamp, eventType) VALUES (?, ?, ?, ?)`;
                    await db.run(skillEventSql, [participantId, skillEvent.skillSlot, skillEvent.timestamp, skillEvent.type]);
                }
            }
        }

        await db.exec('COMMIT');
        console.log('Data inserted successfully.');
    } catch (error) {
        console.error('Transaction failed: ', error);
        await db.exec('ROLLBACK');
        throw error;
    }
}


// Function that converts the perkIds to correct format for JSON
function createStructuredPerks(perks) {
    const groupSizes = [4, 2];
    
    // Creating the structured JSON
    let styles = [];
    let index = 0;
  
    for (let size of groupSizes) {
      let selections = [];
      for (let i = 0; i < size; i++) {
        selections.push({ perk: perks[index++] });
      }
      styles.push({ selections });
    }
  
    return { styles }; // Encapsulating the result in an object with a 'styles' key
  }

// Fetches data from all the stored games in database and parses them into the defined dataclasses
export async function fetchGameData() {
    const db = await createConnection();
    try {
        const gameIds = await db.all('SELECT gameId FROM Participant WHERE riotIdGameName = \'ths22\'');
        const games = await db.all('SELECT * FROM Game WHERE gameId IN ' +'('+ gameIds.map(x => x.gameId).join(', ')+')');
        const participants = await db.all('SELECT * FROM Participant WHERE gameId IN' +'('+ gameIds.map(x => x.gameId).join(', ')+')');
        const items = await db.all('SELECT * FROM Item');
        const perks = await db.all('SELECT * FROM Perk');
        const itemEvents = await db.all('SELECT * FROM ItemEvent');
        const skillEvents = await db.all('SELECT * FROM SkillEvent');

        let gameDataArray = [];

        // Initialize GameData objects
        for (const game of games) {
            let gameData = new GameData(game.gameId, game.matchId);
            gameDataArray.push(gameData);
        }

        // Create participants and add them to their respective games
        for (const participant of participants) {
            // Filter and map items for the participant
            let participantItems = items.filter(item => item.participantId === participant.participantId);

            // Filter and map perks for the participant
            let perkIds = perks.filter(perk => perk.participantId === participant.participantId).map(perk => perk.perkId);
            let structuredPerks = createStructuredPerks(perkIds);

            // Create participant data
            let participantData = new Participant({
                kills: participant.kills,
                deaths: participant.deaths,
                assists: participant.assists,
                riotIdGameName: participant.riotIdGameName,
                summonerName: participant.summonerName,
                championName: participant.championName,
                lane: participant.lane,
                role: participant.role,
                teamPosition: participant.teamPosition,
                puuid: participant.puuid,
                summonerId: participant.summonerId,
                championId: participant.championId,
                participantId: participant.participantId,
                teamId: participant.teamId,
                champLevel: participant.champLevel,
                gameEndedInSurrender: participant.gameEndedInSurrender,
                gameEndedInEarlySurrender: participant.gameEndedInEarlySurrender,
                damageDealtToBuildings: participant.damageDealtToBuildings,
                damageDealtToObjectives: participant.damageDealtToObjectives,
                damageDealtToTurrets: participant.damageDealtToTurrets,
                turretKills: participant.turretKills,
                detectorWardsPlaced: participant.detectorWardsPlaced,
                enemyMissingPings: participant.enemyMissingPings,
                goldEarned: participant.goldEarned,
                goldSpent: participant.goldSpent,
                individualPosition: participant.individualPosition,
                item0: participantItems.find(item => item.slot === 0)?.itemId,
                item1: participantItems.find(item => item.slot === 1)?.itemId,
                item2: participantItems.find(item => item.slot === 2)?.itemId,
                item3: participantItems.find(item => item.slot === 3)?.itemId,
                item4: participantItems.find(item => item.slot === 4)?.itemId,
                item5: participantItems.find(item => item.slot === 5)?.itemId,
                item6: participantItems.find(item => item.slot === 6)?.itemId,
                longestTimeSpentLiving: participant.longestTimeSpentLiving,
                doubleKills: participant.doubleKills,
                tripleKills: participant.tripleKills,
                quadraKills: participant.quadraKills,
                pentaKills: participant.pentaKills,
                riotIdTagline: participant.riotIdTagline,
                summoner1Id: participant.summoner1Id,
                summoner2Id: participant.summoner2Id,
                summoner1Casts: participant.summoner1Casts,
                summoner2Casts: participant.summoner2Casts,
                totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
                totalDamageTaken: participant.totalDamageTaken,
                totalHeal: participant.totalHeal,
                totalMinionsKilled: participant.totalMinionsKilled,
                totalTimeCCDealt: participant.totalTimeCCDealt,
                visionScore: participant.visionScore,
                wardsKilled: participant.wardsKilled,
                wardsPlaced: participant.wardsPlaced,
                win: participant.win,
                perks: structuredPerks,
                itemEvents: [],
                skillEvents: []
            });

            // Find the corresponding game and add the participant
            let gameData = gameDataArray.find(game => game.game_id === participant.gameId);
            if (gameData) {
                gameData.addParticipant(participantData);
            }
        }

        // Assign item events to the corresponding participants
        for (const event of itemEvents) {
            let gameData = gameDataArray.find(game => game.participants.some(p => p.participantId === event.participantId));
            if (gameData) {
                let participant = gameData.participants.find(p => p.participantId === event.participantId);
                if (participant) {
                    participant.addItemEvent(event);
                }
            }
        }

        // Assign skill events to the corresponding participants
        for (const event of skillEvents) {
            let gameData = gameDataArray.find(game => game.participants.some(p => p.participantId === event.participantId));
            if (gameData) {
                let participant = gameData.participants.find(p => p.participantId === event.participantId);
                if (participant) {
                    participant.addSkillEvent(event);
                }
            }
        }

        return gameDataArray;
    } catch (error) {
        console.error('Failed to fetch game data:', error);
    }
}

// Function to verify whether a specific username and password combination is a valid user login
export async function verifyUserLogin(username, password) {
    let connection;
    try {
        connection = await createConnection();
        const query = `SELECT * FROM User WHERE username = ? AND password = ?`;
        const results = await connection.all(query, [username, password]);
        // Checks whether there was a match in the database, or no user with according credentials were found
        const validUserFound = results.length > 0;
        return validUserFound;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

export async function createUser(userInformation) {
    try {
        const connection = await createConnection();
        await ensureUserTableExists(connection);
        const usernameAvailable = await checkUsernameAvailability(connection, userInformation.username);
        if (!usernameAvailable) {
            return false;
        }
        await createAccount(connection, userInformation.username, userInformation.password, userInformation.riotId);
        return true;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error; 
    }
}


