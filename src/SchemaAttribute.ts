export interface SchemaAttributeInterface {
  loaded: boolean;
  name: string;
  value: boolean | number | string;
}

export class SchemaAttribute implements SchemaAttributeInterface {
  loaded = false;
  name = '';
  value = undefined as unknown as boolean | number | string;

  constructor(name: string) {
    this.name = name;
  }

  loadAttribute(value: boolean | number | string) {
    this.value = value;
    this.loaded = true;
  }
}
