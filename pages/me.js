import Head from 'next/head';
import router from 'next/router';
import { useEffect, useRef } from 'react';
import { useSigninCheck } from 'reactfire';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';
import Loading from '../components/ui-blocks/loading';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';

function Me() {
  const { status, data: signInCheckResult } = useSigninCheck();
  const handleRef = useRef(null);
  if (status === 'success' && !signInCheckResult.signedIn) { 
    if (handleRef.current) {
      router.push('/profile/' + handleRef.current);
    } else {
      router.push('/');
    }
  }
  useEffect(() => {
    if (signInCheckResult && signInCheckResult.signedIn) {
      handleRef.current = signInCheckResult.user.email.replace(/@.+/g, '');
    }
   },[signInCheckResult])
  const handle = signInCheckResult?.user?.email.replace(/@.+/g, '');
  return (
    <Layout page={'profile'}>
      <Head>
        <title>My Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {status === 'loading' && <Loading className={'m-12 w-8 h-8 text-sky-600'} />}
        {status === 'success' && signInCheckResult.signedIn && (
          <ProfileHeader profileHandle={handle} allowEdit={true} />
        )}
      </main>
    </Layout>
  )
}

export default (props) => { 
  return useComponentWithFirebase('auth', Me, props)
}