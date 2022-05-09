import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";

const theme = {
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "DM Sans",
    body: "DM Sans",
  },
  styles: {
    global: (props) => ({
      'html, body': {
        bg: props.colorMode === 'dark' ? 'black' : 'gray.100',
      },
      "a, p, label": {

      },
      "h1,h2,h3,h4": {

      },
    }),
    shadows: {
      outline: '0 0 0 3px var(--chakra-colors-brand-500)',
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
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? 'white' : 'black',
        _hover: {
          color: "gray.300",
        },
      }),
    },
    TextArea: {
      defaultProps: {
        focusBorderColor: "white",
      }
    },
    Input: {
      baseStyle: {
        field: {
          padding: 8,
          borderRadius: 0,
          _placeholder: {
            opacity: 1,
            color: "gray.600"
          },
        },
      },
      variants: {
        filled: {
          field: {
            bg: "gray.800",
            borderRadius: 0,
          }
        },
      },
      defaultProps: {
        variant: "filled",
        borderRadius: 0,
        focusBorderColor: "white",
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 0,
        px: 8,
        py: 7,
      },
      defaultProps: {
        colorScheme: "white",
      },
      variants: {
        outline: {
          bg: "white",
          borderWidth: 2,
        },
        link: {
          color: "white",
          _hover: {
            textDecoration: "underline",

          },
        },
        ghost: {
          color: "gray.300",
          _hover: {
            color: "gray.200",
            background: "gray.800"
          },
        },
        solid: {
          color: "black",
          background: "white",
          border: "2px solid transparent",
          _hover: {
            color: "white",
            background: "gray.900",
            border: "2px solid white",
            textDecoration: "none",
            _disabled: {},
          },
          _active: { bg: "gray.800" },
        },
      },
    },
  },
};

export default theme;
