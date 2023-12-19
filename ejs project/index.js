const express = require('express');
const bodyParser = require('body-parser');
const {Pool} = require('pg');
const app = express();
const {check, validationResult} = require('express-validator');
const pool = new Pool({
        user: "kusaielmusraty",
        password: "gKstv5-h3b",
        host: 'localhost',
        port: 5432,
        database: "test"
});

const port = 3000;
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', __dirname + '/views');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const pgSession = require('connect-pg-simple')(session);
app.use(cookieParser());

app.use(session({
    store: new pgSession({
        pool,
        tableName: 'sessions',
        pgPromise: pool,
        pgPool: pool,
        pgp: pool, 
        primaryKey: 'id', 
        sessionId: 'sid', 
        expire: 'expire',
        sessionData: 'sess'
    }),
    secret: 'gkstv5h3b', 
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    },
}));

app.get('/', (req, res) => {
  res.render('login.pug');
});

app.get('/login', (req, res) => {
    res.render('login.pug');
  });
  
app.post('/login', [
    check('email', 'email is not valid').isEmail().normalizeEmail(),
    check('pwd', 'password must be 8 characters long').exists().isLength({ min: 8 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login.pug', { errors: errors.array() });
    }

    const { email, pwd } = req.body; 
    try {
        const query = 'SELECT * FROM accounts WHERE email = $1 AND password = $2';
        const values = [email, pwd]; 

        const user = await pool.query(query, values);

        if (user.rows.length > 0) {
            const userId = user.rows[0].id;
            req.session.user = { userId };
            const alertMessage ='Login successful';
            return res.render('web.pug', {
                alertMessage
            });
        } else {
            return res.send('Invalid email or password');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error checking credentials');
    }
});
app.get('/signup', (req, res) => {
    res.render('signup.pug'); 
});

app.post('/signup', [
    check('email', 'email is not valid').isEmail().normalizeEmail(),
    check('pwd', 'password must be 8 characters long').exists().isLength({ min: 8 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('signup.pug', { errors: errors.array() });
    }

    const { email, pwd } = req.body;

    try {
        const query = 'INSERT INTO accounts (email, password) VALUES ($1, $2)';
        const values = [email, pwd];
        await pool.query(query, values);
        const alertMessage = 'Signup successful';
        return res.render('login.pug', { alertMessage });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error creating user');
    }
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
app.post('/edit', async(req,res)=>{
    try{
            const userId = req.body.userId
            res.render('editUser.pug',{ userId });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error redirecting to edit');
      }
});
app.post('/updateUser', async (req, res) => {
    try {
      const userId = req.body.userId;
      const newFirstName = req.body.fname;
      const newLastName = req.body.lname;
  
      const query = 'UPDATE users SET fname = $1, lname = $2 WHERE id = $3';
      const values = [newFirstName, newLastName, userId];
  
      await pool.query(query, values);
  
      res.redirect('/displayUsers'); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating user');
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
