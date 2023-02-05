import { EndpointOptions, Wallet } from '../../keplr-core';
import { WCWalletV1 } from '../../keplr-walletconnect';

import { ChainKeplrMobile } from './chain-wallet';
import { KeplrClient } from './client';

export class KeplrMobileWallet extends WCWalletV1 {
  constructor(walletInfo: Wallet, preferredEndpoints?: EndpointOptions) {
    super(walletInfo, ChainKeplrMobile, KeplrClient);
    this.preferredEndpoints = preferredEndpoints;
  }
}
