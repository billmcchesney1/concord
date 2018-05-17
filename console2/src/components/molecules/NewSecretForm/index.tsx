/*-
 * *****
 * Concord
 * -----
 * Copyright (C) 2017 - 2018 Wal-Mart Store, Inc.
 * -----
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====
 */
import { InjectedFormikProps, withFormik } from 'formik';
import * as React from 'react';
import { Button, Divider, Form } from 'semantic-ui-react';

import { ConcordKey } from '../../../api/common';
import {
    NewSecretEntry,
    SecretStoreType,
    SecretTypeExt,
    SecretVisibility
} from '../../../api/org/secret';
import { isSecretExists } from '../../../api/service/console';
import { notEmpty } from '../../../utils';
import { secret as validation, secretAlreadyExistsError } from '../../../validation';
import { FormikDropdown, FormikFileInput, FormikInput } from '../../atoms';
import { SecretStoreDropdown } from '../../organisms';

enum StorePasswordType {
    DONT_USE,
    SPECIFY,
    GENERATE
}

interface FormValues {
    name: string;
    visibility: SecretVisibility;
    type: SecretTypeExt;
    publicFile?: File;
    privateFile?: File;
    username?: string;
    password?: string;
    valueString?: string;
    valueFile?: File;
    storePasswordType?: StorePasswordType;
    storePassword?: string;
    storeType?: SecretStoreType;
}

export type NewSecretFormValues = FormValues;

interface Props {
    orgName: ConcordKey;
    initial: FormValues;
    onSubmit: (values: NewSecretEntry) => void;
    submitting: boolean;
}

const visibilityOptions = [
    {
        text: 'Public',
        value: SecretVisibility.PUBLIC,
        description: 'Public secrets can be used by any user.',
        icon: 'unlock'
    },
    {
        text: 'Private',
        value: SecretVisibility.PRIVATE,
        description: 'Private secrets can be used only by the specified teams.',
        icon: 'lock'
    }
];

const typeOptions = [
    { text: 'Generate a new key pair', value: SecretTypeExt.NEW_KEY_PAIR },
    { text: 'Existing key pair', value: SecretTypeExt.EXISTING_KEY_PAIR },
    { text: 'Username/password', value: SecretTypeExt.USERNAME_PASSWORD },
    { text: 'Single value (string)', value: SecretTypeExt.VALUE_STRING },
    { text: 'Single value (file)', value: SecretTypeExt.VALUE_FILE }
];

const pwdTypeOptions = [
    {
        text: "N/A (encrypt using the server's key)",
        value: StorePasswordType.DONT_USE
    },
    { text: 'Specify a password', value: StorePasswordType.SPECIFY },
    { text: 'Generate a new password', value: StorePasswordType.GENERATE }
];

class NewSecretForm extends React.Component<InjectedFormikProps<Props, FormValues>> {
    constructor(props: InjectedFormikProps<Props, FormValues>) {
        super(props);
    }

    render() {
        const { submitting, handleSubmit, errors, dirty, values } = this.props;

        const hasErrors = notEmpty(errors);

        return (
            <Form onSubmit={handleSubmit} loading={submitting}>
                <FormikInput name="name" label="Name" placeholder="Secret name" required={true} />

                <FormikDropdown
                    name="visibility"
                    label="Visibility"
                    required={true}
                    selection={true}
                    options={visibilityOptions}
                />

                <FormikDropdown
                    name="type"
                    label="Type"
                    required={true}
                    selection={true}
                    options={typeOptions}
                />

                {values.type === SecretTypeExt.EXISTING_KEY_PAIR && (
                    <Form.Group widths="equal">
                        <FormikFileInput name="publicFile" label="Public key" required={true} />

                        <FormikFileInput name="privateFile" label="Private key" required={true} />
                    </Form.Group>
                )}

                {values.type === SecretTypeExt.USERNAME_PASSWORD && (
                    <Form.Group widths="equal">
                        <FormikInput name="username" label="Username" required={true} />

                        <FormikInput
                            name="password"
                            label="Password"
                            required={true}
                            type="password"
                            autoComplete="off"
                        />
                    </Form.Group>
                )}

                {values.type === SecretTypeExt.VALUE_STRING && (
                    <FormikInput name="valueString" label="Value" required={true} />
                )}

                {values.type === SecretTypeExt.VALUE_FILE && (
                    <FormikFileInput name="valueFile" label="Value" required={true} />
                )}

                <FormikDropdown
                    name="storePasswordType"
                    label="Store password"
                    selection={true}
                    options={pwdTypeOptions}
                />

                {values.storePasswordType === StorePasswordType.SPECIFY && (
                    <FormikInput
                        name="storePassword"
                        label="Store password"
                        type="password"
                        required={true}
                        autoComplete="off"
                    />
                )}

                <SecretStoreDropdown name="storeType" label="Store type" required={true} />

                <Divider />

                <Button primary={true} type="submit" disabled={!dirty || hasErrors}>
                    Create
                </Button>
            </Form>
        );
    }
}

const validator = async (values: FormValues, props: Props): Promise<{}> => {
    let e;

    e = validation.name(values.name);
    if (e) {
        throw { name: e };
    }

    const exists = await isSecretExists(props.orgName, values.name);
    if (exists) {
        throw { name: secretAlreadyExistsError(values.name) };
    }

    switch (values.type) {
        case SecretTypeExt.EXISTING_KEY_PAIR: {
            e = validation.publicFile(values.publicFile);
            if (e) {
                throw { publicFile: e };
            }

            e = validation.privateFile(values.privateFile);
            if (e) {
                throw { privateFile: e };
            }

            break;
        }
        case SecretTypeExt.USERNAME_PASSWORD: {
            e = validation.username(values.username);
            if (e) {
                throw { username: e };
            }

            e = validation.password(values.password);
            if (e) {
                throw { password: e };
            }

            break;
        }
        case SecretTypeExt.VALUE_STRING: {
            e = validation.valueString(values.valueString);
            if (e) {
                throw { valueString: e };
            }

            break;
        }
        case SecretTypeExt.VALUE_FILE: {
            e = validation.valueFile(values.valueFile);
            if (e) {
                throw { valueFile: e };
            }

            break;
        }
        default:
            break;
    }

    if (values.storePasswordType === StorePasswordType.SPECIFY) {
        e = validation.storePassword(values.storePassword);
        if (e) {
            throw { storePassword: e };
        }
    }

    return {};
};

export default withFormik<Props, FormValues>({
    handleSubmit: (values, bag) => {
        const entry: NewSecretEntry = values;

        switch (values.storePasswordType) {
            case StorePasswordType.DONT_USE: {
                entry.generatePassword = false;
                entry.storePassword = undefined;
                break;
            }
            case StorePasswordType.SPECIFY: {
                entry.generatePassword = false;
                break;
            }
            case StorePasswordType.GENERATE: {
                entry.generatePassword = true;
                entry.storePassword = undefined;
                break;
            }
            default: {
                break;
            }
        }

        bag.props.onSubmit(entry);
    },
    mapPropsToValues: (props) => ({
        storePasswordType: StorePasswordType.DONT_USE,
        ...props.initial
    }),
    validate: validator
})(NewSecretForm);