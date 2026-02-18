/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type UserUpdateFormInputValues = {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    major?: string;
    academicYear?: string;
    gpa?: number;
    skills?: string[];
    researchInterests?: string[];
    careerInterests?: string[];
    resumeKey?: string;
    affiliation?: string;
    profileComplete?: boolean;
    status?: string;
    expectedGraduation?: string;
    availability?: string;
    personalStatement?: string;
    certificates?: string[];
    applicationCount?: number;
    createdAt?: string;
    updatedAt?: string;
    college?: string;
    classesTaught?: string[];
    facultyResearchInterests?: string[];
};
export declare type UserUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
    email?: ValidationFunction<string>;
    role?: ValidationFunction<string>;
    department?: ValidationFunction<string>;
    major?: ValidationFunction<string>;
    academicYear?: ValidationFunction<string>;
    gpa?: ValidationFunction<number>;
    skills?: ValidationFunction<string>;
    researchInterests?: ValidationFunction<string>;
    careerInterests?: ValidationFunction<string>;
    resumeKey?: ValidationFunction<string>;
    affiliation?: ValidationFunction<string>;
    profileComplete?: ValidationFunction<boolean>;
    status?: ValidationFunction<string>;
    expectedGraduation?: ValidationFunction<string>;
    availability?: ValidationFunction<string>;
    personalStatement?: ValidationFunction<string>;
    certificates?: ValidationFunction<string>;
    applicationCount?: ValidationFunction<number>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
    college?: ValidationFunction<string>;
    classesTaught?: ValidationFunction<string>;
    facultyResearchInterests?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UserUpdateFormOverridesProps = {
    UserUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    email?: PrimitiveOverrideProps<TextFieldProps>;
    role?: PrimitiveOverrideProps<TextFieldProps>;
    department?: PrimitiveOverrideProps<TextFieldProps>;
    major?: PrimitiveOverrideProps<TextFieldProps>;
    academicYear?: PrimitiveOverrideProps<TextFieldProps>;
    gpa?: PrimitiveOverrideProps<TextFieldProps>;
    skills?: PrimitiveOverrideProps<TextFieldProps>;
    researchInterests?: PrimitiveOverrideProps<TextFieldProps>;
    careerInterests?: PrimitiveOverrideProps<TextFieldProps>;
    resumeKey?: PrimitiveOverrideProps<TextFieldProps>;
    affiliation?: PrimitiveOverrideProps<TextFieldProps>;
    profileComplete?: PrimitiveOverrideProps<SwitchFieldProps>;
    status?: PrimitiveOverrideProps<TextFieldProps>;
    expectedGraduation?: PrimitiveOverrideProps<TextFieldProps>;
    availability?: PrimitiveOverrideProps<TextFieldProps>;
    personalStatement?: PrimitiveOverrideProps<TextFieldProps>;
    certificates?: PrimitiveOverrideProps<TextFieldProps>;
    applicationCount?: PrimitiveOverrideProps<TextFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
    college?: PrimitiveOverrideProps<TextFieldProps>;
    classesTaught?: PrimitiveOverrideProps<TextFieldProps>;
    facultyResearchInterests?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type UserUpdateFormProps = React.PropsWithChildren<{
    overrides?: UserUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    user?: any;
    onSubmit?: (fields: UserUpdateFormInputValues) => UserUpdateFormInputValues;
    onSuccess?: (fields: UserUpdateFormInputValues) => void;
    onError?: (fields: UserUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: UserUpdateFormInputValues) => UserUpdateFormInputValues;
    onValidate?: UserUpdateFormValidationValues;
} & React.CSSProperties>;
export default function UserUpdateForm(props: UserUpdateFormProps): React.ReactElement;
