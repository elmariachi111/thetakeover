import { Box, Flex, Heading, Spacer } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useRef } from "react";
import NewLink from "../components/organisms/NewLink";
import { LinkInput } from "../types/LinkInput";

const CreateLink: NextPage = () => {
  const router = useRouter();

  const { status } = useSession({
    required: true,
  });

  const create = async (payload: LinkInput) => {
    console.log(payload);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //... connect paypal
    const res = await axios.post("/api/links/create", payload);
    router.push("/my", {});
  };

  const buttonRef = useRef<HTMLDivElement | null>(null);

  return (
    <Flex direction="column" h="full">
      <Spacer />

      <Heading size="lg" my={6}>
        Create a Takeover
      </Heading>

      <NewLink onSubmit={create} buttonRef={buttonRef} />

      <Spacer />

      <Box ref={buttonRef}></Box>
    </Flex>
  );
};

export default CreateLink;
