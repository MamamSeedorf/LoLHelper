// Class used for transporting all the stats for an optimal champion build
// Used in dataBaseNavigator, when sending data back to express server
export class OptimalBuild {
    constructor(itemBuild, skillOrder, summonerSpellCombination, runeSet, generalStats) {
        this.itemBuild = itemBuild;
        this.skillOrder = skillOrder;
        this.summonerSpellCombination = summonerSpellCombination;
        this.runeSet = runeSet;
        this.generalStats = generalStats;
    }
}
