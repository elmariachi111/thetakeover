import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import NewLink from "../components/organisms/NewLink";
import { LinkPayload } from "../types/LinkPayload";

import { Metadata } from "@prisma/client";
import { OembedData } from "oembed-parser";
import MetadataEditor from "../components/organisms/MetadataEditor";

interface XOembedData extends OembedData {
  description?: string;
}
const CreateLink: NextPage = () => {
  const [newLink, setNewLink] = useState<LinkPayload>();
  const [metadata, setMetadata] = useState<Metadata>();

  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
  });

  const linkValid = status === "authenticated" && !!newLink;
  const canCreate = status === "authenticated" && !!metadata;

  const create = async (e) => {
    console.log(newLink, metadata);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //... connect paypal
    const res = await axios.post("/api/links/create", {
      uri: newLink?.url,
      price: newLink?.price,
      metadata,
    });
    console.log(res);
    router.push("/my", {});
  };

  const submitLink = async (e) => {
    e.preventDefault();
    try {
      const oembed: XOembedData = await (
        await axios.post("/api/links/oembed", {
          uri: newLink?.url,
        })
      ).data;
      console.log(oembed);
      setMetadata({
        description: oembed.description || "",
        title: oembed.title || "",
        previewImage: oembed.thumbnail_url || "",
        linkHash: "",
      });
    } catch (e: any) {
      setMetadata({
        description: "",
        title: "",
        previewImage: "",
        linkHash: "",
      });
    }
  };

  return (
    <Flex direction="column" h="full">
      <Spacer />
      <NewLink onChange={setNewLink} />

      {metadata && (
        <Flex mt={16} w="100%">
          <MetadataEditor metadata={metadata} onChange={setMetadata} />
        </Flex>
      )}
      <Spacer />

      {metadata ? (
        <Button w="full" onClick={create} disabled={!canCreate}>
          Create Takeover
        </Button>
      ) : (
        <Button w="full" onClick={submitLink} disabled={!linkValid}>
          go ahead
        </Button>
      )}
    </Flex>
  );
};

export default CreateLink;
