import express from 'express';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

const app = express();

// Tezos network configuration
const rpcUrl = 'https://testnet-tezos.giganode.io';
const contractAddress = 'KT1FVfi5SFiWay5eqSX7Pr37ztP23oTnRuHi';

// Initialize TezosToolkit
const Tezos = new TezosToolkit(rpcUrl);

// Initialize BeaconWallet
const wallet = new BeaconWallet({
  name: 'Your Wallet Name',
  preferredNetwork: 'granadanet', // Ghostnet test network
});

// Endpoint to mint an NFT
app.post('/mint-nft', async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Load wallet
    await wallet.requestPermissions({ network: { type: 'testnet' } });

    // Load contract
    const contract = await Tezos.wallet.at(contractAddress);

    // Prepare the transaction
    const operation = await contract.methods
      .mintNFT(name, description, image)
      .send();

    // Sign and inject the transaction
    const [opHash] = await Tezos.wallet
      .bulkTransfer([{ kind: 'transaction', ...operation }])
      .send();

    res.json({ status: 'success', operationHash: opHash });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
