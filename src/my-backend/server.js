const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv')
//Express Server
const app = express();
// Server Running on Port 3001
// const PORT = process.env.PORT || 3001;

// Cross Origin Response
const cors = require('cors');
// Load environment variables from .env file
dotenv.config();
// Middleware to parse JSON bodies
app.use(express.json());

// CORS Enabled for production
const allowedOrigins = [
    'http://www.puurrty.io.s3-website.ca-central-1.amazonaws.com',
    'https://www.puurrty.io',
    'http://www.puurrty.io'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Allow credentials (e.g., cookies, authorization headers)
};

app.use(cors(corsOptions));

// Route to fetch assets by policyId
app.get('/api/assets/policy/:policyId/:collection', async (req, res, next) => {
    try {
        const { policyId, collection } = req.params;
        const { page = 1, count = 10 } = req.query; // Default to page 1 and 10 items per page
        console.log(`Fetching assets for policy ID: ${policyId} and collection: ${collection}, page: ${page}, count: ${count}`);

        // Ensure count is a positive integer
        const parsedCount = parseInt(count, 10);
        const validCount = isNaN(parsedCount) || parsedCount < 1 ? 10 : parsedCount;

        // Define policies for each collection
        const collections = {
            'Original Collection': 'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e',
            'Halloween Collection': '52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1',
            'PCS/YUMMI Collection': 'd91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c'
        };

        // Validate collection and get the correct policy ID
        const PolicyId = collections[collection];
        if (!PolicyId) {
            res.status(400).json({ error: 'Invalid collection' });
            return;
        }

        const url = `https://cardano-mainnet.blockfrost.io/api/v0/assets/policy/${PolicyId}?page=${page}&count=${validCount}`;
        console.log(`Making request to Blockfrost API: ${url}`);
        const response = await axios.get(url, {
            headers: { 'project_id': process.env.BLOCKFROST_PROJECT_ID },
        });

        console.log('Response received from Blockfrost API:', response.data);

        const detailedAssets = await Promise.all(response.data.map(async (asset) => {
            const assetId = asset.asset;
            const assetUrl = `https://cardano-mainnet.blockfrost.io/api/v0/assets/${assetId}`;
            console.log(`Fetching detailed information for asset: ${assetId}`);
            const assetResponse = await axios.get(assetUrl, {
                headers: { 'project_id': process.env.BLOCKFROST_PROJECT_ID },
            });

            console.log('Response received from Blockfrost API:', assetResponse.data);
            return assetResponse.data;
        }));

        console.log('Detailed assets:', detailedAssets);
        res.json({ data: detailedAssets, totalPages: Math.ceil(detailedAssets.length / count) });
    } catch (error) {
        console.error('Error fetching assets from Blockfrost:', error);
        res.status(500).json({ error: 'Failed to fetch assets' });
        next(error);
    }
});


// Error handling middleware (should be defined after route handlers)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});



// Start the server in test 
/* app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
*/

/// Start the server in production
const port = 3001;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
