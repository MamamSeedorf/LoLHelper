// Loads all the runes for the 2 runpages in the optimal build for the given champion
// Applies highlight filter to optimal runes
async function loadRuneData(mainRune, secondaryRune, selectedRunes) {
    // Sets the title of the given rune paths
    const mainRunePathElement = document.querySelector('#mainRunePathText');
    mainRunePathElement.textContent = mainRune;
    const secondaryRunePathElement = document.querySelector('#secondaryRunePathText');
    secondaryRunePathElement.textContent = secondaryRune;

    // Call API function to get rune data
    let runePaths = await fetchRuneData();

    // Find the path for main rune from JSON object and call function to print corresponding runes
    const primaryPathData = runePaths.find(path => path.key === mainRune);
    if (primaryPathData) {
            printRunesForPath(primaryPathData, 'mainRuneContainer', selectedRunes);
    }
    // Find the path for main rune from JSON object and call function to print corresponding runes
    const secondaryPathData = runePaths.find(path => path.key === secondaryRune);
    if (secondaryPathData) {
            printMinorRunesForPath(secondaryPathData, 'secondaryRuneContainer', selectedRunes);
    }
}