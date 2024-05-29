function displayChampionAbilities(champion, abilityOrder) {
    // Retrieve each ability from the champion object
    const qAbility = champion.spells[0];
    const wAbility = champion.spells[1];
    const eAbility = champion.spells[2];
    const rAbility = champion.spells[3];

    // Map the ability order to their respective abilities
    const abilityMap = {
        1: qAbility,
        2: wAbility,
        3: eAbility,
        4: rAbility // R is always the last ability
    };

    // Retrieve corresponding HTML elements for displaying abilities
    const abilityImages = [
        document.getElementById('qAbilityImage'),
        document.getElementById('wAbilityImage'),
        document.getElementById('eAbilityImage'),
        document.getElementById('rAbilityImage')
    ];

    const abilityNames = [
        document.getElementById('qAbilityName'),
        document.getElementById('wAbilityName'),
        document.getElementById('eAbilityName'),
        document.getElementById('rAbilityName')
    ];

    //Defing the names that should be displayed for abilities
    const displayNames = ['Q', 'W', 'E', 'R'];

    // Load and display abilities according to the given order
    abilityOrder.forEach((ability, index) => {
        const abilityImageElement = abilityImages[index];
        const abilityNameElement = abilityNames[index];
        const abilityObject = abilityMap[ability];

        if (abilityImageElement) {
            abilityImageElement.src = getImageUrl(abilityObject);
            AbilityHoverBox(abilityObject, abilityImageElement);
        }
        if (abilityNameElement) {
            abilityNameElement.innerText = displayNames[ability - 1];
        }
    });

    // Display R ability at the end
    const rAbilityImage = abilityImages[3];
    const rAbilityName = abilityNames[3];
    if (rAbilityImage) {
        rAbilityImage.src = getImageUrl(rAbility);
        AbilityHoverBox(rAbility, rAbilityImage);
    }
    if (rAbilityName) {
        rAbilityName.innerText = 'R';
    }
}

// Helper function to get image URL for each ability
function getImageUrl(ability) {
    if (ability && ability.image && ability.image.full) {
        return `http://ddragon.leagueoflegends.com/cdn/14.3.1/img/spell/${ability.image.full}`;
    }
}

function AbilityHoverBox(abilityData, abilityImageElement) {
    const AbilityHoverBox = document.createElement('div');
    AbilityHoverBox.className = 'abilityHoverBox';
    AbilityHoverBox.innerHTML = `<strong>${abilityData.name}</strong><br>${abilityData.description}`;
    AbilityHoverBox.style.display = 'none';
    abilityImageElement.parentElement.appendChild(AbilityHoverBox);

    abilityImageElement.addEventListener('mouseover', () => AbilityHoverBox.style.display = 'block');
    abilityImageElement.addEventListener('mouseleave', () => AbilityHoverBox.style.display = 'none');
}