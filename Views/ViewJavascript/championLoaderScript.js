const championNames = [ "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios", "Ashe", "AurelionSol", "Azir", "Bard", "Belveth", "Blitzcrank", "Brand", "Braum", "Caitlyn", "Camille", "Cassiopeia", "Chogath", "Corki", "Darius", "Diana", "DrMundo", "Draven", "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger", "Illaoi", "Irelia", "Ivern", "Janna", "JarvanIV", "Jax", "Jayce", "Jhin", "Jinx", "Kaisa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Khazix", "Kindred", "Kled", "KogMaw", "KSante", "Leblanc", "LeeSin", "Leona", "Lillia", "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "MasterYi", "Milio", "MissFortune", "MonkeyKing", "Mordekaiser", "Morgana", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nocturne", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus", "RekSai", "Rell", "Renata", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Sona", "Soraka", "Swain", "Sylas", "Syndra", "TahmKench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "TwistedFate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Velkoz", "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Xayah", "Xerath", "XinZhao", "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra" ];
const championsContainer = document.getElementById('champions-container');

// Function to create and display champion elements
async function displayChampions(championNames) {
    for (let name of championNames) {
        const data = await loadChampionData(name);
        if (data) {
            const championDiv = document.createElement('div');
            championDiv.className = 'champion';
            championDiv.onclick = () => window.location.href = `championBuilds.html?name=${name}`;

            const championImage = document.createElement('img');
            championImage.src = `http://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${data.data[name].image.full}`;
            championImage.alt = name;

            const championName = document.createElement('p');
            championName.textContent = name;

            championDiv.appendChild(championImage);
            championDiv.appendChild(championName);

            championsContainer.appendChild(championDiv);
        }
    }
}

// Function to filter champions based on user input
function championSearch() {
    let delayTimeout = null;

    document.getElementById("championNameInput").addEventListener("input", function () {
        clearTimeout(delayTimeout);

        delayTimeout = setTimeout(() => {
            const userInput = document.getElementById("championNameInput").value.trim().toLowerCase();
            const filteredChampions = championNames.filter(name => name.toLowerCase().startsWith(userInput));

            championsContainer.innerHTML = '';

            if (userInput) {
                displayChampions(filteredChampions);
            } else {
                displayChampions(championNames);
            }
        }, 250); 
    });
}

displayChampions(championNames);
championSearch();