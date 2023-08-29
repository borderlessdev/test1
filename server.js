import axios from 'axios';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { Dapp } from '@temple-wallet/dapp';

// Defina as variáveis de ambiente
const contractAddress = 'KT1FVfi5SFiWay5eqSX7Pr37ztP23oTnRuHi';
const network = 'granadanet';

// Função para criar o NFT
const mintNFT = async (nftData) => {
  try {
    const Tezos = new TezosToolkit(`https://${network}.smartpy.io`);

    // Configurar Dapp e carteira Beacon
    const dApp = new Dapp();
    await dApp.init();

    const walletProvider = new BeaconWallet({ name: 'Your Wallet Name', preferredNetwork: network });
    dApp.addWallet(walletProvider);

    const permissions = await dApp.requestPermissions();

    if (!permissions) {
      return { status: 'error', message: 'Failed to connect to wallet' };
    }

    const wallet = await walletProvider.client.getActiveAccount();
    await Tezos.setWalletProvider(walletProvider);

    // Carregar contrato
    const contract = await Tezos.contract.at(contractAddress);

    // Preparar a transação
    const operation = await contract.methods
      .mintNFT(nftData['nft-name'], nftData['nft-description'], nftData['nft-image'])
      .send();

    // Aguardar a confirmação da transação
    await operation.confirmation();

    return { status: 'success', message: 'NFT minted successfully' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

export default async function (event) {
  try {
    const nftData = event.data;

    const result = await mintNFT(nftData);

    return {
      status: result.status,
      message: result.message,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
}
