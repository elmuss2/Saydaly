const express = require('express');
const { Client } = require('pg');
const os = require('os');

const hostname = os.hostname();
const client = new Client({
    user: "postgres",
    password: "gKstv5-h3b",
    host: hostname,
    port: 5432,
    database: "test"
});

const web = express();
const port = 3000;

web.get('/', (req, res) => {
    client.connect()
        .then(() => client.query("SELECT * FROM messege"))
        .then(results => {
            res.send(`<pre>${JSON.stringify(results.rows, null, 2)}</pre>`);
        })
        .catch(e => {
            console.log(e);
            res.status(500).send('Error');
        })
        .finally(() => client.end());
});

web.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

