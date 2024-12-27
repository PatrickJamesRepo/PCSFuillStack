import React, { useState, useEffect, useMemo, useContext } from 'react';
import { MetaDataContext } from './MetaDataContext';

function MetadataAttributeSelector({ onSelectMetadata }) {
    const { metaData: assets } = useContext(MetaDataContext);
    const [sortKey, setSortKey] = useState('key'); // 'key' or 'value'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [filterTerm, setFilterTerm] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(assets[0] || null); // Default to the first asset

    // Extract all metadata keys and values
    const metadataEntries = useMemo(() => {
        if (!selectedAsset || !selectedAsset.metadata) return [];
        return Object.entries(selectedAsset.metadata);
    }, [selectedAsset]);

    // Filtered and sorted metadata
    const filteredAndSortedMetadata = useMemo(() => {
        let entries = metadataEntries.filter(([key, value]) =>
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
    }, [metadataEntries, filterTerm, sortKey, sortOrder]);

    // Handle asset selection
    const handleAssetChange = (e) => {
        const assetID = e.target.value;
        const asset = assets.find((a) => a.assetID === assetID);
        setSelectedAsset(asset);
    };

    return (
        <div style={{ marginTop: '20px', color: '#fff', backgroundColor: '#444', padding: '20px', borderRadius: '8px' }}>
            <h4>Metadata Attributes</h4>

            {/* Dropdown to Select Asset */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="assetSelector" style={{ display: 'block', marginBottom: '5px' }}>
                    <strong>Select Asset:</strong>
                </label>
                <select
                    id="assetSelector"
                    value={selectedAsset?.assetID || ''}
                    onChange={handleAssetChange}
                    style={{
                        width: '100%',
                        maxWidth: '300px',
                        backgroundColor: '#555',
                        color: '#fff',
                        border: '1px solid #666',
                        borderRadius: '5px',
                        padding: '8px',
                    }}
                >
                    <option value="">-- Select an Asset --</option>
                    {assets.map((asset) => (
                        <option key={asset.assetID} value={asset.assetID}>
                            {asset.assetName || 'Unnamed Asset'}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filter and Sorting Controls */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                {/* Filter Input */}
                <div>
                    <label htmlFor="filterTerm" style={{ display: 'block', marginBottom: '5px' }}>
                        <strong>Search Attributes:</strong>
                    </label>
                    <input
                        id="filterTerm"
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        placeholder="Type to filter attributes..."
                        style={{
                            backgroundColor: '#555',
                            color: '#fff',
                            border: '1px solid #666',
                            padding: '8px',
                            borderRadius: '5px',
                            width: '100%',
                            maxWidth: '300px',
                        }}
                    />
                </div>

                {/* Sort Controls */}
                <div>
                    <label htmlFor="sortKey" style={{ display: 'block', marginBottom: '5px' }}>
                        <strong>Sort By:</strong>
                    </label>
                    <select
                        id="sortKey"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        style={{
                            backgroundColor: '#555',
                            color: '#fff',
                            border: '1px solid #666',
                            padding: '8px',
                            borderRadius: '5px',
                            width: '100%',
                            maxWidth: '150px',
                        }}
                    >
                        <option value="key">Key</option>
                        <option value="value">Value</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{
                            backgroundColor: '#555',
                            color: '#fff',
                            border: '1px solid #666',
                            padding: '8px',
                            borderRadius: '5px',
                            width: '100%',
                            maxWidth: '150px',
                            marginTop: '5px',
                        }}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
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
        </div>
    );
}

export default MetadataAttributeSelector;
