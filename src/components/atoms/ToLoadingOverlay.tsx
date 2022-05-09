import {
  Flex, Spinner,
  Text
} from "@chakra-ui/react";

const ToLoadingOverlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      background="black"
      w="100vw"
      h="100vh"
      direction="column"
      gridGap={3}
      alignItems="center"
      justify="center"
      position="absolute"
      left="0"
      top="0"
      zIndex={1000}
      opacity={0.7}
    >
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
    </Flex>

  );
};

export { ToLoadingOverlay };


/*
<Modal
      isOpen={buzy}
      onClose={() => {
        return;
      }}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent background="transparent" h="100%">
        <Flex
          w="100%"
          h="100%"
          direction="column"
          gridGap={3}
          alignItems="center"
          justify="center"
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="brand.300"
            color="brand.500"
            size="xl"
          />
          {title && (
            <Text bg="brand.500" p={2}>
              {title}
            </Text>
          )}
        </Flex>
      </ModalContent>
    </Modal>
    */