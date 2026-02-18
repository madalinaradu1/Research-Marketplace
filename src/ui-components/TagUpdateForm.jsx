/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Icon,
  ScrollView,
  Text,
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { getTag } from "../graphql/queries";
import { updateTag } from "../graphql/mutations";
function ArrayField({
  items = [],
  onChange,
  label,
  inputFieldRef,
  children,
  hasError,
  setFieldValue,
  currentFieldValue,
  defaultFieldValue,
  lengthLimit,
  getBadgeText,
  runValidationTasks,
  errorMessage,
}) {
  const labelElement = <Text>{label}</Text>;
  const {
    tokens: {
      components: {
        fieldmessages: { error: errorStyles },
      },
    },
  } = useTheme();
  const [selectedBadgeIndex, setSelectedBadgeIndex] = React.useState();
  const [isEditing, setIsEditing] = React.useState();
  React.useEffect(() => {
    if (isEditing) {
      inputFieldRef?.current?.focus();
    }
  }, [isEditing]);
  const removeItem = async (removeIndex) => {
    const newItems = items.filter((value, index) => index !== removeIndex);
    await onChange(newItems);
    setSelectedBadgeIndex(undefined);
  };
  const addItem = async () => {
    const { hasError } = runValidationTasks();
    if (
      currentFieldValue !== undefined &&
      currentFieldValue !== null &&
      currentFieldValue !== "" &&
      !hasError
    ) {
      const newItems = [...items];
      if (selectedBadgeIndex !== undefined) {
        newItems[selectedBadgeIndex] = currentFieldValue;
        setSelectedBadgeIndex(undefined);
      } else {
        newItems.push(currentFieldValue);
      }
      await onChange(newItems);
      setIsEditing(false);
    }
  };
  const arraySection = (
    <React.Fragment>
      {!!items?.length && (
        <ScrollView height="inherit" width="inherit" maxHeight={"7rem"}>
          {items.map((value, index) => {
            return (
              <Badge
                key={index}
                style={{
                  cursor: "pointer",
                  alignItems: "center",
                  marginRight: 3,
                  marginTop: 3,
                  backgroundColor:
                    index === selectedBadgeIndex ? "#B8CEF9" : "",
                }}
                onClick={() => {
                  setSelectedBadgeIndex(index);
                  setFieldValue(items[index]);
                  setIsEditing(true);
                }}
              >
                {getBadgeText ? getBadgeText(value) : value.toString()}
                <Icon
                  style={{
                    cursor: "pointer",
                    paddingLeft: 3,
                    width: 20,
                    height: 20,
                  }}
                  viewBox={{ width: 20, height: 20 }}
                  paths={[
                    {
                      d: "M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z",
                      stroke: "black",
                    },
                  ]}
                  ariaLabel="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(index);
                  }}
                />
              </Badge>
            );
          })}
        </ScrollView>
      )}
      <Divider orientation="horizontal" marginTop={5} />
    </React.Fragment>
  );
  if (lengthLimit !== undefined && items.length >= lengthLimit && !isEditing) {
    return (
      <React.Fragment>
        {labelElement}
        {arraySection}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {labelElement}
      {isEditing && children}
      {!isEditing ? (
        <>
          <Button
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Add item
          </Button>
          {errorMessage && hasError && (
            <Text color={errorStyles.color} fontSize={errorStyles.fontSize}>
              {errorMessage}
            </Text>
          )}
        </>
      ) : (
        <Flex justifyContent="flex-end">
          {(currentFieldValue || isEditing) && (
            <Button
              children="Cancel"
              type="button"
              size="small"
              onClick={() => {
                setFieldValue(defaultFieldValue);
                setIsEditing(false);
                setSelectedBadgeIndex(undefined);
              }}
            ></Button>
          )}
          <Button size="small" variation="link" onClick={addItem}>
            {selectedBadgeIndex !== undefined ? "Save" : "Add"}
          </Button>
        </Flex>
      )}
      {arraySection}
    </React.Fragment>
  );
}
export default function TagUpdateForm(props) {
  const {
    tag_id: tag_idProp,
    tag: tagModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    tag_id: "",
    display_name: "",
    normalized_name: "",
    parent_tag_id: "",
    tag_type: "",
    aliases: [],
    description: "",
    hierarchy_path: [],
    status: "",
  };
  const [tag_id, setTag_id] = React.useState(initialValues.tag_id);
  const [display_name, setDisplay_name] = React.useState(
    initialValues.display_name
  );
  const [normalized_name, setNormalized_name] = React.useState(
    initialValues.normalized_name
  );
  const [parent_tag_id, setParent_tag_id] = React.useState(
    initialValues.parent_tag_id
  );
  const [tag_type, setTag_type] = React.useState(initialValues.tag_type);
  const [aliases, setAliases] = React.useState(initialValues.aliases);
  const [description, setDescription] = React.useState(
    initialValues.description
  );
  const [hierarchy_path, setHierarchy_path] = React.useState(
    initialValues.hierarchy_path
  );
  const [status, setStatus] = React.useState(initialValues.status);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = tagRecord
      ? { ...initialValues, ...tagRecord }
      : initialValues;
    setTag_id(cleanValues.tag_id);
    setDisplay_name(cleanValues.display_name);
    setNormalized_name(cleanValues.normalized_name);
    setParent_tag_id(cleanValues.parent_tag_id);
    setTag_type(cleanValues.tag_type);
    setAliases(cleanValues.aliases ?? []);
    setCurrentAliasesValue("");
    setDescription(cleanValues.description);
    setHierarchy_path(cleanValues.hierarchy_path ?? []);
    setCurrentHierarchy_pathValue("");
    setStatus(cleanValues.status);
    setErrors({});
  };
  const [tagRecord, setTagRecord] = React.useState(tagModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = tag_idProp
        ? (
            await API.graphql({
              query: getTag.replaceAll("__typename", ""),
              variables: { tag_id: tag_idProp },
            })
          )?.data?.getTag
        : tagModelProp;
      setTagRecord(record);
    };
    queryData();
  }, [tag_idProp, tagModelProp]);
  React.useEffect(resetStateValues, [tagRecord]);
  const [currentAliasesValue, setCurrentAliasesValue] = React.useState("");
  const aliasesRef = React.createRef();
  const [currentHierarchy_pathValue, setCurrentHierarchy_pathValue] =
    React.useState("");
  const hierarchy_pathRef = React.createRef();
  const validations = {
    tag_id: [{ type: "Required" }],
    display_name: [{ type: "Required" }],
    normalized_name: [{ type: "Required" }],
    parent_tag_id: [],
    tag_type: [{ type: "Required" }],
    aliases: [],
    description: [],
    hierarchy_path: [],
    status: [{ type: "Required" }],
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
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          tag_id,
          display_name,
          normalized_name,
          parent_tag_id: parent_tag_id ?? null,
          tag_type,
          aliases: aliases ?? null,
          description: description ?? null,
          hierarchy_path: hierarchy_path ?? null,
          status,
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
            query: updateTag.replaceAll("__typename", ""),
            variables: {
              input: {
                tag_id: tagRecord.tag_id,
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
      {...getOverrideProps(overrides, "TagUpdateForm")}
      {...rest}
    >
      <TextField
        label="Tag id"
        isRequired={true}
        isReadOnly={true}
        value={tag_id}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              tag_id: value,
              display_name,
              normalized_name,
              parent_tag_id,
              tag_type,
              aliases,
              description,
              hierarchy_path,
              status,
            };
            const result = onChange(modelFields);
            value = result?.tag_id ?? value;
          }
          if (errors.tag_id?.hasError) {
            runValidationTasks("tag_id", value);
          }
          setTag_id(value);
        }}
        onBlur={() => runValidationTasks("tag_id", tag_id)}
        errorMessage={errors.tag_id?.errorMessage}
        hasError={errors.tag_id?.hasError}
        {...getOverrideProps(overrides, "tag_id")}
      ></TextField>
      <TextField
        label="Display name"
        isRequired={true}
        isReadOnly={false}
        value={display_name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name: value,
              normalized_name,
              parent_tag_id,
              tag_type,
              aliases,
              description,
              hierarchy_path,
              status,
            };
            const result = onChange(modelFields);
            value = result?.display_name ?? value;
          }
          if (errors.display_name?.hasError) {
            runValidationTasks("display_name", value);
          }
          setDisplay_name(value);
        }}
        onBlur={() => runValidationTasks("display_name", display_name)}
        errorMessage={errors.display_name?.errorMessage}
        hasError={errors.display_name?.hasError}
        {...getOverrideProps(overrides, "display_name")}
      ></TextField>
      <TextField
        label="Normalized name"
        isRequired={true}
        isReadOnly={false}
        value={normalized_name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name,
              normalized_name: value,
              parent_tag_id,
              tag_type,
              aliases,
              description,
              hierarchy_path,
              status,
            };
            const result = onChange(modelFields);
            value = result?.normalized_name ?? value;
          }
          if (errors.normalized_name?.hasError) {
            runValidationTasks("normalized_name", value);
          }
          setNormalized_name(value);
        }}
        onBlur={() => runValidationTasks("normalized_name", normalized_name)}
        errorMessage={errors.normalized_name?.errorMessage}
        hasError={errors.normalized_name?.hasError}
        {...getOverrideProps(overrides, "normalized_name")}
      ></TextField>
      <TextField
        label="Parent tag id"
        isRequired={false}
        isReadOnly={false}
        value={parent_tag_id}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name,
              normalized_name,
              parent_tag_id: value,
              tag_type,
              aliases,
              description,
              hierarchy_path,
              status,
            };
            const result = onChange(modelFields);
            value = result?.parent_tag_id ?? value;
          }
          if (errors.parent_tag_id?.hasError) {
            runValidationTasks("parent_tag_id", value);
          }
          setParent_tag_id(value);
        }}
        onBlur={() => runValidationTasks("parent_tag_id", parent_tag_id)}
        errorMessage={errors.parent_tag_id?.errorMessage}
        hasError={errors.parent_tag_id?.hasError}
        {...getOverrideProps(overrides, "parent_tag_id")}
      ></TextField>
      <TextField
        label="Tag type"
        isRequired={true}
        isReadOnly={false}
        value={tag_type}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name,
              normalized_name,
              parent_tag_id,
              tag_type: value,
              aliases,
              description,
              hierarchy_path,
              status,
            };
            const result = onChange(modelFields);
            value = result?.tag_type ?? value;
          }
          if (errors.tag_type?.hasError) {
            runValidationTasks("tag_type", value);
          }
          setTag_type(value);
        }}
        onBlur={() => runValidationTasks("tag_type", tag_type)}
        errorMessage={errors.tag_type?.errorMessage}
        hasError={errors.tag_type?.hasError}
        {...getOverrideProps(overrides, "tag_type")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name,
              normalized_name,
              parent_tag_id,
              tag_type,
              aliases: values,
              description,
              hierarchy_path,
              status,
            };
            const result = onChange(modelFields);
            values = result?.aliases ?? values;
          }
          setAliases(values);
          setCurrentAliasesValue("");
        }}
        currentFieldValue={currentAliasesValue}
        label={"Aliases"}
        items={aliases}
        hasError={errors?.aliases?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks("aliases", currentAliasesValue)
        }
        errorMessage={errors?.aliases?.errorMessage}
        setFieldValue={setCurrentAliasesValue}
        inputFieldRef={aliasesRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Aliases"
          isRequired={false}
          isReadOnly={false}
          value={currentAliasesValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.aliases?.hasError) {
              runValidationTasks("aliases", value);
            }
            setCurrentAliasesValue(value);
          }}
          onBlur={() => runValidationTasks("aliases", currentAliasesValue)}
          errorMessage={errors.aliases?.errorMessage}
          hasError={errors.aliases?.hasError}
          ref={aliasesRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "aliases")}
        ></TextField>
      </ArrayField>
      <TextField
        label="Description"
        isRequired={false}
        isReadOnly={false}
        value={description}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name,
              normalized_name,
              parent_tag_id,
              tag_type,
              aliases,
              description: value,
              hierarchy_path,
              status,
            };
            const result = onChange(modelFields);
            value = result?.description ?? value;
          }
          if (errors.description?.hasError) {
            runValidationTasks("description", value);
          }
          setDescription(value);
        }}
        onBlur={() => runValidationTasks("description", description)}
        errorMessage={errors.description?.errorMessage}
        hasError={errors.description?.hasError}
        {...getOverrideProps(overrides, "description")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name,
              normalized_name,
              parent_tag_id,
              tag_type,
              aliases,
              description,
              hierarchy_path: values,
              status,
            };
            const result = onChange(modelFields);
            values = result?.hierarchy_path ?? values;
          }
          setHierarchy_path(values);
          setCurrentHierarchy_pathValue("");
        }}
        currentFieldValue={currentHierarchy_pathValue}
        label={"Hierarchy path"}
        items={hierarchy_path}
        hasError={errors?.hierarchy_path?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks("hierarchy_path", currentHierarchy_pathValue)
        }
        errorMessage={errors?.hierarchy_path?.errorMessage}
        setFieldValue={setCurrentHierarchy_pathValue}
        inputFieldRef={hierarchy_pathRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Hierarchy path"
          isRequired={false}
          isReadOnly={false}
          value={currentHierarchy_pathValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.hierarchy_path?.hasError) {
              runValidationTasks("hierarchy_path", value);
            }
            setCurrentHierarchy_pathValue(value);
          }}
          onBlur={() =>
            runValidationTasks("hierarchy_path", currentHierarchy_pathValue)
          }
          errorMessage={errors.hierarchy_path?.errorMessage}
          hasError={errors.hierarchy_path?.hasError}
          ref={hierarchy_pathRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "hierarchy_path")}
        ></TextField>
      </ArrayField>
      <TextField
        label="Status"
        isRequired={true}
        isReadOnly={false}
        value={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              tag_id,
              display_name,
              normalized_name,
              parent_tag_id,
              tag_type,
              aliases,
              description,
              hierarchy_path,
              status: value,
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
          isDisabled={!(tag_idProp || tagModelProp)}
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
              !(tag_idProp || tagModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
