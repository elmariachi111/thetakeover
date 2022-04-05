import { Box, Flex, Heading, Spacer } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import NewLink from "../components/organisms/NewLink";
import { LinkInput } from "../types/LinkInput";

const CreateLink: NextPage = () => {
  const router = useRouter();
  const { url: qUrl, price: qPrice } = router.query;
  const { status } = useSession();

  const [initialValues, setInitialValues] = useState<Partial<LinkInput>>();

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
      const res = await axios.post("/api/links/create", payload);
      router.push("/my", {});
    } else {
      window.localStorage.setItem("newLink", JSON.stringify(payload));
      await signIn(undefined, { callbackUrl: "/create" });
    }
  };

  const buttonRef = useRef<HTMLDivElement | null>(null);

  return (
    <Flex direction="column" h="full">
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
