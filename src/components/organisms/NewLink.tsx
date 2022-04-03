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
import React, { MutableRefObject } from "react";
import { LinkInput } from "../../types/LinkInput";
import { LinkSchema, MetadataEditor } from "../molecules/MetadataEditor";

const NewLink = (props: {
  onSubmit: (p: LinkInput) => unknown;
  buttonRef: MutableRefObject<HTMLElement | null>;
}) => {
  const initialValues: LinkInput = {
    url: "",
    price: 0,
    title: "",
    previewImage: "",
    description: "",
    embed: "",
  };

  const buttonRef = props.buttonRef;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={LinkSchema}
      onSubmit={(values) => {
        props.onSubmit(values);
        return;
      }}
    >
      {({ errors, touched }) => (
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

            {!!touched.url && !errors.url && <MetadataEditor />}

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
                Object.values(touched).length == 0 ||
                Object.values(errors).length > 0
              }
            >
              create takeover
            </Button>
          </Portal>
        </Form>
      )}
    </Formik>
  );
};

export default NewLink;
