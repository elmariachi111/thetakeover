import { Box, Flex, Heading, Spacer, useBoolean } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { ToLoadingModal, ToLoadingOverlay } from "../components/atoms/ToLoadingOverlay";
import NewLink from "../components/organisms/NewLink";
import { LinkInput } from "../types/LinkInput";

const CreateLink: NextPage = () => {
  const router = useRouter();
  const { url: qUrl, price: qPrice } = router.query;
  const { status } = useSession();

  const [initialValues, setInitialValues] = useState<Partial<LinkInput>>();
  const [buzy, setBuzy] = useBoolean(false);
  const [success, setSuccess] = useState();

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
      const createResult = _res.data;
      setBuzy.off();

      console.log(createResult);
      //router.push("/my", {});
    } else {
      window.localStorage.setItem("newLink", JSON.stringify(payload));
      await signIn(undefined, { callbackUrl: "/create" });
    }
  };

  const buttonRef = useRef<HTMLDivElement | null>(null);

  return (
    <Flex direction="column" h="full">
      {buzy &&
        <ToLoadingOverlay>
          hang on, we're creating your Takeover
        </ToLoadingOverlay>
      }
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
    </Flex>
  );
};

export default CreateLink;
