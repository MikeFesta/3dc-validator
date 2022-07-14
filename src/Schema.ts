import { SchemaAttribute, SchemaAttributeInterface } from '@/SchemaAttribute';
import { SchemaJSONInterface } from '@/SchemaJSON';

export interface SchemaInterface {
  maxFileSizeInKb: SchemaAttributeInterface;
  minFileSizeInKb: SchemaAttributeInterface;
  loaded: boolean;
  getAttributes: () => SchemaAttributeInterface[];
}

export class Schema implements SchemaInterface {
  maxFileSizeInKb = new SchemaAttribute('Max file size');
  minFileSizeInKb = new SchemaAttribute('Min file size');
  loaded = false;

  getAttributes() {
    return [this.maxFileSizeInKb, this.minFileSizeInKb];
  }

  public async loadFromFile(file: File): Promise<void> {
    const loader = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const schemaText = fileReader.result as string;
        const schemaData = JSON.parse(schemaText) as SchemaJSONInterface;
        // no access to this here
        console.log(
          'File size should be in the range of ' +
            schemaData.fileSizeInKb.min +
            ' to ' +
            schemaData.fileSizeInKb.max +
            'Kb',
        );
        // FileReader is not async be default, so this wrapper is needed.
        resolve(schemaData);
      };
      fileReader.onerror = function (e) {
        reject(e);
      };
      fileReader.readAsText(file);
    });

    const schemaObj = (await loader) as SchemaJSONInterface;
    this.maxFileSizeInKb.loadAttribute(schemaObj.fileSizeInKb.max);
    this.minFileSizeInKb.loadAttribute(schemaObj.fileSizeInKb.min);
    this.loaded = true;
  }
}
