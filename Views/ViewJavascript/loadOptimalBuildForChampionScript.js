// Function that alters the championBuilds.html page to update the correct winrate and games statistics
function updateWinrateAndTotalGames(querySelectorParameter, winrate, totalGames){
    // Convert winrate from decimal to percentage and round to 0 decimals
    let winratePercentage = Math.round(winrate * 100);
        
    // Select the winrate and total games element
    const winrateElement = document.querySelector(querySelectorParameter);
    
    // Set the text content, if statement because general winrate isn't weighted
    if (querySelectorParameter === "#championWinrateAndPickRate") {
        winrateElement.textContent = `${winratePercentage}% winrate over ${totalGames} games`;
    }
    else{
        winrateElement.textContent = `${winratePercentage}% weighted winrate over ${totalGames} games`;
    }

    // Change text color based on winrate value
    if (winratePercentage > 50) {
        winrateElement.style.color = 'green';
    } else {
        winrateElement.style.color = 'red';
    }

}
// Global because they are used in across several functions, when updating minor details
// like updateOptimalBuildByMatchup() and lane updating
let championName;
let championData;
let teamPosition = "undefined"
let opponentChampion = "undefined";

// Updates the recommended build paths with a selected opponent champion
// This is called by championMatchupLoader.js in updateName()
function updateOptimalBuildByMatchup(matchupChampion){
    opponentChampion = matchupChampion;
    getAndLoadOptimalBuild(championData, championName, opponentChampion, teamPosition);
    return;
}


window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    championName = urlParams.get('name');
    championData = await loadChampionData(championName);

    // If championName has been found run API function to get championData
    if (championName && championData) {
        getAndLoadOptimalBuild(championData, championName, opponentChampion, teamPosition);
    }
    // Adds an event listener to lane buttons such that when they are clicked the optimal build chages
    const buttons = document.querySelectorAll('.roleButton');

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Check if the button already has the highlighted class
            if (button.classList.contains('laneButtonHighlight')) {
                button.classList.remove('laneButtonHighlight');
            } else {
                // Remove the highlighted class from all buttons
                buttons.forEach(btn => {
                    btn.classList.remove('laneButtonHighlight');
                });
                // Add the highlighted class to the clicked button
                button.classList.add('laneButtonHighlight');
            }
            teamPosition = event.currentTarget.getAttribute('data-lane');
            getAndLoadOptimalBuild(championData, championName, opponentChampion, teamPosition);
        });
    });
});