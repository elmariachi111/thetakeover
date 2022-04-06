import {
  Flex,
  Modal,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";

const ToLoadingModal = ({ buzy, title }: { buzy: boolean; title?: string }) => {
  return (
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
  );
};

export { ToLoadingModal };
