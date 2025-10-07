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
export declare type MessageUpdateFormInputValues = {
    senderID?: string;
    receiverID?: string;
    subject?: string;
    body?: string;
    isRead?: boolean;
    readAt?: string;
    sentAt?: string;
    createdAt?: string;
    updatedAt?: string;
};
export declare type MessageUpdateFormValidationValues = {
    senderID?: ValidationFunction<string>;
    receiverID?: ValidationFunction<string>;
    subject?: ValidationFunction<string>;
    body?: ValidationFunction<string>;
    isRead?: ValidationFunction<boolean>;
    readAt?: ValidationFunction<string>;
    sentAt?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type MessageUpdateFormOverridesProps = {
    MessageUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    senderID?: PrimitiveOverrideProps<TextFieldProps>;
    receiverID?: PrimitiveOverrideProps<TextFieldProps>;
    subject?: PrimitiveOverrideProps<TextFieldProps>;
    body?: PrimitiveOverrideProps<TextFieldProps>;
    isRead?: PrimitiveOverrideProps<SwitchFieldProps>;
    readAt?: PrimitiveOverrideProps<TextFieldProps>;
    sentAt?: PrimitiveOverrideProps<TextFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type MessageUpdateFormProps = React.PropsWithChildren<{
    overrides?: MessageUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    message?: any;
    onSubmit?: (fields: MessageUpdateFormInputValues) => MessageUpdateFormInputValues;
    onSuccess?: (fields: MessageUpdateFormInputValues) => void;
    onError?: (fields: MessageUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: MessageUpdateFormInputValues) => MessageUpdateFormInputValues;
    onValidate?: MessageUpdateFormValidationValues;
} & React.CSSProperties>;
export default function MessageUpdateForm(props: MessageUpdateFormProps): React.ReactElement;
