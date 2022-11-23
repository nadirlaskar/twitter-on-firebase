import { ArrowLeftIcon, BriefcaseIcon, CakeIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { EditProfileButton, ShowUserInfo, UserInfoWithCoverPic } from '../components/Authenticate';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';
import useFollowStatusFromFirestore from '../hooks/useFollowStatus';
import useProfile from '../hooks/useProfile';
import Loading from './ui-blocks/loading';

const MONTHS = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
const ProfileDetails = ({profileHandle='me'}) => { 
  const [profileDataStatus, profileData] = useProfile(profileHandle);
  if(profileDataStatus === 'loading') return <Loading className={'w-8 h-8 text-sky-600'}/>
  return (
    <div className='flex-col relative left-2 bottom-20 mx-2 pt-2'>
      {profileData?.bio && <div className='text-base text-black pt-2 pb-4'>{profileData.bio}</div>}
      <div className='flex items-center space-x-4'>
        {profileData?.profession && (
          <div className='text-sm text-slate-500 inline-flex items-center'>
            <BriefcaseIcon className='w-4 mr-2'/>
            {profileData?.profession}
          </div>
        )}
        {profileData?.location && (
          <div className='text-sm text-slate-500 inline-flex items-center'>
            <MapPinIcon className='w-4 mr-2'/>
            {profileData.location}
          </div>
        )}
        {profileData?.dob &&(
          <div className='text-sm text-slate-500 inline-flex'>
            <CakeIcon className='w-4 mr-2'/>
            Born {MONTHS[profileData.dob?.month-1]} {profileData.dob?.day},  {profileData.dob?.year}
          </div>
        )}
        {profileData?.joined && (
          <div className='text-sm text-slate-500 inline-flex'>
            <CalendarDaysIcon className='w-4 mr-2'/>
            Joined {MONTHS[profileData.joined?.month-1]} {profileData.joined?.year}
          </div>
        )}
      </div>
    </div>
  )
}
const FollowButton = ({ profileHandle, className }) => {
  const { status, isFollowing, follow, unfollow } = useFollowStatusFromFirestore(profileHandle);
  return (
    <div className={className}>
      <button
        onClick={isFollowing ? unfollow : follow}
        className={classNames(
          'rounded-full px-4 py-2 text-sm font-semibold w-28 h-11 ',
          {
            'bg-sky-500 text-white': !isFollowing,
            'bg-slate-100 text-slate-400 hover:border-red-400 hover:text-red-400 hover:border group': isFollowing
          }
        )}>
        {status === 'loading' ? (
          <Loading className={classNames(
            'w-5 h-5 text-sky-600 border',
            {
              'text-white': !isFollowing,
            }
          )} />
        ) :
        (<>
            <div className='absolute top-3 left-0 right-0 group-hover:hidden'>{isFollowing ? 'Following' : 'Follow'}</div>
            {isFollowing && <div className='absolute top-3 left-0 right-0 invisible group-hover:visible'>Unfollow</div>}
          </>
        )}
      </button>
    </div>
  )
}

const ProfileHeader = ({ profileHandle, allowEdit = false, showFollowButton = false }) => {
  const _showFollowButton = !allowEdit || showFollowButton;
  return (
    <>
      <h1 className='text-xl my-4 text-black font-semibold flex items-center sticky top-4 z-10'>
        <ArrowLeftIcon className='inline-block mr-6 ml-2 h-6 w-6'/>
        <ShowUserInfo profileHandle={profileHandle} showImage={false} showHandle={false} showTweetCount={true} />
      </h1>
      <section className='w-full h-48 border relative'>
        <UserInfoWithCoverPic profileHandle={profileHandle} />
        {allowEdit && <EditProfileButton profileHandle={profileHandle} className={'absolute right-2 top-full mt-9'} />}
        {_showFollowButton && profileHandle && <FollowButton profileHandle={profileHandle}  className={'absolute right-2 top-full mt-9'} />}
        <ProfileDetails profileHandle={profileHandle} />
      </section>
    </>
  )
}

export default (props) => {
  return useComponentWithFirebase('firestore', ProfileHeader, props);
};