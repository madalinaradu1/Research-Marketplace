/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { Button, Flex, Image, Text, TextField } from "@aws-amplify/ui-react";
export default function ProfileCard(props) {
  const { user, overrides, ...rest } = props;
  return (
    <Flex
      gap="24px"
      direction="column"
      width="640px"
      height="unset"
      justifyContent="flex-start"
      alignItems="center"
      position="relative"
      padding="24px 24px 24px 24px"
      backgroundColor="rgba(255,255,255,1)"
      {...getOverrideProps(overrides, "ProfileCard")}
      {...rest}
    >
      <Flex
        gap="16px"
        direction="column"
        width="unset"
        height="unset"
        justifyContent="flex-start"
        alignItems="center"
        shrink="0"
        alignSelf="stretch"
        position="relative"
        padding="0px 0px 0px 0px"
        {...getOverrideProps(overrides, "Profile Header")}
      >
        <Image
          width="96px"
          height="96px"
          display="block"
          gap="unset"
          alignItems="unset"
          justifyContent="unset"
          shrink="0"
          position="relative"
          borderRadius="160px"
          padding="0px 0px 0px 0px"
          objectFit="cover"
          src={user?.profilePicture}
          {...getOverrideProps(overrides, "Profile Picture")}
        ></Image>
        <Flex
          gap="8px"
          direction="column"
          width="unset"
          height="unset"
          justifyContent="flex-start"
          alignItems="center"
          shrink="0"
          position="relative"
          padding="0px 0px 0px 0px"
          {...getOverrideProps(overrides, "Name Container")}
        >
          <Text
            fontFamily="Inter"
            fontSize="20px"
            fontWeight="700"
            color="rgba(13,26,38,1)"
            lineHeight="25px"
            textAlign="center"
            display="block"
            direction="column"
            justifyContent="unset"
            width="unset"
            height="unset"
            gap="unset"
            alignItems="unset"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            whiteSpace="pre-wrap"
            children={user?.name}
            {...getOverrideProps(overrides, "Name")}
          ></Text>
          <Text
            fontFamily="Inter"
            fontSize="16px"
            fontWeight="400"
            color="rgba(48,64,80,1)"
            lineHeight="24px"
            textAlign="center"
            display="block"
            direction="column"
            justifyContent="unset"
            letterSpacing="0.01px"
            width="unset"
            height="unset"
            gap="unset"
            alignItems="unset"
            shrink="0"
            position="relative"
            padding="0px 0px 0px 0px"
            whiteSpace="pre-wrap"
            children={`${user?.major || ""} ${user?.year ? `- ${user?.year}` : ""}`}
            {...getOverrideProps(overrides, "Major and Year")}
          ></Text>
        </Flex>
      </Flex>
      <Flex
        gap="16px"
        direction="column"
        width="unset"
        height="unset"
        justifyContent="flex-start"
        alignItems="flex-start"
        shrink="0"
        alignSelf="stretch"
        position="relative"
        padding="0px 0px 0px 0px"
        {...getOverrideProps(overrides, "Profile Form")}
      >
        <TextField
          width="unset"
          height="unset"
          label="Name"
          placeholder="Your full name"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.name}
          {...getOverrideProps(overrides, "NameField")}
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
        <TextField
          width="unset"
          height="unset"
          label="Major"
          placeholder="Your major"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.major}
          {...getOverrideProps(overrides, "MajorField")}
        ></TextField>
        <TextField
          width="unset"
          height="unset"
          label="Year"
          placeholder="Your academic year"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.year}
          {...getOverrideProps(overrides, "YearField")}
        ></TextField>
        <TextField
          width="unset"
          height="unset"
          label="Research Interests"
          placeholder="Enter your research interests (comma separated)"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.interests?.join(", ")}
          {...getOverrideProps(overrides, "InterestsField")}
        ></TextField>
        <TextField
          width="unset"
          height="unset"
          label="Bio"
          placeholder="Tell us about yourself"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          labelHidden={false}
          variation="default"
          value={user?.bio}
          {...getOverrideProps(overrides, "BioField")}
        ></TextField>
        <Button
          width="unset"
          height="unset"
          shrink="0"
          alignSelf="stretch"
          size="default"
          isDisabled={false}
          variation="primary"
          children="Save Changes"
          {...getOverrideProps(overrides, "SaveButton")}
        ></Button>
      </Flex>
    </Flex>
  );
}