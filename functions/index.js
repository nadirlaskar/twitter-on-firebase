const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const addUserToFireStore = (user) => {
  return admin.firestore()
      .collection("users")
      .doc(user.uid)
      .create({
        name: user.displayName,
        email: user.email,
        role: "user",
        isActive: true,
      });
};

const deleteUserFromFireStore = (user) => {
  return admin.firestore()
      .collection("users")
      .doc(user.uid)
      .delete();
};

exports.createUserListener = functions.auth.user().onCreate(addUserToFireStore);
exports.deleteUserListener = functions.auth
    .user()
    .onDelete(deleteUserFromFireStore);
