import Head from 'next/head';
import Authenticate from '../components/Authenticate';


export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className='text-2xl'>Next Twitter</h1>
        <Authenticate />
      </main>
    </div>
  )
}
