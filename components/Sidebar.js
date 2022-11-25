import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { BellIcon, HomeIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Link from 'next/link';
import { useSigninCheck } from 'reactfire';
import Authenticate from '../components/Authenticate';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';
import TwitterHashtagIcon from './icons/HashtagIcon';
const listItemStyle = `p-2 lg:p-4 w-full flex items-center border hover:rounded-full border-transparent cursor-pointer relative`;
const activeStyle = `absolute left-9 top-3 w-2 h-2 rounded-full bg-sky-500 text-white text-center`;
const Sidebar = ({ page }) => {
  const { status, data: signInCheckResult } = useSigninCheck();
  return (
    <div className='flex flex-col h-full relative'>
      <ul className='my-4 h-full min-w-max'>
        { status === 'success' && (
          <>
            <Link href='/'>
            <li className={classNames(listItemStyle, 'hover:bg-slate-100')}>
              <HomeIcon className='inline-block lg:mr-4 w-5 md:w-6'  />
              {page === 'home' && <span className={activeStyle} />}
              <span className={classNames(`text-xl hidden lg:inline`, { 'font-semibold': page === 'home' })}>Home</span>
            </li>
            </Link>
            <Link href='/u/search'>
            <li className={classNames(listItemStyle, 'hover:bg-slate-100 lg:hidden')}>
              <MagnifyingGlassIcon className='inline-block lg:mr-4 w-5 md:w-6'  />
            </li>
            </Link>
             <li className={classNames(listItemStyle, 'hover:bg-slate-100')}>
              <TwitterHashtagIcon className='inline-block lg:mr-4 w-5 md:w-6'  />
              {page === 'follower' && <span className={activeStyle} />}
              <span className={classNames(`text-xl hidden lg:inline`, { 'font-semibold': page === 'follower' })}>Explore</span>
            </li>
            <li className={classNames(listItemStyle, 'hover:bg-slate-100', { 'hidden': !signInCheckResult.signedIn })}>
              <BellIcon className='inline-block lg:mr-4 w-5 md:w-6'  />
              {page === 'following' && <span className={activeStyle} />}
              <span className={classNames(`text-xl hidden lg:inline`, { 'font-semibold': page === 'following' })}>Notification</span>
            </li>
            <Link href='/me'>
              <li className={classNames(listItemStyle, 'hover:bg-slate-100',{ 'hidden': !signInCheckResult.signedIn })}>
                <UserCircleIcon className='inline-block lg:mr-4 w-5 md:w-6'  />
                {page === 'profile' && <span className={activeStyle} />}
                <span className={classNames(`text-xl hidden lg:inline`, { 'font-semibold': page === 'profile' })}>Profile</span>
              </li>
            </Link>
            <li className={classNames(
              listItemStyle, 'lg:p-3 bg-sky-500 rounded-full text-white lg:w-full lg:h-fit w-12 h-12 hover:bg-sky-600 mt-5',
              { 'lg:hidden': !signInCheckResult.signedIn }
            )}>
              <span className='w-full text-center text-lg font-semibold lg:inline-block hidden'>Tweet</span>
              <PencilSquareIcon className='lg:hidden sm:block w-4 h-4 m-auto'/>
            </li>
          </>
        )}
      </ul>
      <div className='absolute bottom-10 lg:bottom-20 left-0 right-0 lg:block'>
        <Authenticate />
      </div>
    </div>
  )
}
export default (props) => { 
  return useComponentWithFirebase('auth', Sidebar, props)
};