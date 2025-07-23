/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { getOverrideProps } from "./utils";
import { Flex } from "@aws-amplify/ui-react";
import FacultyDashboard from "../pages/FacultyDashboard";

export default function FacultyDashboardWrapper(props) {
  const { user, overrides, ...rest } = props;
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
      {...getOverrideProps(overrides, "FacultyDashboardWrapper")}
      {...rest}
    >
      <FacultyDashboard user={user} />
    </Flex>
  );
}