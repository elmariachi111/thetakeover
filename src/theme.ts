import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";

const theme = {
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
        borderRadius: 0,

        p: 8,
      },
      defaultProps: {
        colorScheme: "brand",
      },
      variants: {
        outline: {
          bg: "white",
          borderWidth: 2,
        },
        solid: {
          color: "white",
          _hover: {
            _disabled: {},
          },
          _active: { bg: "brand.400" },
        },
      },
    },
  },
};

export default theme;
