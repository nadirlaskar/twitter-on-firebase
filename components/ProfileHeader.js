import { ArrowLeftIcon, BriefcaseIcon, CakeIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { EditProfileButton, ShowUserInfo, UserInfoWithCoverPic } from '../components/Authenticate';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';
import useProfile from '../hooks/useProfile';
import Loading from './ui-blocks/loading';

const MONTHS = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
const ProfileDetails = ({profileHandle='me'}) => { 
  const [profileDataStatus, profileData] = useProfile(profileHandle);
  if(profileDataStatus === 'loading') return <Loading className={'w-8 h-8 text-sky-600'}/>
  return (
    <div className='flex-col relative left-4 bottom-20 mx-2'>
      {profileData?.bio && <div className='text-base text-black py-4'>{profileData.bio}</div>}
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
const ProfileHeader = ({ profileHandle }) => {
  return (
    <>
      <h1 className='text-xl my-4 text-black font-semibold flex items-center sticky top-4 z-10'>
        <ArrowLeftIcon className='inline-block mr-6 ml-2 h-6 w-6'/>
        <ShowUserInfo profileHandle={profileHandle} showImage={false} showHandle={false} showTweetCount={true} />
      </h1>
      <section className='w-full h-48 border relative'>
        <UserInfoWithCoverPic profileHandle={profileHandle} />
        <EditProfileButton profileHandle={profileHandle} className={'absolute right-2 top-100 mt-2'} />
        <ProfileDetails profileHandle={profileHandle} />
      </section>
    </>
  )
}

export default (props) => {
  return useComponentWithFirebase('firestore', ProfileHeader, props);
};