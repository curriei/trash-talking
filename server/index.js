//External library imports
const express = require('express');
const bodyParser = require('body-parser');

//Internal imports
const binsRoutes = require('./routes/bins.js');
const userRoutes = require('./routes/users.js');

const app = express();
app.use(bodyParser.json());

//Routing categories
app.use('/users', userRoutes);
app.use('/bins', binsRoutes);

//Port listening
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});