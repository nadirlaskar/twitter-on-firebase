import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Layout from "../../../components/Layout";
import Tweet from "../../../components/Tweet";
import Loading from "../../../components/ui-blocks/loading";
import useComponentWithFirebase from "../../../hooks/useComponentWithFirebase";
import useTweet from "../../../hooks/useTweet";


const TweetItem = ({tweetId, showComments=false, retweetBy, isReply = false }) => { 
  const { tweet, likeTweet, retweet, loading } = useTweet(tweetId);
  if (retweetBy && !tweet?.retweetedBy && tweet) {
    tweet.retweetedBy = { name: retweetBy }
  }
  const [showReplies, setShowReplies] = useState(!isReply);
  const handleToggleComments = () => { 
    if(isReply) setShowReplies((prev) => !prev);
  }
  const replies = useMemo(() => (
    showReplies&&tweet?.replies?.map((reply) => {
        return (
          <>
            { showComments && (
              <div className='text-sm pl-9 ml-9 h-14 border-l-2 flex items-center  text-slate-500'>
                Replying to <span className='text-sky-400 ml-1'> @{tweet?.handle}</span>
              </div>
            )}
            <TweetItem tweetId={reply} showComments={showReplies} isReply={true} />
          </>
        )
      })
  ), [showReplies,showComments,tweet?.replies, tweet?.handle]);
  return (
    <div className="pl-2 border-dashed border-spacing-2 border-slate-200">
      {tweet && (
        <Tweet
          tweet={tweet}
          likeTweet={likeTweet}
          retweet={retweet}
          allowComment={!isReply}
          onCommentClick={() => {
             handleToggleComments();
          }}
        />
      )}
      {loading && <Loading className={'text-sky-400 w-4 h-4 p-4'} />}
      {showComments&&replies}
    </div>
  );
}

const TweetThread = () => {
  const router = useRouter()
  const { tweet:tweetId, handle:profileHandle, retweetBy } = router.query;
  const title = profileHandle ? `${profileHandle}' tweet` : `loading`;
  return (
    <Layout page={'notification'}>
      <Head>
        <title>{title}</title>
      </Head>
      <h1 className='ml-2 text-xl py-4 text-black font-semibold flex items-center sticky top-0 z-10 cursor-pointer bg-white/70'>
        <ArrowLeftIcon className='inline-block mr-2 md:mr-6 ml-2 h-10 w-10 hover:bg-slate-200 rounded-full p-2' onClick={()=>router.back()}/>
        Thread
      </h1>
      <TweetItem tweetId={tweetId} showComments={true} retweetBy={retweetBy} />
    </Layout>
  );
}

export default (props) => {
  const WithAuth = (innerProps) => useComponentWithFirebase('auth', TweetThread, innerProps);
  return useComponentWithFirebase('firestore', WithAuth, props);
};