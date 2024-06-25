import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faLightbulb, faAdjust, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import SideBar from './SideBar'; 
import Switch from 'react-switch';


import Puurr from './images/puurr.png'

import namiImage from './images/nami.jpg';
import eternlImage from './images/eternl.jpg';
import laceImage from './images/lace.jpg';
import yoroiImage from './images/yoroi.jpg';



const Navbar = ({ darkMode, toggleDarkMode }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [connectedWalletLogo, setConnectedWalletLogo] = useState(null);
    const [totalAdaAmount, setTotalAdaAmount] = useState(0);
    const [walletBalances, setWalletBalances] = useState({
        nami: 0,
        eternl: 0,
        lace: 0,
        yoroi: 0,
    });
    const [walletApis] = useState({
        nami: window.cardano?.nami,
        eternl: window.cardano?.eternl,
        lace: window.cardano?.lace,
        yoroi: window.cardano?.yoroi,
    });

    useEffect(() => {
        // Fetch wallet balances when the component mounts
        fetchWalletBalances();
    }, []);

    async function fetchWalletBalances() {
        const balances = {};
        for (const walletType of Object.keys(walletBalances)) {
            const balance = await fetchWalletBalance(walletType);
            balances[walletType] = balance;
        }
        setWalletBalances(balances);
    }

    async function connectWallet(walletType) {
        console.log('Connecting wallet:', walletType);
        // Implement wallet connection logic here
        try {
            const walletApi = walletApis[walletType];
            if (!walletApi) {
                throw new Error(`${walletType} wallet not available`);
            }
    
            // Connect to the wallet API
            const api = await walletApi.enable();
            console.log('Wallet connected successfully:', walletType);
            // Display success toast
            displayToast(`${walletType} wallet connected successfully.`);
            // Close the wallet modal
            setModalOpen(false);
            // Update selected wallet
            setSelectedWallet(walletType);
            // Get wallet balance
            const balance = await fetchWalletBalance(walletType);
            // Update wallet balance
            setWalletBalances(prevBalances => ({ ...prevBalances, [walletType]: balance }));

            // Update connected wallet logo and total Ada amount
            setConnectedWalletLogo(getWalletLogo(walletType)); // Assuming there's a function to get the logo
            setTotalAdaAmount(balance); // Update with the actual total Ada amount
        } catch (error) {
            console.error('Error connecting wallet:', error);
            // Display error toast
            displayToast(`${walletType} wallet failed to connect`, 'error');
        }
    }
    
    async function fetchWalletBalance(walletType) {
        // Fetch wallet balance logic here (replace with actual implementation)
        // For demonstration purposes, returning a random balance
        return Math.random() * 1000;
    }

    async function disconnectWallet() {
        // Implement wallet disconnection logic here
        setSelectedWallet(null);
        setConnectedWalletLogo(null);
        setTotalAdaAmount(0);
        displayToast('Wallet disconnected successfully.');
    }

    const displayToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Function to open the wallet modal
    const openModal = () => {
        setModalOpen(true);
    };

    // Function to close the wallet modal
    const closeModal = () => {
        setModalOpen(false);
    };

    // Function to toggle the sidebar
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Function to get wallet logo
    const getWalletLogo = (walletType) => {
        switch (walletType) {
            case 'nami':
                return namiImage;
            case 'eternl':
                return eternlImage;
            case 'lace':
                return laceImage;
            case 'yoroi':
                return yoroiImage;
            default:
                return null;
        }
    };

    // Define toast styles
    const toastStyle = {
        success: {
            backgroundColor: '#4BB543', 
            color: '#000000', 
        },
        error: {
            backgroundColor: '#FF0000', 
            color: '#FFFFFF', 
        },
    };

    return (
        <div className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            {/* Hamburger Menu Icon */}
            <FontAwesomeIcon icon={faBars} className="text-gray-600 h-6 w-6 md:hidden" onClick={toggleSidebar} />

            {/* Logo */}
            <div className="flex items-center">
                <img src={Puurr} alt="PCS" className={`w-12 h-12 rounded-full mr-4 object-cover ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{marginLeft: '120px'}} />
                <h1 className="text-xl font-bold">PCS</h1>
            </div>

            {/* Connect Wallet Button */}
            <div className="flex">
                {selectedWallet ? (
                    // Connected Wallet Button with Hover Box
                    <div className="relative">
                        <button
                            className={`flex items-center justify-center px-4 py-2 rounded-lg border hover:border-green-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                        >
                            {connectedWalletLogo && <img src={connectedWalletLogo} alt="Connected Wallet" className="w-6 h-6 mr-2" />} Connected
                        </button>
                        {/* Hover Box */}
                        <div className="absolute top-full left-0 -ml-16 p-4 bg-white shadow-md rounded-md opacity-0 transition-opacity duration-300 hover:opacity-100 z-10">
                            <div className="flex items-center mb-2">
                                {connectedWalletLogo && <img src={connectedWalletLogo} alt="Connected Wallet" className="w-6 h-6 mr-2" />}
                                <span className="font-semibold text-black">{selectedWallet}</span> {/* Display the selected wallet */}
                            </div>
                            <div className="flex items-center">
                                <span className="text-black">Total ADA: {totalAdaAmount} ₳</span> {/* Show total ADA amount */}
                                <button
                                    className="ml-auto text-red-600 hover:text-red-800"
                                    onClick={disconnectWallet}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Connect Wallet Button
                    <button
                        className={`flex items-center justify-center px-4 py-2 rounded-lg border hover:border-green-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                        onClick={openModal}
                    >
                        <FontAwesomeIcon icon={faWallet} className="text-blue-500 h-6 w-6 mr-2" />
                        Connect
                    </button>
                )}

                {/* Add space */}
                <div style={{ width: '10px' }}></div>

                {/* Toggle Dark Mode Button */}
                <button
                    className={`flex items-center justify-center px-4 py-2 rounded-lg border hover:border-green-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={toggleDarkMode}
                >
                    <FontAwesomeIcon icon={darkMode ? faLightbulb : faAdjust} className="text-gray-600 h-6 w-6" />
                </button>
            </div>

            {/* Wallet Modal */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className={`relative ${darkMode ? 'bg-customRichBlack text-white' : 'bg-white text-black'} p-8 rounded-lg w-full md:w-2/3 max-w-lg`}>
                        {/* Close button */}
                        <button
                                 className="absolute top-0 right-0 mt-2 mr-2 text-2xl font-semibold leading-none hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center justify-center"
                                 onClick={closeModal}
                                 style={{ borderRadius: '5px' }}
                        >
                            &times;
                        </button>

                        {/* Wallet buttons */}
                        <div className="flex justify-center mb-4">
                            <button className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} mr-4 hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400`} onClick={() => connectWallet('nami')}>
                                <img src={namiImage} alt="Nami" className="w-12 h-12" />
                                <span>Nami</span>
                            </button>
                            <button className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} mr-4 hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400`} onClick={() => connectWallet('eternl')}>
                                <img src={eternlImage} alt="Eternl" className="w-12 h-12" />
                                <span>Eternl</span>
                            </button>
                            <button className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} mr-4 hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400`} onClick={() => connectWallet('lace')}>
                                <img src={laceImage} alt="Lace" className="w-12 h-12" />
                                <span>Lace</span>
                            </button>
                            <button className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400`} onClick={() => connectWallet('yoroi')}>
                                <img src={yoroiImage} alt="Yoroi" className="w-12 h-12" />
                                <span>Yoroi</span>
                            </button>
                        </div>
                    </div>
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
                        ...toastStyle[toastType], // Apply style based on toastType
                    }}
                >
                    {toastMessage}
                </div>
            )}

            {/* Sidebar */}
            <SideBar
                isSidebarVisible={sidebarOpen}
                toggleSidebar={toggleSidebar}
                darkMode={darkMode}
                openModal={openModal}
                onSelect={(service) => console.log(service)} // Replace console.log with your logic
            />
        </div>
    );
};

export default Navbar;
