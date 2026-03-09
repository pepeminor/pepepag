import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "@coinbase/wallet-sdk": false,
      "@safe-global/safe-apps-sdk": false,
      "@safe-global/safe-apps-provider": false,
      "@walletconnect/ethereum-provider": false,
      "@base-org/account": false,
      "porto": false,
      "porto/internal": false,
    };
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
};

export default nextConfig;
