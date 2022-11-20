import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ShowUserInfo } from '../components/Authenticate';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';

const ProfileHeader = ({ profileHandle }) => { 
  return (
    <>
      <h1 className='text-xl my-4 text-slate-700 font-semibold flex items-center'>
        <ArrowLeftIcon className='inline-block mr-6 ml-2 h-6 w-6'/>
        <ShowUserInfo showImage={false} showHandle={false} showTweetCount={true} />
      </h1>
      <section className='w-full h-48 border relative'>
        <img src='https://via.placeholder.com/800x200.png/DDDDDD/888888?text=Your+cover+picture' className='w-full h-full' />
        <div className='relative bottom-20 left-4 inline-block'>
          <ShowUserInfo
            showImage={true}
            showHandle={true}
            showName={true}
            imageClassNames={['w-32 h-auto border-4 border-white rounded-full']}
            metaInfoStyles={['text-xl', 'text-slate-700', 'font-semibold', 'block']}
            rootStyles={['flex flex-col items-start']}
          />
        </div>
      </section>
    </>
  )
}

export default (props) => {
  return useComponentWithFirebase('firestore', ProfileHeader, props);
};