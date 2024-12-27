import React, { useState, useEffect } from 'react';
import { TransactionUnspentOutput } from '@emurgo/cardano-serialization-lib-asmjs';
import Modal from 'react-modal';
import { Buffer } from 'buffer'; // Import Buffer for browser compatibility

Modal.setAppElement('#root');

// Define the allowed policy IDs and their corresponding names
const allowedPolicyIDs = [
    'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e', // OG COLLECTION
    'd91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c', // Naru x Puurrty (Yummi Collab)
    '52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1', // Halloween Collection
    'c94ba9d7f91040d93a305a2c078838b870f4a70a06f41dabce952f47', // Puurrty
];

const policyIDToName = {
    'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e': 'OG COLLECTION',
    'd91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c': 'Naru x Puurrty (Yummi Collab)',
    '52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1': 'Halloween Collection',
    'c94ba9d7f91040d93a305a2c078838b870f4a70a06f41dabce952f47': 'Puurrty',
};

// Define staking options and associated rewards
const stakingOptions = {
    3: 5,          // 3 epochs = 5% reward
    6: 10,         // 6 epochs = 10% reward
    9: 15,         // 9 epochs = 15% reward
    continuous: 20, // continuous = 20% reward
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#222',
        color: '#fff',
        borderRadius: '10px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginBottom: '20px',
        cursor: 'pointer',
    },
    filterContainer: {
        marginBottom: '20px',
    },
    select: {
        padding: '5px',
        fontSize: '14px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        backgroundColor: '#444',
        color: '#fff',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        color: '#fff',
        backgroundColor: '#333',
        tableLayout: 'fixed',
    },
    th: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        wordWrap: 'break-word',
    },
    td: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        color: '#fff',
    },
    actionButton: {
        padding: '10px 20px',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    stakeButton: {
        backgroundColor: '#007bff',
        marginRight: '10px',
    },
    redeemButton: {
        backgroundColor: '#28a745',
    },
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
    },
    modalContent: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '600px',
        margin: '0 auto',
        zIndex: 10000,
    },
    modalButton: {
        padding: '10px 20px',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    confirmButton: {
        backgroundColor: '#007bff',
        marginRight: '10px',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
    },
    durationButton: (isSelected) => ({
        padding: '10px 20px',
        backgroundColor: isSelected ? '#007bff' : '#555',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginRight: '10px',
        cursor: 'pointer',
    }),
};

