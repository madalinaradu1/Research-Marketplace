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
export declare type MessageCreateFormInputValues = {
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
export declare type MessageCreateFormValidationValues = {
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
export declare type MessageCreateFormOverridesProps = {
    MessageCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
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
export declare type MessageCreateFormProps = React.PropsWithChildren<{
    overrides?: MessageCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: MessageCreateFormInputValues) => MessageCreateFormInputValues;
    onSuccess?: (fields: MessageCreateFormInputValues) => void;
    onError?: (fields: MessageCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: MessageCreateFormInputValues) => MessageCreateFormInputValues;
    onValidate?: MessageCreateFormValidationValues;
} & React.CSSProperties>;
export default function MessageCreateForm(props: MessageCreateFormProps): React.ReactElement;
