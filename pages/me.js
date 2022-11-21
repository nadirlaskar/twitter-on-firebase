import Head from 'next/head';
import router from 'next/router';
import { useSigninCheck } from 'reactfire';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';
import Loading from '../components/ui-blocks/loading';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';

function Me() {
  const { status, data: signInCheckResult } = useSigninCheck();
  if (status==='success' && !signInCheckResult.signedIn) { 
    router.push('/');
  }
  console.log(signInCheckResult?.user);
  const profileHandle = signInCheckResult?.user?.email.replace(/@.+/g, '') || 'me';
  return (
    <Layout page={'profile'}>
      <Head>
        <title>My Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {status === 'loading' && <Loading className={'m-12 text-sky-600'} />}
        {status === 'success' && signInCheckResult.signedIn && (
          <ProfileHeader profileHandle={profileHandle} />
        )}
      </main>
    </Layout>
  )
}

export default (props) => { 
  return useComponentWithFirebase('auth', Me, props)
}