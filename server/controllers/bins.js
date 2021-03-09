const uuidv4 = require('uuid').v4;
const {db} = require('../firebase/fb.js');
const goalModels = require('../models/goals.js');

const createBin = async (req, res) => {
    const body = req.body;
    let binArea = parseFloat(body.area);
    const diameter = body.diameter;

    try {

        if (isNaN(binArea)) {
            if (diameter === undefined)
                return res.status(400).json({action: "Failed", description: "diameter or area must be defined."});
            binArea = Math.pow((parseFloat(diameter) / 2.0), 2) * Math.PI;
        }
        if (binArea < 0) return res.status(400).json({
            action: "Failure",
            description: 'Bin area must be greater than 0'
        });

        const binId = uuidv4();
        await db.collection('bins').doc(binId).set({
            activated: false,
            bin_area: binArea
        });
        console.log('Bin created with ID:', binId);
        res.status(200).json({
            action: "Success",
            description: "Bin created",
            bin_id: binId
        });
    } catch (err) {
        console.log("Uncaught error in /bins/new: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error.",
            error: err
        })
    }
};

//Register bin with user account.  User must still "update bin" by opening lid.
const registerBin = async (req, res) => {
    //Json manipulation
    const body = req.body;
    const binId = body.bin_id;
    const binRef = db.collection('bins').doc(binId);

    try {

        //Check if bin was created.
        const bin = await binRef.get();
        if (!bin.exists) return res.status(400).json({
            action: "Failure",
            description: "Bin does not exist."
        });
        if (bin.data().activated === true) return res.status(400).json({
            action: "Failure",
            description: 'Bin has already been registered.'
        });

        //Register bin.
        const userId = req.user.uid;

        //Update firebase
        await binRef.update({
            user_id: userId,
            activated: true
        });

        console.log(`Bin with ID ${binId} registered.`);
        res.status(200).json({
            action: "Success",
            description: `Bin with ID ${binId} registered.`
        });
    } catch (err) {
        console.log("Uncaught error in /bins/register: ", err);
        return res.status(500).json({
            action: "Failed",
            description: "Uncaught error",
            error: err
        });
    }
};

//Called by bin controller to update server values
const binUpdate = async (req, res) => {
    //Json Manipulation
    const updateId = uuidv4();
    const body = req.body;
    const binId = body.bin_id;
    const weight = parseFloat(body.weight);
    const distance = parseFloat(body.distance);
    const timeStamp = new Date().getTime();

    if (binId === undefined)
        return res.status(400).json({action: "Failed", description: "bin_id is undefined."});

    if (isNaN(distance) || typeof distance !== 'number') return res.status(400).json({
        action: "Failed",
        description: "Distance must be a number."
    });
    if (isNaN(weight) || typeof weight !== 'number') return res.status(400).json({
        action: "Failed",
        description: 'Weight must be a number.'
    });


    //Get bin data and check if exists
    let binDocRef;
    let bin;
    try {
        binDocRef = db.collection('bins').doc(binId);
        bin = await binDocRef.get();
    } catch (e) {
        console.log("Uncaught error in /bins/update: ", e);
        return res.status(500).json({
            action: "Failed",
            description: "Uncaught error when accessing bin on database",
            error: e
        });
    }
    if (!bin.exists) {
        return res.status(400).json({
            action: "Failed",
            description: "Bin does not exist"
        });
    }

    try {
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
        //volume measured in cubic metres, bin area is square mm.
        const deltaVolume = deltaDistance * bin.data().bin_area / 1000000000;

        // Only record a garbage update if garbage was added (avoid bag removal)
        if (deltaWeight >= 0) {
            const docRef = db.collection('data-entries').doc(updateId);
            await docRef.set({
                bin_id: binId,
                weight: deltaWeight,
                volume: deltaVolume,
                time_stamp: timeStamp
            });

            await goalModels.updateGoals(bin.data().user_id, deltaVolume, deltaWeight, updateId);
            res.status(200).json({
                action: "Success",
                description: `${deltaWeight} weight and ${deltaVolume} volume added for bin: ${binId}`
            });
        } else {
            res.status(200).json({
                action: "Success",
                description: 'Bag removed, no garbage recorded.'
            });
        }
    } catch (err) {
        console.log("Uncaught error in /bins/update: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore issues",
            error: err
        })
    }
};

//Get current bin fill level
const current = async (req, res) => {
    const userId = req.user.uid;
    const binId = req.query.bin_id;

    try {
        const bin = await db.collection('bins').doc(binId).get();

        //Check if bin exists
        if (!bin.exists) {
            return res.status(400).json({
                action: "Failure",
                description: "Bin does not exist"
            });
        }
        //Check if bin matches registered user.
        if (bin.data().user_id !== userId) {
            return res.status(400).json({
                action: "Failure",
                description: 'Bin does not belong to this user.'
            });
        }
        //Check if bin has any data relating to it
        if (bin.data().bin_weight === undefined) {
            return res.status(400).json({
                action: "Failure",
                description: "Bin has never been updated."
            });
        }
        const currentWeight = bin.data().last_weight - bin.data().bin_weight;
        const currentVolume = (bin.data().bin_distance - bin.data().last_distance) * bin.data().bin_area;
        const percentFill = currentVolume / (bin.data().bin_area * bin.data().bin_distance);

        res.status(200).json({
            action: "Success",
            current_weight: currentWeight,
            current_volume: currentVolume,
            percent_fill: percentFill,
            last_update: bin.data().last_update
        });
    } catch (err) {
        console.log("Uncaught error in /bins/current: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firestore.",
            error: err
        })
    }
};

module.exports = {registerBin, createBin, binUpdate, current};
