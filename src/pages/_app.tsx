import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Space Mono",
    body: "Space Mono",
    textTransform: "uppercase",
  },
  styles: {
    global: {
      "a, p, label": {
        textTransform: "uppercase",
      },
      "h1,h2,h3,h4": {
        textTransform: "uppercase",
      },
    },
  },
  colors: {
    brand: {
      50: "#e5e4ff",
      100: "#b3b3ff",
      200: "#8080ff",
      300: "#4e4dff",
      400: "#1d1aff",
      500: "#0300e6",
      600: "#0000b4",
      700: "#000082",
      800: "#000050",
      900: "#000021",
    },
  },
  components: {
    Link: {
      baseStyle: {
        color: "brand.200",
        // _hover: {
        //   color: "brand.300",
        // },
      },
    },
    Input: {
      baseStyle: {
        field: {
          padding: 8,
          _placeholder: {
            opacity: 1,
          },
        },
      },
      variants: {
        filled: {},
      },
      defaultProps: {
        variant: "filled",
        focusBorderColor: "brand.300",
      },
    },
    Button: {
      baseStyle: {
        textTransform: "uppercase",
        backgroundColor: "brand.400",
        borderRadius: 0,
      },
      defaultProps: {
        colorScheme: "brand",
      },
      variants: {
        solid: {
          bg: "brand.300",
          color: "white",
          _hover: {
            bg: "brand.200",
            _disabled: {
              bg: "brand.200",
            },
          },
          _active: { bg: "brand.400" },

          p: 8,
        },
      },
    },
  },
});

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  auth?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function Auth({ children }) {
  const { data: session, status } = useSession({ required: true });

  if (session?.user) {
    return children;
  }

  return <div>Loading...</div>;
}

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  return (
    <ChakraProvider theme={theme}>
      <SessionProvider session={session}>
        {Component.auth ? (
          <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
        ) : (
          getLayout(<Component {...pageProps} />)
        )}
      </SessionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
