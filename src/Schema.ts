import { SchemaAttribute, SchemaAttributeInterface } from './SchemaAttribute';
import { SchemaJSONInterface } from './SchemaJSON';
import { readFile } from 'fs/promises';

export interface SchemaInterface {
  maxFileSizeInKb: SchemaAttributeInterface;
  minFileSizeInKb: SchemaAttributeInterface;
  maxTriangleCount: SchemaAttributeInterface;
  maxMaterialCount: SchemaAttributeInterface;
  requireTextureDimensionsBePowersOfTwo: SchemaAttributeInterface;
  loaded: boolean;
  getAttributes: () => SchemaAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Schema implements SchemaInterface {
  maxFileSizeInKb = new SchemaAttribute('Max file size in Kb');
  minFileSizeInKb = new SchemaAttribute('Min file size in Kb');
  maxTriangleCount = new SchemaAttribute('Max Triangle Count');
  maxMaterialCount = new SchemaAttribute('Max Material Count');
  requireTextureDimensionsBePowersOfTwo = new SchemaAttribute('Require Texture Dimensions be Powers of 2');
  loaded = false;

  getAttributes() {
    return [this.maxFileSizeInKb, this.minFileSizeInKb, this.maxTriangleCount, this.maxMaterialCount];
  }

  private loadFromSchemaObject(obj: SchemaJSONInterface) {
    this.maxFileSizeInKb.loadAttribute(obj.fileSizeInKb.max);
    this.minFileSizeInKb.loadAttribute(obj.fileSizeInKb.min);
    this.maxTriangleCount.loadAttribute(obj.maxTriangleCount);
    this.maxMaterialCount.loadAttribute(obj.maxMaterialCount);
    this.requireTextureDimensionsBePowersOfTwo.loadAttribute(obj.requireTextureDimensionsBePowersOfTwo);
    this.loaded = true;
  }

  // This version is for the browser and the file comes from an <input type='file'> element
  public async loadFromFileInput(file: File): Promise<void> {
    const loader = new Promise((resolve, reject) => {
      const fileReader = new FileReader(); // FileReader is not available in node.js
      fileReader.onload = async function () {
        const schemaText = fileReader.result as string;
        const schemaData = JSON.parse(schemaText) as SchemaJSONInterface;
        // FileReader is not async be default, so this wrapper is needed.
        resolve(schemaData);
      };
      fileReader.onerror = function (e) {
        reject(e);
      };
      fileReader.readAsText(file);
    });

    const schemaObj = (await loader) as SchemaJSONInterface;
    this.loadFromSchemaObject(schemaObj);
  }

  // This version is for node.js and the file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    const schemaText = await readFile(filepath, 'utf-8');
    const schemaObj = JSON.parse(schemaText) as SchemaJSONInterface;
    this.loadFromSchemaObject(schemaObj);
  }
}
