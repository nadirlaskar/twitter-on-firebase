import { XMarkIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CommentIcon from '../components/icons/Comment';
import LikeIcon from '../components/icons/Like';
import RetweetIcon from '../components/icons/Retweet';
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


export const Tweet = ({ onClick, tweet, likeTweet, retweet, readonly, className }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isLikedByMe, setLike] = useState(tweet.isLikedByMe);
  useEffect(() => {
    setLike(tweet.isLikedByMe??false);
  }, [tweet.isLikedByMe]);
  const [isRetweetedByMe, setRetweeted] = useState(tweet.isRetweetedByMe);
  useEffect(() => {
    setRetweeted(tweet.isRetweetedByMe??false);
  }, [tweet.isRetweetedByMe]);
  const readableTime = getReadableTime(tweet.timestamp);
  const fallbackurl = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${tweet.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}`;
  return (
    <div onClick={onClick} className={classNames(
      'flex flex-col border-b border-slate-200 hover:bg-slate-100/60',
      className
    )}>
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
      {tweet.retweetedBy && (
        <div className='flex pt-4 px-2 items-center w-full text-sm text-slate-500 font-semibold ml-8'>
          <RetweetIcon className={'w-4 h-4 mr-2'}/>
          {tweet.retweetedBy?.name} retweeted
        </div>
      )}
      <div className='flex items-start p-3 w-full'>
        <img className='w-12 h-12 rounded-full mr-3' src={tweet.photoURL||fallbackurl} alt='avatar' onError={
          (e) => {
            e.target.onerror = null;
            e.target.src = fallbackurl;
          }
        }/>
        <div className='pr-2 w-full max-w-xs pb-1'>
          <div className='flex items-center flex-wrap'>
            <Link href={'/'+tweet.handle}>
              <h3 className='text-md font-semibold hover:underline mr-2'>{tweet.name}</h3>
            </Link>
            <span className='text-slate-500 text-sm'>@{tweet.handle} · </span>
            <span className='text-slate-500 text-sm'>{readableTime}</span>
          </div>
          <div className='text-slate-900 text-md'>
            <p>{tweet.tweet}</p>
          </div>
          {!readonly&&(
            <div className='flex items-center justify-between mt-2 relative -left-2'>
              <button className={classNames(
                'flex items-center text-slate-500 hover:text-sky-400 group text-sm',
                {
                  '!text-sky-400': tweet.isCommentedByMe
                }
              )}>
              <CommentIcon
                onClick={(e) => { 
                  e.stopPropagation();
                  setShowCommentModal(true);
                }}
                className='w-9 h-9 p-2 rounded-full group-hover:bg-sky-500/10 mr-2'
              />
              <span>{tweet.comments?.length || ''}</span>
            </button>
              <button
              disabled={tweet.isRetweetedByMe !== isRetweetedByMe}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRetweeted(true);  
                retweet(tweet.id)
              }}
              className={classNames(
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
              disabled={tweet.isLikedByMe !== isLikedByMe}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLike(!isLikedByMe);
                likeTweet(tweet.id);
              }}
              className={classNames(
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
  )
}

export default Tweet;