import * as React from "react";
import { Edit, SimpleForm, EditProps, TextInput } from "react-admin";

export const ReferralEdit = (props: EditProps): React.ReactElement => {
  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput label="Referred" source="referred" />
        <TextInput label="Referrer" source="referrer" />
      </SimpleForm>
    </Edit>
  );
};
