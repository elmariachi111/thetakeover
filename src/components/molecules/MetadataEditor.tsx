import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Progress,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import { useField, useFormikContext } from "formik";
import React, { useEffect, useState } from "react";
import { LinkInput } from "../../types/LinkInput";
import { XOembedData } from "../../types/Oembed";
import * as Yup from "yup";

const LinkSchema = Yup.object().shape({
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

const MetadataEditor = (props: { initialValues?: LinkInput }) => {
  const { initialValues } = props;

  const {
    values: { url },
    setFieldValue,
  } = useFormikContext<LinkInput>();
  const [fTitle, mTitle] = useField({
    name: "title",
    value: initialValues?.title,
  });
  const [fDescription, mDescription] = useField({
    name: "description",
    value: initialValues?.description,
  });
  const [fPreviewImage, mPreviewImage] = useField({
    name: "previewImage",
    value: initialValues?.previewImage,
  });

  const [loading, isLoading] = useState(false);

  useEffect(() => {
    if (initialValues) return;
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

export { MetadataEditor, LinkSchema };
