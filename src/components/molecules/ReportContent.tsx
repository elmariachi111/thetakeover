import {
  Button,
  ButtonProps,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spacer,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { UserReportReason } from "@prisma/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useMemo, useState } from "react";
import { FaFlag } from "react-icons/fa";
import { DisplayableLink, XLink } from "../../types/Link";
import { Report } from "../../types/Report";
import { FiCheckCircle } from "react-icons/fi";

const ReportModalDialog = ({
  link,
  setSubmitted,
  onError,
}: {
  link: XLink;
  setSubmitted: (submitted: boolean) => void;
  onError: () => void;
}) => {
  const { status: sessionStatus, data: sessionData } = useSession();
  const [reportReason, setReportReason] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const toast = useToast();

  const submittable = useMemo(() => {
    return !!reportReason;
  }, [reportReason]);

  const reasonChoices = {
    COPYRIGHT_INFRINGEMENT: "copyright infringement",
    HARRASSMENT: "harrassing or unappropriate content",
    OTHER: "other",
  };

  const reportContent = async () => {
    if (!submittable || !sessionData?.user) return;
    const report: Report = {
      linkHash: link.hash,
      reason: reportReason as UserReportReason,
      message: reportMessage,
    };

    if (report.reason == null) return false;

    try {
      const result = await axios.post(
        `/api/to/report/${link.hash}`,
        report,
        {}
      );
      setSubmitted(true);
    } catch (e: any) {
      console.error(e.message);
      onError();
      toast({
        status: "error",
        title: e.message,
        description: "There's nothing you can't do :(",
      });
    }
  };

  return (
    <>
      <ModalBody>
        <Text>
          You&apos;re about to report <em>{link.metadata.title}</em> by{" "}
          <em>{link.creator.name}</em>. The creator won't be alerted. Your user
          id will be tracked.
        </Text>
        <Spacer my={6} />
        <form onSubmit={reportContent}>
          <VStack gap={3}>
            <FormControl>
              <FormLabel htmlFor="reason">Reason</FormLabel>
              <Select
                placeholder="Select a reason"
                id="reason"
                onChange={(e) => {
                  setReportReason(e.target.value);
                }}
              >
                {Object.keys(reasonChoices).map((choice) => (
                  <option
                    key={choice}
                    value={choice}
                    selected={reportMessage === choice}
                  >
                    {reasonChoices[choice]}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="message">Message</FormLabel>
              <Textarea
                id="message"
                onChange={(e) => setReportMessage(e.target.value)}
              ></Textarea>
            </FormControl>
          </VStack>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={reportContent}
          leftIcon={<FaFlag />}
          disabled={!submittable}
        >
          Submit report
        </Button>
      </ModalFooter>
    </>
  );
};
export const ReportContent = (props: { link: XLink } & ButtonProps) => {
  const { link, ...buttonProps } = props;

  const { status: sessionStatus, data: sessionData } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [submitted, setSubmitted] = useState(false);

  if (sessionStatus === "unauthenticated") {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label="report"
        icon={<FaFlag />}
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
          <ModalHeader>Report Content</ModalHeader>
          <ModalCloseButton />
          {submitted ? (
            <>
              <ModalBody>
                <Flex direction="column" align="center" gap={6}>
                  <Icon as={FiCheckCircle} w={20} h={20} />
                  <Text>
                    Thank you for your report. We're checking the content now.
                  </Text>
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          ) : (
            <ReportModalDialog
              link={link}
              setSubmitted={setSubmitted}
              onError={() => {
                onClose();
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
