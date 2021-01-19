//External library imports
const express = require('express');
require('dotenv').config();

//Internal imports
const binsRoutes = require('./routes/bins.js');
const userRoutes = require('./routes/users.js');
const garbageRoutes = require('./routes/garbage.js');

//App initialization
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Routing categories
app.use('/users', userRoutes);
app.use('/bins', binsRoutes);
app.use('/garbage', garbageRoutes);

//Port listening
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

//TODO: verifyBin auth function, goals in general tbh. Garbage query time constraints.