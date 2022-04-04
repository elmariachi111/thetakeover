import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { NextPage } from "next";
import { SessionProvider, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactElement, ReactNode } from "react";
import Layout from "../components/Layout";
import { default as TOTheme } from "../theme";

const theme = extendTheme(TOTheme);

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
        <Head>
          <script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            type="text/javascript"
          ></script>
        </Head>
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
