const express = require('express');
const app = express();

app.get('/:a', (req, res) => {
    console.log("Running");
    const target = process.env.TARGET || 'World';
    res.send(`Hello ${target}!\n`);
});

app.get('/', (req, res) => {
    res.send("Root location");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});