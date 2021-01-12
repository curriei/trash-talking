//External library imports
const express = require('express');
require('dotenv').config();

//Internal imports
const binsRoutes = require('./routes/bins.js');
const userRoutes = require('./routes/users.js');

//App initialization
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Routing categories
app.use('/users', userRoutes);
app.use('/bins', binsRoutes);

//Port listening
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});