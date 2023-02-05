import { Wallet } from '../../keplr-core';

export const keplrMobileInfo: Wallet = {
  name: 'keplr-mobile',
  prettyName: 'Keplr Mobile',
  logo:
    'https://user-images.githubusercontent.com/545047/191616515-eee176d0-9e50-4325-9529-6c0019d5c71a.png',
  mode: 'wallet-connect',
  mobileDisabled: false,
  rejectMessage: {
    source: 'Request rejected',
  },
  downloads: [
    {
      device: 'mobile',
      os: 'android',
      icon: "",
      link:
        'https://play.google.com/store/apps/details?id=com.chainapsis.keplr&hl=en&gl=US&pli=1',
    },
    {
      device: 'mobile',
      os: 'ios',
      icon: "",
      link: 'https://apps.apple.com/us/app/keplr-wallet/id1567851089',
    },
    {
      icon: "",
      link: 'https://www.keplr.app/download',
    },
  ],
  connectEventNamesOnWindow: ['keplr_keystorechange'],
};
