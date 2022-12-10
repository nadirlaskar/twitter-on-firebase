import { collection, doc, endAt, getDoc, getDocFromCache, getDocFromServer, getDocs, getDocsFromCache, getDocsFromServer, orderBy, query, startAt, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFirebaseInstance } from "../hooks/useComponentWithFirebase";

export const getDocWithLog = async (ref, fromServer = false) => {
  let doc = null;
  try {
    doc = await (fromServer ? getDocFromServer(ref) : getDocFromCache(ref));
  }catch(err) {
    console.error(err);
  }
  if (!doc?.exists()) { 
    doc = await getDoc(ref);
  }
  const source = doc.metadata.fromCache ? "cache" : "server";
  console.debug(ref?.path,":  " + source);
  return doc;
}

export const searchUserByHandleFromFirebase = async (myQ) => {
  const db = getFirebaseInstance('firestore');
  const ref = collection(db, "users"); 
  const nameQ = query(ref, orderBy('handle'), startAt(myQ), endAt(myQ + '\uf8ff'));
  const handleQ = query(ref, orderBy('name'), startAt(myQ), endAt(myQ+'\uf8ff'));
  const nameQSnapshot = await getDocs(nameQ);
  const handleQSnapshot = await getDocs(handleQ);
  const data = {}
  handleQSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  nameQSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  return Object.values(data);
}

export const followUserFirebase = async (handle) => {
  const functions = getFirebaseInstance('functions');
  const followUser = httpsCallable(functions, 'followUser');
  try {
    const result = await followUser(handle);
    return ['success', result.data];
  }
  catch (err) {
    return ['error', err];
  }
}

export const unfollowUserFirebase = async (handle) => {
  const functions = getFirebaseInstance('functions');
  const unfollowUser = httpsCallable(functions, 'unfollowUser');
  try {
    const result = await unfollowUser(handle);
    return ['success', result.data];
  }
  catch (err) {
    return ['error', err];
  }
}

export const loadUserProfiles = async (ids) => {
  // load user profiles from firestore
  const db = getFirebaseInstance('firestore');
  const ref = collection(db, "users");
  const q = query(ref, where('id', 'in', ids));
  const qSnapshot = await getDocs(q);
  const data = {}
  qSnapshot.forEach((doc) => {
    data[doc.id] = ({
      id: doc.id,
      ...doc.data(),
    });
  });
  return Object.values(data);
}

export const sendTweet = async (tweet, replyTo = null) => {
  const functions = getFirebaseInstance('functions');
  const sendTweet = httpsCallable(functions, 'sendTweet');
  const result = await sendTweet({ tweet, replyRef: replyTo });
  return result.data;
}

const fetchUserFromFireStoreById = async (db, uid) => {
  const userRef = doc(db,"users",uid);
  const user = await getDocWithLog(userRef);
  if (!user.exists) {
    throw new Error("not-found", "User not found");
  }
  return {ref: userRef, data: user.data()};
};

