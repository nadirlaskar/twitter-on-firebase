import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import { ShowUserInfo } from '../components/Authenticate';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout page={'profile'}>
      <Head>
        <title>My Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className='text-xl my-4 text-slate-700 font-semibold flex items-center'>
          <ArrowLeftIcon className='inline-block mr-6 ml-2 h-6 w-6'/>
          <ShowUserInfo showImage={false} showHandle={false} showTweetCount={true} />
        </h1>
        <section className='w-full h-48 border'>
          <img src='https://pbs.twimg.com/profile_banners/714176889460432900/1570041174/1500x500' className='w-full h-full'/>
        </section>
      </main>
    </Layout>
  )
}
