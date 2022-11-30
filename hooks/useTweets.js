import { getFirebaseInstance } from "./useComponentWithFirebase";

const { useEffect, useCallback, useState } = require("react");
const { getHomeTweets, likeTweet, getProfileTweets, retweet } = require("../libs/firebase.util");

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
    if (handle) {
      getProfileTweets(handle).then((tweets) => {
        const tweetsData = tweets.data;
        setTweets(tweetsData.sort((a, b) => b.timestamp?._seconds -  a.timestamp?._seconds));
      }).catch((err) => {
        setError(err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      return getHomeTweets().then((tweets) => {
        let tweetsData = tweets.data;
        setTweets(tweetsData.sort((a, b) => b.timestamp?._seconds -  a.timestamp?._seconds));
      }).catch((err) => {
        setError(err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [setLoading, setTweets, setError, handle, user]);

  useEffect(() => { refresh();}, [refresh]);

  return { tweets, loading, error, refresh, likeTweet: likeTweetHandle, retweet: handleRetweet };

}

export default useTweets;