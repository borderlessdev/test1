import express from 'express';
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/connect-wallet', async (req, res) => {
  try {
    const wallet = new TempleWallet('Your DApp Name');
    await wallet.connect('carthagenet'); // Connect to a Tezos network

    const tezos = new TezosToolkit(`https://${wallet.network}.smartpy.io/`);
    tezos.setWalletProvider(wallet);

    return res.status(200).json({ message: 'Wallet connected successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while connecting the wallet.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
