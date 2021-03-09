const {admin, db} = require('../firebase/fb.js');
const uuidv4 = require('uuid').v4;

//Get User Profile
const getUser = async (req, res) => {
    const userId = req.query.user_id;

    if (userId === undefined)
        return res.status(400).json({action: "Failure", description: "user_id must be defined."});

    try {
        const userRef = await db.collection('users').doc(userId).get();
        if (!userRef.exists)
            res.status(400).json({action: 'Failed', message: "User does not exist."});
    } catch (err) {
        console.log("Uncaught error in /users", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firebase.",
            error: err
        })
    }
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
            res.status(400).json({
                action: "Failure",
                description: "Error getting user, likely due to firebase.",
                error: error
            });
        });
};

//Get bins relating to user
const getBins = async (req, res) => {
    const user_id = req.user.uid;

    try {
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
    } catch (err) {
        console.log("Uncaught error in /users/bins", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error, likely due to firebase.",
            error: err
        });
    }
};

const searchUsers = async (req, res) => {
    const query = req.query.query;

    const listAllUsers = async (nextPageToken) => {
        // List batch of users, 1000 at a time.

        const matchedResults = [];
        try {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            for (const userRecord of listUsersResult.users) {
                const user_id = userRecord.uid;
                if (user_id.includes(query)) {
                    //Filter for query search
                    const userRef = await db.collection('users').doc(user_id).get();
                    if (userRef.exists) {
                        matchedResults.push({
                            user_id: user_id,
                            email: userRecord.email,
                            first_name: userRef.data().first_name,
                            last_name: userRef.data().last_name,
                            joined: userRef.data().joined
                        });
                    }
                }
            }
            if (listUsersResult.pageToken) {
                // List next batch of users.
                const furtherResults = await listAllUsers(listUsersResult.pageToken);
                for (const user of furtherResults) {
                    matchedResults.push(user)
                }
            }
            return matchedResults;
        } catch (error) {
            res.status(400).json({
                action: "Failure",
                description: "Error searching users",
                error: error
            });
        }
    };

    const matchedResults = await listAllUsers();

    try {
        const awaitedResults = await Promise.all(matchedResults);
        const result = {};
        for (const user of awaitedResults) {
            result[user.user_id] = {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                joined: user.joined
            }
        }

        res.status(200).json(result);
    } catch (err) {
        console.log("Uncaught error in /users/search", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error.",
            error: err
        })
    }
};

const requestFriend = async (req, res) => {
    const user_1 = req.user.uid;
    const user_2 = req.body.user;
    const requested = new Date().getTime();
    const request_id = uuidv4();

    try {

        const user1Query = await db.collection('friendships').where('user_1', '==', user_1).where('user_2', '==', user_2).limit(1).get();
        const user2Query = await db.collection('friendships').where('user_1', '==', user_2).where('user_2', '==', user_1).limit(1).get();

        if (!user1Query.empty) {
            user1Query.forEach((friendship) => {
                res.status(400).json({
                    action: "Failed",
                    description: "Friend request already exists",
                    request_status: friendship.data().status,
                    request_id: friendship.id
                });
            });
            return;
        } else if (!user2Query.empty) {
            user2Query.forEach((friendship) => {
                res.status(400).json({
                    action: "Failed",
                    description: "Friend request already exists",
                    request_status: friendship.data().status,
                    request_id: friendship.id
                });
            });
            return;
        }


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
    } catch (err) {
        console.log("Uncaught error in /users/friends/request", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error.",
            error: err
        })
    }

};

const getFriends = async (req, res) => {
    const userId = req.user.uid;

    try {
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
        res.status(200).json(result);
    } catch (err) {
        console.log("Uncaught error in /users/friends: ", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error.",
            error: err
        })
    }

};

