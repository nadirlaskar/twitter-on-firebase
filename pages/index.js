import Head from 'next/head';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout page={'home'}>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className='text-xl mt-2 text-sky-500 font-semibold'>Home</h1>
      </main>
    </Layout>
  )
}
