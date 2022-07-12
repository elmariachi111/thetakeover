import {
  Box,
  Flex,
  Heading,
  Spacer,
  Text,
  useBoolean,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { toBase64 } from "b64-lite";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ToLoadingOverlay } from "../components/atoms/ToOverlay";
import { ToSuccessOverlay } from "../components/molecules/ToSuccessOverlay";
import CreateNewLink from "../components/organisms/CreateNewLink";
import { LinkInput, NewTakeoverInput } from "../types/TakeoverInput";

const CACHE_ITEM_NAME = "newTO";

const CreateLink: NextPage = () => {
  const router = useRouter();
  const { url: qUrl, price: qPrice } = router.query;
  const { status } = useSession();
  const toast = useToast();

  const [linkInput, setLinkInput] = useState<LinkInput>();

  const [buzy, setBuzy] = useBoolean(false);
  const [createdLink, setCreatedLink] = useState<string>();

  useEffect(() => {
    const _newTO = window.localStorage.getItem(CACHE_ITEM_NAME);

    if (_newTO) {
      const newTO = JSON.parse(_newTO) as NewTakeoverInput;
      if (status === "authenticated") {
        window.localStorage.removeItem(CACHE_ITEM_NAME);
        create(newTO);
      }
      return;
    }

    if (!!qUrl && !!qPrice) {
      window.localStorage.removeItem(CACHE_ITEM_NAME);
      return setLinkInput({
        url: qUrl as string,
        price: parseFloat(qPrice as string),
      });
    }
  }, [status, qUrl, qPrice]);

  const create = async (
    payload: NewTakeoverInput,
    options?: {
      afterSubmission?: () => void;
    }
  ) => {
    if (status === "authenticated") {
      setBuzy.on();
      try {
        const _payload = {
          ...payload,
          password: payload.password
            ? toBase64(payload.password?.buffer)
            : undefined,
        };
        const _res = await axios.post("/api/links/create", _payload);
        const { newUrl } = _res.data;
        options?.afterSubmission && options.afterSubmission();
        setCreatedLink(newUrl);
      } catch (e: any) {
        const reason = e.response ? e.response.data.reason : e.message;
        toast({
          status: "error",
          title: "couldn't create Takevoer",
          description: reason,
        });
      } finally {
        setBuzy.off();
      }
    } else {
      window.localStorage.setItem(CACHE_ITEM_NAME, JSON.stringify(payload));
      await signIn(undefined, { callbackUrl: "/create" });
    }
    return false;
  };

  const proceedToContent = async () => {
    router.push("/my", {});
  };

  const buttonRef = useRef<HTMLDivElement | null>(null);

  return (
    <Flex direction="column" h="full">
      {buzy && (
        <ToLoadingOverlay>
          hang on, we&apos;re creating your Takeover
        </ToLoadingOverlay>
      )}
      {createdLink && (
        <ToSuccessOverlay
          title="Your Takeover is ready"
          createdLink={createdLink}
          onClose={proceedToContent}
        />
      )}

      <Spacer />
      <Flex my={12} direction="column" gap={2}>
        <Heading size="lg">Create a Takeover</Heading>
        <Text fontSize="md">
          The easiest way to monetize your work. Upload files or use any private
          link to protect. Set a price range or setup onchain conditions. Share
          the result with your peers.
        </Text>
      </Flex>
      <CreateNewLink
        onSubmit={create}
        buttonRef={buttonRef}
        initialLink={linkInput}
      />

      <Spacer />

      <Box ref={buttonRef}></Box>
    </Flex>
  );
};

export default CreateLink;
