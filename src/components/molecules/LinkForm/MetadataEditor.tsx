import {
  AspectRatio,
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
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { NewTakeoverInput } from "../../../types/TakeoverInput";
import { XOembedData } from "../../../types/Oembed";
import CloudinaryUploadWidget from "../../organisms/CloudinaryUploadWidget";

export const LinkSchema = Yup.object().shape({
  url: Yup.string().url("not an url").max(550),
  price: Yup.number()
    .moreThan(0.98, "price too low")
    .lessThan(10000, "price too high")
    .required("required"),
  title: Yup.string()
    .min(3, "too short")
    .max(120, "too long")
    .required("required"),
  description: Yup.string()
    .min(10, "too short")
    .max(2000, "too long")
    .required("required"),
  previewImage: Yup.string()
    .url("must be an url")
    .required("needs a preview image"),
});

export const BundleSchema = LinkSchema.omit(["url"]);

export const MetadataEditor = (props: {
  isDisabled?: boolean;
  initialValues?: Partial<NewTakeoverInput>;
}) => {
  const { isDisabled, initialValues } = props;
  const { status } = useSession();

  const { values, setFieldValue, setFieldTouched } =
    useFormikContext<NewTakeoverInput>();

  const [fTitle, mTitle] = useField({
    name: "title",
    value: initialValues ? initialValues.title : values.title,
  });
  const [fDescription, mDescription] = useField({
    name: "description",
    value: initialValues ? initialValues.description : values.description,
  });
  const [fPreviewImage, mPreviewImage] = useField({
    name: "previewImage",
    value: initialValues ? initialValues.previewImage : values.previewImage,
  });

  const [loading, isLoading] = useState(false);

  useEffect(() => {
    if (initialValues) return;
    if (!values.url) return;

    (async () => {
      try {
        isLoading(true);
        const oembed: XOembedData = await (
          await axios.post("/api/links/oembed", {
            uri: values.url,
          })
        ).data;

        setFieldValue("description", oembed.description, true);
        setFieldValue("title", oembed.title, true);
        setFieldValue("previewImage", oembed.thumbnail_url, true);
        setFieldTouched("description", true, true);
      } catch (e: any) {
        console.error("error on oembed extraction", e.message);
      } finally {
        isLoading(false);
      }
    })();
  }, [values.url]);

  const cloudinaryUploaded = (fileInfo: any) => {
    //console.log(fileInfo);
    setFieldValue("previewImage", fileInfo.secure_url, true);
    return;
  };
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
      <FormControl
        isInvalid={!!mTitle.error && !!mTitle.touched}
        isDisabled={isDisabled}
      >
        <FormLabel>title</FormLabel>
        <Input {...fTitle} />
        <FormErrorMessage>{mTitle.error}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={!!mDescription.error && !!mDescription.touched}
        isDisabled={isDisabled}
      >
        <Flex direction="column">
          <FormLabel>description</FormLabel>
          <Textarea
            {...fDescription}
            resize="vertical"
            variant="filled"
            rows={12}
          />
          <FormErrorMessage>{mDescription.error}</FormErrorMessage>
        </Flex>
      </FormControl>

      <FormControl isInvalid={!!mPreviewImage.error} isDisabled={isDisabled}>
        <Flex direction="row" gap={2} align="flex-end">
          <Flex direction="column" flex={1}>
            <FormLabel>preview</FormLabel>
            <Flex gridGap={2} align="center">
              <Input {...fPreviewImage} placeholder="https://some-image.jpg" />
              {status === "authenticated" && (
                <CloudinaryUploadWidget onUploaded={cloudinaryUploaded} />
              )}
            </Flex>
            <FormErrorMessage>{mPreviewImage.error}</FormErrorMessage>
          </Flex>
        </Flex>
        {!mPreviewImage.error && fPreviewImage.value && (
          <AspectRatio ratio={4 / 3} mt={3}>
            <Image src={fPreviewImage.value} />
          </AspectRatio>
        )}
      </FormControl>
    </Flex>
  );
};
