/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type DeletedUserUpdateFormInputValues = {
    originalUserID?: string;
    name?: string;
    email?: string;
    role?: string;
    deletionScheduledAt?: string;
    deletionExecutedAt?: string;
    isTestMode?: boolean;
    userData?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
};
export declare type DeletedUserUpdateFormValidationValues = {
    originalUserID?: ValidationFunction<string>;
    name?: ValidationFunction<string>;
    email?: ValidationFunction<string>;
    role?: ValidationFunction<string>;
    deletionScheduledAt?: ValidationFunction<string>;
    deletionExecutedAt?: ValidationFunction<string>;
    isTestMode?: ValidationFunction<boolean>;
    userData?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DeletedUserUpdateFormOverridesProps = {
    DeletedUserUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    originalUserID?: PrimitiveOverrideProps<TextFieldProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    email?: PrimitiveOverrideProps<TextFieldProps>;
    role?: PrimitiveOverrideProps<TextFieldProps>;
    deletionScheduledAt?: PrimitiveOverrideProps<TextFieldProps>;
    deletionExecutedAt?: PrimitiveOverrideProps<TextFieldProps>;
    isTestMode?: PrimitiveOverrideProps<SwitchFieldProps>;
    userData?: PrimitiveOverrideProps<TextAreaFieldProps>;
    status?: PrimitiveOverrideProps<TextFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type DeletedUserUpdateFormProps = React.PropsWithChildren<{
    overrides?: DeletedUserUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    deletedUser?: any;
    onSubmit?: (fields: DeletedUserUpdateFormInputValues) => DeletedUserUpdateFormInputValues;
    onSuccess?: (fields: DeletedUserUpdateFormInputValues) => void;
    onError?: (fields: DeletedUserUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: DeletedUserUpdateFormInputValues) => DeletedUserUpdateFormInputValues;
    onValidate?: DeletedUserUpdateFormValidationValues;
} & React.CSSProperties>;
export default function DeletedUserUpdateForm(props: DeletedUserUpdateFormProps): React.ReactElement;
