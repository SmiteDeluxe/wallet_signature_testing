import {
    getChainOptions,
    WalletController,
  } from '@terra-money/wallet-controller';
  
  let instance;
  
  export async function initController() {
    const chainOptions = await getChainOptions();
  
    instance = new WalletController({
      ...chainOptions,
    });
  }
  
  export function getController() {
    return instance;
  }
  