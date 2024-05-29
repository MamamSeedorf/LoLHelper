// Creates a hoverbox for a singular rune
function runeHoverBox(runeData) {
    const runeHoverBox = document.createElement('div');
    runeHoverBox.className = 'runeHoverBox';
    runeHoverBox.innerHTML = `<strong>${runeData.name}</strong><br>${runeData.longDesc}`;
    runeHoverBox.style.display = 'none';
    return runeHoverBox;
}

// Prints all the runes on the given rune page and highlights the selected runes
function printRunesForPath(pathData, containerId, selectedRunes) {
    // Find the containers from HTML to correctly append rune 
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        window.alert(`Container not found: ${containerId}`)
        return;
    }

    // Populate keystone runes with information from object 
    const keystoneRow = container.querySelector('#keystoneRow');
    // slots,0,runes is the specific path in which the object contains keystones
    // Loop that finds the specific spot in the HTML document in which to fill each of the containers with the correct keystone  
    pathData.slots[0].runes.forEach((keystone, index) => {
        if (index < 4) { 
            const keystoneContainer = keystoneRow.querySelector(`#keystoneRune${index}`);
            keystoneContainer.innerHTML = ''; 
            const img = document.createElement('img');
            img.src = `https://ddragon.leagueoflegends.com/cdn/img/${keystone.icon}`;
            img.className = 'keystoneImage';
            keystoneContainer.appendChild(img);

            // Highlight the rune if it is among the selected runes
            // This shows the user which runes to pick
            if (selectedRunes.includes(keystone.id)) {
                img.id = 'highlightRune';
            }

            // Create and append hoverbox
            const hoverBox = runeHoverBox(keystone);
            keystoneContainer.appendChild(hoverBox);

            // Add hover effect to each image, making it so on hover you can see the stats and the desriptions
            img.addEventListener('mouseover', () => hoverBox.style.display = 'block');
            img.addEventListener('mouseleave', () => hoverBox.style.display = 'none');
        }
    });

    // Populate minor runes
    let minorRuneCounter = 0;
    pathData.slots.slice(1).forEach(slot => {
        slot.runes.forEach(minorRune => {
            const minorRuneContainer = container.querySelector(`#minorRune${minorRuneCounter}`);
            if (minorRuneContainer) {
                minorRuneContainer.innerHTML = '';
                const img = document.createElement('img');
                img.src = `https://ddragon.leagueoflegends.com/cdn/img/${minorRune.icon}`;
                img.className = 'minorRuneImage';
                minorRuneContainer.appendChild(img);

                // Highlight the rune if it is among the selected runes
                // This shows the user which runes to pick
                if (selectedRunes.includes(minorRune.id)) {
                    img.id = 'highlightRune';
                }

                // Create and append hoverbox
                const hoverBox = runeHoverBox(minorRune);
                minorRuneContainer.appendChild(hoverBox);

                // Add hover effect to each image, making it so on hover you can see the stats and the desriptions
                img.addEventListener('mouseover', () => hoverBox.style.display = 'block');
                img.addEventListener('mouseleave', () => hoverBox.style.display = 'none');
                
                minorRuneCounter++;
            }
        });
    });
}

// Prints the minor rune path and highlights the selected runes
function printMinorRunesForPath(pathData, containerId, selectedRunes) {
    // Find the containers from HTML to correctly append rune 
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }

    // Clear previous content
    container.querySelectorAll('.minorRuneContainer').forEach(container => container.innerHTML = '');

    let minorRuneCounter = 0; 

    // Iterate over the slots starting from the 1st index since 0 is keystones
    pathData.slots.slice(1).forEach(slot => {
        slot.runes.forEach(minorRune => {
            // Ensure we target the correct minor rune container in the secondary path starting from 9
            const minorRuneContainerId = `minorRune${minorRuneCounter + 9}`;
            const minorRuneContainer = container.querySelector(`#${minorRuneContainerId}`);

            if (minorRuneContainer) {
                minorRuneContainer.innerHTML = '';
                const img = document.createElement('img');
                img.src = `https://ddragon.leagueoflegends.com/cdn/img/${minorRune.icon}`;
                img.className = 'minorRuneImage';
                minorRuneContainer.appendChild(img);

                // Highlight the rune if it is among the selected runes
                // This shows the user which runes to pick
                if (selectedRunes.includes(minorRune.id)) {
                    img.id = 'highlightRune';
                }

                // Create and append hoverbox
                const hoverBox = runeHoverBox(minorRune);
                minorRuneContainer.appendChild(hoverBox);

                // Add hover effect to each image, making it so on hover you can see the stats and the descriptions
                img.addEventListener('mouseover', () => hoverBox.style.display = 'block');
                img.addEventListener('mouseleave', () => hoverBox.style.display = 'none');
            }
            minorRuneCounter++;
        });
    });
}
