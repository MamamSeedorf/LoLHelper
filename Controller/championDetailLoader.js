// Function which returns the clicked champion and its lane
function getLaneAndChampion(currentChampionName) {
    const buttonsContainer = document.getElementById('buttonsContainer');
    if (buttonsContainer) {
        buttonsContainer.addEventListener('click', function(event) {
        // Finds the nearest parent element (button) that was clicked
            const clickedButton = event.target.closest('button[data-lane]');
            if (clickedButton) {
                const lane = clickedButton.dataset.lane;
                const championAndLane = {
                    champion: currentChampionName,
                    lane: lane
                };
                return championAndLane;
            } 
        });
    } 
}


