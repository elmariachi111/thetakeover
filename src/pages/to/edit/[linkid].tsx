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
import axios from "axios";
import { Field, Form, Formik } from "formik";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";

import NextLink from "next/link";
import { UploadedFiles } from "../../../components/molecules/FileUploads";
import { FormikChakraSwitch } from "../../../components/molecules/FormikChakraSwitch";
import { SpeakCondition } from "../../../components/molecules/Gate/SpeakCondition";
import {
  BundleSchema,
  LinkSchema,
  MetadataEditor,
} from "../../../components/molecules/LinkForm";
import { ConditionModal } from "../../../components/organisms/Gate/ConditionModal";
import { findLink } from "../../../modules/api/findLink";
import { XLink } from "../../../types/Link";
import { NewTakeoverInput } from "../../../types/TakeoverInput";

export const getServerSideProps: GetServerSideProps<{
  link: XLink;
}> = async (context) => {
  const linkid: string = context.params?.linkid as string;

  const link = linkid ? await findLink(linkid) : null;
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

  const initialValues: NewTakeoverInput = {
    url: link.originUri || "",
    price: link.price as unknown as number,
    title: link.metadata.title,
    previewImage: link.metadata.previewImage,
    description: link.metadata.description,
    salesActive: link.saleStatus,
    chainConditions: link.chainConditions,
  };

  const isBundle = link.bundles && link.bundles.length > 0;
  const isFile = link.files && link.files.files.length > 0;

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
      {({ errors, values, setFieldValue }) => (
        <Form id="newlink-form">
          <Flex direction="column" gridGap={6} mt={12}>
            {isBundle ? (
              <>
                <Heading size="md">
                  Bundle of {link.bundles!.length} items
                </Heading>
                <Flex direction="row" wrap="wrap" gridGap={2}>
                  {link.bundles!.map((b) => (
                    <Tag key={b.hash} size="lg" variant="solid">
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
            ) : isFile ? (
              <>
                <Heading size="md">
                  Contains {link.files!.files.length} files
                </Heading>
                <UploadedFiles
                  files={link.files!.files}
                  password={new Uint8Array(link.files!.password.data)}
                ></UploadedFiles>
              </>
            ) : (
              <>
                <Heading size="md">Link to external content</Heading>
                <FormControl>
                  <Field name="url" disabled={true} type="text" as={Input} />
                </FormControl>
              </>
            )}

            <MetadataEditor isDisabled={busy} initialValues={initialValues} />

            <FormControl isInvalid={!!errors.price} isDisabled={busy}>
              <Flex direction="row" align="center">
                <FormLabel flex={2}>Price (EUR)</FormLabel>
                <Field name="price" type="text" as={Input} flex={6} />
              </Flex>
              <FormErrorMessage>{errors.price}</FormErrorMessage>
            </FormControl>

            <Flex direction="row" justify="space-between" align="center">
              <FormLabel>
                {values.chainConditions ? (
                  <SpeakCondition conditions={values.chainConditions} />
                ) : (
                  <Text>define on chain conditions</Text>
                )}
              </FormLabel>
              <ConditionModal
                initialConditions={
                  values.chainConditions ? values.chainConditions[0] : undefined
                }
                onConditionsUpdated={(conditions) => {
                  setFieldValue("chainConditions", conditions);
                }}
                variant="ghost"
              />
            </Flex>
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