function StakeToken({ wallet }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedPolicyId, setSelectedPolicyId] = useState('');
    const [selectedDuration, setSelectedDuration] = useState(null); // To store selected staking duration
    const [selectedPercentage, setSelectedPercentage] = useState(null); // To store selected reward percentage

    const filteredAssets = selectedPolicyId
        ? assets.filter((asset) => asset.policyID === selectedPolicyId)
        : assets;

    const fetchMetadataBatch = async (assetBatch) => {
        try {
            console.log('Fetching metadata for batch:', assetBatch);

            const response = await fetch('http://localhost:3002/assetsBatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assets: assetBatch }),
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                console.error(`Error response received: ${response.statusText} (Status Code: ${response.status})`);
                throw new Error(`Error: ${response.statusText}`);
            }

            const metadata = await response.json();
            console.log('Metadata fetched successfully:', metadata);

            return metadata.reduce((acc, item) => {
                acc[item.assetID] = item.metadata;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error in fetchMetadataBatch:', error);
            return {};
        }
    };

    const queryUTXOs = async () => {
        if (!wallet) {
            console.error('Wallet not connected');
            return;
        }

        try {
            setLoading(true);
            setAssets([]); // Clear existing assets

            const utxoHexList = await wallet.api.getUtxos();
            if (!utxoHexList || utxoHexList.length === 0) {
                console.warn('No UTXOs found in wallet');
                setLoading(false);
                return;
            }

            let foundAssets = [];
            for (const utxoHex of utxoHexList) {
                const transactionUnspentOutput = TransactionUnspentOutput.from_hex(utxoHex);
                const output = transactionUnspentOutput.output().to_js_value();

                if (output.amount && output.amount.multiasset) {
                    const multiasset = output.amount.multiasset;

                    for (const [policyID, assetsMap] of multiasset.entries()) {
                        // Only include assets with a policy ID that is in the allowed list
                        if (!allowedPolicyIDs.includes(policyID)) {
                            continue;
                        }

                        for (const [assetNameHex, amount] of assetsMap.entries()) {
                            foundAssets.push({
                                policyID,
                                assetNameHex,
                                amount: parseInt(amount),
                                assetID: `${policyID}${assetNameHex}`,
                            });
                        }
                    }
                }
            }

            // Combine assets with the same policyID and assetNameHex
            const aggregatedAssets = foundAssets.reduce((acc, asset) => {
                const key = `${asset.policyID}-${asset.assetNameHex}`;
                if (!acc[key]) {
                    acc[key] = { ...asset };
                } else {
                    acc[key].amount += asset.amount; // Aggregate the amounts
                }
                return acc;
            }, {});

            // Convert aggregated assets back to an array
            const aggregatedAssetsArray = Object.values(aggregatedAssets);

            // Fetch metadata in batches
            const batchSize = 10; // Assets per batch
            let enrichedAssets = [];
            for (let i = 0; i < aggregatedAssetsArray.length; i += batchSize) {
                const batch = aggregatedAssetsArray.slice(i, i + batchSize);
                const metadata = await fetchMetadataBatch(batch);
                enrichedAssets = enrichedAssets.concat(
                    batch.map((asset) => ({
                        ...asset,
                        metadata: metadata[asset.assetID] || null,
                        assetName: Buffer.from(asset.assetNameHex, 'hex').toString('utf-8'),
                        imageUrl: metadata[asset.assetID]?.image || 'default-image-url.png', // Use a default image if none found
                    }))
                );
            }

            setAssets(enrichedAssets);
        } catch (error) {
            console.error('Error querying UTXOs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (wallet) queryUTXOs();
    }, [wallet]);

    const handleSelectAsset = (asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAsset(null);
        setSelectedDuration(null);
        setSelectedPercentage(null);
    };

    const calculateRewardPercentage = (numAssets, duration) => {
        let baseReward = stakingOptions[duration] || 0;

        if (numAssets >= 10) {
            baseReward += 5;
        } else if (numAssets >= 5) {
            baseReward += 3;
        }

        if (duration > 20) {
            baseReward /= 2;
        }

        return baseReward;
    };

    const handleStake = async () => {
        if (!selectedAsset) {
            console.error('No asset selected');
            return;
        }

        const { policyID, amount, assetNameHex } = selectedAsset;
        if (!allowedPolicyIDs.includes(policyID)) {
            console.error('Selected asset does not have an allowed policy ID');
            return;
        }

        if (!selectedDuration) {
            console.error('No staking duration selected');
            return;
        }

        const rewardPercentage = calculateRewardPercentage(amount, selectedDuration);
        setSelectedPercentage(rewardPercentage);

        try {
            // Implement the staking transaction logic here
            console.log(`Staking ${amount} of ${assetNameHex} for ${selectedDuration} epochs.`);

            // Example transaction structure (to be replaced with actual implementation)
            const transaction = await wallet.api.sendTransaction({
                // Prepare the transaction structure for staking
                // e.g., sending ADA as processing fee, interacting with staking contract, etc.
            });

            console.log('Transaction successfully sent', transaction);

            // Close the modal after successful staking
            closeModal();
        } catch (error) {
            console.error('Error staking assets:', error);
        }
    };

    const handleRedeem = async (asset) => {
        if (!asset) {
            console.error('No asset selected');
            return;
        }

        console.log('Redeeming asset:', asset);
        // Implement redeem logic here

        // Close the modal after redeeming
        closeModal();
    };

    const policyIds = Array.from(new Set(assets.map((asset) => asset.policyID)));

    return (
        <div style={styles.container}>
            <button
                onClick={queryUTXOs}
                disabled={loading}
                style={styles.button}
            >
                {loading ? 'Loading...' : 'Reload'}
            </button>

            <div style={styles.filterContainer}>
                <label htmlFor="policyId" style={{ fontSize: '16px', marginRight: '10px' }}>Filter by Policy:</label>
                <select
                    id="policyId"
                    value={selectedPolicyId}
                    onChange={(e) => setSelectedPolicyId(e.target.value)}
                    style={styles.select}
                >
                    <option value="">All Policies</option>
                    {policyIds.map((policyID) => (
                        <option key={policyID} value={policyID}>
                            {policyIDToName[policyID]}
                        </option>
                    ))}
                </select>
            </div>

            {filteredAssets.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={{ ...styles.th, width: '35%' }}>Asset</th>
                        <th style={{ ...styles.th, width: '25%', textAlign: 'center' }}>Amount</th>
                        <th style={{ ...styles.th, width: '40%', textAlign: 'center' }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAssets.map((asset) => (
                        <tr key={asset.assetID}>
                            <td
                                style={{ ...styles.td, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                onClick={() => handleSelectAsset(asset)}
                            >
                                {asset.metadata && asset.metadata.image ? (
                                    <img
                                        src={asset.metadata.image}
                                        alt={asset.assetName || 'Asset'}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            objectFit: 'cover',
                                            borderRadius: '5px',
                                            marginRight: '10px',
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            backgroundColor: '#ddd',
                                            borderRadius: '5px',
                                            marginRight: '10px',
                                        }}
                                    ></div>
                                )}
                                <span>{asset.assetName || 'Unknown Asset'}</span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                {asset.amount}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                <button
                                    onClick={() => handleSelectAsset(asset)}
                                    style={{ ...styles.actionButton, ...styles.stakeButton }}
                                >
                                    Stake
                                </button>
                                <button
                                    onClick={() => handleRedeem(asset)}
                                    style={{ ...styles.actionButton, ...styles.redeemButton }}
                                >
                                    Redeem
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No assets found.</p>
            )}

            {/* Staking Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Asset Details"
                style={{
                    overlay: styles.modalOverlay,
                    content: styles.modalContent,
                }}
            >
                {selectedAsset && (
                    <div>
                        <h2>Asset Details</h2>
                        <p><strong>Policy ID:</strong> {selectedAsset.policyID}</p>
                        <p><strong>Asset Name:</strong> {selectedAsset.assetNameHex}</p>
                        <p><strong>Amount:</strong> {selectedAsset.amount}</p>

                        <div>
                            <h3>Choose Staking Duration</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {Object.keys(stakingOptions).map((duration) => (
                                    <button
                                        key={duration}
                                        onClick={() => {
                                            setSelectedDuration(duration);
                                            const reward = calculateRewardPercentage(selectedAsset.amount, duration);
                                            setSelectedPercentage(reward);
                                        }}
                                        style={styles.durationButton(selectedDuration === duration)}
                                    >
                                        {duration === 'continuous' ? 'Continuous' : `${duration} Epochs`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                onClick={handleStake}
                                style={{ ...styles.modalButton, ...styles.confirmButton }}
                            >
                                Confirm Stake
                            </button>
                            <button
                                onClick={closeModal}
                                style={{ ...styles.modalButton, ...styles.cancelButton }}
                            >
                                Cancel
                            </button>
                        </div>

                        {selectedPercentage !== null && (
                            <p style={{ textAlign: 'center', marginTop: '10px' }}>
                                Reward Percentage: {selectedPercentage}%
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default StakeToken;
