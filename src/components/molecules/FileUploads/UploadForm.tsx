import { Flex, FormLabel, Input, useColorMode } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUpload } from "./Context";

const UploadForm = (props: { children?: React.ReactNode }) => {
  const { children } = props;
  const { colorMode } = useColorMode();

  const { acceptFiles, filesToUpload } = useUpload();

  const onDrop = useCallback(
    (droppedFiles: File[]) => {
      acceptFiles(droppedFiles);
    },
    [acceptFiles]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const label =
    filesToUpload.length > 0 ? "add more files:" : "upload files to protect:";
  return (
    <Flex direction="column">
      <FormLabel>{children || label}</FormLabel>
      <Flex
        justify="space-between"
        bg={colorMode == "dark" ? "gray.800" : "gray.200"}
        color="gray.600"
        p={6}
        {...getRootProps()}
        transitionDuration="200ms"
        _hover={{
          background: colorMode == "dark" ? "whiteAlpha.100" : "blackAlpha.100",
        }}
      >
        <Input {...getInputProps()} size="lg" />
        click here or drop files
      </Flex>
    </Flex>
  );
};

export { UploadForm };
