import { getFirebaseInstance } from "./useComponentWithFirebase";

const { useEffect, useCallback, useState } = require("react");
const { getHomeTweets, likeTweet, getProfileTweets, retweet, getExploreTweets } = require("../libs/firebase.util");

const useTweets = (handle) => { 
  // fetch notifications from firebase functions
  const [tweets, setTweets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getFirebaseInstance('auth')?.currentUser;

  // clear error after 2s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const likeTweetHandle = useCallback((tweetId) => {
    return likeTweet(tweetId).then((updatedTweet) => {
      setTweets((tweets) => {
        tweets.forEach((tweet, index) => {
          if (tweet.id === updatedTweet.id) {
            tweets[index] = {
              ...tweets[index],
              ...updatedTweet
            };
          }
        });
        return [...tweets];
      })
     }).catch(err => {
        setError(err)
      });
  }, [setTweets, user]);

  const handleRetweet = useCallback((tweetId) => {
    return retweet(tweetId).then((updatedTweet) => {
      setTweets((tweets) => {
        const index = tweets.findIndex((tweet) => tweet.id === updatedTweet.id);
        tweets[index] = updatedTweet;
        return [...tweets];
      });
    }).catch(err => {
      setError(err)
    })
  }, [setTweets, user]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    const successFn = (tweets) => {
      const tweetsData = tweets.data;
      setTweets(tweetsData.sort((a, b) => b.timestamp?._seconds - a.timestamp?._seconds));
    };
    const errorFn = (err) => {
        setError(err);
    }
    const finallyFn = () => {
      setLoading(false);
    }
    if (handle === 'explore') { 
      getExploreTweets().then(successFn).catch(errorFn).finally(finallyFn);
      getExploreTweets(true).then(successFn).catch(errorFn).finally(finallyFn);
    } else if (handle) {
      getProfileTweets(handle).then(successFn).catch(errorFn).finally(finallyFn);
      getProfileTweets(handle,true).then(successFn).catch(errorFn).finally(finallyFn);
    } else {
      getHomeTweets().then(successFn).catch(errorFn).finally(finallyFn);
      getHomeTweets(true).then(successFn).catch(errorFn).finally(finallyFn);
    }
  }, [setLoading, setTweets, setError, handle, user]);

  useEffect(() => { refresh();}, [refresh]);

  return { tweets, loading, error, refresh, likeTweet: likeTweetHandle, retweet: handleRetweet };

}

export default useTweets;