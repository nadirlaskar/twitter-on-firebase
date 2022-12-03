const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
admin.firestore().settings({ignoreUndefinedProperties: true});

const addUserToFireStore = (user) => {
  const handle = user.email.replace(/@.+/g, "");
  return admin.firestore()
      .collection("users")
      .doc(user.uid)
      .create({
        id: user.uid,
        name: user.displayName,
        email: user.email,
        handle: handle,
        photoURL: user.photoURL,
        bio: "Just joined Twitter!",
        role: "user",
        tweets: [],
        following: [],
        followers: [],
        isActive: true,
        joined: {
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
      });
};

const deleteUserFromFireStore = async (user) => {
  await admin.firestore()
      .collection("users")
      .doc(user.uid)
      .delete();
  // delete followers and following
  const followers = user.data().followers;
  const following = user.data().following;
  const batch = admin.firestore().batch();
  await Promise.all(followers.map(async (follower) => {
    const followerRef = admin.firestore().collection("users").doc(follower);
    const followerDoc = await followerRef.get();
    const following = followerDoc.data().following;
    const index = following.indexOf(user.uid);
    if (index > -1) {
      following.splice(index, 1);
    }
    batch.update(followerRef, {following: following});
  }));
  await Promise.all(following.map(async (follow) => {
    const followRef = admin.firestore().collection("users").doc(follow);
    const followDoc = await followRef.get();
    const followers = followDoc.data().followers;
    const index = followers.indexOf(user.uid);
    if (index > -1) {
      followers.splice(index, 1);
    }
    batch.update(followRef, {followers: followers});
  }));
  await batch.commit();
};

exports.createUserListener = functions.auth.user().onCreate(addUserToFireStore);
exports.deleteUserListener = functions.auth
    .user()
    .onDelete(deleteUserFromFireStore);

exports.updateProfile = functions.https.onCall(async (data, context) => {
  let {name, bio, dob, location, profession} = data;
  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  if (user.data().dob) {
    dob = user.data().dob;
  }
  await userRef.update({name, bio, dob, location, profession});
  return {message: "Profile updated successfully"};
});

const fetchUserFromFireStoreByHandle = async (handle) => {
  const userRef = admin.firestore().collection("users");
  const q = userRef.where("handle", "==", handle);
  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const ref = querySnapshot.docs[0].ref;
  const data = querySnapshot.docs[0].data();
  data.id = querySnapshot.docs[0].id;
  return {ref, data};
};

const addTweetsToFollowersTimeline = async (uid, followingData) => {
  const tweetsRef = admin.firestore().collection("tweets");
  const q = tweetsRef.where("uid", "==", followingData.id);
  const querySnapshot = await q.get();
  if (!querySnapshot.empty) {
    const tweets = querySnapshot.docs.map((doc) => doc.id);
    const timelineRef = admin.firestore().collection("notifications").doc(uid);
    const timeline = await timelineRef.get();
    if (timeline.exists) {
      await timelineRef.update({
        tweets: admin.firestore.FieldValue.arrayUnion(...tweets),
      });
    } else {
      await timelineRef.set({
        tweets: admin.firestore.FieldValue.arrayUnion(...tweets),
      });
    }
  }
};

const removeTweetsFromFollowersTimeline = async (uid, followingData) => {
  const tweetsRef = admin.firestore().collection("tweets");
  const q = tweetsRef.where("uid", "==", followingData.id);
  const querySnapshot = await q.get();
  if (!querySnapshot.empty) {
    const tweets = querySnapshot.docs.map((doc) => doc.id);
    const timelineRef = admin.firestore().collection("notifications").doc(uid);
    const timeline = await timelineRef.get();
    if (timeline.exists) {
      await timelineRef.update({
        tweets: admin.firestore.FieldValue.arrayRemove(...tweets),
      });
    }
  }
};

const addFollowNotification = async (uid, followingData) => {
  const notificationRef = admin
      .firestore()
      .collection("notifications")
      .doc(uid);
  const notification = await notificationRef.get();
  if (notification.exists) {
    await notificationRef.update({
      follows: admin.firestore.FieldValue.arrayUnion(followingData),
    });
  } else {
    await notificationRef.set({
      follows: admin.firestore.FieldValue.arrayUnion(followingData),
    });
  }
};

exports.followUser = functions.https.onCall(async (handle, context) => {
  const uid = context.auth.uid;
  const followerRef = admin.firestore().collection("users").doc(uid);
  const follower = await followerRef.get();
  if (!follower.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const {
    ref: followingRef,
    data: followingData,
  } = await fetchUserFromFireStoreByHandle(handle);
  const followingList = followingData.following;
  if (followingList.includes(uid)) {
    throw new functions
        .https
        .HttpsError("already-exists", "User already followed");
  }
  await followerRef.update({
    following: admin.firestore.FieldValue.arrayUnion(followingData.id),
  });
  await followingRef.update({
    followers: admin.firestore.FieldValue.arrayUnion(follower.id),
  });

  // Add tweets to follower's timeline
  await addTweetsToFollowersTimeline(uid, followingData);
  // add notification to following user
  await addFollowNotification(followingData.id, follower.data());

  return {message: "User followed successfully"};
});

exports.unfollowUser = functions.https.onCall(async (handle, context) => {
  const uid = context.auth.uid;
  const followerRef = admin.firestore().collection("users").doc(uid);
  const follower = await followerRef.get();
  if (!follower.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const {
    ref: followingRef,
    data: followingData,
  } = await fetchUserFromFireStoreByHandle(handle);
  const followersList = followingData.followers;
  if (!followersList.includes(uid)) {
    throw new functions
        .https
        .HttpsError("not-found", "User not followed");
  }
  await followerRef.update({
    following: admin.firestore.FieldValue.arrayRemove(followingData.id),
  });
  await followingRef.update({
    followers: admin.firestore.FieldValue.arrayRemove(uid),
  });
  // Add tweets to follower's timeline
  await removeTweetsFromFollowersTimeline(uid, followingData);
  return {message: "User unfollowed successfully"};
});

const updateFollowersAboutTweet = async (user, tweetRef, isRetweet=false) => {
  // Add tweet to followers' timeline
  const followers = user.data().followers;
  const notificationRef = admin.firestore().collection("notifications");
  const batch = admin.firestore().batch();
  const tweetId = isRetweet ? `${tweetRef.id}:${user.data().id}` : tweetRef.id;
  await Promise.all(followers.map(async (follower) => {
    const notificationDocRef = notificationRef.doc(follower);
    const notificationDocData = await notificationDocRef.get();
    if (!notificationDocData.exists) {
      batch.set(notificationDocRef, {
        tweets: admin.firestore.FieldValue.arrayUnion(tweetId),
      });
    } else {
      batch.update(notificationDocRef, {
        tweets: admin.firestore.FieldValue.arrayUnion(tweetId),
      });
    }
  }));
  await batch.commit();
};

const sendTweetFn = async (data, context) => {
  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const {tweet, replyRef, quoteRef, image} = data;
  const tweetRef = admin.firestore().collection("tweets").doc();
  await tweetRef.create({
    id: tweetRef.id,
    replyRef: replyRef,
    quoteRef: quoteRef,
    uid: uid,
    name: user.data().name,
    handle: user.data().handle,
    photoURL: user.data().photoURL,
    tweet,
    image,
    likes: [],
    comments: [],
    retweets: [],
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  // Add tweet to user's tweets
  await userRef.update({
    tweets: admin.firestore.FieldValue.arrayUnion(tweetRef.id),
    comments: replyRef && admin.firestore.FieldValue.arrayUnion(uid),
  });
  // update comments on reply tweet
  if (replyRef) {
    const replyTweetRef = admin.firestore().collection("tweets").doc(replyRef);
    const replyTweet = await replyTweetRef.get();
    if (!replyTweet.exists) {
      throw new functions.https.HttpsError("not-found", "Tweet not found");
    }
    await replyTweetRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(uid),
      replies: admin.firestore.FieldValue.arrayUnion(tweetRef.id),
    });
  }
  await updateFollowersAboutTweet(user, tweetRef);
  return {message: "Tweet sent successfully"};
};

exports.sendTweet = functions.https.onCall(sendTweetFn);

const checkIsloggedIn = (context) => {
  if (!context.auth) {
    throw new functions.https.
        HttpsError("unauthenticated", "Please login");
  }
  return true;
};

const fetchUserFromFireStoreById = async (uid) => {
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  return {ref: userRef, data: user.data()};
};

exports.getHomeTweets = functions.https.onCall(async (_, context) => {
  if (!checkIsloggedIn(context)) {
    return [];
  }
  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const notificationRef = admin.firestore().collection("notifications");
  const notificationDoc = await notificationRef.doc(uid).get();
  if (!notificationDoc.exists) {
    throw new functions.https.HttpsError("not-found", "No tweets found");
  }
  const tweets = notificationDoc.data().tweets || [];
  const tweetsRef = admin.firestore().collection("tweets");
  const homeTweets = [];
  await Promise.all(tweets.map(async (tweet) => {
    let retweetedBy = null;
    if (tweet.includes(":")) {
      const [tweetId, retweetedByRef] = tweet.split(":");
      tweet = tweetId;
      retweetedBy = await fetchUserFromFireStoreById(retweetedByRef);
    }
    const tweetSnapshot = await tweetsRef.doc(tweet).get();
    const tweetData = tweetSnapshot.data();
    if (retweetedBy) {
      tweetData.retweetedBy = retweetedBy.data;
      if (tweetData.retweetedBy.uid === uid) {
        tweetData.retweetedBy.name = "you";
      }
    }
    tweetData.isLikedByMe = tweetData.likes.includes(uid);
    tweetData.isRetweetedByMe = tweetData.retweets.includes(uid);
    homeTweets.push(tweetData);
  }));
  return homeTweets;
});

exports.getProfileTweets = functions.https.onCall(async (handle, context) => {
  if (!handle) {
    return [];
  }
  let user = null;
  let uid = null;
  if (context.auth) {
    uid = context.auth.uid;
    const userRef = admin.firestore().collection("users").doc(uid);
    user = await userRef.get();
    if (!user.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }
  }
  if (handle === "me") {
    handle = user.data().handle;
  }
  const {data} = await fetchUserFromFireStoreByHandle(handle);
  const tweets = data.tweets || [];
  const tweetsRef = admin.firestore().collection("tweets");
  const profileTweets = [];
  await Promise.all(tweets.map(async (tweet) => {
    let retweetedBy = null;
    if (tweet.includes(":")) {
      const [tweetId, retweetedByRef] = tweet.split(":");
      tweet = tweetId;
      retweetedBy = await fetchUserFromFireStoreById(retweetedByRef);
    }
    const tweetSnapshot = await tweetsRef.doc(tweet).get();
    const tweetData = tweetSnapshot.data();
    if (retweetedBy) {
      tweetData.retweetedBy = retweetedBy.data;
      if (tweetData.retweetedBy.uid === uid) {
        tweetData.retweetedBy.name = "you";
      }
    }
    tweetData.isLikedByMe = tweetData.likes.includes(uid);
    tweetData.isRetweetedByMe = tweetData.retweets.includes(uid);
    profileTweets.push(tweetData);
  }));
  return profileTweets;
});

exports.likeTweet = functions.https.onCall(async (tweetId, context) => {
  if (!checkIsloggedIn(context)) {
    return null;
  }
  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const tweetRef = admin.firestore().collection("tweets").doc(tweetId);
  const tweet = await tweetRef.get();
  if (!tweet.exists) {
    throw new functions.https.HttpsError("not-found", "Tweet not found");
  }
  const tweetData = tweet.data();
  const likes = tweetData.likes;
  if (likes.includes(uid)) {
    // remove like from tweet
    await tweetRef.update({
      likes: admin.firestore.FieldValue.arrayRemove(uid),
    });
  } else {
    await tweetRef.update({
      likes: admin.firestore.FieldValue.arrayUnion(uid),
    });
    // update notification to add likes
    const notificationRef = admin.firestore().collection("notifications");
    const notificationDoc = await notificationRef.doc(tweet.data().uid).get();
    const likeInfo = {
      tweetId: tweetId,
      tweet: tweetData.tweet,
      uid: uid,
      name: user.data().name,
      handle: user.data().handle,
      photoURL: user.data().photoURL,
    };
    if (!notificationDoc.exists) {
      await notificationRef.doc(tweet.data().uid).set({
        likes: admin.firestore.FieldValue.arrayUnion(likeInfo),
      });
    } else {
      await notificationRef.doc(tweet.data().uid).update({
        likes: admin.firestore.FieldValue.arrayUnion(likeInfo),
      });
    }
  }
  const updatedTweetRef = await tweetRef.get();
  const updatedTweetData = updatedTweetRef.data();
  updatedTweetData.isLikedByMe = updatedTweetData.likes.includes(uid);
  updatedTweetData.isRetweetedByMe = updatedTweetData.retweets.includes(uid);
  return updatedTweetData;
});

exports.retweet = functions.https.onCall(async (tweetId, context) => {
  if (!checkIsloggedIn(context)) {
    return null;
  }
  const uid = context.auth.uid;
  const userRef = admin.firestore().collection("users").doc(uid);
  const user = await userRef.get();
  if (!user.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }
  const tweetRef = admin.firestore().collection("tweets").doc(tweetId);
  const tweet = await tweetRef.get();
  if (!tweet.exists) {
    throw new functions.https.HttpsError("not-found", "Tweet not found");
  }

  const tweetData = tweet.data();

  const retweets = tweetData.retweets;
  if (retweets.includes(uid)) {
    // remove retweet from tweet
    await tweetRef.update({
      retweets: admin.firestore.FieldValue.arrayRemove(uid),
    });
  } else {
    await tweetRef.update({
      retweets: admin.firestore.FieldValue.arrayUnion(uid),
    });
    updateFollowersAboutTweet(user, tweetRef, "retweet");
    const notificationRef = admin.firestore().collection("notifications");
    const notificationDoc = await notificationRef.doc(tweet.data().uid).get();
    const retweetInfo = {
      tweetId: tweetId,
      tweet: tweetData.tweet,
      uid: uid,
      name: user.data().name,
      handle: user.data().handle,
      photoURL: user.data().photoURL,
    };
    if (!notificationDoc.exists) {
      await notificationRef.doc(tweet.data().uid).set({
        retweets: admin.firestore.FieldValue.arrayUnion(retweetInfo),
      });
    } else {
      await notificationRef.doc(tweet.data().uid).update({
        retweets: admin.firestore.FieldValue.arrayUnion(retweetInfo),
      });
    }
  }
  const updatedTweetRef = await tweetRef.get();
  const updatedTweetData = updatedTweetRef.data();
  updatedTweetData.isRetweetedByMe = updatedTweetData.retweets.includes(uid);
  updatedTweetData.isLikedByMe = updatedTweetData.likes.includes(uid);
  return updatedTweetData;
});

exports.getExploreTweets = functions.https.onCall(async (_, context) => {
  const uid = context&&context.auth&&context.auth.uid;
  const tweetsRef = admin.firestore().collection("tweets");
  const tweets = await tweetsRef.orderBy("timestamp", "desc").get();
  const exploreTweets = [];
  await Promise.all(
      tweets.docs.map(async (tweet) => {
        const tweetData = tweet.data();
        if (uid) {
          tweetData.isLikedByMe = tweetData.likes.includes(uid);
          tweetData.isRetweetedByMe = tweetData.retweets.includes(uid);
        }
        exploreTweets.push(tweetData);
      }),
  );
  return exploreTweets;
});
