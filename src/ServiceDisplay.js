import React, { useState, useEffect } from 'react';
import SortableTable from './SortableTable';
import Stakepcs from './images/stakepcs.jpg';
import CardanoLandsImage from './images/cardanolands.jpg';
import nmkrImage from './images/nmkr.jpg';
import saturnImage from './images/saturn.jpg';
import buffyImage from './images/buffy.jpg';
import summonImage from './images/summon.jpg';
import jpgImage from './images/jpg.jpg';
import wayupImage from './images/wayup.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import PCSBanner1 from './images/pcsbanner(1).jpg';


const ServiceDisplay = ({ serviceName, description, darkMode, openModal, connectWallet }) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');

    
    
    const showToastMessage = (message, type) => {
        setShowToast(true);
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
            setToastType('');
        }, 3000);
    };


    // Define toast styles
    const toastStyle = {
        success: {
            backgroundColor: '#4caf50',
            color: '#fff',
        },
        error: {
            backgroundColor: '#f44336',
            color: '#fff',
        },
    };

    const columns = [
        { Header: 'Thumbnail', accessor: 'thumbnail' },
        { Header: '#', accessor: 'id' },
        { Header: 'Prefix', accessor: 'prefix' },
        { Header: 'First Name', accessor: 'firstName' },
        { Header: 'Last Name', accessor: 'lastName' },
        { Header: 'Suffix', accessor: 'suffix' },
        { Header: 'For Sale', accessor: 'forSale'}
    ];

    const data = [
        { id: 1, thumbnail: <img src="thumbnail1.jpg" alt="Thumbnail 1" />, prefix: 'Dr.', firstName: 'John', lastName: 'Doe', suffix: 'Jr.', forSale: 'Yes' },
        { id: 2, thumbnail: <img src="thumbnail2.jpg" alt="Thumbnail 2" />, prefix: 'Mr.', firstName: 'Jane', lastName: 'Smith', suffix: 'Sr.', forSale: 'No' },
    ];

    // Determine whether to show the sortable table based on the selected service
    const showSortableTable = serviceName === 'View';
    // Determine if the "Coming soon..." message should be displayed
    const showComingSoon = serviceName !== 'View';


    

    return (
        <div className="service-display-container" style={{ minHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
        <div className={`flex justify-center items-center pt-100 ${darkMode ? 'bg-customBlue text-black' : 'bg-customTeal text-white'}`}>
            <div className={`flex flex-col justify-center items-center rounded-lg md:flex-row md:p-8`} style={{ width: '90vw', maxWidth: '1200px', height: 'auto', minHeight: '90vh', maxHeight: 'calc(35rem + 2rem)' }}>
                <div className={`rounded-lg p-4 w-full`}>
                    {/* Display the PCSBanner1 */}
                    <div className="flex justify-center mb-4" style={{ marginTop: '-100px' }}>
                        <img src={PCSBanner1} alt="PCS Banner 1" style={{ width: '100%', maxWidth: '1200px', borderRadius: '5px' }} />
                    </div>


                        <h2 className="text-xl md:text-2xl lg:text-3xl text-center">{serviceName}</h2>
                        <p className="mt-2 md:mt-4 text-sm md:text-base lg:text-lg text-center">{description}</p>
                        {showSortableTable && <SortableTable columns={columns} data={data} />}
                        {serviceName === 'Staking' && (
                            <div className="flex flex-col items-center justify-center mt-8">
                                <a href="https://cardanolands.com/staking/puurrty" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center">
                                    <img src={Stakepcs} alt="Stake PCS" style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
                                </a>
                                <div className="text-lg text-center mt-4">Staking, Only on Cardano Lands</div>
                                <div className="text-sm text-center mt-2">Explore staking on Cardano Lands Today &</div>
                                <div className="text-sm text-center mt-2">Play Cardano Lands Kingdom Metaverse!</div>
                                <div className="flex justify-center mt-4">
                                    <a href="https://cardanolands.com/staking/puurrty" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center">
                                        <img src={CardanoLandsImage} alt="Cardano Lands" style={{ width: '100px', height: 'auto', borderRadius: '5px' }} />
                                    </a>
                                </div>
                            </div>
                        )}

{serviceName === 'Swap' && (
    <div className="flex justify-center items-center h-screen" style={{ marginTop: '400px' }}>
        <div className="flex justify-center items-center" style={{ marginTop: '50px' }}>
            <div className="flex flex-col justify-center items-center rounded-lg p-8 max-w-[450px] w-full">
                <div className="iframe-container" style={{ width: '100%', paddingTop: '56.25%' }}>
                    <div>
                        <script type="module" src="https://embedded.muesliswap.com/embedded/embed.js"></script>
                        <script type="module">
                            {`
                              import { initMuesliswapIframeBridge } from "https://embedded.muesliswap.com/embedded/embed.js"
                              // Don't auto connect to any wallet
                              setTimeout(initMuesliswapIframeBridge, 400) 
                              // Auto connect to any wallet which is injected into window.cardano and follows CIP-30.
                              // setTimeout(() => initMuesliswapIframeBridge('nami'), 400)
                            `}
                        </script>
                    </div>
                    <iframe
                        src="https://embedded.muesliswap.com/swap?base=.&quote=c94ba9d7f91040d93a305a2c078838b870f4a70a06f41dabce952f47.70757572727479&e_theme=0&e_height=670px&e_width=450px&e_simple_view=t&e_hide_background=t"
                        title="MuesliSwap Integrated Swap"
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', top: '100px', left: 0, right: 0 }}
                        id="muesliswap_integrated_swap_container"
                    ></iframe>
                </div>
            </div>
        </div>
    </div>   
)}


                        {serviceName === 'Mint' && (
                            <div className="flex flex-col items-center justify-center mt-4">
                                <a href="https://www.nmkr.io/" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center mb-2">
                                    <img src={nmkrImage} alt="NMKR" style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
                                </a>
                                <a href="https://saturnnft.io/mint" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center mb-2">
                                    <img src={saturnImage} alt="Saturn" style={{ width: '100%', maxWidth: '300px ', borderRadius: '5px' }} />
                                </a>
                                <a href="https://buffybot.io/" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center">
                                    <img src={buffyImage} alt="Buffy" style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
                                </a>
                            </div>
                        )}

                        {serviceName === 'Vote/Gov' && (
                            <div className="flex flex-col items-center justify-center mt-4">
                                <a href="https://summonplatform.io/fee-free-voting/" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center mb-2">
                                    <img src={summonImage} alt="Summon" style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
                                </a>
                            </div>
                        )}

                        {serviceName === 'Marketplace' && (
                            <div className="flex flex-col items-center justify-center mt-4">
                                <a href="https://www.jpg.store/" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center mb-2">
                                    <img src={jpgImage} alt="JPG" style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
                                </a>
                                <a href="https://www.wayup.io/" target="_blank" rel="noopener noreferrer" className="hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center mb-2">
                                    <img src={wayupImage} alt="WayUp" style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
                                </a>
                            </div>
                        )}

                        {showComingSoon && serviceName !== 'Staking' && serviceName !== 'Swap' && (
                            <div className="flex justify-center mt-4">
                                {/* You can add content here */}
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center h-screen" style={{ marginTop: '-650px' }}>
                <div className="flex flex-col items-center">
                    {serviceName === 'Connect' && (
                        <div className="flex flex-col items-center justify-center mt-4">
                            <button
                                className={`flex items-center justify-center px-4 py-2 rounded-lg border hover:border-green-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                                onClick={openModal} // Using the openModal function passed as prop
                            >
                                <FontAwesomeIcon icon={faWallet} className="text-blue-500 h-6 w-6 mr-2" />
                                Connect
                            </button>
                        </div>
                    )}

                    {/* Iframe for triggering wallet connection */}
                    {serviceName === 'IFrameService' && (
                        <div className="iframe-container">
                            <iframe
                                src="https://example.com" 
                                title="Wallet Connection"
                                width="100%"
                                height="100%"
                                className="aspect-[3/4] w-full h-full"
                            ></iframe>
                        </div>
                    )}

                    {/* Coming Soon Text */}
                    {serviceName !== 'Connect' && serviceName !== 'IFrameService' && (
                        <div className="flex justify-center mt-4">
                            {/* You can add content here */}
                        </div>
                    )}

                    {/* Toast Notification */}
                    {showToast && (
                        <div
                            className="toast-notification"
                            style={{
                                position: 'fixed',
                                top: '20px',
                                left: '20px',
                                padding: '10px',
                                borderRadius: '5px',
                                zIndex: 1050,
                                ...toastStyle[toastType], 
                            }}
                        >
                            {toastMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceDisplay;
