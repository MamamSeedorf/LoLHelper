// Sets the actual images of the summonerspells on the page
function setSpellImage(slotId, spellName, summonerData) {
    const baseUrl = "http://ddragon.leagueoflegends.com/cdn/14.6.1/img/spell/";
    const spellData = summonerData.data[spellName];
    if (spellData) {
        const imageUrl = baseUrl + spellData.image.full;
        const spellSlot = document.querySelector(`#${slotId}`);
        const imageElement = spellSlot.querySelector('img');
        imageElement.src = imageUrl;

        // Create and append hoverbox
        const hoverBox = summonerHoverBox(spellData);
        spellSlot.appendChild(hoverBox);

        // Add hover effect to each image, making it so on hover you can see the stats and the summoner descriptions
        imageElement.addEventListener('mouseover', () => hoverBox.style.display = 'block'); 
        imageElement.addEventListener('mouseleave', () => hoverBox.style.display = 'none');
    }
}

// Adds a hover box with description for a given summoner spell
function summonerHoverBox(summonerData) {
    const summonerHoverBox = document.createElement('div');
    summonerHoverBox.className = 'summonerHoverBox';
    summonerHoverBox.innerHTML = `<strong>${summonerData.name}</strong><br>${summonerData.description}`;
    summonerHoverBox.style.display = 'none';
    return summonerHoverBox;
}

// Used by loadOptimalBuildForChampion to send over the 2 optimal summoner spells that
// Should be printed on the page
async function fillSummonerSpells(sumSpell1, sumSpell2,summonerData) {
    
    // Update each summoner spell slot with the provided spell names
    setSpellImage('sumSlot1', sumSpell1, summonerData);
    setSpellImage('sumSlot2', sumSpell2, summonerData);
}
