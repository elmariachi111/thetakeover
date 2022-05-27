import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import React from "react";
import { XLink } from "../../types/Link";
import { BundleInput } from "../../types/LinkInput";

export const BundleCreator = (props: {
  items: Array<XLink & { price: string }>;
  onCreated: (url: string) => void;
  onCancel: () => void;
}) => {
  const { items, onCreated, onCancel } = props;
  const toast = useToast();
  const aggregatedPrice = items
    .reduce((p, c) => p + (parseFloat(c.price) || 0), 0)
    .toFixed(2);
  const initialValues = {
    title: `Bundle of ${items.length} items`,
    description:
      "### this bundle contains\n" +
      items.map((i) => `- ${i.metadata.title}  `).join("\n"),
    price: aggregatedPrice,
  };

  const createBundle = async (values) => {
    const payload: BundleInput = {
      ...values,
      previewImage: items[0].metadata.previewImage,
      members: items.map((i) => i.hash),
    };

    try {
      const res = (await axios.post("/api/links/bundle", payload)).data;
      console.log(res);
      const { hash, newUrl } = res;
      onCreated(newUrl);
    } catch (e: any) {
      toast({
        status: "error",
        title: "Couldn't create bundle",
        description: e.response.data.message,
      });
    }
  };

  return (
    <Flex direction="column" width="100%">
      <Flex direction="row" align="center" justify="space-between">
        <Heading size="sm" my={3}>
          {" "}
          Create a bundle({items.length})
        </Heading>
        <CloseButton onClick={onCancel} />
      </Flex>
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => createBundle(values)}
      >
        {({ errors, values }) => (
          <Form id="bundle-form">
            <VStack gap={6} borderLeftWidth={3} pl={4}>
              <FormControl>
                <FormLabel>title</FormLabel>
                <Field name="title" type="text" as={Input} />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <Flex direction="column">
                  <FormLabel>description</FormLabel>
                  <Field
                    name="description"
                    type="text"
                    as={Textarea}
                    resize="vertical"
                    variant="filled"
                    rows={12}
                  />
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
            </VStack>
            <Button type="submit" form="bundle-form" w="100%" my={3}>
              Create bundle
            </Button>
          </Form>
        )}
      </Formik>
    </Flex>
  );
};
