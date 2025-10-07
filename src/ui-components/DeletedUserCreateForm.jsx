/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { createDeletedUser } from "../graphql/mutations";
export default function DeletedUserCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    originalUserID: "",
    deletedAt: "",
    scheduledCleanupAt: "",
    userData: "",
    status: "",
    createdAt: "",
    updatedAt: "",
  };
  const [originalUserID, setOriginalUserID] = React.useState(
    initialValues.originalUserID
  );
  const [deletedAt, setDeletedAt] = React.useState(initialValues.deletedAt);
  const [scheduledCleanupAt, setScheduledCleanupAt] = React.useState(
    initialValues.scheduledCleanupAt
  );
  const [userData, setUserData] = React.useState(initialValues.userData);
  const [status, setStatus] = React.useState(initialValues.status);
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setOriginalUserID(initialValues.originalUserID);
    setDeletedAt(initialValues.deletedAt);
    setScheduledCleanupAt(initialValues.scheduledCleanupAt);
    setUserData(initialValues.userData);
    setStatus(initialValues.status);
    setCreatedAt(initialValues.createdAt);
    setUpdatedAt(initialValues.updatedAt);
    setErrors({});
  };
  const validations = {
    originalUserID: [{ type: "Required" }],
    deletedAt: [{ type: "Required" }],
    scheduledCleanupAt: [{ type: "Required" }],
    userData: [{ type: "Required" }, { type: "JSON" }],
    status: [{ type: "Required" }],
    createdAt: [{ type: "Required" }],
    updatedAt: [{ type: "Required" }],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  const convertToLocal = (date) => {
    const df = new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "iso8601",
      numberingSystem: "latn",
      hourCycle: "h23",
    });
    const parts = df.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          originalUserID,
          deletedAt,
          scheduledCleanupAt,
          userData,
          status,
          createdAt,
          updatedAt,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await API.graphql({
            query: createDeletedUser.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "DeletedUserCreateForm")}
      {...rest}
    >
      <TextField
        label="Original user id"
        isRequired={true}
        isReadOnly={false}
        value={originalUserID}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              originalUserID: value,
              deletedAt,
              scheduledCleanupAt,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.originalUserID ?? value;
          }
          if (errors.originalUserID?.hasError) {
            runValidationTasks("originalUserID", value);
          }
          setOriginalUserID(value);
        }}
        onBlur={() => runValidationTasks("originalUserID", originalUserID)}
        errorMessage={errors.originalUserID?.errorMessage}
        hasError={errors.originalUserID?.hasError}
        {...getOverrideProps(overrides, "originalUserID")}
      ></TextField>
      <TextField
        label="Deleted at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={deletedAt && convertToLocal(new Date(deletedAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              originalUserID,
              deletedAt: value,
              scheduledCleanupAt,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.deletedAt ?? value;
          }
          if (errors.deletedAt?.hasError) {
            runValidationTasks("deletedAt", value);
          }
          setDeletedAt(value);
        }}
        onBlur={() => runValidationTasks("deletedAt", deletedAt)}
        errorMessage={errors.deletedAt?.errorMessage}
        hasError={errors.deletedAt?.hasError}
        {...getOverrideProps(overrides, "deletedAt")}
      ></TextField>
      <TextField
        label="Scheduled cleanup at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={
          scheduledCleanupAt && convertToLocal(new Date(scheduledCleanupAt))
        }
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              originalUserID,
              deletedAt,
              scheduledCleanupAt: value,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.scheduledCleanupAt ?? value;
          }
          if (errors.scheduledCleanupAt?.hasError) {
            runValidationTasks("scheduledCleanupAt", value);
          }
          setScheduledCleanupAt(value);
        }}
        onBlur={() =>
          runValidationTasks("scheduledCleanupAt", scheduledCleanupAt)
        }
        errorMessage={errors.scheduledCleanupAt?.errorMessage}
        hasError={errors.scheduledCleanupAt?.hasError}
        {...getOverrideProps(overrides, "scheduledCleanupAt")}
      ></TextField>
      <TextAreaField
        label="User data"
        isRequired={true}
        isReadOnly={false}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              originalUserID,
              deletedAt,
              scheduledCleanupAt,
              userData: value,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.userData ?? value;
          }
          if (errors.userData?.hasError) {
            runValidationTasks("userData", value);
          }
          setUserData(value);
        }}
        onBlur={() => runValidationTasks("userData", userData)}
        errorMessage={errors.userData?.errorMessage}
        hasError={errors.userData?.hasError}
        {...getOverrideProps(overrides, "userData")}
      ></TextAreaField>
      <TextField
        label="Status"
        isRequired={true}
        isReadOnly={false}
        value={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              originalUserID,
              deletedAt,
              scheduledCleanupAt,
              userData,
              status: value,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.status ?? value;
          }
          if (errors.status?.hasError) {
            runValidationTasks("status", value);
          }
          setStatus(value);
        }}
        onBlur={() => runValidationTasks("status", status)}
        errorMessage={errors.status?.errorMessage}
        hasError={errors.status?.hasError}
        {...getOverrideProps(overrides, "status")}
      ></TextField>
      <TextField
        label="Created at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={createdAt && convertToLocal(new Date(createdAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              originalUserID,
              deletedAt,
              scheduledCleanupAt,
              userData,
              status,
              createdAt: value,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.createdAt ?? value;
          }
          if (errors.createdAt?.hasError) {
            runValidationTasks("createdAt", value);
          }
          setCreatedAt(value);
        }}
        onBlur={() => runValidationTasks("createdAt", createdAt)}
        errorMessage={errors.createdAt?.errorMessage}
        hasError={errors.createdAt?.hasError}
        {...getOverrideProps(overrides, "createdAt")}
      ></TextField>
      <TextField
        label="Updated at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={updatedAt && convertToLocal(new Date(updatedAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              originalUserID,
              deletedAt,
              scheduledCleanupAt,
              userData,
              status,
              createdAt,
              updatedAt: value,
            };
            const result = onChange(modelFields);
            value = result?.updatedAt ?? value;
          }
          if (errors.updatedAt?.hasError) {
            runValidationTasks("updatedAt", value);
          }
          setUpdatedAt(value);
        }}
        onBlur={() => runValidationTasks("updatedAt", updatedAt)}
        errorMessage={errors.updatedAt?.errorMessage}
        hasError={errors.updatedAt?.hasError}
        {...getOverrideProps(overrides, "updatedAt")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
