import express from 'express';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';

const app = express();
const port = 3000;

app.use(express.json());

const connectedWallets = {}; // Armazene as carteiras conectadas por ID de sessão

app.post('/connect', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!connectedWallets[sessionId]) {
      connectedWallets[sessionId] = new BeaconWallet({ name: 'My Tezos Wallet' });
    }

    const wallet = connectedWallets[sessionId];

    const permissions = await wallet.requestPermissions({
      network: {
        type: 'delphinet', // ou 'mainnet'
      },
      scopes: ['email', 'operations'],
    });

    const tezos = new TezosToolkit('delphinet'); // ou 'mainnet'
    tezos.setWalletProvider(wallet);

    const publicKeyHash = permissions.address; // Obtenha o publicKeyHash da permissão

    res.json({ message: 'Connected to Tezos network successfully.', publicKeyHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
