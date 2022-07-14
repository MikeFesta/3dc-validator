export interface ModelAttributeInterface {
  loaded: boolean;
  name: string;
  value: boolean | number | string;
  loadValue: (value: boolean | number | string) => void;
}

export class ModelAttribute implements ModelAttributeInterface {
  loaded = false;
  name = '';
  value = undefined as unknown as boolean | number | string;

  constructor(name: string) {
    this.name = name;
  }

  loadValue(value: boolean | number | string) {
    this.value = value;
    this.loaded = true;
  }
}
