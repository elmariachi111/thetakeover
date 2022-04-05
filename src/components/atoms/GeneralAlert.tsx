import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  AlertTitle,
  BoxProps,
  CloseButton,
  Collapse,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";

const GeneralAlert = (
  props: {
    status: AlertStatus;
    title: string;
    timeout?: number;
    children?: string | React.ReactNode;
    onClosed?: () => void;
  } & BoxProps
) => {
  const { status, title, timeout, children, onClosed, ...boxProps } = props;
  const { isOpen, onClose } = useDisclosure({
    defaultIsOpen: true,
  });

  useEffect(() => {
    if (timeout) {
      setTimeout(doClose, timeout);
    }
  }, [timeout]);

  const doClose = () => {
    onClose();
    if (onClosed) onClosed();
  };
  return (
    <Collapse in={isOpen} animateOpacity style={{ width: "100%" }}>
      <Alert status={status} w="100%" alignItems="flex-start" {...boxProps}>
        <AlertIcon />
        <Flex direction="column">
          <AlertTitle mr={2} textTransform="uppercase">
            {title}
          </AlertTitle>
          {children && (
            <AlertDescription fontSize="sm">{children}</AlertDescription>
          )}
        </Flex>
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={doClose}
        />
      </Alert>
    </Collapse>
  );
};

export { GeneralAlert };
