import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import NewLink from "../components/organisms/NewLink";
import { LinkPayload } from "../types/LinkPayload";

const CreateLink: NextPage = () => {
  const [newLink, setNewLink] = useState<LinkPayload>();
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
  });

  const canCreate = status === "authenticated" && !!newLink;

  const submit = async (e) => {
    e.preventDefault();

    //... connect paypal
    const res = await axios.post("/api/links/create", {
      uri: newLink?.url,
      price: newLink?.price,
    });

    router.push("/my", {});
  };

  return (
    <Flex direction="column" h="full" align="center">
      <Spacer />
      <NewLink onChange={setNewLink} />
      <Spacer />

      <Button w="full" onClick={submit} disabled={!canCreate}>
        go ahead
      </Button>
    </Flex>
  );
};

export default CreateLink;
