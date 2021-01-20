const admin = require('firebase-admin/lib/index');

//IAM Service Account Key Json (not added to git)
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

module.exports = {admin, db};
