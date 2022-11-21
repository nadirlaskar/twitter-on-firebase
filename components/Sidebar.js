import { HomeIcon, UserCircleIcon, UserGroupIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Link from 'next/link';
import { useSigninCheck } from 'reactfire';
import Authenticate from '../components/Authenticate';
import useComponentWithFirebase from '../hooks/useComponentWithFirebase';
const listItemStyle = `p-4 w-full flex items-center border hover:rounded-full border-transparent cursor-pointer relative`;
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
              <HomeIcon className='inline-block mr-4' width={24} />
              {page === 'home' && <span className={activeStyle} />}
              <span className={classNames(`text-xl`, { 'font-semibold': page === 'home' })}>Home</span>
            </li>
            </Link>
            <Link href='/me'>
              <li className={classNames(listItemStyle, 'hover:bg-slate-100',{ 'hidden': !signInCheckResult.signedIn })}>
                <UserCircleIcon className='inline-block mr-4' width={24} />
                {page === 'profile' && <span className={activeStyle} />}
                <span className={classNames(`text-xl`, { 'font-semibold': page === 'profile' })}>Profile</span>
              </li>
            </Link>
            <li className={classNames(listItemStyle, 'hover:bg-slate-100', { 'hidden': !signInCheckResult.signedIn })}>
              <UserPlusIcon className='inline-block mr-4' width={24} />
              {page === 'following' && <span className={activeStyle} />}
              <span className={classNames(`text-xl`, { 'font-semibold': page === 'following' })}>Following</span>
            </li>
            <li className={classNames(listItemStyle, 'hover:bg-slate-100', { 'hidden': !signInCheckResult.signedIn })}>
              <UserGroupIcon className='inline-block mr-4' width={24} />
              {page === 'follower' && <span className={activeStyle} />}
              <span className={classNames(`text-xl`, { 'font-semibold': page === 'follower' })}>Follower</span>
            </li>
            <li className={classNames(
              listItemStyle, 'py-2 bg-sky-500 rounded-full text-white w-full  hover:bg-sky-600 justify-center mt-5',
              { 'hidden': !signInCheckResult.signedIn }
            )}>
              <span className='text-lg font-semibold'>Tweet</span>
            </li>
          </>
        )}
      </ul>
      <div className='absolute bottom-20 left-0 right-0'>
        <Authenticate />
      </div>
    </div>
  )
}
export default (props) => { 
  return useComponentWithFirebase('auth', Sidebar, props)
};