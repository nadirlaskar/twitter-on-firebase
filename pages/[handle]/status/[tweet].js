import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { TweetItem } from "../../../components/Tweet";
import useComponentWithFirebase from "../../../hooks/useComponentWithFirebase";

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
      <TweetItem tweetId={tweetId} showReplies={true} retweetBy={retweetBy} showReplyTo={true} />
    </Layout>
  );
}

export default (props) => {
  const WithAuth = (innerProps) => useComponentWithFirebase('auth', TweetThread, innerProps);
  return useComponentWithFirebase('firestore', WithAuth, props);
};