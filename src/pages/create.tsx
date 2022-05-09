import { Box, CloseButton, Flex, Heading, Icon, IconButton, Input, Spacer, Text, useBoolean, useClipboard } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import { ToLoadingOverlay, ToOverlay } from "../components/atoms/ToOverlay";
import NewLink from "../components/organisms/NewLink";
import { LinkInput } from "../types/LinkInput";


const ToSuccessOverlay = ({ createdLink, onClose }: { createdLink: string, onClose?: () => void }) => {
  const { onCopy } = useClipboard(createdLink);
  return (<ToOverlay>
    <Flex w="50vw" h="40vh" align="center" justify="center" direction="column" gridGap={5}>
      <Flex alignSelf="flex-end">
        <CloseButton onClick={() => onClose ? onClose() : null} />
      </Flex>
      <Icon as={FaCheckCircle} h="20vh" w="20vw" />
      <Text fontSize="2xl">Your Takeover is ready.</Text>
      <Flex direction="row" align="center" w="100%">
        <Input value={createdLink} variant="outline" background="black" />
        <IconButton aria-label="copy" onClick={onCopy} ml={2} icon={<FiCopy />} fontSize="2xl" w="20%" h="100%" />
      </Flex>
    </Flex>
  </ToOverlay>);
};

const CreateLink: NextPage = () => {
  const router = useRouter();
  const { url: qUrl, price: qPrice } = router.query;
  const { status } = useSession();

  const [initialValues, setInitialValues] = useState<Partial<LinkInput>>();
  const [buzy, setBuzy] = useBoolean(false);
  const [createdLink, setCreatedLink] = useState<string>();

  useEffect(() => {
    const _newLink = window.localStorage.getItem("newLink");

    if (_newLink) {
      const newLink = JSON.parse(_newLink) as LinkInput;
      if (status === "authenticated") {
        window.localStorage.removeItem("newLink");
        create(newLink);
      }
      return;
    }

    if (!!qUrl && !!qPrice) {
      window.localStorage.removeItem("newLink");
      return setInitialValues({
        price: parseFloat(qPrice as string),
        url: qUrl as string,
      });
    }

    setInitialValues(undefined);
  }, [status, qUrl, qPrice]);

  const create = async (payload: LinkInput) => {
    if (status === "authenticated") {
      setBuzy.on();
      const _res = await axios.post("/api/links/create", payload);
      const { newUrl } = _res.data;
      setBuzy.off();
      setCreatedLink(newUrl);
    } else {
      window.localStorage.setItem("newLink", JSON.stringify(payload));
      await signIn(undefined, { callbackUrl: "/create" });
    }
  };

  const proceedToContent = async () => {
    router.push("/my", {});
  };

  const buttonRef = useRef<HTMLDivElement | null>(null);

  return (
    <Flex direction="column" h="full">
      {buzy &&
        <ToLoadingOverlay>
          hang on, we're creating your Takeover
        </ToLoadingOverlay>
      }
      {createdLink && <ToSuccessOverlay createdLink={createdLink} onClose={proceedToContent} />}

      <Spacer />
      <Heading size="lg" my={6}>
        Create a Takeover
      </Heading>

      <NewLink
        onSubmit={create}
        buttonRef={buttonRef}
        initialValues={initialValues}
      />

      <Spacer />

      <Box ref={buttonRef}></Box>
    </Flex >
  );
};

export default CreateLink;
