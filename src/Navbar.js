import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faLightbulb, faAdjust, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import SideBar from './SideBar';
import ConnectWallet from './ConnectWallet';
import Puurr from './images/puurr.png';
import namiImage from './images/nami.jpg';
import eternlImage from './images/eternl.jpg';
import laceImage from './images/lace.jpg';
import yoroiImage from './images/yoroi.jpg';
import {
    Address,
    TransactionUnspentOutput,
    Value,
} from "@emurgo/cardano-serialization-lib-asmjs";

const Navbar = ({ darkMode, toggleDarkMode, setWallet }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [connectedWalletLogo, setConnectedWalletLogo] = useState(null);
    const [totalAdaAmount, setTotalAdaAmount] = useState(0);
    const [walletData, setWalletData] = useState({
        balance: null,
        changeAddress: null,
        rewardAddress: null,
        usedAddress: null,
        utxos: [],
    });

    const walletApis = {
        nami: window.cardano?.nami,
        eternl: window.cardano?.eternl,
        lace: window.cardano?.lace,
        yoroi: window.cardano?.yoroi,
    };

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

    async function connectWallet(walletType) {
        console.log('Connecting wallet:', walletType);
        try {
            const walletApi = walletApis[walletType];
            if (!walletApi) {
                throw new Error(`${walletType} wallet not available`);
            }

            const api = await walletApi.enable();
            console.log('Wallet connected successfully:', walletType);
            displayToast(`${walletType} wallet connected successfully.`);
            setModalOpen(false);
            setSelectedWallet(walletType);
            setConnectedWalletLogo(getWalletLogo(walletType));

            // Fetch wallet information
            await fetchWalletData(api);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            displayToast(`${walletType} wallet failed to connect`, 'error');
        }
    }

    async function fetchWalletData(api) {
        try {
            const networkId = await api.getNetworkId();
            if (networkId !== 1) {
                displayToast('Please connect to the mainnet network.', 'error');
                return;
            }

            const balanceCBORHex = await api.getBalance();
            const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();

            const changeAddressRaw = await api.getChangeAddress();
            const changeAddress = Address.from_bytes(Buffer.from(changeAddressRaw, "hex")).to_bech32();

            const rewardAddressRaw = await api.getRewardAddresses();
            const rewardAddress = Address.from_bytes(Buffer.from(rewardAddressRaw[0], "hex")).to_bech32();

            const usedAddressRaw = await api.getUsedAddresses();
            const usedAddress = Address.from_bytes(Buffer.from(usedAddressRaw[0], "hex")).to_bech32();

            const rawUtxos = await api.getUtxos();
            let parsedUtxos = [];
            for (const rawUtxo of rawUtxos) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
                const input = utxo.input();
                const txid = Buffer.from(input.transaction_id().to_bytes(), "hex").toString("hex");
                const txindx = input.index();
                const output = utxo.output();
                const amount = output.amount().coin().to_str();
                parsedUtxos.push({ txid, txindx, amount });
            }

            setWalletData({
                balance,
                changeAddress,
                rewardAddress,
                usedAddress,
                utxos: parsedUtxos,
            });
            setTotalAdaAmount(balance / 1000000); // Convert Lovelace to ADA
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        }
    }

    async function disconnectWallet() {
        setSelectedWallet(null);
        setConnectedWalletLogo(null);
        setTotalAdaAmount(0);
        setWalletData({
            balance: null,
            changeAddress: null,
            rewardAddress: null,
            usedAddress: null,
            utxos: [],
        });
        displayToast('Wallet disconnected successfully.');
    }

    const displayToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <FontAwesomeIcon icon={faBars} className="text-gray-600 h-6 w-6 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex items-center">
                <img src={Puurr} alt="PCS" className={`w-12 h-12 rounded-full mr-4 object-cover ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ marginLeft: '120px' }} />
                <h1 className="text-xl font-bold">PCS</h1>
            </div>

            <div className="flex">
                {selectedWallet ? (
                    <div className="relative">
                        <button
                            className={`flex items-center justify-center px-4 py-2 rounded-lg border hover:border-green-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                        >
                            {connectedWalletLogo && <img src={connectedWalletLogo} alt="Connected Wallet" className="w-6 h-6 mr-2" />} Connected
                        </button>
                        <div className="absolute top-full left-0 -ml-16 p-4 bg-white shadow-md rounded-md opacity-0 transition-opacity duration-300 hover:opacity-100 z-10">
                            <div className="flex items-center mb-2">
                                {connectedWalletLogo && <img src={connectedWalletLogo} alt="Connected Wallet" className="w-6 h-6 mr-2" />}
                                <span className="font-semibold text-black">{selectedWallet}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-black">Total ADA: {totalAdaAmount} ₳</span>
                                <button className="ml-auto text-red-600 hover:text-red-800" onClick={disconnectWallet}>
                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" /> Logout
                                </button>
                            </div>
                            <div className="mt-2">
                                <p className="text-black text-sm">Change Address: {walletData.changeAddress}</p>
                                <p className="text-black text-sm">Reward Address: {walletData.rewardAddress}</p>
                                <p className="text-black text-sm">Used Address: {walletData.usedAddress}</p>
                            </div>
                            <div className="mt-2">
                                <h5 className="text-black text-sm font-semibold">UTXOs:</h5>
                                <ul className="text-black text-xs">
                                    {walletData.utxos.map((utxo, index) => (
                                        <li key={index}>
                                            TXID: {utxo.txid}, Amount: {utxo.amount} Lovelace
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        className={`flex items-center justify-center px-4 py-2 rounded-lg border hover:border-green-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                        onClick={() => setModalOpen(true)}
                    >
                        <FontAwesomeIcon icon={faWallet} className="text-blue-500 h-6 w-6 mr-2" />
                        Connect
                    </button>
                )}
                <div style={{ width: '10px' }}></div>
                <button
                    className={`flex items-center justify-center px-4 py-2 rounded-lg border hover:border-green-400 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={toggleDarkMode}
                >
                    <FontAwesomeIcon icon={darkMode ? faLightbulb : faAdjust} className="text-gray-600 h-6 w-6" />
                </button>

                
            </div>

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className={`relative ${darkMode ? 'bg-customRichBlack text-white' : 'bg-white text-black'} p-8 rounded-lg w-full md:w-2/3 max-w-lg`}>
                        <button
                            className="absolute top-0 right-0 mt-2 mr-2 text-2xl font-semibold leading-none hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center justify-center"
                            onClick={() => setModalOpen(false)}
                            style={{ borderRadius: '5px' }}
                        >
                            &times;
                        </button>
                        <div className="flex justify-center mb-4">
                            {Object.keys(walletApis).map(walletType => (
                                <button
                                    key={walletType}
                                    className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} mr-4 hover:bg-gray-700 hover:text-white rounded px-2 py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400`}
                                    onClick={() => connectWallet(walletType)}
                                >
                                    <img src={getWalletLogo(walletType)} alt={walletType} className="w-12 h-12" />
                                    <span>{walletType.charAt(0).toUpperCase() + walletType.slice(1)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
                        backgroundColor: toastType === 'success' ? '#4BB543' : '#FF0000',
                        color: toastType === 'success' ? '#000000' : '#FFFFFF',
                    }}
                >
                    {toastMessage}
                </div>
            )}

            <SideBar
                isSidebarVisible={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                darkMode={darkMode}
                openModal={() => setModalOpen(true)}
                onSelect={(service) => console.log(service)}
            />
        </div>
    );
};

export default Navbar;