import {
  Avatar,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link as ChakraLink,
  Spinner,
  Tag,
  TagLabel,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { Link, Metadata, PrismaClient, User } from "@prisma/client";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";

import NextLink from "next/link";
import React from "react";
import { FormikChakraSwitch } from "../../../components/molecules/FormikChakraSwitch";
import {
  BundleSchema,
  LinkSchema,
  MetadataEditor,
} from "../../../components/molecules/MetadataEditor";
import { findLink } from "../../../modules/api/findLink";
import { LinkInput } from "../../../types/LinkInput";

export const getServerSideProps: GetServerSideProps<{
  link: Link & {
    metadata: Metadata;
    creator: User;
    bundles: Array<{
      hash: string;
      metadata: {
        title: string;
        previewImage: string;
      };
    }>;
  };
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
    url: link.originUri || "",
    price: link.price as unknown as number,
    title: link.metadata.title,
    previewImage: link.metadata.previewImage,
    description: link.metadata.description,
    embed: link.metadata.embed || "",
    salesActive: link.saleStatus,
  };

  const isBundle = link.bundles.length > 0;

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={isBundle ? BundleSchema : LinkSchema}
      onSubmit={(values) => {
        onSubmit(values);
        return;
      }}
    >
      {({ errors, values }) => (
        <Form id="newlink-form">
          <Flex direction="column" gridGap={6}>
            {isBundle ? (
              <>
                <Heading size="md">
                  Bundle of {link.bundles.length} items
                </Heading>
                <Flex direction="row" wrap="wrap" gridGap={2}>
                  {link.bundles.map((b) => (
                    <Tag
                      key={b.hash}
                      colorScheme="blue"
                      borderRadius="full"
                      size="lg"
                      variant="solid"
                    >
                      <Avatar
                        src={b.metadata.previewImage}
                        size="xs"
                        name={b.metadata.title}
                        ml={-1}
                        mr={2}
                      />
                      <ChakraLink href={`/to/edit/${b.hash}`}>
                        <TagLabel>{b.metadata.title}</TagLabel>
                      </ChakraLink>
                    </Tag>
                  ))}
                </Flex>
              </>
            ) : (
              <FormControl isInvalid={!!errors.url}>
                <FormLabel>link</FormLabel>
                <Field name="url" disabled={true} type="text" as={Input} />
              </FormControl>
            )}

            <MetadataEditor isDisabled={busy} initialValues={initialValues} />

            <FormControl isInvalid={!!errors.price} isDisabled={busy}>
              <Flex direction="row" align="center">
                <FormLabel flex={2}>Price (EUR)</FormLabel>
                <Field name="price" type="text" as={Input} flex={6} />
              </Flex>
              <FormErrorMessage>{errors.price}</FormErrorMessage>
            </FormControl>

            <FormikChakraSwitch
              name="salesActive"
              label="is on sale"
              options={{ on: "ON_SALE", off: "PAUSED" }}
            />
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
