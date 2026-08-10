import {
  getWalletConnectConnector,
  type RainbowKitWalletConnectParameters,
  type Wallet,
} from "@rainbow-me/rainbowkit";

const robinhoodIcon =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2096%2096'%3E%3Crect%20width='96'%20height='96'%20rx='20'%20fill='%23000000'/%3E%3Cg%20transform='translate(24,24)%20scale(2)'%3E%3Cpath%20fill='%2300C805'%20d='M2.84%2024h.53c.096%200%20.192-.048.224-.128C7.591%2013.696%2011.94%208.656%2014.67%205.638c.112-.128.064-.225-.096-.225h-4.88a.55.55%200%200%200-.45.225L5.746%209.972c-.514.642-.642%201.236-.642%202.086v4.43c-1.14%203.194-1.862%205.361-2.392%207.32-.032.125.016.192.129.192M20.447.646c-.754-.802-4.157-.834-5.73-.224a3%203%200%200%200-.786.465%2041%2041%200%200%200-3.323%203.178c-.112.113-.064.225.097.225h5.409c.497%200%20.786.289.786.786v6.1c0%20.16.128.208.225.064l3.258-4.254c.53-.69.69-.898.835-1.861.192-1.413.08-3.58-.77-4.479m-6.982%2016.18%202.231-3.676a.7.7%200%200%200%20.064-.29V6.73c0-.16-.112-.225-.224-.097-3.355%203.74-5.971%207.672-8.395%2012.407-.06.12.016.225.16.177l5.009-1.54c.565-.174.882-.402%201.155-.852'/%3E%3C/g%3E%3C/svg%3E";

export const robinhoodWallet = ({
  projectId,
  walletConnectParameters,
}: {
  projectId: string;
  walletConnectParameters?: RainbowKitWalletConnectParameters;
}): Wallet => ({
  id: "robinhood",
  name: "Robinhood Wallet",
  shortName: "Robinhood",
  iconUrl: robinhoodIcon,
  iconAccent: "#00C805",
  iconBackground: "#000000",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=com.robinhood.gateway",
    ios: "https://apps.apple.com/us/app/robinhood-wallet/id1634080733",
    mobile: "https://robinhood.com/us/en/download/wallet/",
    qrCode: "https://robinhood.com/us/en/download/wallet/",
  },
  mobile: {
    getUri: undefined,
  },
  qrCode: {
    getUri: (uri) => uri,
    instructions: {
      learnMoreUrl: "https://robinhood.com/us/en/support/articles/connect-to-dapps/",
      steps: [
        {
          step: "install",
          title: "Install Robinhood Wallet",
          description:
            "Download the Robinhood Wallet app from the App Store or Google Play.",
        },
        {
          step: "create",
          title: "Create or import a wallet",
          description:
            "Create a new wallet and back it up, or import an existing one.",
        },
        {
          step: "scan",
          title: "Scan this QR code",
          description:
            "Open Robinhood Wallet on your phone, tap Scan, and scan the code to connect.",
        },
      ],
    },
  },
  createConnector: getWalletConnectConnector({
    projectId,
    walletConnectParameters: {
      ...walletConnectParameters,
      customStoragePrefix: "robinhood",
    },
  }),
});
