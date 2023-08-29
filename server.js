import express from 'express';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { DAppClient } from '@temple-wallet/dapp';
import { TezosToolkit } from '@taquito/taquito';

// Configurações
const app = express();
const port = process.env.PORT || 3000; // Use a porta definida no ambiente ou 3000

// Inicializando o BeaconWallet
const wallet = new BeaconWallet({
  name: 'Borderless ',
  preferredNetwork: 'mainnet', // or 'delphinet' for Tezos testnet
  disableDefaultEvents: true,
  eventHandlers: {
    PERMISSION_REQUEST_SUCCESS: {
      handler: async (data) => {
        console.log('Permission request successful:', data);
      },
    },
  },
});

// Inicializando o DAppClient e TezosToolkit
const client = new DAppClient({ name: 'Borderless' });
const tezos = new TezosToolkit(client);

// Endpoint para solicitar autorização de carteira
app.get('/authorize', async (req, res) => {
  try {
    // Inicia o processo de autorização com a carteira Beacon
    await wallet.requestPermissions({
      network: {
        type: 'mainnet', // or 'delphinet'
      },
    });

    res.status(200).json({ message: 'Wallet authorized successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Endpoint para receber os dados do Bubble.io e criar a NFT
app.post('/createNFT', async (req, res) => {
  try {
    const { nftName, nftDescription, nftImage } = req.body;

    // Enviar transação para o contrato inteligente
    const contract = await tezos.wallet.at('KT1FVfi5SFiWay5eqSX7Pr37ztP23oTnRuHi');
    const operation = await contract.methods.createNFT(nftName, nftDescription, nftImage).send();

    // Aguardar confirmação da transação
    await operation.confirmation();

    res.status(200).json({ message: 'NFT created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
