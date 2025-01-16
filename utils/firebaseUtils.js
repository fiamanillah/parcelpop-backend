const admin = require('firebase-admin');

const serviceAccount = require('../private/firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const verifyFirebaseToken = async idToken => {
    try {
        return await admin.auth().verifyIdToken(idToken);
    } catch (err) {
        throw new Error('Invalid Firebase token', err);
    }
};

module.exports = {
    verifyFirebaseToken,
};
