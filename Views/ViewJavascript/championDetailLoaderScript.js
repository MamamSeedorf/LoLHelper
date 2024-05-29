// Function for getting champion name and picture so it can be parsed on to the header
function displayChampionDetails(champion) {
    const championName = document.getElementById('championName'); 
    const championImage = document.getElementById('championImage'); 
    championName.textContent = champion.name;
    championImage.src = `http://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${champion.image.full}`;

    let currentChampionName = champion.name;
    
    getLaneAndChampion(currentChampionName);
}

// Helper function that runs when page is loaded
window.addEventListener('load', async () => {
    // Find which champion user selected on the page 'champions' page and store as 'championName'
    const urlParams = new URLSearchParams(window.location.search);
    const championName = urlParams.get('name');
    // If championName has been found run API function to get championData
    if (championName) {
        const championData = await loadChampionData(championName);
        // If champion data has been succesfully found, store it as new variable and run main function for correct champion
        if(championData) {
            const champion = championData.data[championName];
            displayChampionDetails(champion);
        } else {
            console.error("Champion data not found for:", championName);
        }
    }

});
