import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import type { AppProps } from 'next/app'

const theme = extendTheme({
  config: {
    //initialColorMode: "dark",
    useSystemColorMode: true
  },
})

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return <ChakraProvider theme={theme}>
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  </ChakraProvider>
}

export default MyApp
