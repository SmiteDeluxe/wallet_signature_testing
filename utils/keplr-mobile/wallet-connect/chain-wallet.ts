import { ChainRecord, Wallet } from '../../keplr-core';
import { ChainWCV1 } from '../../keplr-walletconnect';

export class ChainKeplrMobile extends ChainWCV1 {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }
}
