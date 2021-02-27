//External library imports
const express = require('express');
require('dotenv').config();
const cors = require('cors');

//Internal imports
const binsRoutes = require('./routes/bins.js');
const userRoutes = require('./routes/users.js');
const garbageRoutes = require('./routes/garbage.js');
const goalRoutes = require('./routes/goals.js');

//App initialization
const app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors());

//Routing categories
app.use('/users', userRoutes);
app.use('/bins', binsRoutes);
app.use('/garbage', garbageRoutes);
app.use('/goals', goalRoutes);

//Port listening
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

//TODO: VerifyBin/admin auth function
//TODO: units!
//TODO: firebase indexing/rules