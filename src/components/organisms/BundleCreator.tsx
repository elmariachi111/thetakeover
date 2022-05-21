import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React from "react";
import { IoTerminalSharp } from "react-icons/io5";
import { DisplayableLink, XLink } from "../../types/Link";
import { MetadataEditor } from "../molecules/MetadataEditor";

export const BundleCreator = (props: { items: Partial<DisplayableLink>[] }) => {
  const { items } = props;
  const aggregatedPrice = items.reduce((p, c) => p + (c.price || 0), 0);
  const initialValues = {
    title: "Bundle of",
    description: "this bundle contains",
    price: aggregatedPrice,
  };

  const createBundle = async (values) => {
    console.log(values);
  };

  return (
    <Flex width="100%">
      <Heading size="sm">Create a bundle ({items.length})</Heading>
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => createBundle(values)}
      >
        {({ errors, values }) => (
          <Form id="bundle-form">
            <FormControl>
              <FormLabel>title</FormLabel>
              <Field name="title" type="text" as={Input} />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Flex direction="column">
                <FormLabel>description</FormLabel>
                <Field name="description" type="text" as={Textarea} />
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.price}>
              <Flex direction="row" align="center">
                <FormLabel flex={2}>Price (EUR)</FormLabel>
                <Field name="price" type="text" as={Input} flex={6} />
              </Flex>
              <FormErrorMessage>{errors.price}</FormErrorMessage>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Flex>
  );
};
