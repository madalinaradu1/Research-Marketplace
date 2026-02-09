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
export declare type TagUpdateFormInputValues = {
    tag_id?: string;
    display_name?: string;
    normalized_name?: string;
    parent_tag_id?: string;
    tag_type?: string;
    aliases?: string[];
    description?: string;
    hierarchy_path?: string[];
    status?: string;
};
export declare type TagUpdateFormValidationValues = {
    tag_id?: ValidationFunction<string>;
    display_name?: ValidationFunction<string>;
    normalized_name?: ValidationFunction<string>;
    parent_tag_id?: ValidationFunction<string>;
    tag_type?: ValidationFunction<string>;
    aliases?: ValidationFunction<string>;
    description?: ValidationFunction<string>;
    hierarchy_path?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TagUpdateFormOverridesProps = {
    TagUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    tag_id?: PrimitiveOverrideProps<TextFieldProps>;
    display_name?: PrimitiveOverrideProps<TextFieldProps>;
    normalized_name?: PrimitiveOverrideProps<TextFieldProps>;
    parent_tag_id?: PrimitiveOverrideProps<TextFieldProps>;
    tag_type?: PrimitiveOverrideProps<TextFieldProps>;
    aliases?: PrimitiveOverrideProps<TextFieldProps>;
    description?: PrimitiveOverrideProps<TextFieldProps>;
    hierarchy_path?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TagUpdateFormProps = React.PropsWithChildren<{
    overrides?: TagUpdateFormOverridesProps | undefined | null;
} & {
    tag_id?: string;
    tag?: any;
    onSubmit?: (fields: TagUpdateFormInputValues) => TagUpdateFormInputValues;
    onSuccess?: (fields: TagUpdateFormInputValues) => void;
    onError?: (fields: TagUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TagUpdateFormInputValues) => TagUpdateFormInputValues;
    onValidate?: TagUpdateFormValidationValues;
} & React.CSSProperties>;
export default function TagUpdateForm(props: TagUpdateFormProps): React.ReactElement;