const homeTweetsFromFirestore = async (db, context, fetchFromServer) => {
  const uid = context.auth?.uid;
  if (!uid) return [];
  const userRef = doc(db, "users", uid);
  const user = await getDocWithLog(userRef)
  if (!user.exists) { 
    throw new Error("not-found", "User not found");
  }
  const notificationDoc = await getDocWithLog(doc(db,"notifications", uid), fetchFromServer);
  if (!notificationDoc.exists) {
    throw new Error("not-found", "No tweets found");
  }
  const tweets = notificationDoc.data().tweets || [];

  const homeTweets = [];
  await Promise.all(tweets.map(async (tweet) => {
    let retweetedBy = null;
    if (tweet.includes(":")) {
      const [tweetId, retweetedByRef] = tweet.split(":");
      tweet = tweetId;
      retweetedBy = await fetchUserFromFireStoreById(db,retweetedByRef);
    }
    const tweetSnapshot = await getDocWithLog(doc(db,"tweets",tweet),fetchFromServer)
    const tweetData = tweetSnapshot.data();
    tweetData.id = tweetSnapshot.id;
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
}

// call firebase function getHomeTweets
export const getHomeTweets = async (fetchFromServer = false) => {
  const db = getFirebaseInstance('firestore');
  const auth = getFirebaseInstance('auth');
  const result = await homeTweetsFromFirestore(db, { auth: auth.currentUser }, fetchFromServer);
  return {data: result};
}

const fetchUserFromFireStoreByHandle = async (db,handle) => {
  const userRef = collection(db,"users");
  const q = query(userRef, where("handle", "==", handle));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error("not-found", "User not found");
  }
  const ref = querySnapshot.docs[0].ref;
  const data = querySnapshot.docs[0].data();
  data.id = querySnapshot.docs[0].id;
  return {ref, data};
};

const getProfileTweetsFromFirestore = async (db, context, handle, fetchFromServer = false) => {
  if (!handle) {
    return [];
  }
  let user = null;
  let uid = null;
  if (context.auth) {
    uid = context.auth.uid;
    const userRef = doc(db,"users",uid);
    user = await getDocWithLog(userRef);
    if (!user.exists) {
      throw new Error("not-found", "User not found");
    }
  }
  if (handle === "me") {
    handle = user.data().handle;
  }
  const {data} = await fetchUserFromFireStoreByHandle(db,handle);
  const tweets = data.tweets || [];
  const profileTweets = [];
  await Promise.all(tweets.map(async (tweet) => {
    let retweetedBy = null;
    if (tweet.includes(":")) {
      const [tweetId, retweetedByRef] = tweet.split(":");
      tweet = tweetId;
      retweetedBy = await fetchUserFromFireStoreById(retweetedByRef);
    }
    const tweetSnapshot = await getDocWithLog(doc(db,"tweets",tweet), fetchFromServer);
    const tweetData = tweetSnapshot.data();
    tweetData.id = tweetSnapshot.id;
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
}

// call firebase function getHomeTweets
export const getProfileTweets = async (handle = 'me', fetchFromServer=false) => {
  const db = getFirebaseInstance('firestore');
  const auth = getFirebaseInstance('auth');
  const result = await getProfileTweetsFromFirestore(db, { auth: auth.currentUser }, handle, fetchFromServer);
  return {data: result};
}

export const likeTweet = async (tweetId) => {
  const functions = getFirebaseInstance('functions');
  const likeTweet = httpsCallable(functions, 'likeTweet');
  const result = await likeTweet(tweetId);
  return result.data;
}

export const retweet = async (tweetId) => {
  const functions = getFirebaseInstance('functions');
  const retweet = httpsCallable(functions, 'retweet');
  const result = await retweet(tweetId);
  return result.data;
}

const getExploreTweetsFromFirestore = async (db, context, fetchFromServer = false) => {
  const uid = context?.auth?.uid;
  const tweetsRef = collection(db, "tweets");
  const tweetsQuery = query(tweetsRef, orderBy("timestamp", "desc"));
  let tweets = await ( fetchFromServer ?  getDocsFromServer(tweetsQuery) :  getDocsFromCache(tweetsQuery) );
  if (tweets.empty) { 
    tweets = await getDocsFromServer(tweetsQuery);
  }
  const exploreTweets = [];
  console.debug(tweetsRef.path, ':  ', tweets.metadata.fromCache ? 'cache' : 'server' );
  await Promise.all(
      tweets.docs.map(async (tweetSnap) => {
        const tweetData = tweetSnap.data();
        tweetData.id = tweetSnap.id;
        if (uid) {
          tweetData.isLikedByMe = tweetData.likes.includes(uid);
          tweetData.isRetweetedByMe = tweetData.retweets.includes(uid);
        }
        exploreTweets.push(tweetData);
      }),
  );
  return exploreTweets;
}

export const getExploreTweets = async (fetchFromServer=false) => {
   const db = getFirebaseInstance('firestore');
  const auth = getFirebaseInstance('auth');
  const result = await getExploreTweetsFromFirestore(db, { auth: auth.currentUser },fetchFromServer);
  return {data: result};
}
