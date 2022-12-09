import { XCircleIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Head from 'next/head';
import router from 'next/router';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import Tweet from '../components/Tweet';
import TweetInput from '../components/TweetInput';
import Loading from '../components/ui-blocks/loading';
import { getFirebaseInstance } from '../hooks/useComponentWithFirebase';
import useTweets from '../hooks/useTweets';

export default function Home() {
  const { tweets, loading, error, refresh, likeTweet, retweet } = useTweets();
  const noTweets = tweets?.length === 0 && !loading;
  useEffect(() => { 
    return getFirebaseInstance('auth').onAuthStateChanged((user) => {
      if (!user) {
        router.push('/explore');
      }
    });
  }, []);
  return (
    <Layout page={'home'}>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='h-full relative'>
        <h1 className='text-xl mt-2 text-sky-500 font-semibold p-2 ml-4'>Home</h1>
        <div className='ml-2 mt-2 mr-2 hidden sm:block'>
          <TweetInput />
        </div>
        { noTweets && (
          <div className={classNames('absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-end items-center w-fit h-2/4 text-slate-500 text-sm p-12 m-auto text-center')}>
            <XCircleIcon className='w-10 mb-2 text-slate-300' />
            We’re sorry we don’t have tweets to show now.
          </div>
        )}
        {!loading && error && <div className='text-red-500 p-4 text-center border-b border-t'>{error.message}</div>}
        <div className='hover:bg-slate-100 p-4 text-center text-sky-400 border-b border-t cursor-pointer' onClick={refresh}>
          {loading ? (<Loading className={'w-5 h-5 text-sky-500 !border-2'} />): "Load more tweets"}
        </div>
        {tweets.map((tweet,index) => (
          <Tweet
            onClick={() => {
              router.push({
                pathname: `/${tweet.handle}/status/${tweet.id}`,
                query: { ...router.query, retweetBy: tweet.retweetedBy?.name }
            });
            }}
            key={tweet.id+index}
            tweet={tweet}
            likeTweet={likeTweet}
            retweet={retweet}
          />
        ))}
      </main>
    </Layout>
  )
}
