const uuidv4 = require('uuid').v4;
const {db} = require('../firebase/fb.js');

const createBin = async (req, res) => {
    const body = req.body;
    let binArea = body.bin_area;
    if (binArea === undefined)
        binArea = Math.pow((body.diameter / 2.0), 2) * Math.PI;

    if (binArea < 0) return res.status(400).send('Bin area must be greater than 0');

    const binId = uuidv4();
    await db.collection('bins').doc(binId).set({
        activated: false,
        bin_area: binArea
    });
    console.log('Bin created with ID:', binId);
    res.status(200).json({
        status: "success",
        message: "Bin created",
        bin_id: binId
    });
};

//Register bin with user account.  User must still "update bin" by opening lid.
const registerBin = async (req, res) => {
    //Json manipulation
    const body = req.body;
    const binId = body.bin_id;
    const binRef = db.collection('bins').doc(binId);

    //Check if bin was created.
    const bin = await binRef.get();
    if (!bin.exists) return res.status(400).send("Bin does not exist.");
    if (bin.data().activated === true) return res.status(400).send('Bin has already been registered.');

    //Register bin.
    const user_id = req.user.uid;

    //Update firebase
    await binRef.update({
        user_id: user_id,
        activated: true
    });

    console.log(`Bin with ID ${binId} registered.`);
    res.status(200).send(`Bin with ID ${binId} registered.`);
};

//Called by bin controller to update server values
const binUpdate = async (req, res) => {
    //Json Manipulation
    const update_id = uuidv4();
    const body_json = req.body;
    const binId = body_json.bin_id;
    const weight = parseFloat(body_json.weight);
    const distance = parseFloat(body_json.distance);
    const timeStamp = new Date().getTime();

    if (isNaN(distance) || typeof distance !== 'number') return res.status(400).send("Distance must be a number");
    if (isNaN(weight) || typeof weight !== 'number') return res.status(400).send('Weight must be a number');

    //Get bin data and check if exists
    let binDocRef;
    let bin;
    try {
        binDocRef = db.collection('bins').doc(binId);
        bin = await binDocRef.get();
    } catch (e) {
        return res.status(400).send(`Error accessing database: ${e}`);
    }
    if (!bin.exists) {
        res.status(400).send("Bin does not exist");
        return
    }

    //Update bin data, including checking if bin has had any updates in the past yet.
    let lastWeight = bin.data().last_weight;
    let lastDistance = bin.data().last_distance;
    if (lastWeight === undefined) {
        binDocRef.update({
            last_weight: weight,
            last_distance: distance,
            bin_weight: weight,
            bin_distance: distance,
            last_update: timeStamp
        });
        lastDistance = distance;
        lastWeight = weight;
    } else {
        binDocRef.update({
            last_weight: weight,
            last_distance: distance,
            last_update: timeStamp
        })
    }

    //Calculate delta values for garbage update.
    const deltaWeight = weight - lastWeight;
    // Negative because distance is measured from top of bin.
    const deltaDistance = lastDistance - distance;
    const deltaVolume = deltaDistance * bin.data().bin_area;

    // Only record a garbage update if garbage was added (avoid bag removal)
    if (deltaWeight >= 0) {
        const docRef = db.collection('data-entries').doc(update_id);
        await docRef.set({
            bin_id: binId,
            weight: deltaWeight,
            volume: deltaVolume,
            time_stamp: timeStamp
        });
        res.status(200).send(`${deltaWeight} weight and ${deltaVolume} volume added for bin: ${binId}`);
    } else {
        res.status(200).send('Bag removed, no garbage recorded.');
    }
};

//Get current bin fill level
const current = async (req, res) => {
    const user_id = req.user.uid;
    const binId = req.query.bin_id;

    const bin = await db.collection('bins').doc(binId).get();

    //Check if bin exists
    if (!bin.exists) {
        return res.status(400).send("Bin does not exist");
    }
    //Check if bin has any data relating to it
    if (bin.data().bin_weight === undefined) {
        return res.status(400).send("Bin has never been updated.");
    }
    //Check if bin matches registered user.
    if (bin.data().user_id !== user_id) {
        return res.status(400).send('Bin does not belong to this user.');
    }
    const currentWeight = bin.data().last_weight - bin.data().bin_weight;
    const currentVolume = (bin.data().bin_distance - bin.data().last_distance) * bin.data().bin_area;

    res.status(200).json({
        current_weight: currentWeight,
        current_volume: currentVolume,
        last_update: bin.data().last_update
    });
};

module.exports = {registerBin, createBin, binUpdate, current};
