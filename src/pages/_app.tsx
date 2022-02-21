import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: 'Space Mono',
    body: 'Space Mono',
  },
  colors: {
    brand: {
      100: "#403CFF",
      200: "#403CFF",
      300: "#403CFF",
      400: "#403CFF",
      500: "#403CFF",
      600: "#403CFF",
      700: "#403CFF",
      800: "#403CFF",
      900: "#403CFF",
    },
  },
  components: {
    Button: {
      baseStyle: {
        textTransform: 'uppercase',
        borderRadius: 0
      },
      defaultProps: {
        colorScheme: "brand"
      },
      variants: {
        solid: {
          color: "white",
          p: 8,
        }
      }
    }
  }
});

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <SessionProvider session={session}>
        <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string, currency: "EUR" }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PayPalScriptProvider>
      </SessionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
