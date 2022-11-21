import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { EditProfileButton, ShowUserInfo, UserInfoWithCoverPic } from '../components/Authenticate';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';

const ProfileHeader = ({ profileHandle }) => { 
  return (
    <>
      <h1 className='text-xl my-4 text-black font-semibold flex items-center sticky top-4 z-10'>
        <ArrowLeftIcon className='inline-block mr-6 ml-2 h-6 w-6'/>
        <ShowUserInfo showImage={false} showHandle={false} showTweetCount={true} />
      </h1>
      <section className='w-full h-48 border relative'>
        <UserInfoWithCoverPic />
        <EditProfileButton className={'absolute right-2 top-100 mt-2'} />
      </section>
    </>
  )
}

export default (props) => {
  return useComponentWithFirebase('firestore', ProfileHeader, props);
};