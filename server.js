import express from 'express';
import bodyParser from 'body-parser';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

const app = express();
const port = 3000;

// Tezos network configuration
const rpcUrl = 'https://granadanet.smartpy.io';
const contractAddress = 'KT1FVfi5SFiWay5eqSX7Pr37ztP23oTnRuHi';

app.use(bodyParser.json());

// Initialize BeaconWallet
const wallet = new BeaconWallet({
  name: 'Your Wallet Name',
  preferredNetwork: 'granadanet', // Ghostnet test network
});

// Mint NFT endpoint
app.post('/mint-nft', async (req, res) => {
  try {
    const { 'nft-name': nftName, 'nft-description': nftDescription, 'nft-image': nftImage } = req.body;

    const Tezos = new TezosToolkit(rpcUrl);
    Tezos.setWalletProvider(wallet);

    // Load contract
    const contract = await Tezos.contract.at(contractAddress);

    // Request wallet permissions
    await wallet.requestPermissions({ network: { type: 'testnet' } });

    // Prepare the transaction
    const operation = await contract.methods
      .mintNFT(nftName, nftDescription, nftImage)
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

app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
