import {
  CloseButton,
  Flex,
  Icon,
  IconButton,
  Input,
  ScaleFade,
  Text,
  useClipboard,
  useColorMode,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import { ToOverlay } from "../atoms/ToOverlay";

export const ToSuccessOverlay = ({
  title,
  createdLink,
  onClose,
}: {
  title: string;
  createdLink: string;
  onClose?: () => void;
}) => {
  const { onCopy } = useClipboard(createdLink);
  const { colorMode } = useColorMode();
  return (
    <ToOverlay>
      <ScaleFade initialScale={0.5} in={true} delay={0.2}>
        <Flex
          w="50vw"
          h="40vh"
          align="center"
          justify="center"
          direction="column"
          gridGap={5}
        >
          <Flex alignSelf="flex-end">
            <CloseButton
              onClick={() => (onClose ? onClose() : null)}
              color="white"
            />
          </Flex>
          <Icon as={FaCheckCircle} h="20vh" w="20vw" color="white" />
          <Text fontSize="2xl" color="white">
            {title}
          </Text>
          <Flex direction="row" align="center" w="100%">
            <Input
              value={createdLink}
              variant="outline"
              background={colorMode === "dark" ? "black" : "white"}
            />
            <IconButton
              aria-label="copy"
              onClick={onCopy}
              ml={2}
              icon={<FiCopy />}
              fontSize="2xl"
              w="20%"
              h="100%"
            />
          </Flex>
        </Flex>
      </ScaleFade>
    </ToOverlay>
  );
};
