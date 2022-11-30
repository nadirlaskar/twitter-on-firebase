import classNames from 'classnames';
import Link from 'next/link';
import CommentIcon from '../components/icons/Comment';
import LikeIcon from '../components/icons/Like';
import RetweetIcon from '../components/icons/Retweet';

const getReadableTime = (timestamp) => {
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


export const Tweet = ({ tweet, likeTweet, retweet}) => {
  const readableTime = getReadableTime(tweet.timestamp?._seconds * 1000);
  const fallbackurl = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${tweet.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}`;
  return (
    <div className='flex flex-col border-b border-slate-200 hover:bg-slate-100/60'>
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
          <div className='flex items-center justify-between mt-2 relative -left-2'>
            <button className='flex items-center text-slate-500 hover:text-sky-400 group text-sm'>
              <CommentIcon className='w-9 h-9 p-2 rounded-full group-hover:bg-sky-500/10 mr-2' />
              <span>{tweet.comments?.length || ''}</span>
            </button>
            <button
              onClick={() => retweet(tweet.id)}
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
              onClick={() => { likeTweet(tweet.id); }}
              className={classNames(
                'flex items-center text-slate-500 hover:text-pink-500 ml-4 group text-sm',
                {
                  'text-pink-500': tweet.isLikedByMe,
                }
              )}
            >
              <LikeIcon
                filled={tweet.isLikedByMe}
                className={classNames(
                  'w-9 h-9 p-2 rounded-full group-hover:bg-pink-500/10 mr-2',
  
                )}
              />
              <span>{tweet.likes?.length || ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tweet;