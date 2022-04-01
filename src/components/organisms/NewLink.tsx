import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Portal,
  Progress,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import { Field, Form, Formik, useField, useFormikContext } from "formik";
import React, { MutableRefObject, useEffect, useState } from "react";
import * as Yup from "yup";
import { LinkInput } from "../../types/LinkInput";
import { XOembedData } from "../../types/Oembed";

const NewLinkSchema = Yup.object().shape({
  url: Yup.string().url("not an url").required("required"),
  price: Yup.number()
    .moreThan(0.98, "price too low")
    .lessThan(100, "price too high")
    .required("required"),
  title: Yup.string()
    .min(3, "too short")
    .max(120, "too long")
    .required("required"),
  description: Yup.string()
    .min(10, "too short")
    .max(2000, "too long")
    .required("required"),
});

const MetadataEditor = () => {
  const {
    values: { url },
    setFieldValue,
  } = useFormikContext<LinkInput>();
  const [fTitle, mTitle] = useField({
    name: "title",
  });
  const [fDescription, mDescription] = useField({
    name: "description",
  });
  const [fPreviewImage, mPreviewImage] = useField({
    name: "previewImage",
  });

  const [loading, isLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        isLoading(true);
        const oembed: XOembedData = await (
          await axios.post("/api/links/oembed", {
            uri: url,
          })
        ).data;

        setFieldValue("description", oembed.description);
        setFieldValue("title", oembed.title);
        setFieldValue("previewImage", oembed.thumbnail_url, true);
        setFieldValue("embed", oembed.html);
      } catch (e: any) {
        console.error(e.message);
      } finally {
        setTimeout(() => {
          isLoading(false);
        }, 500);
      }
    })();
  }, [url, setFieldValue]);

  if (loading) {
    return <Progress size="sm" isIndeterminate />;
  }
  return (
    <Flex
      direction="column"
      gridGap={6}
      borderLeftWidth={3}
      borderLeftColor="gray.700"
      pl={4}
    >
      <FormControl isInvalid={!!mTitle.error && !!mTitle.touched}>
        <FormLabel>title</FormLabel>
        <Input {...fTitle} />
        <FormErrorMessage>{mTitle.error}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!mDescription.error && !!mDescription.touched}>
        <Flex direction="column">
          <FormLabel>description</FormLabel>
          <Textarea
            {...fDescription}
            resize="vertical"
            variant="filled"
            size="sm"
            rows={12}
          />
          <FormErrorMessage>{mDescription.error}</FormErrorMessage>
        </Flex>
      </FormControl>

      <FormControl isInvalid={!!mPreviewImage.error}>
        <Flex direction="row" gap={2}>
          <Flex direction="column" flex={3}>
            <FormLabel>preview</FormLabel>
            <Input {...fPreviewImage} />
          </Flex>
          {!mPreviewImage.error && (
            <Flex flex={1}>
              <Image src={fPreviewImage.value} />
            </Flex>
          )}
        </Flex>
      </FormControl>
    </Flex>
  );
};

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
      validationSchema={NewLinkSchema}
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
