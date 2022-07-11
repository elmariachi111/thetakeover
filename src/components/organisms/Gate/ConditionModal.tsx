import {
  ButtonProps,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import { FaPen, FaPlus } from "react-icons/fa";
import { ChainCondition } from "../../../types/ChainConditions";
import { ConditionForm } from "../../molecules/Gate/ConditionForm";

const ConditionModal = (
  props: {
    initialConditions: ChainCondition | undefined;
    onConditionsUpdated: (condition: ChainCondition[]) => void;
  } & ButtonProps
) => {
  const { initialConditions, onConditionsUpdated, ...buttonProps } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const footerRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <IconButton
        aria-label="report"
        icon={props.initialConditions ? <FaPen /> : <FaPlus />}
        onClick={onOpen}
        {...buttonProps}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>NFT conditions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ConditionForm
              buttonRef={footerRef}
              initialConditions={props.initialConditions}
              chainsAllowed={[
                "ethereum",
                "polygon",
                "rinkeby",
                // "goerli",
                // "xdai",
                // "arbitrum",
                // "optimism",
              ]}
              onUnifiedAccessControlConditionsSelected={(conditions) => {
                props.onConditionsUpdated(conditions);
                onClose();
              }}
            />
          </ModalBody>
          <ModalFooter ref={footerRef}></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export { ConditionModal };
