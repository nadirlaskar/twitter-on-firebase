import { XCircleIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout page={'home'}>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='h-3/4'>
        <h1 className='text-xl mt-2 text-sky-500 font-semibold p-2 ml-4'>Home</h1>
        <div className={classNames('flex flex-col justify-end items-center w-fit h-2/4 text-slate-500 text-sm p-12 m-auto text-center')}>
         <XCircleIcon className='w-10 mb-2 text-slate-300'/>
          We’re sorry we don’t have tweets to show now.
        </div>
      </main>
    </Layout>
  )
}