const acceptRequest = async (req, res) => {
    const acceptedTime = new Date().getTime();
    const requestId = req.body.request_id;

    if (requestId === undefined)
        return res.status(400).json({action: "Failure", description: "Request ID is undefined."});

    try {
        const requestRef = db.collection('friendships').doc(requestId);
        const pendingRequest = await requestRef.get();
        if (!pendingRequest.exists)
            return res.status(400).json({action: "Failure", description: "Request does not exist"});
        if (pendingRequest.data().user_2 !== req.user.uid)
            return res.status(400).json({action: "Failure", description: "User not allowed to accept this request"});
        if (pendingRequest.data().status !== "Pending")
            return res.status(400).json({
                action: "Failure",
                description: "Request is not in a state that can be accepted"
            });
        await requestRef.update({
            response_time: acceptedTime,
            status: "Accepted"
        });
        res.status(200).json({
            action: "Success",
            description: "Request accepted"
        });
    } catch (err) {
        console.log("Uncaught error in /users/friends/accept", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error.",
            error: err
        })
    }

};

const denyRequest = async (req, res) => {
    const deniedTime = new Date().getTime();
    const requestId = req.body.request_id;

    if (requestId === undefined)
        return res.status(400).json({action: "Failure", description: "Request ID is undefined."});

    try {
        const requestRef = db.collection('friendships').doc(requestId);
        const pendingRequest = await requestRef.get();
        if (!pendingRequest.exists)
            return res.status(400).json({action: "Failure", description: "Request does not exist"});
        if (pendingRequest.data().user_2 !== req.user.uid)
            return res.status(400).json({action: "Failure", description: "User not allowed to deny this request"});
        if (pendingRequest.data().status !== "Pending")
            return res.status(400).json({
                action: "Failure",
                description: "Request is not in a state that can be accepted"
            });

        await requestRef.update({
            response_time: deniedTime,
            status: "Declined"
        });
        res.status(200).json({
            status: "Success",
            message: "Request declined"
        });
    } catch (err) {
        console.log("Uncaught error in /users/friends/deny", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error.",
            error: err
        })
    }
};

const getFriendRequests = async (req, res) => {
    const userId = req.user.uid;

    try {
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
        res.status(200).json(result);
    } catch (err) {
        console.log("Uncaught error in /users/friends/requests", err);
        res.status(500).json({
            action: "Failure",
            description: "Uncaught error.",
            error: err
        })
    }
};

const shareQuery = async (req, res) => {
    const userId = req.user.uid;
    const timeStart = req.body.time_start;
    const timeEnd = req.body.time_end;
    const interval = req.body.interval;
    const sharedWith = req.body.sharing_with;
    const bins = req.body.bins ? req.body.bins : "*";
    const shareId = uuidv4();

    if (!timeEnd || !timeStart || !interval || !sharedWith)
        return res.status(400).json({
            action: "Failed",
            description: "Some input in the request body is not defined, check documentation."
        });
    //check if users are friends


    try {
        await db.collection("shares").doc(shareId).set({
            time_start: timeStart,
            time_end: timeEnd,
            interval: interval,
            bins: bins,
            shared_with: sharedWith,
            sharing_user: userId,
            status: "Sent",
            sharedAt: new Date().getTime()
        });
    } catch (err) {
        return res.status(500).json({action: "Failed", description: "Firebase error.", error: err})
    }
    res.status(200).json({action: "Success", description: "Query shared."});
};

const getSharedQueries = async (req, res) => {
    const userId = req.user.uid;
    let numNotViewed = 0;
    const shares = {};

    try {
        const query = await db.collection("shares").where("shared_with", '==', userId).get();
        query.forEach((share) => {
            if (share.data().status === "Sent")
                numNotViewed += 1;
            shares[share.id] = {
                shared_by: share.data().sharing_user,
                shared_at: share.data().shared_at,
                status: share.data().status
            }
        });
    } catch (err) {
        return res.status(400).json({action: "Failed", description: "Uncaught error.", error: err});
    }
    res.status(200).json({
        num_to_view: numNotViewed,
        shares: shares
    });
};

module.exports = {
    getUser,
    getBins,
    searchUsers,
    getFriends,
    getFriendRequests,
    denyRequest,
    acceptRequest,
    requestFriend,
    shareQuery,
    getSharedQueries
};
