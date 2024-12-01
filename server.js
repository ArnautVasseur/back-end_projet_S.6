const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4000;

const corsOptions = {
  origin: 'https://projet-s6.arnaut-vasseur.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('./database/database.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database');
  }
});

app.get('/', (req, res) => {
    res.redirect('/users');
});

app.get('/users', (req, res) => {
    db.all('SELECT * FROM Users', (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of recipes as JSON response
    });
});

app.get('/achievements', (req, res) => {
    db.all('SELECT * FROM Achievements', (err, rows) => {
        if (err) {
            console.error('Error fetching achievements:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows); // Return the list of recipes as JSON response
    });
});

app.get('/users/:userID', (req, res) => {
    const { userID } = req.params;
    db.get(`SELECT points FROM Users WHERE user_ID = ?`, [userID], (err, user) => {
        if (err) {
            console.error('Error fetching user details:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({  points: user.points });
    });
});

app.get('/achievements/:userID', (req, res) => {
    const { userID } = req.params;
    db.all('SELECT name FROM Achievements WHERE user_ID = ?', [userID], (err, rows) => {
        if (err) {
            console.error('Error fetching recipes:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!rows) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(rows); // Return the list of recipes as JSON response
    });
});

app.put('/users/:userID/points/:NewPoints', (req, res) => {
    const {userID, NewPoints} = req.params;

    const updateQuery = `UPDATE Users SET points = ? WHERE user_ID = ?`;
    const updateParams = [NewPoints, userID ];

    db.run(updateQuery, updateParams, function (err) {
      if (err) {
        console.error('Error updating instruction step:', err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
  
      if (this.changes === 0) {
        // No rows were affected, indicating that the instruction step or recipe was not found
        res.status(404).json({ error: 'User not found' });
      } else {
        // Instruction step updated successfully
        res.json({ message: 'Points updated successfully' });
      }
    });
});

app.put('/users/:userID/points/:morepoints', (req, res) => {
    const {userID, morepoints} = req.params;

    const updateQuery = `UPDATE Users SET points = ? WHERE user_ID = ?`;
    const updateParams = [ morepoints, userID ];

    db.run(updateQuery, updateParams, function (err) {
      if (err) {
        console.error('Error updating instruction step:', err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
  
      if (this.changes === 0) {
        // No rows were affected, indicating that the instruction step or recipe was not found
        res.status(404).json({ error: 'User not found' });
      } else {
        // Instruction step updated successfully
        res.json({ message: 'Points added successfully' });
      }
    });
});

// Add an achievement
app.post('/users/:userID/achievement/:Name', (req, res) => {
    const { userID, Name } = req.params;
    
    // Insert the new achievement into the Achievement table
    db.run('INSERT INTO Achievements (name, user_ID) VALUES (?, ?)', [Name, userID], function (err) {
      if (err) {
        console.error('Error adding achievement:', err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      res.json({ message: 'Achievement added successfully' });
    });
});

app.post('/inscription', (req, res) => {
    const { username, password } = req.body;

    // Vérifie si tous les paramètres sont renseignés
    if (!username || !password) {
        res.status(400).json({ error: 'username and password are required' });
        return;
    }
    
    // Ajoute le nouveau user à la table User avec points initialisé à 0
    db.run('INSERT INTO Users (username, password, points) VALUES (?, ?, 1)', [username, password], function (err) {
        if (err) {
            console.error('Error inscription:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        res.json({ user_ID: this.lastID, username });
    });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Récupération de l'utilisateur depuis la base de données
    db.get(`
        SELECT *
        FROM Users
        WHERE username = ?
        AND password = ?`, [username, password], async (err, user) => {
        if (err) {
            res.status(500).json({ error: 'Erreur interne du serveur' });
            return;
        }
        if (!user) {
            res.status(401).json({ error: 'username ou password incorrect' });
            return;
        }
        res.json({token : user.user_ID});
    });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});