import express from 'express';
import fs from 'fs';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/mint-nft', async (req, res) => {
  try {
    const wallet = new TempleWallet('Borderless');
    await wallet.connect('edo2net'); // Conectando à rede de testes Ghostnet

    const Tezos = new TezosToolkit();
    Tezos.setWalletProvider(wallet);

    const contractAddress = 'KT1FVfi5SFiWay5eqSX7Pr37ztP23oTnRuHi'; // Substitua pelo endereço do contrato

    const contract = await Tezos.contract.at(contractAddress);

    // Lendo o objeto do arquivo JSON enviado pelo cliente
    const jsonFile = req.body.file;
    const tokenMetadata = MichelsonMap.fromLiteral(jsonFile);

    const operation = await contract.methods.mint(tokenMetadata).send();
    await operation.confirmation();

    console.log('NFT minted successfully! Transaction hash:', operation.hash);

    await wallet.disconnect();

    res.status(200).json({ message: 'NFT minted successfully!', txHash: operation.hash });
  } catch (error) {
    console.error('Erro ao criar o NFT:', error);
    res.status(500).json({ error: 'Erro ao criar o NFT' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
