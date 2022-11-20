import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const SearchInput = () => {
  return (
    <div className='flex items-center justify-center rounded-full bg-slate-200 border-2 text-slate-400 pl-4 w-4/6 hover:border-sky-600 hover:border-2 hover:text-sky-600 hover:bg-slate-50'>
      <MagnifyingGlassIcon className="w-6 h-6 mr-4  hover:text-sky-600"/>
      <input type='text' placeholder='Search Twitter' className=' bg-transparent flex-grow h-10 border-none  rounded-full outline-none focus:outline-none w-full text-sm'/>
    </div>
  )
}
const Sidebar = ({page}) => {
  return (
    <div className='flex flex-col h-full relative px-2 mt-2'>
      <SearchInput/>
    </div>
  )
}
export default Sidebar;