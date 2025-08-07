
// GSDC Smart Contract Configuration
//export const GSDC_ADDRESS = "0xCbf821127D07a621c0D2183D7e5153C0a3a921BE" as const;
//export const GSDC_ADDRESS = "0x3134D660C83F742dcb19913CA4EF1e74AC27638b" as const;
export const GSDC_ADDRESS = "0x5589660F31F3229EA268AFa65e412Cd16666E83b" as const;
export const GSDC_ABI = [{"inputs":[{"internalType":"address","name":"implementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"stateMutability":"payable","type":"receive"}] as const;

export const GSDC_NFT_ADDRESS = "0x7Af963cF6D228E564e2A0aA0DdBF06210B38615D" as const;
  