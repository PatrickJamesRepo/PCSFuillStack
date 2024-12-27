import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { MetaDataProvider } from './MetaDataContext'; // Ensure the context is correctly imported

function MetadataAttributeSelector({
                                       selectedAsset,
                                       collections,
                                       handleStake,
                                       handleRedeem,
                                   }) {
    const [sortKey, setSortKey] = useState('key'); // 'key' or 'value'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [filterTerm, setFilterTerm] = useState('');
    const [filters, setFilters] = useState({}); // Track dropdown selections for each property

    // Extract all metadata keys dynamically from the selected asset
    const dynamicProperties = useMemo(() => {
        if (!selectedAsset || !selectedAsset.metadata) return [];
        return Object.keys(selectedAsset.metadata);
    }, [selectedAsset]);

    // Extract metadata entries
    const metadataEntries = useMemo(() => {
        if (!selectedAsset || !selectedAsset.metadata) return [];
        return Object.entries(selectedAsset.metadata);
    }, [selectedAsset]);

    // Apply dropdown filters
    const filteredMetadataByDropdowns = useMemo(() => {
        if (!Object.keys(filters).length) return metadataEntries;
        return metadataEntries.filter(([key, value]) => {
            return filters[key] ? filters[key] === value : true;
        });
    }, [metadataEntries, filters]);

    // Filtered and sorted metadata
    const filteredAndSortedMetadata = useMemo(() => {
        let entries = filteredMetadataByDropdowns.filter(([key, value]) =>
            key.toLowerCase().includes(filterTerm.toLowerCase()) ||
            (typeof value === 'string' && value.toLowerCase().includes(filterTerm.toLowerCase()))
        );

        entries.sort(([keyA, valueA], [keyB, valueB]) => {
            const a = sortKey === 'key' ? keyA : valueA;
            const b = sortKey === 'key' ? keyB : valueB;

            const comparison = a.toString().localeCompare(b.toString(), undefined, { numeric: true });
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return entries;
    }, [filteredMetadataByDropdowns, filterTerm, sortKey, sortOrder]);

    // Handle dropdown changes
    const handleDropdownChange = (property, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [property]: value }));
    };

    return (
        <div style={{ marginTop: '20px', color: '#fff', backgroundColor: '#444', padding: '20px', borderRadius: '8px' }}>
            <h4>Metadata Attributes</h4>

            {/* Asset Image */}
            {selectedAsset?.imageUrl ? (
                <img
                    src={selectedAsset.imageUrl}
                    alt={selectedAsset.assetName || 'Asset'}
                    style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '20px',
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://example.com/default-image.png'; // Fallback image
                    }}
                />
            ) : (
                <div
                    style={{
                        width: '200px',
                        height: '200px',
                        backgroundColor: '#555',
                        borderRadius: '8px',
                        marginBottom: '20px',
                    }}
                >
                    <p style={{ color: '#fff', textAlign: 'center', lineHeight: '200px' }}>No Image</p>
                </div>
            )}

            {/* Asset Details */}
            <div style={{ maxWidth: '600px', textAlign: 'left', marginBottom: '20px' }}>
                <p><strong>Asset Name:</strong> {selectedAsset?.assetName || 'Unnamed Asset'}</p>
                <p><strong>Policy ID:</strong> {selectedAsset?.policyID || 'N/A'}</p>
                <p><strong>Amount:</strong> {selectedAsset?.amount || 0}</p>
                {selectedAsset?.metadata?.description && (
                    <p><strong>Description:</strong> {selectedAsset.metadata.description}</p>
                )}
            </div>

            {/* Dynamic Dropdown Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                {dynamicProperties.map((property) => (
                    <div key={property} style={{ flex: '1 1 200px' }}>
                        <label htmlFor={property} style={{ display: 'block', marginBottom: '5px' }}>
                            <strong>{property}:</strong>
                        </label>
                        <select
                            id={property}
                            value={filters[property] || ''}
                            onChange={(e) => handleDropdownChange(property, e.target.value)}
                            style={{
                                backgroundColor: '#555',
                                color: '#fff',
                                border: '1px solid #666',
                                padding: '8px',
                                borderRadius: '5px',
                                width: '100%',
                            }}
                        >
                            <option value="">-- Select --</option>
                            {collections[property]?.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {/* Metadata Table */}
            <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #666' }}>Key</th>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #666' }}>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSortedMetadata.map(([key, value]) => (
                        <tr key={key}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #666' }}>{key}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #666' }}>
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Stake and Redeem Buttons */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    onClick={() => handleStake(selectedAsset)}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    Stake
                </button>
                <button
                    onClick={() => handleRedeem(selectedAsset)}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Redeem
                </button>
            </div>
        </div>
    );
}

function AssetDetails({ asset, collections, handleStake, handleRedeem }) {
    if (!asset) {
        return <p style={{ color: '#fff' }}>No asset selected.</p>;
    }

    return (
        <MetaDataProvider>
            <Card style={{ marginBottom: '20px' }}>
                <Card.Header as="h5">{asset?.assetName || 'Unnamed Asset'}</Card.Header>
                <Card.Body>
                    <MetadataAttributeSelector
                        selectedAsset={asset}
                        collections={collections}
                        handleStake={handleStake}
                        handleRedeem={handleRedeem}
                    />
                </Card.Body>
            </Card>
        </MetaDataProvider>
    );
}

AssetDetails.propTypes = {
    asset: PropTypes.object.isRequired,
    collections: PropTypes.object.isRequired,
    handleStake: PropTypes.func.isRequired,
    handleRedeem: PropTypes.func.isRequired,
};

export default AssetDetails;
