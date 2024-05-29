async function fetchSummonerSpellData() {
    try {
        const response = await fetch("https://ddragon.leagueoflegends.com/cdn/14.9.1/data/en_US/summoner.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching summoner spell data:', error);
    }
}

async function loadChampionData(championName) {
    try {
        const response = await fetch(`../dataFiles/champion/${championName}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching champion data:', error);
    }
}

async function fetchRuneData() {
    try {
        let response = await fetch('https://ddragon.leagueoflegends.com/cdn/12.10.1/data/en_US/runesReforged.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching champion data:', error);
    }
}

async function loadItemData() {
    try {   
        let response = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.4.1/data/en_US/item.json`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        let data = await response.json();

        // Define the length of the data we want to look through. That being all the items.
        let dataLength = Object.keys(data.data).length;
        
        // itemList is an array that gets filled with all of the items.
        let itemList = [];

        // Loop through every item in data, filling up an object for each item and putting it in the array of items.
        for (let i = 0; i < dataLength; i++) {
            let item = {
                Id: null,
                name: null,
                gold: null,
                image: null,
                description: "",
                statNames: [],
                statValues: [],
            };

            item.Id=Object.keys(data.data)[i];
            item.name = data.data[item.Id].name;
            item.gold = data.data[item.Id].gold.total;
            item.image = data.data[item.Id].image.full;
            item.description = data.data[item.Id].description;

            // Call getStats function to find statNames and statValues for items. Look further down.            
            const { statNames, statValues} = getStats(item.description);

            item.statNames = statNames;
            item.statValues = statValues;

            // Populate array using .push.
            itemList.push(item);
        }
        return itemList;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function that gets the stats of items
function getStats(description) {
        
    // Matches patterns in the text file. So we find the stat name and the stat value using the structure of the text from the API.
    // An example of an item description in the API would be: <mainText><stats><attention>25</attention> Move Speed</stats><br><br></mainText>
    // We would want movement speed: 25
    const pattern = /<attention>(.*?)<\/attention>(.*?)<br>/g;

    let match;
    const statNames = [];
    const statValues = [];

    // Value "match" is !== null when the pattern can be found in the text string.
    // The while loop therefor runs until "match" = null, meaning the pattern can no longer be found, and therefor no more stats are present.
    while ((match = pattern.exec(description)) !== null) {
        const statName = match[2].replace('</stats>', '').trim(); // Extract the stat name, and remove the '</stats>' characters and <br> characters using .trim.
        const statValue = match[1]; // Extract the stat value
            
        statNames.push(statName);
        statValues.push(statValue);
    }

    return { statNames, statValues };
}