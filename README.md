# League of Legends Game Analysis and Optimal Build 

## Overview
This project uses thousands of League of Legends games to calculate and display optimal builds for each champion. Users can use the system to view the most effective item builds (according to our algorithms) based on a dataset of game results.

## Technology Stack
- **Front-end:** HTML, CSS, JavaScript
- **Back-end:** JavaScript, Node.js
- **Database:** SQLite3
- **Dependencies:**
  - axios
  - axios-retry
  - cors
  - body-parser
  - chai
  - sqlite
  - sqlite3
  - express
  - mocha
  - Babel (core, preset, register)
    
## Installation

### Prerequisites
- Node.js (v20.x or later), the developers used v20.11.0
- npm (v10.x or later), the developers used v10.2.4
- Visual Studio Code

  
### Clone the Repository
To get the repository either clone it via git:
```bash
git clone --indsæt endelige url--
```
Or download the repository as a zip file from github.com and unpack the folder.

Open the LoLHelperP2 folder with VS code and follow the rest of the installation guide


### Install dependencies
To install the listed dependencies from techonology stack, perform this simple command in the terminal inside the project root directory.
```bash
npm install
```
This installs all the dependencies highlighted in this readme aswell as in package.json

Install the Visual Studio code extension "Live Sever" by Ritwick Dey.
This can be done inside VS code by navigation to the extensions view or by pressing 'Ctrl+Shift+X'
In the search box, type "Live Server"
Click on "Live Server" by Ritwick Dey and then click "Install"

### How to
When all steps in Installation are complete, the program is ready to run. 
Initialise the express server by running in the terminal inside the project root directory.
```bash
npm start
```
Navigate to the frontpage in "../Views/frontpage.html", right click it and press 'Open with Live Server'.

(To exit the server, target the terminal, press "ctrl + c" and enter "y")
Enjoy !

### Additional Information

The Riot Games API keys are only valid for 24 hours, meaning that the API keys in this repository have expired. This does not affect functionality since 'playerstats' can also run purely on database data. However, this means that 'playerstats' can only be used on players who are already in the database.

One player that is in the database is:

**"ths22#EUW"**

You can input this into the search in 'playerstats,' and it will work regardless of whether the API key is expired or not.



### Testing
To run the unit tests close the server and write
```bash
npm test
```

### Fetching new games
This is not needed for the program to run, but if you wish to fetch new games to add to the database:
* First create an account on https://developer.riotgames.com/
* Then navigate to your user dashboard and generate a valid api key.
* Navigate to "../services/gameExtraction.mjs" and insert the api key in apiKeys.
* Run gameExtraction.mjs
* When done stop the program and the fetched games have been added to games.json
* Navigate to "models/dataAccess/dataBaseNavigator.mjs" and uncomment the following lines
  ```js
  // await insertGamesDataToDB();
  ```
* Run the file and now the games have been added to the database

  
### Contact us
If you experience any trouble feel free to contact the developers on mail: mpauls23@student.aau.dk or phone: +45 23 43 90 23
  ![Alt Text](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDNwZm8zemhzanFiNDExdWEyeWd4MGk4d2ZtbXB3MmY5NjI2MDZucCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6vXNLzXdW4sbFRGo/giphy.gif)

