import { Box, Button, Flex, Spacer } from "@chakra-ui/react";
import { Metadata } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import MetadataEditor from "../components/organisms/MetadataEditor";
import NewLink from "../components/organisms/NewLink";
import { LinkInput } from "../types/LinkInput";
import { XOembedData } from "../types/Oembed";

const CreateLink: NextPage = () => {
  const [newLink, setNewLink] = useState<LinkInput>();
  const [metadata, setMetadata] = useState<Metadata>();

  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
  });

  const canCreate = status === "authenticated" && !!metadata;

  const create = async (e) => {
    const payload = {
      uri: newLink?.url,
      price: newLink?.price,
      metadata,
    };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //... connect paypal
    const res = await axios.post("/api/links/create", payload);
    console.debug("link created", res);
    router.push("/my", {});
  };

  useEffect(() => {
    if (!newLink) return;
    (async () => {
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
          embed: oembed.html || null,
        });
      } catch (e: any) {
        console.error(e);
        setMetadata({
          description: "",
          title: "",
          previewImage: "",
          linkHash: "",
          embed: null,
        });
      }
    })();
  }, [newLink]);

  const buttonRef = useRef<HTMLDivElement | null>(null);

  return (
    <Flex direction="column" h="full">
      <Spacer />
      <NewLink onLink={setNewLink} buttonRef={buttonRef} />

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
        <Box ref={buttonRef}></Box>
      )}
    </Flex>
  );
};

export default CreateLink;
