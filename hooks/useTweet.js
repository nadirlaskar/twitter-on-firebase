import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseInstance } from "./useComponentWithFirebase";

const { useEffect, useCallback, useState } = require("react");
const { likeTweet, retweet } = require("../libs/firebase.util");

const useTweet = (tweetId) => { 
  // fetch notifications from firebase functions
  const [tweet, setTweet] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getFirebaseInstance('auth')?.currentUser;

  // load tweet from tweet collection firestore
  useEffect(() => {
    if (tweetId) {
      const db = getFirebaseInstance('firestore');
      setLoading(true);
      const docRef = doc(db, "tweets", tweetId);
      return onSnapshot(docRef, (docSnap) => {
        const tweetData = docSnap.data();
        console.debug(docRef.path, docSnap.metadata.fromCache ? ":  cached" : ":  server");
        setTweet({
          id: docRef.id,
          ...tweetData,
          isLikedByMe: tweetData?.likes?.includes(user?.uid),
          isCommentedByMe: tweetData?.comments?.includes(user?.uid),
          isRetweetedByMe: tweetData?.retweets?.includes(user?.uid),
        });
        setLoading(false);
      });
    }
  }, [tweetId, user?.uid]);

  // clear error after 2s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const likeTweetHandle = useCallback(() => {
    return likeTweet(tweetId).then((updatedTweet) => {
        setTweet((tweet)=>({
            ...tweet,
            ...updatedTweet
        }));
      }).catch(err => {
        setError(err)
      });
  }, [setTweet]);

  const handleRetweet = useCallback(() => {
    return retweet(tweetId).then((updatedTweet) => {
      setTweet((tweet)=>({
        ...tweet,
        ...updatedTweet
      }));
    }).catch(err => {
      setError(err)
    })
  }, [setTweet]);

  return { tweet, loading, error, likeTweet: likeTweetHandle, retweet: handleRetweet };

}

export default useTweet;