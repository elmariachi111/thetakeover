import { Button, Portal } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import { MutableRefObject } from "react";
import { LinkInput, NewTakeoverInput } from "../../types/TakeoverInput";
import { LinkSchema } from "../molecules/LinkForm/MetadataEditor";

import { GateWorkerProvider } from "../../context/GatingWorkerContext";
import { UploadProvider } from "../molecules/FileUploads";
import { NewLinkForm } from "../molecules/LinkForm";

type NewLinkSubmitOptions = {
  afterSubmission?: () => void;
  password?: Uint8Array;
};

const CreateNewLink = (props: {
  onSubmit: (input: NewTakeoverInput, options: NewLinkSubmitOptions) => unknown;
  buttonRef: MutableRefObject<HTMLElement | null>;
  initialLink?: LinkInput;
}) => {
  const { onSubmit } = props;
  const { status } = useSession();
  const buttonRef = props.buttonRef;

  const initialValues: NewTakeoverInput = {
    url: undefined,
    files: [],
    price: undefined,
    title: "",
    previewImage: "",
    description: "",
    password: undefined,
    ...props.initialLink,
  };

  return (
    <GateWorkerProvider>
      <Formik
        enableReinitialize
        validateOnMount={props.initialLink !== undefined}
        initialValues={initialValues}
        validationSchema={LinkSchema}
        onSubmit={async (values, { resetForm }) => {
          onSubmit(values, {
            afterSubmission: resetForm,
          });
        }}
      >
        {(formikProps) => {
          const { errors, values, setFieldValue } = formikProps;
          const submittable =
            Object.values(errors).length == 0 &&
            ((values.url && values.url.length > 5) ||
              (values.files && values.files.length > 0));

          return (
            <Form id="newlink-form">
              <UploadProvider
                password={values.password}
                setPassword={(password) => setFieldValue("password", password)}
                onFilesUploaded={(files) => {
                  setFieldValue("files", [...(values.files || []), ...files]);
                }}
              >
                <NewLinkForm {...formikProps} />
              </UploadProvider>

              <Portal containerRef={buttonRef}>
                <Button
                  type="submit"
                  w="100%"
                  form="newlink-form"
                  disabled={!submittable}
                >
                  {status === "authenticated"
                    ? "Create Takeover"
                    : "Login and create Takeover"}
                </Button>
              </Portal>
            </Form>
          );
        }}
      </Formik>
    </GateWorkerProvider>
  );
};

export default CreateNewLink;
