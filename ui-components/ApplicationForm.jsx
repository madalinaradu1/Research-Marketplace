/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import {
  Button,
  Divider,
  Flex,
  Heading,
  SelectField,
  Text,
  TextAreaField,
  TextField,
  View,
} from "@aws-amplify/ui-react";
export default function ApplicationForm(props) {
  const { opportunity, user, overrides, ...rest } = props;
  return (
    <Flex
      gap="24px"
      direction="column"
      width="640px"
      height="unset"
      justifyContent="flex-start"
      alignItems="flex-start"
      position="relative"
      padding="32px 32px 32px 32px"
      backgroundColor="rgba(255,255,255,1)"
      {...getOverrideProps(overrides, "ApplicationForm")}
      {...rest}
    >
      <Flex
        gap="8px"
        direction="column"
        width="unset"
        height="unset"
        justifyContent="flex-start"
        alignItems="flex-start"
        shrink="0"
        alignSelf="stretch"
        position="relative"
        padding="0px 0px 0px 0px"
        {...getOverrideProps(overrides, "Header")}
      >
        <Heading
          width="unset"
          height="unset"
          shrink="0"
          level="3"
          children="Research Opportunity Application"
          {...getOverrideProps(overrides, "Heading")}
        ></Heading>
        <Text
          fontFamily="Inter"
          fontSize="16px"
          fontWeight="400"
          color="rgba(48,64,80,1)"
          lineHeight="24px"
          textAlign="left"
          display="block"
          direction="column"
          justifyContent="unset"
          width="unset"
          height="unset"
          gap="unset"
          alignItems="unset"
          shrink="0"
          alignSelf="stretch"
          position="relative"
          padding="0px 0px 0px 0px"
          whiteSpace="pre-wrap"
          children={`Applying for: ${opportunity?.title}`}
          {...getOverrideProps(overrides, "OpportunityTitle")}
        ></Text>
        <Text
          fontFamily="Inter"
          fontSize="16px"
          fontWeight="400"
          color="rgba(48,64,80,1)"
          lineHeight="24px"
          textAlign="left"
          display="block"
          direction="column"
          justifyContent="unset"
          width="unset"
          height="unset"
          gap="unset"
          alignItems="unset"
          shrink="0"
          alignSelf="stretch"
          position="relative"
          padding="0px 0px 0px 0px"
          whiteSpace="pre-wrap"
          children={`Faculty: ${opportunity?.faculty?.name}`}
          {...getOverrideProps(overrides, "FacultyName")}
        ></Text>
      </Flex>
      <Divider
        width="unset"
        height="1px"
        shrink="0"
        alignSelf="stretch"
        size="small"
        orientation="horizontal"
        {...getOverrideProps(overrides, "Divider")}
      ></Divider>
      <Flex
        gap="24px"
        direction="column"
        width="unset"
        height="unset"
        justifyContent="flex-start"
        alignItems="flex-start"
        shrink="0"
        alignSelf="stretch"
        position="relative"
        padding="0px 0px 0px 0px"
        {...getOverrideProps(overrides, "Content")}
      >
        <TextField
          width="unset"
          height="unset"
          label="Full Name"
          placeholder="Your full name"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.name}
          {...getOverrideProps(overrides, "FullNameField")}
        ></TextField>
        <TextField
          width="unset"
          height="unset"
          label="Email"
          placeholder="Your email address"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.email}
          {...getOverrideProps(overrides, "EmailField")}
        ></TextField>
        <SelectField
          width="unset"
          height="unset"
          label="Academic Year"
          placeholder="Select your academic year"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.year}
          {...getOverrideProps(overrides, "YearField")}
        ></SelectField>
        <TextAreaField
          width="unset"
          height="unset"
          label="Statement of Interest"
          placeholder="Explain why you are interested in this research opportunity and what qualifies you for it."
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          {...getOverrideProps(overrides, "StatementField")}
        ></TextAreaField>
        <View
          width="unset"
          height="unset"
          display="block"
          gap="unset"
          alignItems="unset"
          justifyContent="unset"
          shrink="0"
          alignSelf="stretch"
          position="relative"
          padding="0px 0px 0px 0px"
          {...getOverrideProps(overrides, "ResumeUpload")}
        >
          <Text
            fontFamily="Inter"
            fontSize="16px"
            fontWeight="400"
            color="rgba(48,64,80,1)"
            lineHeight="24px"
            textAlign="left"
            display="block"
            direction="column"
            justifyContent="unset"
            width="unset"
            height="unset"
            gap="unset"
            alignItems="unset"
            position="relative"
            padding="0px 0px 0px 0px"
            whiteSpace="pre-wrap"
            children="Resume/CV"
            {...getOverrideProps(overrides, "ResumeLabel")}
          ></Text>
          <Flex
            gap="16px"
            direction="row"
            width="unset"
            height="unset"
            justifyContent="flex-start"
            alignItems="center"
            position="relative"
            padding="0px 0px 0px 0px"
            {...getOverrideProps(overrides, "ResumeUploadContainer")}
          >
            <TextField
              width="400px"
              height="unset"
              placeholder="No file selected"
              shrink="0"
              size="default"
              isDisabled={true}
              labelHidden={true}
              variation="default"
              {...getOverrideProps(overrides, "ResumeFileField")}
            ></TextField>
            <Button
              width="unset"
              height="unset"
              shrink="0"
              size="default"
              isDisabled={false}
              variation="default"
              children="Browse..."
              {...getOverrideProps(overrides, "BrowseButton")}
            ></Button>
          </Flex>
        </View>
      </Flex>
      <Flex
        gap="16px"
        direction="row"
        width="unset"
        height="unset"
        justifyContent="flex-end"
        alignItems="center"
        shrink="0"
        alignSelf="stretch"
        position="relative"
        padding="0px 0px 0px 0px"
        {...getOverrideProps(overrides, "Actions")}
      >
        <Button
          width="unset"
          height="unset"
          shrink="0"
          size="default"
          isDisabled={false}
          variation="default"
          children="Save Draft"
          {...getOverrideProps(overrides, "SaveDraftButton")}
        ></Button>
        <Button
          width="unset"
          height="unset"
          shrink="0"
          size="default"
          isDisabled={false}
          variation="primary"
          children="Submit Application"
          {...getOverrideProps(overrides, "SubmitButton")}
        ></Button>
      </Flex>
    </Flex>
  );
}