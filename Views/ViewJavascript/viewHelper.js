// This function is used to load the header html file onto any html page its needed
let element = document.getElementById('nav');

// Simple function to load the header on the html pages
function loadHeader() {
    // Uses the fetch API to request the header.html file from its location
    fetch('../Sharedlayout/Structure/header.html')
        .then(response => response.text())
        .then(headerHtml => {
            // Finds an element with the ID "header-placeholder" as defined in the html-file, and sets the innerHTML = headerHtml
            document.getElementById('header-placeholder').innerHTML = headerHtml;
        })
        .catch(error => {
            console.error('Error loading the HTML file:', error);
        });

} 
