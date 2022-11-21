import Head from 'next/head';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';

export default function Home() {
  return (
    <Layout page={'profile'}>
      <Head>
        <title>My Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <ProfileHeader />
      </main>
    </Layout>
  )
}
