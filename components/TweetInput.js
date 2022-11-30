import classNames from "classnames";
import { useRef, useState } from "react";
import useComponentWithFirebase from "../hooks/useComponentWithFirebase";
import useProfile from "../hooks/useProfile";
import { sendTweet } from "../libs/firebase.util";
import Loading from "./ui-blocks/loading";

const TweetInput = ({ MAX=60, onTweetSent}) => {
  const [status, user] = useProfile('me');
  const [tweet, setTweet] = useState('');
  const tweetref = useRef(null);
  const [sendingTweet, setSendingTweet] = useState(false);
  const initial = user?.name.split(' ').map((n) => n[0]).join('')
  const fallabckImage = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${initial?.toUpperCase()}`;
  console.log('Tweet ref', tweetref);
  return (
    <div className="p-2 w-full">
      {status === 'loading' && <Loading className={classNames('w-10 text-sky-500')} />}
      {status === 'success' && user && (
        <div className="flex flex-row items-start">
          <img
            className="rounded-full w-12 h-12"
            src={user.photoURL||fallabckImage}
            alt={user?.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallabckImage
            }}
          />
          <div className={classNames("flex flex-col ml-4 w-full relative group h-full mt-2")}>
            <div
              ref={tweetref}
              className="outline-none text-lg max-w-xl flex-wrap group z-30 h-fit text-plain"
              contentEditable="true"
              onInput={(e) => { setTweet(e.target.innerText); return false; }}
              onPaste={(e) => {
                e.preventDefault();
                // get text representation of clipboard
                var text = (e.originalEvent || e).clipboardData.getData('text/plain');
                // insert text manually
                document.execCommand("insertHTML", false, text);
                return false;
              }}
            />
            <span className={classNames(
              {'hidden': tweet.length>0},
              "text-slate-600 absolute text-lg"
            )}>What's happening?</span>
            <div className={classNames(
              'flex mt-6 border-t py-4 justify-end items-center border-slate-200',
              {
                'border-none': tweet.length===0
              }
            )}>
              <span className={classNames(
                {
                  'text-red-600': tweet.length > MAX,
                  'text-green-500': tweet.length <= MAX
                },
                "inline-block text-sm text-slate-400"
              )}>{MAX-tweet.length}</span><span className="inline-block mr-2 text-sm text-slate-400">{'\u00A0'}/ {MAX}</span>
              <button
                disabled={
                  tweet.length > MAX
                  || tweet.length === 0
                  || sendingTweet
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSendingTweet(true);
                  tweet.length > 0 && sendTweet(tweet).then(() => {
                    setTweet('')
                    if(tweetref.current) tweetref.current.innerHTML = '';
                    setSendingTweet(false);
                    onTweetSent && onTweetSent();
                  }).catch((e) => {
                    console.error(e);
                    setSendingTweet(false);
                  });
                }}
                className={classNames(
                "disabled:bg-slate-200",
                "bg-sky-500 text-white rounded-full px-4 py-2 text-sm w-fit",
              )}>Tweet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default (props = {}) => {
  const withAuth = (innerProps) => useComponentWithFirebase('auth', TweetInput, innerProps);
  return useComponentWithFirebase('firestore', withAuth, props);
}