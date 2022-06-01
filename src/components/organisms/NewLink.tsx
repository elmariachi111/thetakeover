import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Portal,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import React, { MutableRefObject } from "react";
import { LinkInput } from "../../types/LinkInput";
import { LinkSchema, MetadataEditor } from "../molecules/MetadataEditor";

const NewLink = (props: {
  onSubmit: (input: LinkInput, afterSubmission?: () => void) => unknown;
  buttonRef: MutableRefObject<HTMLElement | null>;
  initialValues?: Partial<LinkInput>;
}) => {
  const initialValues: LinkInput = {
    url: "",
    price: 0,
    title: "",
    previewImage: "",
    description: "",
    ...props.initialValues,
  };
  const { status } = useSession();
  const buttonRef = props.buttonRef;

  return (
    <Formik
      enableReinitialize
      validateOnMount={props.initialValues !== undefined}
      initialValues={initialValues}
      validationSchema={LinkSchema}
      onSubmit={async (values, { resetForm }) => {
        props.onSubmit(values, resetForm);
      }}
    >
      {({ errors, touched, values }) => (
        <Form id="newlink-form">
          <Flex direction="column" gridGap={6}>
            <FormControl isInvalid={!!errors.url}>
              <FormLabel>Paste a link to protect:</FormLabel>
              <Field
                name="url"
                type="text"
                as={Input}
                placeholder="https://some.link"
              />
              {errors.url && touched.url && (
                <FormErrorMessage>{errors.url}</FormErrorMessage>
              )}
            </FormControl>

            {!!values.url && !errors.url && (
              <MetadataEditor
                initialValues={
                  values.description?.length > 10 ? initialValues : undefined
                }
              />
            )}

            <FormControl mb={8} isInvalid={!!errors.price}>
              <Flex direction="row" align="center">
                <FormLabel flex={2}>Price (EUR)</FormLabel>
                <Field name="price" type="text" as={Input} flex={6} />
              </Flex>
              <FormErrorMessage>{errors.price}</FormErrorMessage>
            </FormControl>
          </Flex>
          <Portal containerRef={buttonRef}>
            <Button
              type="submit"
              w="100%"
              form="newlink-form"
              disabled={
                values.url.length < 5 || Object.values(errors).length > 0
              }
            >
              {status === "authenticated"
                ? "Create Takeover"
                : "Login and create Takeover"}
            </Button>
          </Portal>
        </Form>
      )}
    </Formik>
  );
};

export default NewLink;
