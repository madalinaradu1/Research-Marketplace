/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { getOverrideProps } from "./utils";
import { Flex } from "@aws-amplify/ui-react";
import ApplicationStatus from "../components/ApplicationStatus";

export default function ApplicationStatusWrapper(props) {
  const { application, isStudent, onUpdate, overrides, ...rest } = props;
  return (
    <Flex
      gap="0"
      direction="column"
      width="100%"
      height="unset"
      justifyContent="flex-start"
      alignItems="flex-start"
      position="relative"
      padding="0px 0px 0px 0px"
      {...getOverrideProps(overrides, "ApplicationStatusWrapper")}
      {...rest}
    >
      <ApplicationStatus 
        application={application} 
        isStudent={isStudent} 
        onUpdate={onUpdate} 
      />
    </Flex>
  );
}