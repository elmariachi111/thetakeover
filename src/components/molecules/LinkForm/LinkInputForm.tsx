import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Field, FormikErrors, FormikTouched } from "formik";
import React, { useMemo } from "react";
import { NewTakeoverInput } from "../../../types/TakeoverInput";
import { useUpload } from "../FileUploads";

const LinkInputForm = ({
  errors,
  touched,
  values,
}: {
  errors: FormikErrors<Partial<NewTakeoverInput>>;
  touched: FormikTouched<Partial<NewTakeoverInput>>;
  values: Partial<NewTakeoverInput>;
}) => {
  const { filesToUpload } = useUpload();

  const disabled = useMemo(() => {
    return (
      filesToUpload.length > 0 || (values.files && values.files.length > 0)
    );
  }, [values, filesToUpload]);

  if (disabled) return <></>;
  return (
    <Flex direction="column" w="100%">
      {values.files && values.files.length === 0 && (
        <FormControl isInvalid={!!errors.url} isDisabled={disabled}>
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
      )}
    </Flex>
  );
};

export { LinkInputForm };
