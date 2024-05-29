// Function that fills HTML containers with item pictures and item stats.
async function loadItemPictures(itemId, containerId) {
    const targetItem = await findItemById(itemId);

    if (!targetItem) {
        console.error(`Item with id ${itemId} not found: `);
        return;
    }

        const container = document.getElementById(`item${containerId}`);
        if (!container) {
            console.error(`Container with id ${containerId} not found: `);
            return;
        }
        container.innerHTML = '';

        let hoverBox = container.getElementsByClassName('itemHoverBox')[0];
        if (!hoverBox) {
            hoverBox = document.createElement('div');
            hoverBox.className = 'itemHoverBox';
        }
        populateHoverBox(hoverBox, targetItem);
        setupImage(container, hoverBox, targetItem);
}

// Fills hoverBox with Item stats 
function populateHoverBox(hoverBox, targetItem) {
     const statsHTML = targetItem.statNames.map((statName, index) => `${statName}: ${targetItem.statValues[index]}`).join('<br>');
     hoverBox.innerHTML = `${targetItem.name}<br>${statsHTML}`;
 }
    
 // Fills containers with item images.
 function setupImage(container, hoverBox, targetItem) {
    const image = document.createElement('img');
    image.src = `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${targetItem.image}`;
    image.alt = targetItem.name;
    image.className = 'item-image';
    container.appendChild(image);
    container.appendChild(hoverBox);
    addHoverEffect(image, hoverBox);
}
    
// Adds a hover effect to each image, making it so on hover you can see the stats and item name (hoverBox).
function addHoverEffect(image, hoverBox) {
    // Use event delegation to handle the mouseover and mouseleave
    image.addEventListener('mouseover', () => hoverBox.style.display = 'block');
    image.addEventListener('mouseleave', () => hoverBox.style.display = 'none');
}
