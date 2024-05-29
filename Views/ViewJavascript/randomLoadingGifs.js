// Array of GIF URLs
const gifUrls = [
    "../Sharedlayout/images/katarina.gif",
    "../Sharedlayout/images/reksai.gif",
    "../Sharedlayout/images/teemo.gif",
    "../Sharedlayout/images/yuumi-cat.gif",
];

// Function to randomly select a GIF URL
function getRandomGifUrl() {
    const randomIndex = Math.floor(Math.random() * gifUrls.length);
    return gifUrls[randomIndex];
}

// Function to display the spinner overlay with a randomly selected GIF
function showSpinnerOverlay() {
    const spinner = document.getElementById('spinner');
    const randomGifUrl = getRandomGifUrl();
    spinner.innerHTML = `<img src="${randomGifUrl}" alt="Loading...">`;
    document.getElementById('spinnerOverlay').style.display = 'block';
}

// Function to hide the spinner overlay
function hideSpinnerOverlay() {
    document.getElementById('spinnerOverlay').style.display = 'none';
}

showSpinnerOverlay();
setTimeout(hideSpinnerOverlay);