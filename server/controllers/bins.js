const uuidv4 = require('uuid').v4;
const {db} = require('../fb.js');

const registerBin = async (req, res) => {
    //Json manipulation
    const body_json = req.body;
    var bin_id = body_json.id;
    if (bin_id === undefined) {
        bin_id = uuidv4;
    }
    const user_name = body_json.user_name;

    //Update firebase
    const docRef = db.collection('bins').doc(bin_id);
    await docRef.set({
        user: user_name
    });

    res.send(`Bin with ID ${bin_id} added.`);
};

const binUpdate = async (req, res) => {
    //Json Manipulation
    const update_id = uuidv4();
    const body_json = req.body;
    const {bin_id} = req.params;
    const weight = body_json.weight;
    const distance = body_json.distance;
    const time = body_json.time;
    const date = body_json.date;

    //Update firebase
    const docRef = db.collection('data-entries').doc(update_id);
    await docRef.set({
        bin_id: bin_id,
        weight: weight,
        volume: distance,
        time: time,
        date: date
    });

    res.send(`Bin update completed for bin ${bin_id}`);
};

module.exports = {registerBin, binUpdate};