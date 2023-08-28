import express from 'express';
import bodyParser from 'body-parser';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { importKey } from '@taquito/signer';
import { BeaconWallet } from '@taquito/beacon-wallet';

const CONTRACT_ADDRESS = 'KT1FVfi5SFiWay5eqSX7Pr37ztP23oTnRuHi'; // Endereço do contrato
const NETWORK = 'florencenet'; // Rede de teste Florencenet

const app = express();
app.use(bodyParser.json());

const tezos = new TezosToolkit('https://florencenet.smartpy.io'); // URL da rede Florencenet

const wallet = new BeaconWallet({
  name: 'Your Wallet Name', // Nome da carteira
  preferredNetwork: NETWORK,
});

async function mintNFT(name, description, imageUrl) {
  try {
    const activeAccount = await wallet.client.getActiveAccount();

    if (!activeAccount) {
      throw new Error('No active account found');
    }

    const tezosWithWallet = new TezosToolkit('https://florencenet.smartpy.io');
    tezosWithWallet.setWalletProvider(wallet);

    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
    };

    const metadataMap = MichelsonMap.fromLiteral({
      '': Buffer.from(JSON.stringify(metadata)).toString('hex'),
    });

    const contract = await tezosWithWallet.contract.at(CONTRACT_ADDRESS);

    const operation = await contract.methods.mint(metadataMap).send();

    await operation.confirmation();

    console.log('NFT minted successfully');
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error; // Rethrow the error to be caught by the route handler
  }
}

app.post('/mint-nft', async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    await wallet.requestPermissions({
      network: {
        type: NETWORK,
        rpcUrl: 'https://florencenet.smartpy.io', // URL da rede Florencenet
      },
    });

    await mintNFT(name, description, imageUrl);

    res.status(200).json({ message: 'NFT minted successfully' });
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
