import * as React from "react";
import { Create, SimpleForm, CreateProps, TextInput } from "react-admin";

export const ReferralCreate = (props: CreateProps): React.ReactElement => {
  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput label="Referred" source="referred" />
        <TextInput label="Referrer" source="referrer" />
      </SimpleForm>
    </Create>
  );
};
