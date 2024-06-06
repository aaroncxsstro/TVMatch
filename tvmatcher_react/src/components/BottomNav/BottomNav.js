import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation(); 
  const [activeButton, setActiveButton] = useState(getActiveButton(location.pathname));

  function getActiveButton(pathname) {
    if (pathname.startsWith('/home')) return 'home';
    else if (pathname.startsWith('/explore')) return 'explore';
    else if (pathname.startsWith('/collection')) return 'collection'; 
    else if (pathname.startsWith('/settings')) return 'settings';
    else return 'home'; 
  }

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  return (
    <div className="bottom-nav-container px-7 bg-white shadow-lg">
      <div className="flex">
        <div className={`flex-1 group ${activeButton === 'home' ? 'active' : ''}`} onClick={() => handleButtonClick('home')}>
          <Link to="/home" className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${activeButton === 'home' ? 'text-amber-800' : 'text-gray-400'} group-hover:text-amber-800`}>
            <span className="block px-1 pt-1 pb-1">
              <i className="far fa-home text-2xl pt-1 mb-1 block"></i>
              <span className="block text-xs pb-2">Home</span>
              <span className={`block w-5 mx-auto h-1 ${activeButton === 'home' ? 'bg-amber-800' : 'group-hover:bg-amber-800'} rounded-full`}></span>
            </span>
          </Link>
        </div>
        <div className={`flex-1 group ${activeButton === 'explore' ? 'active' : ''}`} onClick={() => handleButtonClick('explore')}>
          <Link to="/explore" className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${activeButton === 'explore' ? 'text-amber-800' : 'text-gray-400'} group-hover:text-amber-800`}>
            <span className="block px-1 pt-1 pb-1">
              <i className="far fa-compass text-2xl pt-1 mb-1 block"></i>
              <span className="block text-xs pb-2">Explorar</span>
              <span className={`block w-5 mx-auto h-1 ${activeButton === 'explore' ? 'bg-amber-800' : 'group-hover:bg-amber-800'} rounded-full`}></span>
            </span>
          </Link>
        </div>
        <div className={`flex-1 group ${activeButton === 'collection' ? 'active' : ''}`} onClick={() => handleButtonClick('collection')}>
          <Link to="/collection" className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${activeButton === 'collection' ? 'text-amber-800' : 'text-gray-400'} group-hover:text-amber-800`}>
            <span className="block px-1 pt-1 pb-1">
              <i className="far fa-book text-2xl pt-1 mb-1 block"></i> 
              <span className="block text-xs pb-2">Biblioteca</span> 
              <span className={`block w-5 mx-auto h-1 ${activeButton === 'collection' ? 'bg-amber-800' : 'group-hover:bg-amber-800'} rounded-full`}></span>
            </span>
          </Link>
        </div>
        <div className={`flex-1 group ${activeButton === 'settings' ? 'active' : ''}`} onClick={() => handleButtonClick('settings')}>
          <Link to="/settings" className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${activeButton === 'settings' ? 'text-amber-800' : 'text-gray-400'} group-hover:text-amber-800`}>
            <span className="block px-1 pt-1 pb-1">
              <i className="far fa-cog text-2xl pt-1 mb-1 block"></i>
              <span className="block text-xs pb-2">Ajustes</span>
              <span className={`block w-5 mx-auto h-1 ${activeButton === 'settings' ? 'bg-amber-800' : 'group-hover:bg-amber-800'} rounded-full`}></span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;