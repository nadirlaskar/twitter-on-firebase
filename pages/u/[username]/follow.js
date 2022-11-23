import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { ProfileTitle } from "../../../components/ProfileHeader";
import Loading from "../../../components/ui-blocks/loading";
import useComponentWithFirebase from "../../../hooks/useComponentWithFirebase";
import useProfile from "../../../hooks/useProfile";
import { loadUserProfiles } from "../../../libs/firebase.util";

const FollowList = () => {
  const router = useRouter()
  const { username: profileHandle, tab } = router.query;
  const title = `${profileHandle}'s ${tab}`;
  const [_, loggedInUser] =  useProfile('me')
  const [profileStatus, profile] = useProfile(profileHandle);
  const [profilesStatus, setProfileStatus] = useState('loading');
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    if (profile && (tab === 'followers' || tab === 'following') && profile[tab] && profile[tab].length > 0) {
      loadUserProfiles(profile[tab]).then((profiles) => {
        setProfiles(profiles);
        setProfileStatus('success');
      }).catch((err) => {
        setProfileStatus('error');
      })
    }
    setProfileStatus('success');
    setProfiles([]);
  }, [tab, profile, setProfiles, setProfileStatus]);
  return (
    <Layout page={'followers'}>
      <Head>
        <title>{title}</title>
      </Head>
      <ProfileTitle profileHandle={profileHandle} showHandle={true} handleStyles={'mt-2 font-normal'} />
      {(profileStatus === 'loading' || profilesStatus === 'loading') && <Loading className={'m-12 w-8 h-8 text-sky-600'} />}
      {profileStatus === 'success' && (
        <div className={'mt-4 h-full w-full'}>
          {profiles.length === 0 && (<div className="text-slate-400 text-center w-full h-1/4 flex items-center justify-center">{`No ${tab} yet`}</div>)}
          {profiles?.map((profile) => (
            <Link key={profile.id}  href={`/profile/${profile.handle}`}>
              <div key={profile.handle} className={'flex items-start p-2 hover:bg-slate-100'}>
                <img width={48} height={48} src={profile.photoURL} className={'rounded-full mr-2'} />
                <div className={'flex flex-col'}>
                    <span className={'font-bold hover:underline'}>{profile.name}</span>
                  <span className={'text-gray-500'}>
                    @{profile.handle}
                  {!profile.following?.includes(loggedInUser.uid)&&<span className="ml-1 p-1 rounded-sm font-medium text-xs bg-slate-100 text-slate-600">Follows you</span>}
                  </span>
                  <span className="py-1 text-sm text-slate-800">
                    {profile.bio}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default (props) => {
  const WithAuth = () => useComponentWithFirebase('auth', FollowList, props);
  return useComponentWithFirebase('firestore', WithAuth, props);
}