/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type AuditLogCreateFormInputValues = {
    userId?: string;
    userName?: string;
    userEmail?: string;
    action?: string;
    resource?: string;
    details?: string;
    timestamp?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: string;
    updatedAt?: string;
};
export declare type AuditLogCreateFormValidationValues = {
    userId?: ValidationFunction<string>;
    userName?: ValidationFunction<string>;
    userEmail?: ValidationFunction<string>;
    action?: ValidationFunction<string>;
    resource?: ValidationFunction<string>;
    details?: ValidationFunction<string>;
    timestamp?: ValidationFunction<string>;
    ipAddress?: ValidationFunction<string>;
    userAgent?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AuditLogCreateFormOverridesProps = {
    AuditLogCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    userId?: PrimitiveOverrideProps<TextFieldProps>;
    userName?: PrimitiveOverrideProps<TextFieldProps>;
    userEmail?: PrimitiveOverrideProps<TextFieldProps>;
    action?: PrimitiveOverrideProps<TextFieldProps>;
    resource?: PrimitiveOverrideProps<TextFieldProps>;
    details?: PrimitiveOverrideProps<TextFieldProps>;
    timestamp?: PrimitiveOverrideProps<TextFieldProps>;
    ipAddress?: PrimitiveOverrideProps<TextFieldProps>;
    userAgent?: PrimitiveOverrideProps<TextFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AuditLogCreateFormProps = React.PropsWithChildren<{
    overrides?: AuditLogCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: AuditLogCreateFormInputValues) => AuditLogCreateFormInputValues;
    onSuccess?: (fields: AuditLogCreateFormInputValues) => void;
    onError?: (fields: AuditLogCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AuditLogCreateFormInputValues) => AuditLogCreateFormInputValues;
    onValidate?: AuditLogCreateFormValidationValues;
} & React.CSSProperties>;
export default function AuditLogCreateForm(props: AuditLogCreateFormProps): React.ReactElement;
