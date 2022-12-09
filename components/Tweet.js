import { XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CommentIcon from '../components/icons/Comment';
import LikeIcon from '../components/icons/Like';
import RetweetIcon from '../components/icons/Retweet';
import { getFirebaseInstance } from '../hooks/useComponentWithFirebase';
import TweetInput from './TweetInput';
import Modal from './ui-blocks/popup';

const getReadableTime = (timestamp) => {
  timestamp = (timestamp._seconds || timestamp.seconds)*1000;
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / 1000 / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 30) {
    return `${diffInDays}d`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}m`;
  } else {
    return `${diffInYears}y`;
  }
};

import { useRouter } from 'next/router';
import { useMemo } from "react";
import Loading from "../components/ui-blocks/loading";
import useTweet from "../hooks/useTweet";


export const TweetItem = ({className, tweetId, showReplies=false, retweetBy, showReplyTo, onClick }) => { 
  const { tweet, likeTweet, retweet, loading } = useTweet(tweetId);
  if (retweetBy && !tweet?.retweetedBy && tweet) {
    tweet.retweetedBy = { name: retweetBy }
  }
  const replies = useMemo(() => (
    showReplies&&tweet?.replies?.map((reply) => {
        return (
          <TweetItem
              key={reply}
              tweetId={reply}
              showReplies={false}
              isReply={true}
            />
        )
      })
  ), [showReplies, tweet?.replies, tweet?.handle]);
  return (
    <div onClick={onClick}>
      {tweet && (
        <Tweet
          tweet={tweet}
          likeTweet={likeTweet}
          retweet={retweet}
          showReplyTo={showReplyTo}
          className={className}
        />
      )}
      {loading && <Loading className={'text-sky-400 w-4 h-4 p-4'} />}
      {replies}
    </div>
  );
}


export const Tweet = ({ tweet, likeTweet, retweet, readonly, className, showReplyTo = false }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isLikedByMe, setLike] = useState(tweet.isLikedByMe);
  const router = useRouter();
  useEffect(() => {
    setLike(tweet.isLikedByMe??false);
  }, [tweet.isLikedByMe]);
  const [isRetweetedByMe, setRetweeted] = useState(tweet.isRetweetedByMe);
  useEffect(() => {
    setRetweeted(tweet.isRetweetedByMe??false);
  }, [tweet.isRetweetedByMe]);
  const readableTime = getReadableTime(tweet.timestamp);
  const fallbackurl = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${tweet.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}`;
  const isLoggedIn = getFirebaseInstance('auth').currentUser !== null;
  const [replyTo, setReplyTo] = useState(null);
  useEffect(() => {
    if (tweet?.replyRef && showReplyTo) {
      const db = getFirebaseInstance('firestore');
      getDoc(doc(db, 'tweets', tweet.replyRef)).then((doc) => {
        if (doc.exists()) {
          setReplyTo(doc.data());
        }
      });
    }
  }, [tweet?.replyRef, showReplyTo]);
  return (
  <>
    <div>
      {replyTo && <>
        <TweetItem tweetId={tweet?.replyRef} showReplies={false} showReplyTo={false}  className='!border-none' />
        <div className='text-sm pl-9 ml-9 h-14 border-l-2 flex items-center -mt-12 text-slate-500'/>
      </>}
    </div>
    {!readonly && (
      <Modal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        title={
          <div className='mt-2 mx-2' onClick={() => { 
            setShowCommentModal(false);
          }}>
            <XMarkIcon className='w-9 h-9 text-slate-500 hover:bg-slate-100 p-2 rounded-full' />
          </div>
        }>
        <div className='flex flex-col'>
          <Tweet tweet={tweet} readonly={true} className='!border-none' />
          <div className='text-sm pl-9 ml-9 h-14 border-l-2 flex items-center -mt-3 text-slate-500'>
            Replying to <span className='text-sky-400 ml-1'> @{tweet.handle}</span>
          </div>
          <div className='mx-1'>
            <TweetInput replyTo={tweet.id} onTweetSent={() => {
              setShowCommentModal(false);
            }} />
          </div>
        </div>
      </Modal>
    )}
    <div onClick={() => { router.push(`/${tweet.handle}/status/${tweet.id}`); }}
      className={classNames(
      'flex flex-col border-b border-slate-200 hover:bg-slate-100/60',
      className
    )}>
      {tweet.retweetedBy && (
        <div className='flex pt-4 px-2 items-center w-full text-sm text-slate-500 font-semibold ml-8'>
          <RetweetIcon className={'w-4 h-4 mr-2'}/>
          {tweet.retweetedBy?.name} retweeted
        </div>
      )}
        <div className='flex items-start p-3 w-full'>
          <Link href={'/'+tweet.handle}>
            <img onClick={e=>e.stopPropagation()} className='w-12 h-12 rounded-full mr-3' src={tweet.photoURL||fallbackurl} alt='avatar' onError={
              (e) => {
                e.target.onerror = null;
                e.target.src = fallbackurl;
              }
            } />
          </Link>
        <div className='pr-2 w-full max-w-xs pb-1'>
          <div className='flex items-center flex-wrap' onClick={e=>e.stopPropagation()}>
            <Link href={'/'+tweet.handle}>
              <h3 className='text-md font-semibold hover:underline mr-2'>{tweet.name}</h3>
            </Link>
            <span className='text-slate-500 text-sm'>@{tweet.handle} · </span>
            <span className='text-slate-500 text-sm'>{readableTime}</span>
          </div>
          {replyTo && (
            <div className='flex my-2 items-center w-full text-sm text-slate-500'>
              Replying to
              <Link href={`/${replyTo.handle}`}>
                <span className='text-sky-400 hover:underline ml-1'>
                    @{replyTo?.handle}
                </span>
              </Link>
            </div>
          )}
          <div className='text-slate-900 text-md'>
            <p>{tweet.tweet}</p>
          </div>
          {!readonly&&(
            <div className='flex items-center justify-between mt-2 relative -left-2'>
              <button
                disabled={!isLoggedIn}
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCommentModal(true);
                }}
                className={classNames(
                'disabled:text-slate-300 disabled:cursor-not-allowed disabled:pointer-events-none',
                'flex items-center text-slate-500 hover:text-sky-400 group text-sm',
                {
                  '!text-sky-400': tweet.isCommentedByMe
                }
              )}>
              <CommentIcon
                className='w-9 h-9 p-2 rounded-full group-hover:bg-sky-500/10 mr-2'
              />
              <span>{tweet.comments?.length || ''}</span>
            </button>
              <button
              disabled={tweet.isRetweetedByMe !== isRetweetedByMe || !isLoggedIn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRetweeted(true);  
                retweet(tweet.id)
              }}
              className={classNames(
                'disabled:text-slate-300 disabled:cursor-not-allowed disabled:pointer-events-none',
                'flex items-center text-slate-500 hover:text-green-400 ml-4 group text-sm',
                {
                  'text-green-400': tweet.isRetweetedByMe,
                }
              )}
            >
              <RetweetIcon className='w-9 h-9 p-2 rounded-full group-hover:bg-green-500/10 mr-2'/>
              <span>{tweet.retweets?.length || ''}</span>
            </button>
              <button
              disabled={tweet.isLikedByMe !== isLikedByMe || !isLoggedIn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLike(!isLikedByMe);
                likeTweet(tweet.id);
              }}
              className={classNames(
                'disabled:text-slate-300 disabled:cursor-not-allowed disabled:pointer-events-none',
                'flex items-center text-slate-500 hover:text-pink-500 ml-4 group text-sm',
                {
                  'text-pink-500': isLikedByMe,
                }
              )}
            >
              <LikeIcon
                filled={isLikedByMe}
                className={classNames(
                  'w-9 h-9 p-2 rounded-full group-hover:bg-pink-500/10 mr-2',
  
                )}
              />
              <span>{tweet.likes?.length || ''}</span>
            </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </>)
}

export default Tweet;