// src/component/ConnectWallet.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from 'prop-types';
import { Address, Value, TransactionUnspentOutput } from "@emurgo/cardano-serialization-lib-asmjs";
import { Buffer } from "buffer"; // Polyfill for Buffer if needed
import { MetaDataContext } from "./MetaDataContext"; // Ensure correct path

// Define Puurrty's policy ID and asset name
const puurrtyPolicyID = 'c94ba9d7f91040d93a305a2c078838b870f4a70a06f41dabce952f47';
const puurrtyAssetName = 'puurrty';

function ConnectWallet({ setWallet, adaHandle }) {
    const [wallets, setWallets] = useState([]);
    const [connectedWallet, setConnectedWallet] = useState(null);
    const [balance, setBalance] = useState("0.000000");
    const [puurrtyBalance, setPuurrtyBalance] = useState("0.000000");
    const [puurrtyImage, setPuurrtyImage] = useState(null);
    const [adaHandleImage, setAdaHandleImage] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

    const { metaData } = useContext(MetaDataContext); // Consume metaData from Context

    // Detect available wallets on component mount
    useEffect(() => {
        const detectedWallets = [];
        for (const key in window.cardano) {
            if (window.cardano[key]?.enable && !detectedWallets.includes(key)) {
                detectedWallets.push(key);
            }
        }
        setWallets(detectedWallets.sort());
        console.log("Detected wallets:", detectedWallets);
    }, []);

    // Handle wallet selection and connection
    const handleWalletSelection = useCallback(async (key) => {
        try {
            const wallet = await window.cardano[key].enable();
            const networkID = await wallet.getNetworkId();

            // Get the main address (bech32)
            const hexAddress = await wallet.getChangeAddress();
            const bech32Address = Address.from_hex(hexAddress).to_bech32();
            console.log(`Wallet Address (bech32): ${bech32Address}`);

            // Get ADA balance
            const balanceCBORHex = await wallet.getBalance();
            const walletBalance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();
            const balanceInAda = (Number(walletBalance) / 1_000_000).toFixed(6);
            console.log(`ADA Balance (ADA): ${balanceInAda}`);
            setBalance(balanceInAda);

            // Get UTXOs and calculate Puurrty balance
            const utxoHexList = await wallet.getUtxos();
            console.log(`Fetched ${utxoHexList.length} UTXOs`);

            let foundPuurrtyBalance = 0;

            for (const utxoHex of utxoHexList) {
                const transactionUnspentOutput = TransactionUnspentOutput.from_hex(utxoHex);
                const output = transactionUnspentOutput.output().to_js_value();
                if (output.amount && output.amount.multiasset) {
                    const multiasset = output.amount.multiasset;
                    for (const [policyID, assetsMap] of multiasset.entries()) {
                        for (const [assetNameHex, amount] of assetsMap.entries()) {
                            const assetName = Buffer.from(assetNameHex, "hex").toString("utf-8").toLowerCase();
                            if (policyID === puurrtyPolicyID && assetName === puurrtyAssetName) {
                                foundPuurrtyBalance += Number(amount);
                            }
                        }
                    }
                }
            }

            const actualPuurrtyBalance = (foundPuurrtyBalance / 1_000_000).toFixed(6);
            const formattedPuurrtyBalance = Number(actualPuurrtyBalance).toLocaleString(undefined, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
            });
            setPuurrtyBalance(formattedPuurrtyBalance);

            const changeHexAddress = await wallet.getChangeAddress();
            const changeBech32Address = Address.from_hex(changeHexAddress).to_bech32();
            console.log(`Change Address (bech32): ${changeBech32Address}`);

            // Set connected wallet details
            const walletDetails = {
                name: window.cardano[key].name,
                logo: window.cardano[key].icon,
                balance: balanceInAda,
                bech32Address,
                changeBech32Address,
                api: wallet,
                network: networkID,
            };
            setConnectedWallet(walletDetails);

            // Update parent state
            setWallet({
                api: wallet,
                address: hexAddress,
                bech32: bech32Address,
                network: networkID,
            });

        } catch (error) {
            console.error("Error connecting wallet:", error);
            // Reset states on error
            setBalance("0.000000");
            setPuurrtyBalance("0.000000");
            setPuurrtyImage(null);
            setAdaHandleImage(null);
            setConnectedWallet(null);
            setWallet(null);
        }
    }, [setWallet]);

    // Handle wallet disconnection
    const handleDisconnect = useCallback(() => {
        setConnectedWallet(null);
        setBalance("0.000000");
        setPuurrtyBalance("0.000000");
        setPuurrtyImage(null);
        setAdaHandleImage(null);
        setIsDropdownOpen(false);
        setWallet(null);
    }, [setWallet]);

    // Handle copying text to clipboard
    const copyToClipboard = useCallback((text) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess("Copied!");
            setTimeout(() => setCopySuccess(''), 2000);
        }).catch((err) => {
            console.error("Failed to copy: ", err);
            setCopySuccess("Failed to copy!");
        });
    }, []);

    // Once metaData updates, find and set Puurrty and ADA Handle images
    useEffect(() => {
        console.log("ConnectWallet received metaData:", metaData);
        if (metaData && metaData.length > 0) {
            // Find Puurrty asset
            const puurrtyAsset = metaData.find(item =>
                item.metadata &&
                item.metadata.name &&
                item.metadata.name.toLowerCase() === 'puurrty'
            );
            if (puurrtyAsset && puurrtyAsset.metadata.image) {
                setPuurrtyImage(puurrtyAsset.metadata.image);
                console.log("Puurrty Image set:", puurrtyAsset.metadata.image);
            } else {
                setPuurrtyImage(null);
                console.log("Puurrty Image not found");
            }

            // Find ADA Handle asset (name starts with '$')
            const adaHandleAsset = metaData.find(item =>
                item.metadata &&
                item.metadata.name &&
                item.metadata.name.startsWith('$')
            );
            if (adaHandleAsset && adaHandleAsset.metadata.image) {
                setAdaHandleImage(adaHandleAsset.metadata.image);
                console.log("ADA Handle Image set:", adaHandleAsset.metadata.image);
            } else {
                setAdaHandleImage(null);
                console.log("ADA Handle Image not found");
            }
        } else {
            setPuurrtyImage(null);
            setAdaHandleImage(null);
            console.log("No metaData available");
        }
    }, [metaData]);

    return (
        <div className="connect-wallet">
            <div className="dropdown" onMouseLeave={() => setIsDropdownOpen(false)}>
                <button
                    className="connect-button"
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    aria-label="Connect Wallet Dropdown"
                >
                    {connectedWallet ? (
                        <div className="connected-wallet">
                            <img
                                src={connectedWallet.logo}
                                width={32}
                                height={32}
                                alt={`${connectedWallet.name} Logo`}
                                className="wallet-icon"
                            />
                            <span>{connectedWallet.name}</span>
                        </div>
                    ) : (
                        "Connect Wallet"
                    )}
                </button>
                {isDropdownOpen && (
                    <div className="dropdown-content" role="menu">
                        {!connectedWallet ? (
                            wallets.map((key) => (
                                <button
                                    key={key}
                                    className="wallet-item"
                                    onClick={() => { handleWalletSelection(key); setIsDropdownOpen(false); }}
                                    role="menuitem"
                                    aria-label={`Connect to ${window.cardano[key].name} wallet`}
                                >
                                    <img
                                        src={window.cardano[key].icon}
                                        width={32}
                                        height={32}
                                        alt={`${window.cardano[key].name} Logo`}
                                        className="wallet-icon"
                                    />
                                    <span>{window.cardano[key].name}</span>
                                </button>
                            ))
                        ) : (
                            <div className="wallet-info">
                                <div className="wallet-details">
                                    <p><strong>₳:</strong> {balance}</p>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <strong style={{ marginRight: '10px' }}>₱:</strong> {puurrtyBalance}
                                        {puurrtyImage ? (
                                            <img
                                                src={puurrtyImage}
                                                alt="Puurrty"
                                                width="32"
                                                height="32"
                                                style={{ marginLeft: '10px' }}
                                            />
                                        ) : (
                                            <span style={{ marginLeft: '10px', color: '#ccc' }}>No Image</span>
                                        )}
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <button
                                            className="copy-button"
                                            onClick={() => copyToClipboard(connectedWallet.bech32Address)}
                                            aria-label="Copy Address to Clipboard"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '0',
                                                cursor: 'pointer',
                                                marginRight: '5px',
                                            }}
                                        >
                                            <i className="fas fa-copy"></i>
                                        </button>
                                        <strong>Address:</strong> {connectedWallet.bech32Address}
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <button
                                            className="copy-button"
                                            onClick={() => copyToClipboard(connectedWallet.changeBech32Address)}
                                            aria-label="Copy Change Address to Clipboard"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '0',
                                                cursor: 'pointer',
                                                marginRight: '5px',
                                            }}
                                        >

                                        </button>

                                    </p>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="disconnect-button"
                                    aria-label="Disconnect Wallet"
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Disconnect
                                </button>
                                <div className="ada-handle-section" style={{ marginTop: '15px' }}>
                                    <p style={{ display: 'flex', alignItems: 'center' }}>
                                        <strong style={{ marginRight: '10px' }}>ADA Handle:</strong> {adaHandle || "Not available"}
                                        {adaHandle && (
                                            <>
                                                <button
                                                    className="copy-button"
                                                    onClick={() => copyToClipboard(adaHandle)}
                                                    aria-label="Copy ADA Handle to Clipboard"
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: '0',
                                                        cursor: 'pointer',
                                                        marginLeft: '5px',
                                                    }}
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                                {adaHandleImage ? (
                                                    <img
                                                        src={adaHandleImage}
                                                        alt="ADA Handle"
                                                        width="32"
                                                        height="32"
                                                        style={{ marginLeft: '10px' }}
                                                    />
                                                ) : (
                                                    <span style={{ marginLeft: '10px', color: '#ccc' }}>No Image</span>
                                                )}
                                            </>
                                        )}
                                    </p>
                                    {copySuccess && (
                                        <span className="copy-feedback" style={{ marginLeft: '10px', color: 'green' }}>
                                            {copySuccess}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

ConnectWallet.propTypes = {
    setWallet: PropTypes.func.isRequired,
    adaHandle: PropTypes.string,
    // Removed assetImage and metaData as they are no longer needed
};

export default ConnectWallet;
