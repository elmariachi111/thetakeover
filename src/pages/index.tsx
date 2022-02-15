import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { useState } from "react";
import NewLink from "../components/organisms/NewLink";
import { LinkPayload } from "../types/LinkPayload";

const CreateLink: NextPage = () => {

  const [newLink, setNewLink] = useState<LinkPayload>();
  const submit = async (e) => {
    e.preventDefault();

    console.log(newLink);
    const res = await axios.post("/api/links/create", {
      uri: newLink?.url,
      price: newLink?.price
    })

    console.log(await res.data);
    //... connect paypal
    //...generate link on the backend
    //const paywallLink = 
  }

  return (
    <Flex  direction="column" h="full" align="center">
      <Spacer />
      <NewLink onChange={setNewLink}/>
      <Spacer />
      <Button w="full" onClick={submit}>go ahead</Button>
    </Flex>
  );
};

export default CreateLink;
