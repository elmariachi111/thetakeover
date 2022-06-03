import { Flex } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export const TakeoverUploadForm = (props: {
  onFiles: (files: File[]) => void;
}) => {
  const { onFiles } = props;
  const [files, setFiles] = useState([]);
  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles(acceptedFiles);
      onFiles(acceptedFiles);
    },
    [onFiles]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Flex
      justify="space-between"
      border="3px solid"
      borderColor="gray.400"
      p={6}
    >
      <Flex {...getRootProps()} direction="column">
        <input {...getInputProps()} />
        <p>Drop some files here, or click to select files</p>
        <ul>
          {files.map((f: { path: string }) => (
            <li key={f.path}>{f.path}</li>
          ))}
        </ul>
      </Flex>
      {/* {!!files && <Button onClick={() => storeFiles(files)}>upload</Button>} */}
    </Flex>
  );
};
