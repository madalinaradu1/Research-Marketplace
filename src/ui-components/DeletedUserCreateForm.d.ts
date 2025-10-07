/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type DeletedUserCreateFormInputValues = {
    originalUserID?: string;
    deletedAt?: string;
    scheduledCleanupAt?: string;
    userData?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
};
export declare type DeletedUserCreateFormValidationValues = {
    originalUserID?: ValidationFunction<string>;
    deletedAt?: ValidationFunction<string>;
    scheduledCleanupAt?: ValidationFunction<string>;
    userData?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DeletedUserCreateFormOverridesProps = {
    DeletedUserCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    originalUserID?: PrimitiveOverrideProps<TextFieldProps>;
    deletedAt?: PrimitiveOverrideProps<TextFieldProps>;
    scheduledCleanupAt?: PrimitiveOverrideProps<TextFieldProps>;
    userData?: PrimitiveOverrideProps<TextAreaFieldProps>;
    status?: PrimitiveOverrideProps<TextFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type DeletedUserCreateFormProps = React.PropsWithChildren<{
    overrides?: DeletedUserCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: DeletedUserCreateFormInputValues) => DeletedUserCreateFormInputValues;
    onSuccess?: (fields: DeletedUserCreateFormInputValues) => void;
    onError?: (fields: DeletedUserCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: DeletedUserCreateFormInputValues) => DeletedUserCreateFormInputValues;
    onValidate?: DeletedUserCreateFormValidationValues;
} & React.CSSProperties>;
export default function DeletedUserCreateForm(props: DeletedUserCreateFormProps): React.ReactElement;
