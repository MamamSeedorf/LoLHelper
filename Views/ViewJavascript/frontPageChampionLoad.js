// Function to create and display champion elements
async function displaySuggestedChampions(...championNames) {
    // roleCount used as a counter determining what champion class icon to display. Roles are determined in roleArray on line 2.
    let roleCount = 0;

    const championsContainer = document.getElementById('frontChampion_Container');
    const roleArray = ['top', 'jungle', 'mid', 'bot', 'support'];

    for (let name of championNames) {
        // Data is the name of champion.
        const data = await loadChampionData(name);
        if (data) {
            
            // Generates <img> element containing the image of champion called
            const championImage = document.createElement('img');
            championImage.src = `http://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${data.data[name].image.full}`;
            championImage.alt = name;
            championImage.classList.add("championChoice-img");
            championImage.addEventListener("click", () => {
                window.location.href = `championBuilds.html?name=${name}`;
            });

            // Generates icon image from 0-4 Values
            const roleIcon = document.createElement('img');
            roleIcon.classList.add("icon-img");
            roleIcon.src = `../Sharedlayout/images/lol-role-${roleArray[roleCount]}.png`;
            roleCount++;

            // Generates <div> class containing each champion displayed.
            const championDiv = document.createElement('div');
            championDiv.className = 'champion';

            // Generates <p> element containing namchampion name.
            const championName = document.createElement('p');
            championName.textContent = name;

            championDiv.appendChild(roleIcon);
            championDiv.appendChild(championImage);
            championDiv.appendChild(championName);

            championsContainer.appendChild(championDiv);
        }
    }
}

// Function call for champion display.
displaySuggestedChampions("Aatrox", "Shaco", "Lux", "Xayah", "Milio");
