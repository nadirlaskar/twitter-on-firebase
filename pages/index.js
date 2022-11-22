import Head from 'next/head';
import Layout from '../components/Layout';
import Loading from '../components/ui-blocks/loading';

export default function Home() {
  return (
    <Layout page={'home'}>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className='text-xl mt-2 text-sky-500 font-semibold p-2'>Home</h1>
        <Loading className={'m-12 w-8 h-8 text-sky-600'}/>
      </main>
    </Layout>
  )
}
