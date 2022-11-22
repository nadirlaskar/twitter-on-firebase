import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../../components/Layout";
import ProfileHeader from "../../components/ProfileHeader";
import useComponentWithFirebase from "../../hooks/useComponentWithFirebase";
import useProfile from "../../hooks/useProfile";

export function Profile() {
  const router = useRouter()
  const { handle: profileHandle } = router.query
  const [_status, user] = useProfile('me');
  useEffect(() => { 
    if (user && user?.handle === profileHandle) {
      router.push('/me')
    }
  },[user])
  return (
    <Layout>
      <Head>
        <title>{profileHandle?`${profileHandle}'s Profile`:'Loading...'}</title>
      </Head>
      <main>
        <ProfileHeader profileHandle={profileHandle} allowEdit={false} />
      </main>
    </Layout>
  );
}

export default (props) => { 
  return useComponentWithFirebase('auth', Profile, props)
}