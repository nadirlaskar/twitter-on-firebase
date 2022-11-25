import { ArrowLeftIcon, BriefcaseIcon, CakeIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import Link from 'next/link';
import router from 'next/router';
import { memo } from 'react';
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
    <div className='flex-col relative left-4 bottom-20 pt-2'>
      {profileData?.bio && <div className='text-base text-black pt-2 pb-4'>{profileData.bio}</div>}
      <div className='flex items-center gap-x-4 flex-wrap gap-y-1'>
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
      <div className='flex space-x-4 text-sm mt-4 text-black'>
        <Link href={`/u/${profileData?.handle}/follow?tab=following`}>
          <div className='hover:underline'>
            <span className='font-bold'>{profileData?.following?.length || 0}</span> <span className='text-slate-500'>Following</span>
          </div>
        </Link>
        <Link href={`/u/${profileData?.handle}/follow?tab=followers`}>
          <div className='hover:underline'>
            <span className='font-bold'>{profileData?.followers?.length || 0}</span> <span className='text-slate-500'>Followers</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
export const FollowButton = ({ profileHandle, className }) => {
  const [userStatus, loggedInUser] = useProfile('me');
  const { status, isFollowing, follow, unfollow } = useFollowStatusFromFirestore(profileHandle);
  if (userStatus === 'success' && !loggedInUser) {
    return null;
  }
  return (
    <div className={className}>
      <button
        disabled={status === 'loading'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isFollowing) {
            unfollow();
          } else {
            follow();
          }
        }}
        className={classNames(
          'relative rounded-full px-4 py-2 text-sm font-semibold w-28 h-11 ',
          {
            'bg-sky-500 text-white': !isFollowing,
            'bg-slate-100 text-slate-400 hover:border-red-400 hover:text-red-400 hover:border group hover:bg-red-100': isFollowing,
            'border-red-400 text-red-400 bg-red-100': status === 'loading' && isFollowing,
            'cursor-not-allowed': status === 'loading'
          }
        )}>
        {status === 'loading' ? (
          <Loading className={classNames(
            'w-5 h-5 text-sky-600 border',
            {
              'text-white': !isFollowing,
              'text-red-400': isFollowing
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

export const ProfileTitle = ({ profileHandle, showHandle = false, showTweetCount = false, showImage = false, ...rest }) => {
  return (
    <h1 className='text-xl my-4 text-black font-semibold flex items-center sticky top-4 z-10 cursor-pointer'>
      <ArrowLeftIcon className='inline-block mr-2 md:mr-6 ml-2 h-10 w-10 hover:bg-slate-200 rounded-full p-2' onClick={()=>router.back()}/>
      <ShowUserInfo rootStyles={'items-center'} profileHandle={profileHandle} showImage={showImage} showHandle={showHandle} showTweetCount={showTweetCount} {...rest} />
    </h1>
  )
}

const ProfileHeader = ({ profileHandle, allowEdit = false, showFollowButton = false }) => {
  const _showFollowButton = !allowEdit || showFollowButton;
  return (
    <>
      <ProfileTitle profileHandle={profileHandle} showTweetCount={true} />
      <section className='w-full h-48 border relative'>
        <UserInfoWithCoverPic profileHandle={profileHandle} />
        {allowEdit && <EditProfileButton profileHandle={profileHandle} className={'absolute right-2 top-full mt-6'} />}
        {_showFollowButton && profileHandle && <FollowButton profileHandle={profileHandle}  className={'absolute right-2 top-full mt-6'} />}
        <ProfileDetails profileHandle={profileHandle} />
      </section>
    </>
  )
}

export default memo((props) => {
  return useComponentWithFirebase('firestore', ProfileHeader, props);
})