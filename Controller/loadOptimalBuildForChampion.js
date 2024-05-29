// Main function that is used when the page loads. Gets the optimal build from the database
// and call the relevant functions to get the data on the page
async function getAndLoadOptimalBuild(championData, userChampion, opponentChampion = "undefined", teamPosition = "undefined")
{
    // Get the data from database via express server, function from fetchData.js
    const optimalBuild = await loadOptimalBuildFromDatabase(userChampion, opponentChampion, teamPosition);
    // This happens if the database has 0 games for the given request
    // Conveys transparency to the user that a build can not be provided
    if (optimalBuild.itemBuild === undefined) {
        alert("Too few games in the database with this setup to give valid reccomendation");
        // Sets the text to 0 games with 0% winrate
        updateWinrateAndTotalGames("#championWinrateAndPickRate", 0, 0);
        return;
    }
    await insertOptimalRunes(optimalBuild.runeSet.keysArray.finalData)
    await insertOptimalSummonerSpells(optimalBuild.summonerSpellCombination.keysArray.finalData)
    await displayChampionAbilities(championData.data[userChampion], optimalBuild.skillOrder.keysArray);
    await insertOptimalItemBuild(optimalBuild.itemBuild.keysArray.finalData);
    await fillAllWinrateAndTotalPicks(optimalBuild);
}


// Function that makes sure the winrate and games text is written to the page with the relevant data
async function fillAllWinrateAndTotalPicks(optimalBuild){
    updateWinrateAndTotalGames("#summonerSpellsWinrateTotalGames", optimalBuild.summonerSpellCombination.weightedWinRate, optimalBuild.summonerSpellCombination.total);
    updateWinrateAndTotalGames("#abilityWinrateTotalGames", optimalBuild.skillOrder.weightedWinRate, optimalBuild.skillOrder.total);
    updateWinrateAndTotalGames("#itemWinrateTotalGames", optimalBuild.itemBuild.weightedWinRate, optimalBuild.itemBuild.total);
    updateWinrateAndTotalGames("#runeWinrateTotalGames", optimalBuild.runeSet.weightedWinRate, optimalBuild.runeSet.total);
    updateWinrateAndTotalGames("#runeWinrateTotalGames", optimalBuild.runeSet.weightedWinRate, optimalBuild.runeSet.total);
    updateWinrateAndTotalGames("#championWinrateAndPickRate", optimalBuild.generalStats.generalWinRate, optimalBuild.generalStats.total);

}

// Communicates with championItemLoader.js to input the optimal build to the page
async function insertOptimalItemBuild(build){
    // loadItemPictures from championItemLoader.js
    for (let index = 0; index < build.length; index++) {
        loadItemPictures(build[index], index + 1);
    }
}

// Communicates with championRuneLoader.js to input the optimal runes to the page
async function insertOptimalRunes(selectedRunes){
    let mainRune = "";
    let secondaryRune = "";
    const runeData = await fetchRuneData();
    // Helper function to determine whether a rune slot matches with any of the selectedRunes
    const hasMatchingRune = (slot, runes) => slot.runes.some(rune => runes.includes(rune.id));
    for (let runePath of runeData) {
        // Check if any of the runes in the runePath match the first rune
        if (hasMatchingRune(runePath.slots[0], selectedRunes)) {
            mainRune = runePath.key;
        }

        // Check if any of the runes in any slot in the runePath match any of the other provided runes
        // That are not part of the main rune path
        if (runePath.key !== mainRune && runePath.slots.some(slot => hasMatchingRune(slot, selectedRunes))) {
            secondaryRune = runePath.key;
        }     
    }
    // Loads the actual rune data to the page, function from championRuneLoader.js
    await loadRuneData(mainRune, secondaryRune, selectedRunes);
}


// Communicates with championSummonerLoader.js to input the optimal summoners to the page
async function insertOptimalSummonerSpells(spells){
    const summonerData = await fetchSummonerSpellData();
    const summonerNames = [];
    for (let summonerId of spells) {
        for (let summonerKey in summonerData.data) {
            if (summonerData.data[summonerKey].key === summonerId.toString()) {
                summonerNames.push(summonerData.data[summonerKey].id);
                break; 
            }
        }
    }
    fillSummonerSpells(summonerNames[0], summonerNames[1], summonerData);
}


