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
  SwitchField,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { getDeletedUser } from "../graphql/queries";
import { updateDeletedUser } from "../graphql/mutations";
export default function DeletedUserUpdateForm(props) {
  const {
    id: idProp,
    deletedUser: deletedUserModelProp,
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
    name: "",
    email: "",
    role: "",
    deletionScheduledAt: "",
    deletionExecutedAt: "",
    isTestMode: false,
    userData: "",
    status: "",
    createdAt: "",
    updatedAt: "",
  };
  const [originalUserID, setOriginalUserID] = React.useState(
    initialValues.originalUserID
  );
  const [name, setName] = React.useState(initialValues.name);
  const [email, setEmail] = React.useState(initialValues.email);
  const [role, setRole] = React.useState(initialValues.role);
  const [deletionScheduledAt, setDeletionScheduledAt] = React.useState(
    initialValues.deletionScheduledAt
  );
  const [deletionExecutedAt, setDeletionExecutedAt] = React.useState(
    initialValues.deletionExecutedAt
  );
  const [isTestMode, setIsTestMode] = React.useState(initialValues.isTestMode);
  const [userData, setUserData] = React.useState(initialValues.userData);
  const [status, setStatus] = React.useState(initialValues.status);
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = deletedUserRecord
      ? { ...initialValues, ...deletedUserRecord }
      : initialValues;
    setOriginalUserID(cleanValues.originalUserID);
    setName(cleanValues.name);
    setEmail(cleanValues.email);
    setRole(cleanValues.role);
    setDeletionScheduledAt(cleanValues.deletionScheduledAt);
    setDeletionExecutedAt(cleanValues.deletionExecutedAt);
    setIsTestMode(cleanValues.isTestMode);
    setUserData(
      typeof cleanValues.userData === "string" || cleanValues.userData === null
        ? cleanValues.userData
        : JSON.stringify(cleanValues.userData)
    );
    setStatus(cleanValues.status);
    setCreatedAt(cleanValues.createdAt);
    setUpdatedAt(cleanValues.updatedAt);
    setErrors({});
  };
  const [deletedUserRecord, setDeletedUserRecord] =
    React.useState(deletedUserModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await API.graphql({
              query: getDeletedUser.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getDeletedUser
        : deletedUserModelProp;
      setDeletedUserRecord(record);
    };
    queryData();
  }, [idProp, deletedUserModelProp]);
  React.useEffect(resetStateValues, [deletedUserRecord]);
  const validations = {
    originalUserID: [{ type: "Required" }],
    name: [{ type: "Required" }],
    email: [{ type: "Required" }],
    role: [{ type: "Required" }],
    deletionScheduledAt: [{ type: "Required" }],
    deletionExecutedAt: [],
    isTestMode: [{ type: "Required" }],
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
          name,
          email,
          role,
          deletionScheduledAt,
          deletionExecutedAt: deletionExecutedAt ?? null,
          isTestMode,
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
            query: updateDeletedUser.replaceAll("__typename", ""),
            variables: {
              input: {
                id: deletedUserRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "DeletedUserUpdateForm")}
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
              name,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
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
        label="Name"
        isRequired={true}
        isReadOnly={false}
        value={name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              originalUserID,
              name: value,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.name ?? value;
          }
          if (errors.name?.hasError) {
            runValidationTasks("name", value);
          }
          setName(value);
        }}
        onBlur={() => runValidationTasks("name", name)}
        errorMessage={errors.name?.errorMessage}
        hasError={errors.name?.hasError}
        {...getOverrideProps(overrides, "name")}
      ></TextField>
      <TextField
        label="Email"
        isRequired={true}
        isReadOnly={false}
        value={email}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              originalUserID,
              name,
              email: value,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.email ?? value;
          }
          if (errors.email?.hasError) {
            runValidationTasks("email", value);
          }
          setEmail(value);
        }}
        onBlur={() => runValidationTasks("email", email)}
        errorMessage={errors.email?.errorMessage}
        hasError={errors.email?.hasError}
        {...getOverrideProps(overrides, "email")}
      ></TextField>
      <TextField
        label="Role"
        isRequired={true}
        isReadOnly={false}
        value={role}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              originalUserID,
              name,
              email,
              role: value,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.role ?? value;
          }
          if (errors.role?.hasError) {
            runValidationTasks("role", value);
          }
          setRole(value);
        }}
        onBlur={() => runValidationTasks("role", role)}
        errorMessage={errors.role?.errorMessage}
        hasError={errors.role?.hasError}
        {...getOverrideProps(overrides, "role")}
      ></TextField>
      <TextField
        label="Deletion scheduled at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={
          deletionScheduledAt && convertToLocal(new Date(deletionScheduledAt))
        }
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              originalUserID,
              name,
              email,
              role,
              deletionScheduledAt: value,
              deletionExecutedAt,
              isTestMode,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.deletionScheduledAt ?? value;
          }
          if (errors.deletionScheduledAt?.hasError) {
            runValidationTasks("deletionScheduledAt", value);
          }
          setDeletionScheduledAt(value);
        }}
        onBlur={() =>
          runValidationTasks("deletionScheduledAt", deletionScheduledAt)
        }
        errorMessage={errors.deletionScheduledAt?.errorMessage}
        hasError={errors.deletionScheduledAt?.hasError}
        {...getOverrideProps(overrides, "deletionScheduledAt")}
      ></TextField>
      <TextField
        label="Deletion executed at"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={
          deletionExecutedAt && convertToLocal(new Date(deletionExecutedAt))
        }
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              originalUserID,
              name,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt: value,
              isTestMode,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.deletionExecutedAt ?? value;
          }
          if (errors.deletionExecutedAt?.hasError) {
            runValidationTasks("deletionExecutedAt", value);
          }
          setDeletionExecutedAt(value);
        }}
        onBlur={() =>
          runValidationTasks("deletionExecutedAt", deletionExecutedAt)
        }
        errorMessage={errors.deletionExecutedAt?.errorMessage}
        hasError={errors.deletionExecutedAt?.hasError}
        {...getOverrideProps(overrides, "deletionExecutedAt")}
      ></TextField>
      <SwitchField
        label="Is test mode"
        defaultChecked={false}
        isDisabled={false}
        isChecked={isTestMode}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              originalUserID,
              name,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode: value,
              userData,
              status,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.isTestMode ?? value;
          }
          if (errors.isTestMode?.hasError) {
            runValidationTasks("isTestMode", value);
          }
          setIsTestMode(value);
        }}
        onBlur={() => runValidationTasks("isTestMode", isTestMode)}
        errorMessage={errors.isTestMode?.errorMessage}
        hasError={errors.isTestMode?.hasError}
        {...getOverrideProps(overrides, "isTestMode")}
      ></SwitchField>
      <TextAreaField
        label="User data"
        isRequired={true}
        isReadOnly={false}
        value={userData}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              originalUserID,
              name,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
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
              name,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
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
              name,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
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
              name,
              email,
              role,
              deletionScheduledAt,
              deletionExecutedAt,
              isTestMode,
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
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || deletedUserModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || deletedUserModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
