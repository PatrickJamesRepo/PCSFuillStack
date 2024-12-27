// src/component/WalletUTXOs.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { TransactionUnspentOutput } from '@emurgo/cardano-serialization-lib-asmjs';
import { Buffer } from 'buffer';
import Modal from 'react-modal';
import { Table, Button, Form, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import AssetDetails from './AssetDetails'; // New Component
import StakeTx from './StakeToken'; // New Component
import SendTokenTx from './WalletTokenTx'; // New Component
import SendAdaTx from './WalletAdaTx'; // New Component
import MintTokenTx from './MintToken'; // New Component
import { MetaDataContext } from "./MetaDataContext";

// Ensure the modal is attached to the root element for accessibility
Modal.setAppElement('#root');

// Define the allowed policy IDs and their corresponding names
const allowedPolicyIDs = [
    'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e', // OG COLLECTION
    'd91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c', // Naru x Puurrty (Yummi Collab)
    '52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1', // Halloween Collection
    'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a', // ADA Handle
    'c94ba9d7f91040d93a305a2c078838b870f4a70a06f41dabce952f47', // Puurrty
];

const policyIDToName = {
    'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e': 'OG COLLECTION',
    'd91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c': 'Naru x Puurrty (Yummi Collab)',
    '52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1': 'Halloween Collection',
    'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a': 'ADA Handle',
    'c94ba9d7f91040d93a305a2c078838b870f4a70a06f41dabce952f47': 'Puurrty',
};

function WalletUTXOs({
                         wallet,
                         handleArView,
                         onUpdateAdaHandle,
                         adaHandle,
                         handleStake,
                         handleRedeem,

                         assetImage,
                         setWallet,
                     }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedPolicyId, setSelectedPolicyId] = useState('');
    const [sortedAssets, setSortedAssets] = useState([]);
    const [error, setError] = useState(null);
    const { metaData, setMetaData } = useContext(MetaDataContext); // Access metaData from Context
    const [showAssetDetails, setShowAssetDetails] = useState(false); // New State
    const [carouselIndex, setCarouselIndex] = useState(0); // New State for carousel index
    const [selectedTransactionType, setSelectedTransactionType] = useState('stake'); // Default to 'Stake'
    /**
     * Filter assets based on selected policy ID.
     */
    const filteredAssets = selectedPolicyId
        ? assets.filter((asset) => asset.policyID === selectedPolicyId)
        : assets;

    /**
     * Handle sorting of assets by specified column.
     * @param {string} column - The column to sort by.
     */
    const handleSort = useCallback(
        (column) => {
            const sortedData = [...filteredAssets].sort((a, b) => {
                if (typeof a[column] === 'string') {
                    return a[column].localeCompare(b[column]);
                }
                return a[column] - b[column];
            });
            setSortedAssets(sortedData);
        },
        [filteredAssets]
    );

    /**
     * Fetch metadata for a batch of assets from the backend API.
     * @param {Array} assetBatch - Array of asset objects.
     * @returns {Object} - An object mapping assetID to its metadata.
     */
    const fetchMetadataBatch = useCallback(async (assetBatch) => {
        try {
            console.log('Fetching metadata for batch:', assetBatch);

            const response = await fetch('http://localhost:3003/assetsBatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assets: assetBatch }),
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                console.error(
                    `Error response received: ${response.statusText} (Status Code: ${response.status})`
                );
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
            setError(error.message || 'Failed to fetch asset metadata.');
            return {};
        }
    }, []);

    /**
     * Query UTXOs from the wallet and process assets.
     */
    const queryUTXOs = useCallback(async () => {
        if (!wallet) {
            console.error('Wallet not connected');
            setError('Wallet not connected.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setAssets([]);
            const utxoHexList = await wallet.api.getUtxos();

            if (!utxoHexList || utxoHexList.length === 0) {
                console.warn('No UTXOs found in wallet');
                setError('No UTXOs found in wallet.');
                setLoading(false);
                return;
            }

            // Extract and filter assets based on allowedPolicyIDs
            const foundAssets = utxoHexList.flatMap((utxoHex) => {
                const transactionUnspentOutput = TransactionUnspentOutput.from_hex(utxoHex);
                const output = transactionUnspentOutput.output().to_js_value();

                if (output.amount && output.amount.multiasset) {
                    const multiasset = output.amount.multiasset;

                    return Array.from(multiasset.entries()).flatMap(([policyID, assetsMap]) => {
                        if (!allowedPolicyIDs.includes(policyID)) return [];

                        return Array.from(assetsMap.entries()).map(([assetNameHex, amount]) => ({
                            policyID,
                            assetNameHex,
                            amount: parseInt(amount, 10),
                            assetID: `${policyID}${assetNameHex}`,
                        }));
                    });
                }

                return [];
            });

            if (foundAssets.length === 0) {
                console.warn('No assets found matching allowed policies');
                setError('No assets found matching allowed policies.');
                setLoading(false);
                return;
            }

            // Aggregate assets with the same policyID and assetNameHex
            const aggregatedAssets = foundAssets.reduce((acc, asset) => {
                const key = `${asset.policyID}-${asset.assetNameHex}`;
                if (!acc[key]) {
                    acc[key] = { ...asset };
                } else {
                    acc[key].amount += asset.amount;
                }
                return acc;
            }, {});

            const aggregatedAssetsArray = Object.values(aggregatedAssets);
            const batchSize = 10;
            let enrichedAssets = [];
            let localAdaHandle = null;
            let collectedMetaData = []; // Initialize an array to collect metadata

            // Fetch metadata in batches
            for (let i = 0; i < aggregatedAssetsArray.length; i += batchSize) {
                const batch = aggregatedAssetsArray.slice(i, i + batchSize);
                const metadata = await fetchMetadataBatch(batch);

                enrichedAssets = enrichedAssets.concat(
                    batch.map((asset) => {
                        const assetMetadata = metadata[asset.assetID] || {};
                        const assetName = Buffer.from(asset.assetNameHex, 'hex').toString('utf-8');

                        // Extract ADA Handle if available
                        if (!localAdaHandle && assetMetadata?.name?.startsWith('$')) {
                            localAdaHandle = assetMetadata.name;
                        }

                        // Collect metadata for later use
                        if (assetMetadata.image) {
                            collectedMetaData.push({
                                assetID: asset.assetID,
                                metadata: assetMetadata,
                            });
                        }

                        return {
                            ...asset,
                            metadata: assetMetadata,
                            assetName,
                            imageUrl: assetMetadata?.image || 'https://example.com/default-image.png', // Ensure imageUrl is present
                        };
                    })
                );
            }

            setAssets(enrichedAssets);
            setMetaData(collectedMetaData); // Set the collected metadata in Context
            console.log('Collected metaData in WalletUTXOs:', collectedMetaData);

            // Pass ADA Handle to parent
            if (localAdaHandle && onUpdateAdaHandle) {
                onUpdateAdaHandle(localAdaHandle);
            }
        } catch (error) {
            console.error('Error querying UTXOs:', error);
            setError(error.message || 'An error occurred while querying UTXOs.');
        } finally {
            setLoading(false);
        }
    }, [wallet, fetchMetadataBatch, onUpdateAdaHandle, setMetaData]);

    /**
     * Handle when the component mounts or wallet changes.
     */
    useEffect(() => {
        if (wallet) {
            queryUTXOs();
        }
    }, [wallet, queryUTXOs]);

    /**
     * Handle asset selection to open the modal.
     * @param {Object} asset - The selected asset object.
     */
    const handleSelectAsset = useCallback((asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
        setShowAssetDetails(false); // Reset asset details visibility
        setSelectedTransactionType('stake'); // Reset to default transaction type
    }, []);

    /**
     * Handle closing the modal.
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedAsset(null);
        setShowAssetDetails(false); // Reset asset details visibility
    }, []);

    /**
     * Get unique policy IDs from assets.
     */
    const policyIds = Array.from(new Set(assets.map((asset) => asset.policyID)));

    /**
     * Handle AR View button click.
     * @param {Object} asset - The asset to view in AR.
     */
    const handleArViewClick = useCallback(
        (asset) => {
            handleArView(asset);
        },
        [handleArView]
    );

    /**
     * Handle Select button click.
     * @param {Object} asset - The asset to select.
     */
    const handleSelectClick = useCallback(
        (asset) => {
            handleSelectAsset(asset);
        },
        [handleSelectAsset]
    );

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Display Loading Spinner */}
            {loading && (
                <div className="d-flex justify-content-center my-3">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {/* Display Error Message */}
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {/* Display Assets Table */}
            {filteredAssets.length > 0 && !loading && (
                <div className="table-responsive" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Table hover bordered className="align-middle">
                        <thead className="table-light">
                        {/* Table Controls */}
                        <tr>
                            <th colSpan="5" className="text-center p-3">
                                {/* Reload Button */}
                                <Button
                                    onClick={queryUTXOs}
                                    disabled={loading}
                                    variant="primary"
                                    className="me-3"
                                    style={{
                                        padding: '10px 16px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Reload Assets
                                </Button>

                                {/* Policy ID Dropdown */}
                                <Form.Label htmlFor="policyId" className="me-2 fw-bold">
                                    Filter by Policy:
                                </Form.Label>
                                <Form.Select
                                    id="policyId"
                                    value={selectedPolicyId}
                                    onChange={(e) => {
                                        setSelectedPolicyId(e.target.value);
                                        setSortedAssets([]); // Reset sorting when filter changes
                                    }}
                                    className="form-select form-select-sm d-inline-block"
                                    style={{
                                        maxWidth: '300px',
                                        display: 'inline-block',
                                    }}
                                >
                                    <option value="">All Policies</option>
                                    {policyIds.map((policyID) => (
                                        <option key={policyID} value={policyID}>
                                            {policyIDToName[policyID] || 'Unknown Policy'}
                                        </option>
                                    ))}
                                </Form.Select>
                            </th>
                        </tr>

                        {/* Column Headers */}
                        <tr>
                            <th scope="col" className="text-center">
                                #
                            </th>
                            <th
                                scope="col"
                                className="sortable-column"
                                onClick={() => handleSort('assetName')}
                                style={{ cursor: 'pointer' }}
                            >
                                Asset Name
                            </th>
                            <th
                                scope="col"
                                className="sortable-column"
                                onClick={() => handleSort('amount')}
                                style={{ cursor: 'pointer' }}
                            >
                                Amount
                            </th>
                            <th
                                scope="col"
                                className="sortable-column"
                                onClick={() => handleSort('policyID')}
                                style={{ cursor: 'pointer' }}
                            >
                                Policy ID
                            </th>
                            <th scope="col" className="text-center">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {(sortedAssets.length > 0 ? sortedAssets : filteredAssets).map((asset, index) => (
                            <tr
                                key={asset.assetID}
                                className="table-row"
                                onClick={() => handleSelectAsset(asset)}
                                style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <th scope="row" className="text-center">
                                    {index + 1}
                                </th>
                                <td className="d-flex align-items-center">
                                    {/* Asset Image */}
                                    {asset.imageUrl ? (
                                        <img
                                            src={asset.imageUrl}
                                            alt={asset.assetName}
                                            className="rounded me-3"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                border: '1px solid #ddd',
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://example.com/default-image.png';
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#ddd',
                                                borderRadius: '5px',
                                                marginRight: '10px',
                                            }}
                                        ></div>
                                    )}
                                    {/* Asset Name */}
                                    <span
                                        className="fw-bold text-truncate"
                                        title={asset.assetName}
                                        style={{
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                            {asset.assetName || 'Unnamed Asset'}
                                        </span>
                                </td>
                                <td className="fw-bold">{asset.amount}</td>
                                <td className="text-muted text-truncate" style={{ maxWidth: '150px' }}>
                                    {asset.policyID}
                                </td>
                                <td className="text-center">
                                    {/* AR View Button */}
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        className="me-2"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click
                                            handleArViewClick(asset);
                                        }}
                                        aria-label={`View AR for ${asset.assetName}`}
                                    >
                                        <i className="bi bi-eye"></i> AR View
                                    </Button>

                                    {/* Select Button */}
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click
                                            handleSelectClick(asset);
                                        }}
                                        aria-label={`Select ${asset.assetName}`}
                                    >
                                        <i className="bi bi-check-circle"></i> Select
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Display Message if No Assets Found */}
            {!loading && filteredAssets.length === 0 && (
                <p className="text-center text-muted fs-5 mt-4">
                    No assets found. Please reload or adjust your filters.
                </p>
            )}

            {/* Transaction Modal */}
            {selectedAsset && (
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Token Transaction"
                    style={{
                        content: {
                            maxWidth: '900px',
                            margin: 'auto',
                            padding: '20px',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        },
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    }}
                >
                    {/* Navigation Buttons */}
                    <ButtonGroup className="mb-3">
                        <Button
                            variant={selectedTransactionType === 'stake' ? 'primary' : 'outline-primary'}
                            onClick={() => setSelectedTransactionType('stake')}
                        >
                            Stake
                        </Button>
                        <Button
                            variant={selectedTransactionType === 'sendToken' ? 'primary' : 'outline-primary'}
                            onClick={() => setSelectedTransactionType('sendToken')}
                        >
                            Send Token
                        </Button>
                        <Button
                            variant={selectedTransactionType === 'sendAda' ? 'primary' : 'outline-primary'}
                            onClick={() => setSelectedTransactionType('sendAda')}
                        >
                            Send ADA
                        </Button>
                        <Button
                            variant={selectedTransactionType === 'mintToken' ? 'primary' : 'outline-primary'}
                            onClick={() => setSelectedTransactionType('mintToken')}
                        >
                            Mint Token
                        </Button>
                    </ButtonGroup>

                    {/* Conditionally Render Selected Transaction Component */}
                    <div className="w-100">
                        {selectedTransactionType === 'stake' && (
                            <StakeTx asset={selectedAsset} wallet={wallet} onClose={closeModal} handleStake={handleStake} handleRedeem={handleRedeem} />
                        )}
                        {selectedTransactionType === 'sendToken' && (
                            <SendTokenTx asset={selectedAsset} onSelectAsset={selectedAsset} wallet={wallet} onClose={closeModal} assets={assets} handleStake={handleStake} handleRedeem={handleRedeem}/>
                        )}
                        {selectedTransactionType === 'sendAda' && (
                            <SendAdaTx wallet={wallet} onClose={closeModal} />
                        )}
                        {selectedTransactionType === 'mintToken' && (
                            <MintTokenTx wallet={wallet} onClose={closeModal} />
                        )}
                    </div>

                    {/* Asset Details Toggle */}
                    <Button
                        variant="info"
                        onClick={() => setShowAssetDetails((prev) => !prev)}
                        className="mt-3"
                    >
                        {showAssetDetails ? 'Hide Asset Details' : 'View Asset Details'}
                    </Button>

                    {/* Asset Details Section */}
                    {showAssetDetails && (
                        <AssetDetails asset={selectedAsset}  collections={policyIds} handleRedeem={handleRedeem} handleStake={handleStake}/>
                    )}

                    {/* Close Modal Button */}
                    <Button
                        variant="secondary"
                        onClick={closeModal}
                        className="mt-3"
                    >
                        Close
                    </Button>
                </Modal>
            )}
        </div>
    )

}

WalletUTXOs.propTypes = {
    wallet: PropTypes.object,
    handleArView: PropTypes.func.isRequired,
    onUpdateAdaHandle: PropTypes.func.isRequired,
    adaHandle: PropTypes.string,
    assetImage: PropTypes.string,
    setWallet: PropTypes.func.isRequired,
};

export default WalletUTXOs;
