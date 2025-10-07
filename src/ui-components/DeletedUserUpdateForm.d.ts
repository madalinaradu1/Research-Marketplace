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
export declare type DeletedUserUpdateFormInputValues = {
    originalUserID?: string;
    deletedAt?: string;
    scheduledCleanupAt?: string;
    userData?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
};
export declare type DeletedUserUpdateFormValidationValues = {
    originalUserID?: ValidationFunction<string>;
    deletedAt?: ValidationFunction<string>;
    scheduledCleanupAt?: ValidationFunction<string>;
    userData?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DeletedUserUpdateFormOverridesProps = {
    DeletedUserUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    originalUserID?: PrimitiveOverrideProps<TextFieldProps>;
    deletedAt?: PrimitiveOverrideProps<TextFieldProps>;
    scheduledCleanupAt?: PrimitiveOverrideProps<TextFieldProps>;
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
