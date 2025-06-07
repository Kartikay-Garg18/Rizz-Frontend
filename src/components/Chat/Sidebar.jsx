import React from 'react'
import Setting from '../Setting';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const cl = "my-3 w-8 rounded-full cursor-pointer";
  return (

    <div className='px-4 py-4 bg-gray-950 opacity-65 w-fit overflow-y-aut flex justify-start items-center flex-col border-r border-gray-300'>

            <Link to="/">
              <img src="https://img.icons8.com/?size=100&id=43699&format=png&color=FFFFFF" alt="Home icon"
              className={cl} />
            </Link>
            <Link to="/chat">
              <img src="https://img.icons8.com/?size=100&id=118377&format=png&color=FFFFFF" alt="Chat icon" className={cl} />
            </Link>
            {/* <img src="https://img.icons8.com/?size=100&id=9672&format=png&color=FFFFFF" alt="Explore icon" className={cl} /> */}
            <Link to="/chat/calling">
              <img src="https://img.icons8.com/?size=100&id=vfXAPwB00Ntn&format=png&color=FFFFFF" alt="Call icon" className={cl} />
            </Link>
            <Link to="/chat/setting">
              <img  src="https://img.icons8.com/?size=100&id=364&format=png&color=FFFFFF" alt="Setting icon" className={cl} />
            </Link>
          
        </div>
  )
}

export default Sidebar