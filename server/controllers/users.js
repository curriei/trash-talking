const {admin, db} = require('../firebase/fb.js');
const uuidv4 = require('uuid').v4;

//Get User Profile
const getUser = async (req, res) => {
    const userId = req.query.user_id;
    const userRef = await db.collection('users').doc(userId).get();
    if (!userRef.exists)
        res.status(400).json({action: 'Failed', message: "User does not exist."});

    admin.auth().getUser(userId)
        .then((userRecord) => {
            res.status(200).json({
                user_id: userRecord.uid,
                email: userRecord.email,
                first_name: userRef.data().first_name,
                last_name: userRef.data().last_name,
                joined: userRef.data().joined
            });
        })
        .catch((error) => {
            res.status(400).send(error);
        });
};

//Get bins relating to user
const getBins = async (req, res) => {
    const user_id = req.user.uid;
    const binQuery = await db.collection('bins').where('user_id', '==', user_id).get();
    let result = {};
    let num = 0;
    binQuery.forEach(bin => {
        result[bin.id] = bin.data();
        num++;
    });
    res.status(200).json({
        num_bins: num,
        bins: result
    });
};

const searchUsers = async (req, res) => {
    const query = req.query.query;
    let result = {};

    const listAllUsers = (nextPageToken) => {
        // List batch of users, 1000 at a time.
        admin
            .auth()
            .listUsers(1000, nextPageToken)
            .then((listUsersResult) => {
                listUsersResult.users.forEach(async (userRecord) => {
                    const user_id = userRecord.uid;
                    if (user_id.includes(query)) {
                        const userRef = await db.collection('users').doc(user_id).get();
                        result[userRecord.uid] = {
                            email: userRecord.email,
                            first_name: userRef.data().first_name,
                            last_name: userRef.data().last_name,
                            joined: userRef.data().joined
                        }
                    }
                });
                if (listUsersResult.pageToken) {
                    // List next batch of users.
                    listAllUsers(listUsersResult.pageToken);
                }
            })
            .catch((error) => {
                res.status(400).send(error);
            });
    };
    await listAllUsers();

    res.status(200).send(result);
};

const requestFriend = async (req, res) => {
    const user_1 = req.user.uid;
    const user_2 = req.body.user;
    const requested = new Date().getTime();
    const request_id = uuidv4();

    await db.collection('friendships').doc(request_id).set({
        user_1: user_1,
        user_2: user_2,
        request_time: requested,
        status: "Pending"
    });

    res.status(200).json({
        action: "Success",
        message: "Friendship request sent"
    })

};

const getFriends = async (req, res) => {
    const userId = req.user.uid;
    const user1Query = await db.collection('friendships').where('user_1', '==', userId).where('status', '==', 'Accepted').get();
    const user2Query = await db.collection('friendships').where('user_2', '==', userId).where('status', '==', 'Accepted').get();

    let result = {};
    user1Query.forEach((doc) => {
        result[doc.id] = {
            friend: doc.data().user_2,
            friends_since: doc.data().response_time
        }
    });
    user2Query.forEach((doc) => {
        result[doc.id] = {
            friend: doc.data().user_1,
            friends_since: doc.data().response_time
        }
    });
    res.status(200).send(result);

};

const acceptRequest = async (req, res) => {
    const acceptedTime = new Date().getTime();
    const requestId = req.body.request_id;
    if (requestId === undefined)
        return res.status(400).send("Request ID is undefined.");
    const requestRef = db.collection('friendships').doc(requestId);
    const pendingRequest = await requestRef.get();
    if (!pendingRequest.exists)
        return res.status(400).send("Request does not exist");
    if (pendingRequest.data().user_2 !== req.user.uid)
        return res.status(400).send("User not allowed to accept this request");
    if (pendingRequest.data().status !== "Pending")
        return res.status(400).send("Request is not in a state that can be accepted");
    await requestRef.update({
        response_time: acceptedTime,
        status: "Accepted"
    });
    res.status(200).json({
        action: "Success",
        description: "Request accepted"
    })
};

const denyRequest = async (req, res) => {
    const deniedTime = new Date().getTime();
    const requestId = req.body.request_id;
    if (requestId === undefined)
        return res.status(400).send("Request ID is undefined.");
    const requestRef = db.collection('friendships').doc(requestId);
    const pendingRequest = await requestRef.get();
    if (!pendingRequest.exists)
        return res.status(400).send("Request does not exist");
    if (pendingRequest.data().user_2 !== req.user.uid)
        return res.status(400).send("User not allowed to deny this request");
    if (pendingRequest.data().status !== "Pending")
        return res.status(400).send("Request is not in a state that can be accepted");
    await requestRef.update({
        response_time: deniedTime,
        status: "Accepted"
    });
    res.status(200).json({
        status: "Success",
        message: "Request accepted"
    })
};

const getFriendRequests = async (req, res) => {
    const userId = req.user.uid;
    const query = await db.collection('friendships')
        .where('user_2', '==', userId)
        .where('status', '==', 'Pending').get();

    let result = {};
    query.forEach((doc) => {
        result[doc.id] = {
            friend: doc.data().user_1,
            request_time: doc.data().request_time
        }
    });
    res.status(200).send(result);
};

module.exports = {
    getUser,
    getBins,
    searchUsers,
    getFriends,
    getFriendRequests,
    denyRequest,
    acceptRequest,
    requestFriend
};
