import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link as ChakraLink,
  Spinner,
  useBoolean
} from "@chakra-ui/react";
import { Link, Metadata, PrismaClient, User } from "@prisma/client";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import NextLink from "next/link";
import React from "react";
import {
  LinkSchema,
  MetadataEditor
} from "../../../components/molecules/MetadataEditor";
import { findLink } from "../../../modules/api/findLink";
import { LinkInput } from "../../../types/LinkInput";

export const getServerSideProps: GetServerSideProps<{
  link: Link & { metadata: Metadata; creator: User };
}> = async (context) => {
  const linkid: string = context.params?.linkid as string;
  const prisma = new PrismaClient();

  const link = linkid ? await findLink(prisma, linkid) : null;
  if (!link) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(context);

  if (!session || !session.user?.id) {
    return {
      redirect: {
        destination: `/api/auth/signin`,
        permanent: false,
      },
    };
  }

  const { user } = session;

  if (user.id !== link.creatorId) {
    //todo: add an error message
    return {
      redirect: {
        destination: `/to/${linkid}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      link: JSON.parse(JSON.stringify(link)),
    },
  };
};

function ToEdit({
  link,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useSession({
    required: true,
  });

  const [busy, setBusy] = useBoolean(false);
  const onSubmit = async (values) => {
    setBusy.on();
    await axios.post(`/api/to/${link.hash}`, { link: values });
    setBusy.off();
    return false;
  };

  const initialValues: LinkInput = {
    url: link.originUri,
    price: link.price as unknown as number,
    title: link.metadata.title,
    previewImage: link.metadata.previewImage,
    description: link.metadata.description,
    embed: link.metadata.embed || "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={LinkSchema}
      onSubmit={(values) => {
        onSubmit(values);
        return;
      }}
    >
      {({ errors }) => (
        <Form id="newlink-form">
          <Flex direction="column" gridGap={6}>
            <FormControl isInvalid={!!errors.url}>
              <FormLabel>link</FormLabel>
              <Field name="url" disabled={true} type="text" as={Input} />
            </FormControl>

            <MetadataEditor isDisabled={busy} initialValues={initialValues} />

            <FormControl mb={8} isInvalid={!!errors.price} isDisabled={busy}>
              <Flex direction="row" align="center">
                <FormLabel flex={2}>Price (EUR)</FormLabel>
                <Field name="price" type="text" as={Input} flex={6} />
              </Flex>
              <FormErrorMessage>{errors.price}</FormErrorMessage>
            </FormControl>
          </Flex>
          <Flex gridGap={2}>
            <Button
              type="submit"
              w="100%"
              gap={3}
              form="newlink-form"
              disabled={busy || Object.values(errors).length > 0}
            >
              {busy && <Spinner />} update
            </Button>
            <NextLink href={`/to/${link.hash}`} passHref>
              <Button as={ChakraLink} variant="ghost">
                visit
              </Button>
            </NextLink>
          </Flex>
        </Form>
      )}
    </Formik>
  );
}

ToEdit.auth = true;

export default ToEdit;
