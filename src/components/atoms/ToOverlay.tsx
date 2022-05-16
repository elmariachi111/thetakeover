import { Flex, Spinner, Text } from "@chakra-ui/react";

const ToOverlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      background="rgba(0,0,0,0.7)"
      w="100vw"
      h="100vh"
      direction="column"
      gridGap={3}
      alignItems="center"
      justify="center"
      position="fixed"
      left="0"
      top="0"
      zIndex={1000}
    >
      {children}
    </Flex>
  );
};

const ToLoadingOverlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToOverlay>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.300"
        color="gray.500"
        size="xl"
      />
      {children && (
        <Text bg="gray.500" p={2} fontSize="xl">
          {children}
        </Text>
      )}
    </ToOverlay>
  );
};
export { ToOverlay, ToLoadingOverlay };
