// The function appendStatPictures creates containers for the images and the hoverboxes, and appends them in the correct position using the parameter "imagePositions"
// which is given from the function renderChart
function appendStatPictures(imagePositions, averageStats) {
    const statImageContainer = document.getElementById('image-container');
    const statText = document.getElementById('statText-container');

    if (!statImageContainer) {
        console.error('Image container not found');
        return;
    }
    if (!statText) {
        console.error('Stat container not found');
        return;
    }
    statImageContainer.innerHTML = '';

    // Fills an empty array statImages with the key from "averageStats" and the values of corresponding image paths
    const statImages = {};
    for (const key of Object.keys(averageStats)) {
        statImages[key] = `../Sharedlayout/images/${key}.png`;
    }

    // ForEach loop that loops through each key in the "imagePositions" array, and finds the positioning for each picture, and appends
    imagePositions.forEach((imagePosition) => {
        const statImg = document.createElement('img');
        
        // Position array would have the labels: label: kills, label: deaths... label: totalMinionsKilled. So finds the corresponding path to image
        statImg.src = statImages[imagePosition.label]; 

        statImg.alt = imagePosition.label;
        statImg.style.width = '35px'; 
        statImg.style.height = '35px'; 
        statImg.style.position = 'absolute';

        // The transform = translate(-50%, -50%) property ensures the center of the image is at the coordinates. Not the edge
        statImg.style.transform = 'translate(-50%, -50%)';

        // Assign the coordinates to the image by adding the left and top property
        statImg.style.left = `${imagePosition.x}px`;
        statImg.style.top = `${imagePosition.y}px`;

        // Hoverbox function that states how much better/worse you are than the average player in your games
        statImg.addEventListener('mouseover', () => {
            // Math.abs get the absolute value. toFixed removes decimals
            let averageStat = Math.abs((averageStats[imagePosition.label]-1)*100).toFixed(0);
                if (averageStats[imagePosition.label]>= 1) {
                    statText.innerHTML = `You have ${averageStat}% more ${imagePosition.label} than the average player in your games`;
                }
                else {
                    statText.innerHTML = `You have ${averageStat}% less ${imagePosition.label} than the average player in your games`;
                }
            statText.style.display = 'block';
        })

        statImg.addEventListener('mouseleave', () => {
            statText.style.display = 'none';
        })

        statImageContainer.appendChild(statImg);
    });
}

// The function renderChart creates a polar chart using the data from "averageStats and creates corresponding images around the chart for each stat element in "averageStats"
function renderChart(averageStats) {
    const chartContainer = document.getElementById('myPolarChart').getContext('2d');

    if (window.myPolarChart instanceof Chart) {
        window.myPolarChart.destroy();
    }
    window.myPolarChart = new Chart(chartContainer, {
        
        // Define type of chart. This is a polarArea chart.
        type: 'polarArea',
        data: {
            // Labels are the names of the individual stats. So the keys of the "averageStats" array of objects
            labels: Object.keys(averageStats),
            datasets: [{
                label: 'Game Stats',
                // Data is the data used in creating the chart. Here it is the values of the "averageStats" array of objects
                data: Object.values(averageStats),
                // Coloring
                backgroundColor: [
                    'rgba(255, 99, 132, 0.75)',
                    'rgba(54, 162, 235, 0.75)',
                    'rgba(255, 206, 86, 0.75)',
                    'rgba(75, 192, 192, 0.75)',
                    'rgba(153, 102, 255, 0.75)',
                    'rgba(255, 159, 64, 0.75)',
                    'rgba(199, 199, 199, 0.75)',
                    'rgba(83, 102, 255, 0.75)'
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)'
                ],
                borderWidth: 2
            }]
        },
        // chart.js attributes
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        },
        plugins: [{
            id: 'customPlugin',
            // Afterdraw runs after the chart has been drawn, as the name suggests. This means that the chart is drawn
            // and then the positions of the images are calculated and appended using the function appendStatPictures
            afterDraw: (chart) => {
                // We use the array "imagePositions" to give the "appendStatPictures" the label, x coordinate and y coordinate of the image
                const imagePositions = [];
                
                // Calculates x coordinate for the center of the chart
                const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                
                // Calculates y coordinate for the center of the chart
                const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                
                // Calculates radius of the chart
                const radius = Math.min((chart.chartArea.right - chart.chartArea.left) / 2, (chart.chartArea.bottom - chart.chartArea.top) / 2);
                
                // Offset for the images
                const offset = 10;

                // Calculates "anglecalar", which is used to calculate the angle of each segments center, where the images will lie
                const angleScalar = (2*Math.PI) / chart.data.labels.length;
                
                // ForEach loop that runs through each label used in the data of the chart. So through kills, deaths, assists etc
                chart.data.labels.forEach((label, index) => {
                // Calculates angle for the image. (index+0.5) is because we want the image to be at the center of the segment, not the edge
                const angle = angleScalar * (index+0.5) - Math.PI / 2;
                
                // Calculates the x coordinate for the image placement.
                const x = centerX + (radius+offset) * Math.cos(angle);

                // Calculates the y coordinate for the image placement.
                const y = centerY + (radius+offset) * Math.sin(angle);

                // Pushes to the "imagePositions" array of objects.
                imagePositions.push({ label, x, y});
                });

                // Runs appendStatPictures, which makes image containers and fills them with corresponding images
                appendStatPictures(imagePositions, averageStats);
            }
        }]
    });
}