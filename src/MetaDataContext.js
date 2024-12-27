import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const MetaDataContext = createContext();

export const MetaDataProvider = ({ children }) => {
    const [metaData, setMetaData] = useState([]); // Replace with your assets
    const [selectedAsset, setSelectedAsset] = useState(null); // Currently selected asset

    return (
        <MetaDataContext.Provider value={{ metaData, setMetaData, selectedAsset, setSelectedAsset }}>
            {children}
        </MetaDataContext.Provider>
    );
};

MetaDataProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
