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
  SwitchField,
  Text,
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { createUser } from "../graphql/mutations";
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
export default function UserCreateForm(props) {
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
    name: "",
    email: "",
    role: "",
    department: "",
    major: "",
    academicYear: "",
    gpa: "",
    skills: [],
    researchInterests: [],
    careerInterests: [],
    resumeKey: "",
    affiliation: "",
    profileComplete: false,
    status: "",
    expectedGraduation: "",
    availability: "",
    personalStatement: "",
    certificates: [],
    applicationCount: "",
    createdAt: "",
    updatedAt: "",
    college: "",
    classesTaught: [],
    facultyResearchInterests: [],
  };
  const [name, setName] = React.useState(initialValues.name);
  const [email, setEmail] = React.useState(initialValues.email);
  const [role, setRole] = React.useState(initialValues.role);
  const [department, setDepartment] = React.useState(initialValues.department);
  const [major, setMajor] = React.useState(initialValues.major);
  const [academicYear, setAcademicYear] = React.useState(
    initialValues.academicYear
  );
  const [gpa, setGpa] = React.useState(initialValues.gpa);
  const [skills, setSkills] = React.useState(initialValues.skills);
  const [researchInterests, setResearchInterests] = React.useState(
    initialValues.researchInterests
  );
  const [careerInterests, setCareerInterests] = React.useState(
    initialValues.careerInterests
  );
  const [resumeKey, setResumeKey] = React.useState(initialValues.resumeKey);
  const [affiliation, setAffiliation] = React.useState(
    initialValues.affiliation
  );
  const [profileComplete, setProfileComplete] = React.useState(
    initialValues.profileComplete
  );
  const [status, setStatus] = React.useState(initialValues.status);
  const [expectedGraduation, setExpectedGraduation] = React.useState(
    initialValues.expectedGraduation
  );
  const [availability, setAvailability] = React.useState(
    initialValues.availability
  );
  const [personalStatement, setPersonalStatement] = React.useState(
    initialValues.personalStatement
  );
  const [certificates, setCertificates] = React.useState(
    initialValues.certificates
  );
  const [applicationCount, setApplicationCount] = React.useState(
    initialValues.applicationCount
  );
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [college, setCollege] = React.useState(initialValues.college);
  const [classesTaught, setClassesTaught] = React.useState(
    initialValues.classesTaught
  );
  const [facultyResearchInterests, setFacultyResearchInterests] =
    React.useState(initialValues.facultyResearchInterests);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setName(initialValues.name);
    setEmail(initialValues.email);
    setRole(initialValues.role);
    setDepartment(initialValues.department);
    setMajor(initialValues.major);
    setAcademicYear(initialValues.academicYear);
    setGpa(initialValues.gpa);
    setSkills(initialValues.skills);
    setCurrentSkillsValue("");
    setResearchInterests(initialValues.researchInterests);
    setCurrentResearchInterestsValue("");
    setCareerInterests(initialValues.careerInterests);
    setCurrentCareerInterestsValue("");
    setResumeKey(initialValues.resumeKey);
    setAffiliation(initialValues.affiliation);
    setProfileComplete(initialValues.profileComplete);
    setStatus(initialValues.status);
    setExpectedGraduation(initialValues.expectedGraduation);
    setAvailability(initialValues.availability);
    setPersonalStatement(initialValues.personalStatement);
    setCertificates(initialValues.certificates);
    setCurrentCertificatesValue("");
    setApplicationCount(initialValues.applicationCount);
    setCreatedAt(initialValues.createdAt);
    setUpdatedAt(initialValues.updatedAt);
    setCollege(initialValues.college);
    setClassesTaught(initialValues.classesTaught);
    setCurrentClassesTaughtValue("");
    setFacultyResearchInterests(initialValues.facultyResearchInterests);
    setCurrentFacultyResearchInterestsValue("");
    setErrors({});
  };
  const [currentSkillsValue, setCurrentSkillsValue] = React.useState("");
  const skillsRef = React.createRef();
  const [currentResearchInterestsValue, setCurrentResearchInterestsValue] =
    React.useState("");
  const researchInterestsRef = React.createRef();
  const [currentCareerInterestsValue, setCurrentCareerInterestsValue] =
    React.useState("");
  const careerInterestsRef = React.createRef();
  const [currentCertificatesValue, setCurrentCertificatesValue] =
    React.useState("");
  const certificatesRef = React.createRef();
  const [currentClassesTaughtValue, setCurrentClassesTaughtValue] =
    React.useState("");
  const classesTaughtRef = React.createRef();
  const [
    currentFacultyResearchInterestsValue,
    setCurrentFacultyResearchInterestsValue,
  ] = React.useState("");
  const facultyResearchInterestsRef = React.createRef();
  const validations = {
    name: [{ type: "Required" }],
    email: [{ type: "Required" }],
    role: [{ type: "Required" }],
    department: [],
    major: [],
    academicYear: [],
    gpa: [],
    skills: [],
    researchInterests: [],
    careerInterests: [],
    resumeKey: [],
    affiliation: [],
    profileComplete: [],
    status: [],
    expectedGraduation: [],
    availability: [],
    personalStatement: [],
    certificates: [],
    applicationCount: [],
    createdAt: [{ type: "Required" }],
    updatedAt: [{ type: "Required" }],
    college: [],
    classesTaught: [],
    facultyResearchInterests: [],
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
          name,
          email,
          role,
          department,
          major,
          academicYear,
          gpa,
          skills,
          researchInterests,
          careerInterests,
          resumeKey,
          affiliation,
          profileComplete,
          status,
          expectedGraduation,
          availability,
          personalStatement,
          certificates,
          applicationCount,
          createdAt,
          updatedAt,
          college,
          classesTaught,
          facultyResearchInterests,
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
            query: createUser.replaceAll("__typename", ""),
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
      {...getOverrideProps(overrides, "UserCreateForm")}
      {...rest}
    >
      <TextField
        label="Name"
        isRequired={true}
        isReadOnly={false}
        value={name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name: value,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
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
              name,
              email: value,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
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
              name,
              email,
              role: value,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
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
        label="Department"
        isRequired={false}
        isReadOnly={false}
        value={department}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department: value,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.department ?? value;
          }
          if (errors.department?.hasError) {
            runValidationTasks("department", value);
          }
          setDepartment(value);
        }}
        onBlur={() => runValidationTasks("department", department)}
        errorMessage={errors.department?.errorMessage}
        hasError={errors.department?.hasError}
        {...getOverrideProps(overrides, "department")}
      ></TextField>
      <TextField
        label="Major"
        isRequired={false}
        isReadOnly={false}
        value={major}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major: value,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.major ?? value;
          }
          if (errors.major?.hasError) {
            runValidationTasks("major", value);
          }
          setMajor(value);
        }}
        onBlur={() => runValidationTasks("major", major)}
        errorMessage={errors.major?.errorMessage}
        hasError={errors.major?.hasError}
        {...getOverrideProps(overrides, "major")}
      ></TextField>
      <TextField
        label="Academic year"
        isRequired={false}
        isReadOnly={false}
        value={academicYear}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear: value,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.academicYear ?? value;
          }
          if (errors.academicYear?.hasError) {
            runValidationTasks("academicYear", value);
          }
          setAcademicYear(value);
        }}
        onBlur={() => runValidationTasks("academicYear", academicYear)}
        errorMessage={errors.academicYear?.errorMessage}
        hasError={errors.academicYear?.hasError}
        {...getOverrideProps(overrides, "academicYear")}
      ></TextField>
      <TextField
        label="Gpa"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={gpa}
        onChange={(e) => {
          let value = isNaN(parseFloat(e.target.value))
            ? e.target.value
            : parseFloat(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa: value,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.gpa ?? value;
          }
          if (errors.gpa?.hasError) {
            runValidationTasks("gpa", value);
          }
          setGpa(value);
        }}
        onBlur={() => runValidationTasks("gpa", gpa)}
        errorMessage={errors.gpa?.errorMessage}
        hasError={errors.gpa?.hasError}
        {...getOverrideProps(overrides, "gpa")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills: values,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            values = result?.skills ?? values;
          }
          setSkills(values);
          setCurrentSkillsValue("");
        }}
        currentFieldValue={currentSkillsValue}
        label={"Skills"}
        items={skills}
        hasError={errors?.skills?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks("skills", currentSkillsValue)
        }
        errorMessage={errors?.skills?.errorMessage}
        setFieldValue={setCurrentSkillsValue}
        inputFieldRef={skillsRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Skills"
          isRequired={false}
          isReadOnly={false}
          value={currentSkillsValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.skills?.hasError) {
              runValidationTasks("skills", value);
            }
            setCurrentSkillsValue(value);
          }}
          onBlur={() => runValidationTasks("skills", currentSkillsValue)}
          errorMessage={errors.skills?.errorMessage}
          hasError={errors.skills?.hasError}
          ref={skillsRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "skills")}
        ></TextField>
      </ArrayField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests: values,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            values = result?.researchInterests ?? values;
          }
          setResearchInterests(values);
          setCurrentResearchInterestsValue("");
        }}
        currentFieldValue={currentResearchInterestsValue}
        label={"Research interests"}
        items={researchInterests}
        hasError={errors?.researchInterests?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks(
            "researchInterests",
            currentResearchInterestsValue
          )
        }
        errorMessage={errors?.researchInterests?.errorMessage}
        setFieldValue={setCurrentResearchInterestsValue}
        inputFieldRef={researchInterestsRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Research interests"
          isRequired={false}
          isReadOnly={false}
          value={currentResearchInterestsValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.researchInterests?.hasError) {
              runValidationTasks("researchInterests", value);
            }
            setCurrentResearchInterestsValue(value);
          }}
          onBlur={() =>
            runValidationTasks(
              "researchInterests",
              currentResearchInterestsValue
            )
          }
          errorMessage={errors.researchInterests?.errorMessage}
          hasError={errors.researchInterests?.hasError}
          ref={researchInterestsRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "researchInterests")}
        ></TextField>
      </ArrayField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests: values,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            values = result?.careerInterests ?? values;
          }
          setCareerInterests(values);
          setCurrentCareerInterestsValue("");
        }}
        currentFieldValue={currentCareerInterestsValue}
        label={"Career interests"}
        items={careerInterests}
        hasError={errors?.careerInterests?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks(
            "careerInterests",
            currentCareerInterestsValue
          )
        }
        errorMessage={errors?.careerInterests?.errorMessage}
        setFieldValue={setCurrentCareerInterestsValue}
        inputFieldRef={careerInterestsRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Career interests"
          isRequired={false}
          isReadOnly={false}
          value={currentCareerInterestsValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.careerInterests?.hasError) {
              runValidationTasks("careerInterests", value);
            }
            setCurrentCareerInterestsValue(value);
          }}
          onBlur={() =>
            runValidationTasks("careerInterests", currentCareerInterestsValue)
          }
          errorMessage={errors.careerInterests?.errorMessage}
          hasError={errors.careerInterests?.hasError}
          ref={careerInterestsRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "careerInterests")}
        ></TextField>
      </ArrayField>
      <TextField
        label="Resume key"
        isRequired={false}
        isReadOnly={false}
        value={resumeKey}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey: value,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.resumeKey ?? value;
          }
          if (errors.resumeKey?.hasError) {
            runValidationTasks("resumeKey", value);
          }
          setResumeKey(value);
        }}
        onBlur={() => runValidationTasks("resumeKey", resumeKey)}
        errorMessage={errors.resumeKey?.errorMessage}
        hasError={errors.resumeKey?.hasError}
        {...getOverrideProps(overrides, "resumeKey")}
      ></TextField>
      <TextField
        label="Affiliation"
        isRequired={false}
        isReadOnly={false}
        value={affiliation}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation: value,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.affiliation ?? value;
          }
          if (errors.affiliation?.hasError) {
            runValidationTasks("affiliation", value);
          }
          setAffiliation(value);
        }}
        onBlur={() => runValidationTasks("affiliation", affiliation)}
        errorMessage={errors.affiliation?.errorMessage}
        hasError={errors.affiliation?.hasError}
        {...getOverrideProps(overrides, "affiliation")}
      ></TextField>
      <SwitchField
        label="Profile complete"
        defaultChecked={false}
        isDisabled={false}
        isChecked={profileComplete}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete: value,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.profileComplete ?? value;
          }
          if (errors.profileComplete?.hasError) {
            runValidationTasks("profileComplete", value);
          }
          setProfileComplete(value);
        }}
        onBlur={() => runValidationTasks("profileComplete", profileComplete)}
        errorMessage={errors.profileComplete?.errorMessage}
        hasError={errors.profileComplete?.hasError}
        {...getOverrideProps(overrides, "profileComplete")}
      ></SwitchField>
      <TextField
        label="Status"
        isRequired={false}
        isReadOnly={false}
        value={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status: value,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
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
        label="Expected graduation"
        isRequired={false}
        isReadOnly={false}
        value={expectedGraduation}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation: value,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.expectedGraduation ?? value;
          }
          if (errors.expectedGraduation?.hasError) {
            runValidationTasks("expectedGraduation", value);
          }
          setExpectedGraduation(value);
        }}
        onBlur={() =>
          runValidationTasks("expectedGraduation", expectedGraduation)
        }
        errorMessage={errors.expectedGraduation?.errorMessage}
        hasError={errors.expectedGraduation?.hasError}
        {...getOverrideProps(overrides, "expectedGraduation")}
      ></TextField>
      <TextField
        label="Availability"
        isRequired={false}
        isReadOnly={false}
        value={availability}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability: value,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.availability ?? value;
          }
          if (errors.availability?.hasError) {
            runValidationTasks("availability", value);
          }
          setAvailability(value);
        }}
        onBlur={() => runValidationTasks("availability", availability)}
        errorMessage={errors.availability?.errorMessage}
        hasError={errors.availability?.hasError}
        {...getOverrideProps(overrides, "availability")}
      ></TextField>
      <TextField
        label="Personal statement"
        isRequired={false}
        isReadOnly={false}
        value={personalStatement}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement: value,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.personalStatement ?? value;
          }
          if (errors.personalStatement?.hasError) {
            runValidationTasks("personalStatement", value);
          }
          setPersonalStatement(value);
        }}
        onBlur={() =>
          runValidationTasks("personalStatement", personalStatement)
        }
        errorMessage={errors.personalStatement?.errorMessage}
        hasError={errors.personalStatement?.hasError}
        {...getOverrideProps(overrides, "personalStatement")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates: values,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            values = result?.certificates ?? values;
          }
          setCertificates(values);
          setCurrentCertificatesValue("");
        }}
        currentFieldValue={currentCertificatesValue}
        label={"Certificates"}
        items={certificates}
        hasError={errors?.certificates?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks("certificates", currentCertificatesValue)
        }
        errorMessage={errors?.certificates?.errorMessage}
        setFieldValue={setCurrentCertificatesValue}
        inputFieldRef={certificatesRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Certificates"
          isRequired={false}
          isReadOnly={false}
          value={currentCertificatesValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.certificates?.hasError) {
              runValidationTasks("certificates", value);
            }
            setCurrentCertificatesValue(value);
          }}
          onBlur={() =>
            runValidationTasks("certificates", currentCertificatesValue)
          }
          errorMessage={errors.certificates?.errorMessage}
          hasError={errors.certificates?.hasError}
          ref={certificatesRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "certificates")}
        ></TextField>
      </ArrayField>
      <TextField
        label="Application count"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={applicationCount}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount: value,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.applicationCount ?? value;
          }
          if (errors.applicationCount?.hasError) {
            runValidationTasks("applicationCount", value);
          }
          setApplicationCount(value);
        }}
        onBlur={() => runValidationTasks("applicationCount", applicationCount)}
        errorMessage={errors.applicationCount?.errorMessage}
        hasError={errors.applicationCount?.hasError}
        {...getOverrideProps(overrides, "applicationCount")}
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
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt: value,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests,
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
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt: value,
              college,
              classesTaught,
              facultyResearchInterests,
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
      <TextField
        label="College"
        isRequired={false}
        isReadOnly={false}
        value={college}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college: value,
              classesTaught,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            value = result?.college ?? value;
          }
          if (errors.college?.hasError) {
            runValidationTasks("college", value);
          }
          setCollege(value);
        }}
        onBlur={() => runValidationTasks("college", college)}
        errorMessage={errors.college?.errorMessage}
        hasError={errors.college?.hasError}
        {...getOverrideProps(overrides, "college")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught: values,
              facultyResearchInterests,
            };
            const result = onChange(modelFields);
            values = result?.classesTaught ?? values;
          }
          setClassesTaught(values);
          setCurrentClassesTaughtValue("");
        }}
        currentFieldValue={currentClassesTaughtValue}
        label={"Classes taught"}
        items={classesTaught}
        hasError={errors?.classesTaught?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks("classesTaught", currentClassesTaughtValue)
        }
        errorMessage={errors?.classesTaught?.errorMessage}
        setFieldValue={setCurrentClassesTaughtValue}
        inputFieldRef={classesTaughtRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Classes taught"
          isRequired={false}
          isReadOnly={false}
          value={currentClassesTaughtValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.classesTaught?.hasError) {
              runValidationTasks("classesTaught", value);
            }
            setCurrentClassesTaughtValue(value);
          }}
          onBlur={() =>
            runValidationTasks("classesTaught", currentClassesTaughtValue)
          }
          errorMessage={errors.classesTaught?.errorMessage}
          hasError={errors.classesTaught?.hasError}
          ref={classesTaughtRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "classesTaught")}
        ></TextField>
      </ArrayField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              name,
              email,
              role,
              department,
              major,
              academicYear,
              gpa,
              skills,
              researchInterests,
              careerInterests,
              resumeKey,
              affiliation,
              profileComplete,
              status,
              expectedGraduation,
              availability,
              personalStatement,
              certificates,
              applicationCount,
              createdAt,
              updatedAt,
              college,
              classesTaught,
              facultyResearchInterests: values,
            };
            const result = onChange(modelFields);
            values = result?.facultyResearchInterests ?? values;
          }
          setFacultyResearchInterests(values);
          setCurrentFacultyResearchInterestsValue("");
        }}
        currentFieldValue={currentFacultyResearchInterestsValue}
        label={"Faculty research interests"}
        items={facultyResearchInterests}
        hasError={errors?.facultyResearchInterests?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks(
            "facultyResearchInterests",
            currentFacultyResearchInterestsValue
          )
        }
        errorMessage={errors?.facultyResearchInterests?.errorMessage}
        setFieldValue={setCurrentFacultyResearchInterestsValue}
        inputFieldRef={facultyResearchInterestsRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Faculty research interests"
          isRequired={false}
          isReadOnly={false}
          value={currentFacultyResearchInterestsValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.facultyResearchInterests?.hasError) {
              runValidationTasks("facultyResearchInterests", value);
            }
            setCurrentFacultyResearchInterestsValue(value);
          }}
          onBlur={() =>
            runValidationTasks(
              "facultyResearchInterests",
              currentFacultyResearchInterestsValue
            )
          }
          errorMessage={errors.facultyResearchInterests?.errorMessage}
          hasError={errors.facultyResearchInterests?.hasError}
          ref={facultyResearchInterestsRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "facultyResearchInterests")}
        ></TextField>
      </ArrayField>
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
