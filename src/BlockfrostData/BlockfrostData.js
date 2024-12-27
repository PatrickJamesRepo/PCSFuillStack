import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SortableTable from './SortableTable';

function BlockfrostData() {
    const [tableData, setTableData] = useState([]);
    const [policyId, setPolicyId] = useState('');
    const POLICY_ID = 'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e'; // Updated policy ID
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Fetching assets for policy ID from backend...');        
        if (policyId) {
            axios.get(`http://localhost:3003/api/assets/policy/${POLICY_ID}`) // Updated to use POLICY_ID
                .then(response => {
                    console.log('Assets fetched successfully:', JSON.stringify(response.data));
                    const newData = response.data.map(asset => ({
                        id: asset.asset,
                        name: asset.name,
                        
                    }));
                    setTableData(newData);
                })
                .catch(error => {
                    console.error('Error fetching assets:', error);
                    setError('Failed to fetch assets'); // Set error message state
                });
        }
    }, []); 

    return (
        <div>
            <input 
                type="text" 
                value={policyId} 
                onChange={(e) => setPolicyId(e.target.value)} 
                placeholder="Enter Policy ID" 
            />
            <SortableTable data={tableData} />
        </div>
    );
}

export default BlockfrostData;
