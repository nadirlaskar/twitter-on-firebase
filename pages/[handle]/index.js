import { XCircleIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../../components/Layout";
import ProfileHeader from "../../components/ProfileHeader";
import { Tweet } from "../../components/Tweet";
import Loading from "../../components/ui-blocks/loading";
import useProfile from "../../hooks/useProfile";
import useTweets from "../../hooks/useTweets";

export function Profile() {
  const router = useRouter()
  const { handle: profileHandle } = router.query
  const [_status, user] = useProfile('me');
  useEffect(() => { 
    if (user && profileHandle === 'me') {
      router.replace('/'+handle)
    }
  }, [user])
  const handle = profileHandle === 'me' ? user?.handle : profileHandle
  const { tweets, loading, error, refresh, likeTweet, retweet } = useTweets(handle);
  const noTweets = tweets?.length === 0 && !loading;
  const isMyProfile = user?.handle === handle || profileHandle === 'me';
  return (
    <Layout page={'profile'}>
      <Head>
        <title>{profileHandle?`${profileHandle}'s Profile`:'Loading...'}</title>
      </Head>
      <main>
        <ProfileHeader profileHandle={profileHandle} allowEdit={isMyProfile} />
        <div className="relative">
          {!loading && error && <div className='text-red-500 p-4 text-center border-b border-t'>{error.message}</div>}
          <div className='hover:bg-slate-100 p-4 text-center text-sky-400 border-b border-t cursor-pointer' onClick={refresh}>
            {loading ? (<Loading className={'w-5 h-5 text-sky-500 !border-2'} />): "Load more tweets"}
          </div>
          {tweets.map((tweet,index) => (
            <Tweet
              onClick={() => {
                router.push(`/${tweet.handle}/status/${tweet.id}`);
              }}
              key={tweet.id+index}
              tweet={tweet}
              likeTweet={likeTweet}
              retweet={retweet}
              showReplyTo={true}
            />
          ))}
          { noTweets && (
            <div className={classNames('flex flex-col justify-end items-center w-fit h-2/4 text-slate-500 text-sm p-12 m-auto text-center')}>
              <XCircleIcon className='w-10 mb-2 text-slate-300' />
              We’re sorry we don’t have tweets to show now.
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}

export default Profile;