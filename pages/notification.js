import classNames from "classnames";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Loading from "../components/ui-blocks/loading";
import useNotifications from "../hooks/useNotifications";
import useProfile from "../hooks/useProfile";

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

const NotificationList = () => {
  const router = useRouter()
  const [profileStatus, loggedInUser] = useProfile('me');
  const { tab:activeTab = 'likes' } = router.query;
  const profileHandle = loggedInUser?.handle;
  const title = profileHandle ? `${profileHandle}'s notification` : `loading`;
  const [notificationStatus, notifications, error] = useNotifications();
  return (
    <Layout page={'notification'}>
      <Head>
        <title>{title}</title>
      </Head>
      <h1 className='ml-3 text-xl py-4 text-black font-semibold flex items-center sticky top-0 z-10 cursor-pointer bg-white/70'>
        Notifications
      </h1>
      <Tabs tabs={["likes", 'follows']} active={activeTab} setActiveTab={(tab) => { 
        router.replace({
          query: { ...router.query, tab: tab },
        });
      }} />
      {(profileStatus === 'loading' || notificationStatus === 'loading') && <Loading className={'m-12 w-8 h-8 text-sky-600'} />}
      {profileStatus === 'success' && (
        <div className={'mt-4 h-full w-full'}>
          {notifications?.length === 0 && (
            <div className="text-slate-400 text-center w-full h-1/4 flex items-center justify-center">{`No ${activeTab} yet`}</div>
          )}
          {notifications[activeTab]?.map((notification, index) => {
            return (
              <div key={notification.handle + index} className={'flex items-start px-4 hover:bg-slate-100 justify-between border-b'}>
                <div className={'flex items-start'}>
                    {notification.action}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  );
}

export default NotificationList;