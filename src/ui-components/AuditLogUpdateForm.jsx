/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { getAuditLog } from "../graphql/queries";
import { updateAuditLog } from "../graphql/mutations";
export default function AuditLogUpdateForm(props) {
  const {
    id: idProp,
    auditLog: auditLogModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    userId: "",
    userName: "",
    userEmail: "",
    action: "",
    resource: "",
    details: "",
    timestamp: "",
    ipAddress: "",
    userAgent: "",
    createdAt: "",
    updatedAt: "",
  };
  const [userId, setUserId] = React.useState(initialValues.userId);
  const [userName, setUserName] = React.useState(initialValues.userName);
  const [userEmail, setUserEmail] = React.useState(initialValues.userEmail);
  const [action, setAction] = React.useState(initialValues.action);
  const [resource, setResource] = React.useState(initialValues.resource);
  const [details, setDetails] = React.useState(initialValues.details);
  const [timestamp, setTimestamp] = React.useState(initialValues.timestamp);
  const [ipAddress, setIpAddress] = React.useState(initialValues.ipAddress);
  const [userAgent, setUserAgent] = React.useState(initialValues.userAgent);
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = auditLogRecord
      ? { ...initialValues, ...auditLogRecord }
      : initialValues;
    setUserId(cleanValues.userId);
    setUserName(cleanValues.userName);
    setUserEmail(cleanValues.userEmail);
    setAction(cleanValues.action);
    setResource(cleanValues.resource);
    setDetails(cleanValues.details);
    setTimestamp(cleanValues.timestamp);
    setIpAddress(cleanValues.ipAddress);
    setUserAgent(cleanValues.userAgent);
    setCreatedAt(cleanValues.createdAt);
    setUpdatedAt(cleanValues.updatedAt);
    setErrors({});
  };
  const [auditLogRecord, setAuditLogRecord] = React.useState(auditLogModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await API.graphql({
              query: getAuditLog.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getAuditLog
        : auditLogModelProp;
      setAuditLogRecord(record);
    };
    queryData();
  }, [idProp, auditLogModelProp]);
  React.useEffect(resetStateValues, [auditLogRecord]);
  const validations = {
    userId: [{ type: "Required" }],
    userName: [{ type: "Required" }],
    userEmail: [{ type: "Required" }],
    action: [{ type: "Required" }],
    resource: [{ type: "Required" }],
    details: [{ type: "Required" }],
    timestamp: [{ type: "Required" }],
    ipAddress: [],
    userAgent: [],
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
          userId,
          userName,
          userEmail,
          action,
          resource,
          details,
          timestamp,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
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
            query: updateAuditLog.replaceAll("__typename", ""),
            variables: {
              input: {
                id: auditLogRecord.id,
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
      {...getOverrideProps(overrides, "AuditLogUpdateForm")}
      {...rest}
    >
      <TextField
        label="User id"
        isRequired={true}
        isReadOnly={false}
        value={userId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId: value,
              userName,
              userEmail,
              action,
              resource,
              details,
              timestamp,
              ipAddress,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.userId ?? value;
          }
          if (errors.userId?.hasError) {
            runValidationTasks("userId", value);
          }
          setUserId(value);
        }}
        onBlur={() => runValidationTasks("userId", userId)}
        errorMessage={errors.userId?.errorMessage}
        hasError={errors.userId?.hasError}
        {...getOverrideProps(overrides, "userId")}
      ></TextField>
      <TextField
        label="User name"
        isRequired={true}
        isReadOnly={false}
        value={userName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId,
              userName: value,
              userEmail,
              action,
              resource,
              details,
              timestamp,
              ipAddress,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.userName ?? value;
          }
          if (errors.userName?.hasError) {
            runValidationTasks("userName", value);
          }
          setUserName(value);
        }}
        onBlur={() => runValidationTasks("userName", userName)}
        errorMessage={errors.userName?.errorMessage}
        hasError={errors.userName?.hasError}
        {...getOverrideProps(overrides, "userName")}
      ></TextField>
      <TextField
        label="User email"
        isRequired={true}
        isReadOnly={false}
        value={userEmail}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId,
              userName,
              userEmail: value,
              action,
              resource,
              details,
              timestamp,
              ipAddress,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.userEmail ?? value;
          }
          if (errors.userEmail?.hasError) {
            runValidationTasks("userEmail", value);
          }
          setUserEmail(value);
        }}
        onBlur={() => runValidationTasks("userEmail", userEmail)}
        errorMessage={errors.userEmail?.errorMessage}
        hasError={errors.userEmail?.hasError}
        {...getOverrideProps(overrides, "userEmail")}
      ></TextField>
      <TextField
        label="Action"
        isRequired={true}
        isReadOnly={false}
        value={action}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId,
              userName,
              userEmail,
              action: value,
              resource,
              details,
              timestamp,
              ipAddress,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.action ?? value;
          }
          if (errors.action?.hasError) {
            runValidationTasks("action", value);
          }
          setAction(value);
        }}
        onBlur={() => runValidationTasks("action", action)}
        errorMessage={errors.action?.errorMessage}
        hasError={errors.action?.hasError}
        {...getOverrideProps(overrides, "action")}
      ></TextField>
      <TextField
        label="Resource"
        isRequired={true}
        isReadOnly={false}
        value={resource}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId,
              userName,
              userEmail,
              action,
              resource: value,
              details,
              timestamp,
              ipAddress,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.resource ?? value;
          }
          if (errors.resource?.hasError) {
            runValidationTasks("resource", value);
          }
          setResource(value);
        }}
        onBlur={() => runValidationTasks("resource", resource)}
        errorMessage={errors.resource?.errorMessage}
        hasError={errors.resource?.hasError}
        {...getOverrideProps(overrides, "resource")}
      ></TextField>
      <TextField
        label="Details"
        isRequired={true}
        isReadOnly={false}
        value={details}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId,
              userName,
              userEmail,
              action,
              resource,
              details: value,
              timestamp,
              ipAddress,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.details ?? value;
          }
          if (errors.details?.hasError) {
            runValidationTasks("details", value);
          }
          setDetails(value);
        }}
        onBlur={() => runValidationTasks("details", details)}
        errorMessage={errors.details?.errorMessage}
        hasError={errors.details?.hasError}
        {...getOverrideProps(overrides, "details")}
      ></TextField>
      <TextField
        label="Timestamp"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={timestamp && convertToLocal(new Date(timestamp))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              userId,
              userName,
              userEmail,
              action,
              resource,
              details,
              timestamp: value,
              ipAddress,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.timestamp ?? value;
          }
          if (errors.timestamp?.hasError) {
            runValidationTasks("timestamp", value);
          }
          setTimestamp(value);
        }}
        onBlur={() => runValidationTasks("timestamp", timestamp)}
        errorMessage={errors.timestamp?.errorMessage}
        hasError={errors.timestamp?.hasError}
        {...getOverrideProps(overrides, "timestamp")}
      ></TextField>
      <TextField
        label="Ip address"
        isRequired={false}
        isReadOnly={false}
        value={ipAddress}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId,
              userName,
              userEmail,
              action,
              resource,
              details,
              timestamp,
              ipAddress: value,
              userAgent,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.ipAddress ?? value;
          }
          if (errors.ipAddress?.hasError) {
            runValidationTasks("ipAddress", value);
          }
          setIpAddress(value);
        }}
        onBlur={() => runValidationTasks("ipAddress", ipAddress)}
        errorMessage={errors.ipAddress?.errorMessage}
        hasError={errors.ipAddress?.hasError}
        {...getOverrideProps(overrides, "ipAddress")}
      ></TextField>
      <TextField
        label="User agent"
        isRequired={false}
        isReadOnly={false}
        value={userAgent}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              userId,
              userName,
              userEmail,
              action,
              resource,
              details,
              timestamp,
              ipAddress,
              userAgent: value,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.userAgent ?? value;
          }
          if (errors.userAgent?.hasError) {
            runValidationTasks("userAgent", value);
          }
          setUserAgent(value);
        }}
        onBlur={() => runValidationTasks("userAgent", userAgent)}
        errorMessage={errors.userAgent?.errorMessage}
        hasError={errors.userAgent?.hasError}
        {...getOverrideProps(overrides, "userAgent")}
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
              userId,
              userName,
              userEmail,
              action,
              resource,
              details,
              timestamp,
              ipAddress,
              userAgent,
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
              userId,
              userName,
              userEmail,
              action,
              resource,
              details,
              timestamp,
              ipAddress,
              userAgent,
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
          isDisabled={!(idProp || auditLogModelProp)}
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
              !(idProp || auditLogModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
