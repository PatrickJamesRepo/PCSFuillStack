import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import {
    faWallet, faEye, faHandHoldingUsd, faStore,
    faExchangeAlt, faVoteYea, faSyncAlt, faEllipsisH,
    faBars, faTimes
} from '@fortawesome/free-solid-svg-icons';


import Stakepcs from './images/stakepcs.jpg'

import Puurr from './images/puurr.png'


const SideBar = ({ isSidebarVisible, toggleSidebar, darkMode, onSelect }) => {
    const [isSmallSidebar, setIsSmallSidebar] = useState(true);

    const handleToggleSidebar = () => {
        setIsSmallSidebar(!isSmallSidebar);
    };

    const handleSelect = (service) => {
        onSelect(service);
        if (!isSmallSidebar) handleToggleSidebar(); // Close the sidebar upon selection if it's not in small mode
    };


    
    

 return (
        <div className={`fixed top-0 left-0 h-full transition-transform duration-300 ${isSmallSidebar ? 'w-16 sm:w-20 md:w-24 lg:w-32' : 'w-full sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3'} flex flex-col justify-between ${darkMode ? 'bg-customRichBlack text-white' : 'bg-white text-black'} shadow-lg z-50 transition-width duration-300 ease-in-out`}>
            <div className="py-4 px-2 flex flex-col">
                {isSmallSidebar ? (
                    <button st className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer ..." onClick={handleToggleSidebar}>
                    <FontAwesomeIcon icon={isSmallSidebar ? faBars : faTimes} />
                </button>
                ) : (
                    <>
                      <div className="flex justify-end mb-4">
                            <button className="text-3xl hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400" onClick={handleToggleSidebar}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="flex items-center">
                             <img src={Puurr} alt="PCS" className={`w-12 h-12 rounded-full mr-4 object-cover ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{marginLeft: '180px'}} />
                             <h1 className="text-xl font-bold">PCS</h1>
                         </div>
                        <div className="flex flex-col items-start mx-4"style={{ marginLeft: '180px' }}>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('Connect')}>
                                    <FontAwesomeIcon icon={faWallet} className="mr-2" /> 
                                    {!isSmallSidebar && <span>Connect</span>}
                                </button>
                            </div>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('View')}>
                                    <FontAwesomeIcon icon={faEye} className="mr-2" /> 
                                    {!isSmallSidebar && <span>Collection</span>}
                                </button>
                            </div>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('Mint')}>
                                    <FontAwesomeIcon icon={faHandHoldingUsd} className="mr-2" /> 
                                    {!isSmallSidebar && <span>Mint</span>}
                                </button>
                            </div>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('Swap')}>
                                    <FontAwesomeIcon icon={faSyncAlt} className="mr-2" /> 
                                    {!isSmallSidebar && <span>Swap</span>}
                                </button>
                            </div>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('Staking')}>
                                    <FontAwesomeIcon icon={faStore} className="mr-2" /> 
                                    {!isSmallSidebar && <span>Stake</span>}
                                </button>
                            </div>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('Vote/Gov')}>
                                    <FontAwesomeIcon icon={faVoteYea} className="mr-2" />
                                    {!isSmallSidebar && <span>Vote/Gov</span>}
                                </button>
                            </div>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('Marketplace')}>
                                    <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" /> 
                                    {!isSmallSidebar && <span>Marketplace</span>}
                                </button>
                            </div>
                            <div className="my-2">
                                <button className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center" onClick={() => handleSelect('Other')}>
                                    <FontAwesomeIcon icon={faEllipsisH} className="mr-2" /> 
                                    {!isSmallSidebar && <span>Other</span>}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="py-4 px-2 flex flex-col items-center">
                <a href="https://discord.com/invite/fhyVxrEQsR" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 mb-2">
                    <FontAwesomeIcon icon={faDiscord} size="2x" />
                </a>
                <a href="https://twitter.com/@PuurrtyCats" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400">
                <FontAwesomeIcon icon={faXTwitter} size='2x'/>
                </a>
            </div>
        </div>
    );
};

export default SideBar;
