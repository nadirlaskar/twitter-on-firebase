import { HomeIcon, UserCircleIcon, UserGroupIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import Link from 'next/link';
import Authenticate from '../components/Authenticate';
const listItemStyle = `p-4 w-full flex items-center border hover:rounded-full border-transparent hover:bg-slate-100 cursor-pointer relative`;
const activeStyle = `absolute left-9 top-3 w-2 h-2 rounded-full bg-sky-500 text-white text-center`;
const Sidebar = ({page}) => {
  return (
    <div className='flex flex-col h-full relative'>
      <ul className='my-4 h-full min-w-max'>
        <Link href='/'>
          <li className={listItemStyle}>
            <HomeIcon className='inline-block mr-4' width={24} />
            {page === 'home' && <span className={activeStyle}/>}
            <span className={classNames(`text-xl`, { 'font-semibold': page === 'home' })}>Home</span>
          </li>
        </Link>
        <Link href='/me'>
          <li className={listItemStyle}>
            <UserCircleIcon className='inline-block mr-4' width={24} />
            {page === 'profile' && <span className={activeStyle}/>}
            <span className={classNames(`text-xl`, { 'font-semibold': page === 'profile' })}>Profile</span>
          </li>
        </Link>
        <li className={listItemStyle}>
          <UserPlusIcon className='inline-block mr-4' width={24} />
          {page === 'following' && <span className={activeStyle}/>}
          <span className={classNames(`text-xl`, { 'font-semibold': page === 'following' })}>Following</span>
        </li>
        <li className={listItemStyle}>
          <UserGroupIcon className='inline-block mr-4' width={24} />
          {page === 'follower' && <span className={activeStyle}/>}
          <span className={classNames(`text-xl`, { 'font-semibold': page === 'follower' })}>Follower</span>
        </li>
        <li className={listItemStyle + ' bg-sky-500 rounded-full text-white w-full p-2 hover:bg-sky-600 justify-center mt-5'}>
          <span className='text-lg'>Tweet</span>
        </li>
      </ul>
      <div className='absolute bottom-20 left-0 right-0'>
        <Authenticate />
      </div>
    </div>
  )
}
export default Sidebar;