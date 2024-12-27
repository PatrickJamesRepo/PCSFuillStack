import {useState} from 'react';
import {Alert, Button, Col, Container, Form, Row} from 'react-bootstrap';
import {useDropzone} from 'react-dropzone';
import {Lucid} from 'lucid-cardano';
import {Address} from '@emurgo/cardano-serialization-lib-asmjs'; // Import Address from CSL

// BackendProvider to interact with the backend
class BackendProvider {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
    }

    async getProtocolParameters() {
        const res = await fetch(`${this.backendUrl}/protocolParameters`);
        if (!res.ok) throw new Error('Failed to fetch protocol parameters');
        return await res.json();
    }

    async submitTx(txHex) {
        const res = await fetch(`${this.backendUrl}/submitTx`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txHex }),
        });
        if (!res.ok) throw new Error('Failed to submit transaction');
        const data = await res.json();
        return data.txHash;
    }
}

// Dynamically generate a minting policy and its ID
async function generateMintingPolicy(wallet) {
    const policyScript = wallet.address; // Create a policy based on the wallet address (or other criteria)
    return {
        script: policyScript,
        id: `minting_policy_${Math.random().toString(36).substr(2, 9)}`,
    };
}

async function initWallet(walletKey, backendUrl) {
    const provider = new BackendProvider(backendUrl);
    let lucid;

    try {
        // Log the provider before passing it to Lucid
        console.log("BackendProvider initialized:", provider);

        lucid = await Lucid.new(provider, "Mainnet");
        console.log("Lucid initialized successfully:", lucid);
    } catch (err) {
        console.error("Error initializing Lucid:", err);
        throw new Error("Failed to initialize Lucid: " + err.message);
    }

    const wallet = window.cardano[walletKey];
    if (!wallet) {
        throw new Error("Wallet not available");
    }

    try {
        // Enable the wallet
        await wallet.enable();
        console.log("Wallet enabled");

        // Fetch the address using the wallet API
        const hexAddress = await wallet.getChangeAddress();
        console.log("Fetched wallet address (hex):", hexAddress);

        if (!hexAddress) {
            throw new Error("Failed to retrieve wallet address in hex format");
        }

        // Add additional logging to check the value of hexAddress
        console.log("Hex address is valid:", hexAddress);

        // Convert the hex address to bech32 format
        const bech32Address = Address.from_hex(hexAddress).to_bech32();
        console.log("Converted wallet address (bech32):", bech32Address);

        if (!bech32Address) {
            throw new Error("Failed to convert address to bech32 format");
        }

        return {
            wallet: wallet,
            lucid: lucid,
            address: bech32Address,  // Return the bech32 address
        };
    } catch (error) {
        console.error("Error connecting wallet:", error);
        throw new Error("Failed to initialize wallet: " + error.message);
    }
}

const MintTokenPage = ({ walletKey }) => {
    const [metadata, setMetadata] = useState({
        name: "",
        description: "",
        image: null,
    });
    const [minting, setMinting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);


    const mintNFT = async () => {
        setMinting(true);
        setSuccess(false);
        setError("");

        if (!metadata.image || !metadata.name || !metadata.description) {
            setError("Name, description, and image are required.");
            setMinting(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3002/mintNFT', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetName: metadata.name,
                    description: metadata.description,
                    image: metadata.image,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log(`NFT minted successfully! Tx Hash: ${result.txHash}`);
                setSuccess(true);
            } else {
                setError(`Error minting NFT: ${result.error}`);
            }
        } catch (error) {
            console.error("Minting error:", error);
            setError("Error minting the NFT. Please try again.");
        } finally {
            setMinting(false);
        }
    };




    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            setMetadata({ ...metadata, image: acceptedFiles[0] });
        },
    });

    const imagePreview = metadata.image ? URL.createObjectURL(metadata.image) : null;

    return (
        <Container>
            <Row className="justify-content-center mt-5">
                <Col xs={12} md={8} lg={6}>
                    <h1 className="text-center">Mint Your NFT</h1>
                    {success && <Alert variant="success">NFT Minted Successfully!</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter NFT Name"
                                value={metadata.name}
                                onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Enter NFT Description"
                                value={metadata.description}
                                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Image</Form.Label>
                            <div {...getRootProps()} className="dropzone">
                                <input {...getInputProps()} />
                                <p>Drag & drop an image, or click to select</p>
                                {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%" }} />}
                            </div>
                        </Form.Group>

                        <Button variant="primary" onClick={mintNFT} disabled={minting}>
                            {minting ? "Minting..." : "Mint NFT"}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default MintTokenPage;
