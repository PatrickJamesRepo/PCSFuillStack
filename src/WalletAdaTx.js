import React, { useState } from "react";
import {
    Address,
    BigNum,
    CoinSelectionStrategyCIP2,
    LinearFee,
    Transaction,
    TransactionBuilder,
    TransactionBuilderConfigBuilder,
    TransactionOutput,
    TransactionUnspentOutput,
    TransactionUnspentOutputs,
    TransactionWitnessSet,
    Value,
} from "@emurgo/cardano-serialization-lib-asmjs";

function WalletAdaTx({ wallet }) {
    const [toAddress, setToAddress] = useState("");
    const [lovelaces, setLovelaces] = useState("");
    const [txHash, setTxHash] = useState(null);
    const [error, setError] = useState(null);

    const handleSendTransaction = async () => {
        try {
            setError(null);
            console.log("=== STARTING TRANSACTION PROCESS ===");

            // Step 1: Fetch Protocol Parameters
            console.log("Step 1: Fetching protocol parameters...");
            const protocolParameters = await fetch("/protocolParameters");
            const pp = await protocolParameters.json();
            console.log("Protocol Parameters:", pp);

            // Step 2: Configure Transaction Builder
            console.log("\nStep 2: Setting up transaction builder...");
            const minFeeA = BigNum.from_str(pp.min_fee_a.toString());
            const minFeeB = BigNum.from_str(pp.min_fee_b.toString());
            const feeAlgo = LinearFee.new(minFeeA, minFeeB);

            const coinsPerUtxoWord = BigNum.from_str(pp.coins_per_utxo_word.toString());
            const poolDeposit = BigNum.from_str(pp.pool_deposit.toString());
            const keyDeposit = BigNum.from_str(pp.key_deposit.toString());

            const config = TransactionBuilderConfigBuilder.new()
                .fee_algo(feeAlgo)
                .coins_per_utxo_word(coinsPerUtxoWord)
                .pool_deposit(poolDeposit)
                .key_deposit(keyDeposit)
                .max_value_size(pp.max_val_size)
                .max_tx_size(pp.max_tx_size)
                .build();

            const builder = TransactionBuilder.new(config);
            console.log("Transaction builder configured with:", config);

            // Step 3: Add Output
            console.log("\nStep 3: Adding transaction output...");
            const value = Value.new(BigNum.from_str(lovelaces));
            const address = Address.from_bech32(toAddress);
            builder.add_output(TransactionOutput.new(address, value));
            console.log(`Output added: ${lovelaces} lovelaces to address ${toAddress}`);

            // Step 4: Fetch Wallet UTXOs
            console.log("\nStep 4: Fetching UTXOs from wallet...");
            const utxos = await wallet.api.getUtxos();
            console.log("Fetched UTXOs:", utxos);

            // Step 5: Add UTXOs to Transaction Builder
            console.log("\nStep 5: Adding UTXOs to transaction builder...");
            const transactionUnspentOutputs = TransactionUnspentOutputs.new();
            for (const utxo of utxos) {
                const txUnspentOutput = TransactionUnspentOutput.from_hex(utxo);
                console.log("Processing UTXO:", txUnspentOutput.to_hex());
                if (txUnspentOutput.output().amount().multiasset() == null) {
                    transactionUnspentOutputs.add(txUnspentOutput);
                }
            }
            builder.add_inputs_from(transactionUnspentOutputs, CoinSelectionStrategyCIP2.RandomImprove);
            console.log("UTXOs added successfully.");

            // Step 6: Set Change Address
            console.log("\nStep 6: Setting change address...");
            const changeAddress = Address.from_bech32(wallet.bech32);
            builder.add_change_if_needed(changeAddress);
            console.log("Change address set to:", wallet.bech32);

            // Step 7: Build Transaction
            console.log("\nStep 7: Building transaction...");
            const txBody = builder.build();
            console.log("Transaction body:", txBody.to_hex());

            // Step 8: Create Unsigned Transaction
            console.log("\nStep 8: Creating unsigned transaction...");
            const noWitnessSet = TransactionWitnessSet.new();
            const txUnsigned = Transaction.new(txBody, noWitnessSet);
            console.log("Unsigned transaction (hex):", txUnsigned.to_hex());

            // Step 9: Sign Transaction
            console.log("\nStep 9: Signing transaction...");
            const txRaw = txUnsigned.to_hex();
            console.log("Raw transaction hex (unsigned):", txRaw);
            const signedTx = await wallet.api.signTx(txRaw);
            console.log("Signed transaction hex:", signedTx);

            // Step 10: Attach Witnesses
            console.log("\nStep 10: Attaching witnesses...");
            const txWitness = TransactionWitnessSet.from_hex(signedTx);
            const txSigned = Transaction.new(txBody, txWitness);
            console.log("Final signed transaction:", txSigned.to_hex());

            // Step 11: Submit Transaction
            console.log("\nStep 11: Submitting transaction...");
            const submittedTxHash = await wallet.api.submitTx(txSigned.to_hex());
            console.log("Transaction submitted successfully. TxHash:", submittedTxHash);

            setTxHash(submittedTxHash);
            console.log("=== TRANSACTION PROCESS COMPLETED SUCCESSFULLY ===");
        } catch (err) {
            console.error("Error during transaction process:", err);
            setError(err.message);
        }
    };

    return (
        <div className="p-4 rounded-lg bg-dark text-white shadow-lg">
            <div className="mb-3">
                <label htmlFor="toAddress" className="form-label">
                    Recipient Address
                </label>
                <input
                    type="text"
                    className="form-control bg-dark text-white border-0 shadow-sm"
                    id="toAddress"
                    placeholder="Enter recipient wallet address"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="lovelaces" className="form-label">
                    Amount (in Lovelaces)
                </label>
                <input
                    type="number"
                    className="form-control bg-dark text-white border-0 shadow-sm"
                    id="lovelaces"
                    placeholder="Enter amount in lovelaces (1 ADA = 1,000,000 Lovelaces)"
                    value={lovelaces}
                    onChange={(e) => setLovelaces(e.target.value)}
                    min="1000000"
                />
            </div>
            <button
                className="btn btn-primary w-100"
                onClick={handleSendTransaction}
            >
                Send ADA
            </button>
            {txHash && (
                <div className="alert alert-success mt-3">
                    <strong>Transaction Successful!</strong> <br />
                    TxHash: <span className="text-break">{txHash}</span>
                </div>
            )}
            {error && (
                <div className="alert alert-danger mt-3">
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
}

export default WalletAdaTx;
