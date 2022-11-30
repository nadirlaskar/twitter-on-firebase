import classNames from "classnames";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { FollowButton, ProfileTitle } from "../../components/ProfileHeader";
import Loading from "../../components/ui-blocks/loading";
import useComponentWithFirebase from "../../hooks/useComponentWithFirebase";
import useProfile from "../../hooks/useProfile";
import { loadUserProfiles } from "../../libs/firebase.util";

function toPascleCase(text) {
  return text[0].toUpperCase() + text.slice(1);
}

const Tabs = ({ tabs, active, setActiveTab }) => {
  return (
    <div className="flex flex-row border-b border-slate-100">
      {tabs.map((tab) => (
        <div
          className="flex flex-row items-end justify-center px-4 pt-6 pb-0 cursor-pointer hover:bg-slate-200 grow"
          key={tab}
          onClick={() => {
            setActiveTab(tab);
          }}
        >
          <div className="flex-col items-center justify-center">
            <div
              className={`${
                tab === active ? "text-black font-extrabold" : "text-gray-500"
                }  px-4 text-md`}
            >
              <span className="mb-4 inline-block">{toPascleCase(tab)}</span>
              <div className={classNames("h-1 w-full bg-transparent rounded m-auto", {
                "!bg-sky-600": tab === active,
              })} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


const FollowList = () => {
  const router = useRouter()
  const { handle: profileHandle, tab:activeTab } = router.query;
  const title = profileHandle?`${profileHandle}'s ${activeTab}`:`loading`;
  const [_, loggedInUser] =  useProfile('me')
  const [profileStatus, profile] = useProfile(profileHandle);
  const [profilesStatus, setProfileStatus] = useState('loading');
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    if (profile && (activeTab === 'followers' || activeTab === 'following') && profile[activeTab] && profile[activeTab].length > 0) {
      loadUserProfiles(profile[activeTab]).then((profiles) => {
        setProfiles(profiles);
        setProfileStatus('success');
      }).catch((err) => {
        setProfileStatus('error');
      })
    }
    setProfileStatus('success');
    setProfiles([]);
  }, [activeTab, profile, setProfiles, setProfileStatus]);
  return (
    <Layout page={'Follows'}>
      <Head>
        <title>{title}</title>
      </Head>
      <ProfileTitle profileHandle={profileHandle} showHandle={true} handleStyles={'mt-2 font-normal'} />
      <Tabs tabs={["followers", 'following']} active={activeTab} setActiveTab={(tab) => { 
        router.replace({
          query: { ...router.query, tab: tab },
        });
      }} />
      {(profileStatus === 'loading' || profilesStatus === 'loading') && <Loading className={'m-12 w-8 h-8 text-sky-600'} />}
      {profileStatus === 'success' && (
        <div className={'mt-4 h-full w-full'}>
          {profiles.length === 0 && (<div className="text-slate-400 text-center w-full h-1/4 flex items-center justify-center">{`No ${activeTab} yet`}</div>)}
          {profiles?.map((profile) => {
            const initial = profile?.name.split(' ').map((n) => n[0]).join('')
            const fallback = `https://via.placeholder.com/80/OEA5E9/FFFFFF?text=${initial.toUpperCase()}`
            return (
              <Link key={profile.id} href={`/${profile.handle}`}>
                <div key={profile.handle} className={'flex items-start p-2 hover:bg-slate-100 justify-between'}>
                  <div className={'flex items-start'}>
                    <img width={48} height={48} src={profile.photoURL || fallback} className={'rounded-full mr-2'} onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallback;
                    }} />
                    <div className={'flex flex-col'}>
                      <span className={'text-sm md:text-base font-bold hover:underline'}>{profile.name}</span>
                      <span className={'text-xxs md:text-base text-gray-500'}>
                        @{profile.handle}
                        {loggedInUser?.uid && !profile.following?.includes(loggedInUser?.uid) && (
                          <span className="ml-1 p-1 rounded-sm font-medium text-xs bg-slate-100 text-slate-600">Follows you</span>
                        )}
                      </span>
                      <span className="py-1 text-xxs md:text-sm text-slate-800">
                        {profile.bio}
                      </span>
                    </div>
                  </div>
                  {profile && loggedInUser?.id !== profile.id && <FollowButton profileHandle={profile?.handle} />}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Layout>
  );
}

export default (props) => {
  const WithAuth = () => useComponentWithFirebase('auth', FollowList, props);
  return useComponentWithFirebase('firestore', WithAuth, props);
};