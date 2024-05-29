// Used to store all the usefull information in a game
export class GameData {
    constructor(gameId, matchId) {
        this.game_id = gameId;
        this.matchId = matchId;
        this.participants = [];
    }

    addParticipant(participant) {
        this.participants.push(participant);
    }
}

// Participant class used in gameExtraction.mjs and elsewhere to store the 
// given data on a player in a game. Storing instances of this class is only used in GameData class. 
export class Participant {
    constructor(participantData) {
        const {
            kills,
            deaths,
            assists,
            riotIdGameName,
            summonerName,
            championName,
            lane,
            role,
            teamPosition,
            puuid,
            summonerId,
            championId,
            participantId,
            teamId,
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
            item0,
            item1,
            item2,
            item3,
            item4,
            item5,
            item6,
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
            totalTimeCCDealt,
            visionScore,
            wardsKilled,
            wardsPlaced,
            win,
            perks
        } = participantData;

        Object.assign(this, {
            kills,
            deaths,
            assists,
            riotIdGameName,
            summonerName,
            championName,
            lane,
            role,
            teamPosition,
            puuid,
            summonerId,
            championId,
            participantId,
            teamId,
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
            item0,
            item1,
            item2,
            item3,
            item4,
            item5,
            item6, 
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
            totalTimeCCDealt,
            visionScore,
            wardsKilled,
            wardsPlaced,
            win,
            perks: this.processPerks(perks),
            itemEvents: [],
            skillEvents: []
        });
    }
    

    // Converts the perks to proper format for json file
    processPerks(perks) {
        return {
            styles: perks.styles.map(style => ({
                selections: style.selections.map(selection => ({
                    perk: selection.perk,
                }))
            }))
        };
    }
    addItemEvent(event) {
        this.itemEvents.push(event);
    }

    addSkillEvent(event) {
        this.skillEvents.push(event);
    }

}