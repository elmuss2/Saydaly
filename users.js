const express = require('express');
const { Client } = require('pg');
const os = require('os');
const bodyParser = require('body-parser');
const hostname = os.hostname();
const web = express();
const port = 3000;
const cors = require('cors');
web.use(cors());
//parses the input into json
web.use(bodyParser.json());
web.use(bodyParser.urlencoded({ extended: true }));
web.use(express.json());

web.post('/adduser',async (req, res) => {
    const { Fname, Lname } = req.body;
    const client = new Client({
        user: "postgres",
        password: "gKstv5-h3b",
        host: hostname,
        port: 5432,
        database: "test"
    });
    try{

        await client.connect();
        await client.query('INSERT INTO users (fname, lname) VALUES ($1, $2)', [Fname, Lname]);
        res.send('User Added!');
    }
    catch(error){
        console.error(error);
        res.status(500).send('Error adding data'+ error.message);

    } finally {
        await client.end();
    }


})
web.delete('/deleteuser', async (req, res)=>{
    const {Fname, Lname} = req.body;
    const client = new Client({
        user: "postgres",
        password: "gKstv5-h3b",
        host: hostname,
        port: 5432,
        database: "test"
    });
    try{
        await client.connect();
        console.log(' data:', { Fname, Lname });
        const result = await client.query('DELETE FROM users WHERE TRIM(fname) = TRIM($1) AND TRIM(lname) = TRIM($2) RETURNING *',[Fname, Lname]);

        if (result.rowCount > 0) {
            res.send("User Deleted");
        } else {
            res.status(404).send("User not found");
        }
    }
    catch(error)
    {
        console.error(error);
        res.status(500).send('error while deleting data' + error.message);
    }
    finally{
        await client.end();
    }
})
web.get('/displayusers', async (req,res)=>{
    const client = new Client({
        user: "postgres",
        password: "gKstv5-h3b",
        host: hostname,
        port: 5432,
        database: "test"
    });
    try{
        await client.connect();
        const result = await client.query('SELECT * FROM users');
        res.send(result.rows);
    }
    catch(error){
        console.error(error);
        res.status(500).send('error while deleting data' + error.message)
    }
    finally{
        await client.end();
    }
})
web.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});