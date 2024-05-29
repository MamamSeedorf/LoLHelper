import express from 'express';
import cors from 'cors';
import { calculateOptimalBuild } from './models/dataAccess/dataBaseNavigator.mjs'; 
import axios from 'axios';
import { verifyUserLogin, createUser, fetchGameData } from './models/dataAccess/dataBaseHelpers.mjs'
const API_KEY = "xxx";
const app = express();
const port = 3000;
import bodyParser from "body-parser";
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json()); // bodyParser to process JSON request object 

// Server api endpoint to handle requests. 

app.post('/login', async (req, res) => {
    const { username, password } = req.body; 
    try {
        let isAuthenticated = await verifyUserLogin(username, password);
        if (isAuthenticated) {
            res.sendStatus(200); 
        } else { 
            res.sendStatus(401);
        }
    } catch (error) { 
        res.sendStatus(500);
    }
});

app.post('/register', async (req, res) => {
    try {
        const userInformation = req.body;
        let userCreated = await createUser(userInformation);
        if (userCreated) {
            res.sendStatus(200); 
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});


app.get('/getPlayerPUUIDFromRiotTag/:riotId/:tagline', async (req, res) => {
    try {
        const { riotId, tagline } = req.params;
        const encodedRiotId = encodeURIComponent(riotId);
        const encodedTagline = encodeURIComponent(tagline);
        const response = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedRiotId}/${encodedTagline}`, {
            headers: {
                "X-Riot-Token": API_KEY 
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Riot API:', error);
        res.status(500).send('Error fetching data from Riot API');
    }
});


app.get('/getMatchIds/:puuid', async (req, res) => {
    const { puuid } = req.params;
    const { start, count, queueId = 420 } = req.query; 

    try {
        const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=${queueId}&start=${start}&count=${count}`;
        const response = await axios.get(url, {
            headers: {
                "X-Riot-Token": API_KEY
            }
        });
        console.log('Match IDs:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching match IDs from Riot API:', error);
        res.status(500).send('Error fetching match IDs from Riot API');
    }
});

app.get('/getMatchDetails/:matchId', async (req, res) => {
    const { matchId } = req.params;
    try {
        const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}?api_key=${API_KEY}`;
        const response = await axios.get(url);
        console.log('Match Details:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching match details from Riot API:', error);
        res.status(500).send('Error fetching match details from Riot API');
    }
});

app.get('/loadOptimalDBBuild/:userChampion/:opponentChampion/:teamPosition', async (req, res) => {
    try {
        console.log("Got request");
        const { userChampion, opponentChampion, teamPosition } = req.params;
        const data = await calculateOptimalBuild(userChampion, opponentChampion, teamPosition);
        console.log('Data loaded from database:', data);
        res.json(data); 
    } catch (error) {
        console.error('Error loading data from database:', error);
        res.status(500).send('Error loading data from database');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/fetchStatsFromDB', async (req, res) => {
    try {
        console.log("Got request");
        const data = await fetchGameData();
        console.log(data);
        console.log('Data loaded from database:', data);
        res.json(data); 
    } catch (error) {
        console.error('Error loading data from database:', error);
        res.status(500).send('Error loading data from database');
    }
});

