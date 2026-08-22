export interface AttributeDefinition {
  id: string;
  key: string;
  label: string;
  status: "active" | "deleted";
}

export interface AttributeDefinitionInput {
  key: string;
  label: string;
}

export interface AttributeDefinitionUpdateInput {
  label: string;
}
