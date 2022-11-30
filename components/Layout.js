import { PencilIcon } from "@heroicons/react/24/solid";
import RightSidebar from "./RightSidebar";
import Sidebar from "./Sidebar";

const Layout = ({ children, page, leftBarChildren }) => {
  return (
    <div className="md:container md:mx-auto flex min-h-screen overflow-hidden">
      <div className="flex-none w-fit lg:w-3/12 xl:w-2/12 border-r lg:pr-6 px-2">
        <h1 className='text-2xl mt-4 text-sky-500 font-extrabold'>
          <PencilIcon className="w-8 pl-2 lg:w-12 lg:pl-4"/>
        </h1>
        <Sidebar page={page} />
      </div>
      <div className="lg:w-6/12 w-full h-screen overflow-y-scroll no-scrollbar overflow-x-hidden">
        {children}
      </div>
      <div className="md:w-2/6 lg:w-3/12 xl:w-4/12 border-l overflow-hidden hidden lg:block">
        {leftBarChildren || <RightSidebar/>}
      </div>
    </div>
  )
 }

export default Layout;