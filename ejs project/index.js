const express = require('express');
const bodyParser = require('body-parser');
const {Pool} = require('pg');
const app = express();
const pool = new Pool({
        user: "postgres",
        password: "gKstv5-h3b",
        host: 'Kusais-MacBook-Pro.local',
        port: 5432,
        database: "test"
});
const port = 3000;
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');

app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    },
}));

app.get('/', (req, res) => {
  res.render('web.pug');
});

app.post('/submit', async (req, res) => {
    try{
        const {fname, lname} = req.body;
        const query = 'INSERT INTO users (fname, lname) VALUES ($1, $2) RETURNING * ';
        const values = [fname,lname];
        const newUser = await pool.query(query,values);
        const alertMessage = 'Used Added!';
        res.render('web.pug',{
            alertMessage
        });
    }
    catch(error){
        console.error(error);
        const alertMessage = 'Fail to add user to database';
        
        res.status(500).render('web.pug',{
            alertMessage
        });
    }

});
app.post('/delete', async (req, res) => {
    try{
        const userId = req.body.userId;
        console.log(req.body);
        const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const values = [userId];
        const action = await pool.query(query,values);
        const alertMessage = 'Used Deleted!';
        res.redirect('/displayUsers');
    }
    catch(error){
        console.error(error);
        const alertMessage = 'Fail to delete user from database';
        
        res.status(500).render('web.pug',{
            alertMessage
        });
    }
});
app.get('/displayUsers', async (req, res) => {
    try {
        const query = 'SELECT * FROM users'; 
        const users = await pool.query(query);
        res.render('web.pug', { users: users.rows });
    } catch (error) {
        console.error(error);
        const alertMessage = 'Failed to fetch users from the database.';
        res.status(500).render('web.pug', { alertMessage });
    }
});

app.listen(port, () => {
  console.log('Server is running on port:', port);
});
