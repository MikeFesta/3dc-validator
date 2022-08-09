import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { SchemaJSONInterface } from './SchemaJSON.js';
import { readFile } from 'fs/promises';

export interface SchemaInterface {
  loaded: boolean;
  maxFileSizeInKb: LoadableAttributeInterface;
  maxHeight: LoadableAttributeInterface;
  maxLength: LoadableAttributeInterface;
  maxMaterialCount: LoadableAttributeInterface;
  maxTriangleCount: LoadableAttributeInterface;
  maxWidth: LoadableAttributeInterface;
  minFileSizeInKb: LoadableAttributeInterface;
  minHeight: LoadableAttributeInterface;
  minLength: LoadableAttributeInterface;
  minWidth: LoadableAttributeInterface;
  percentToleranceHeight: LoadableAttributeInterface;
  percentToleranceLength: LoadableAttributeInterface;
  percentToleranceWidth: LoadableAttributeInterface;
  requireTextureDimensionsBePowersOfTwo: LoadableAttributeInterface;

  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Schema implements SchemaInterface {
  loaded = false;
  maxFileSizeInKb = new LoadableAttribute('Max file size in Kb');
  maxHeight = new LoadableAttribute('Max Height (z)');
  maxLength = new LoadableAttribute('Max Length (y)');
  maxMaterialCount = new LoadableAttribute('Max Material Count');
  maxTriangleCount = new LoadableAttribute('Max Triangle Count');
  maxWidth = new LoadableAttribute('Max Width (x)');
  minFileSizeInKb = new LoadableAttribute('Min file size in Kb');
  minHeight = new LoadableAttribute('Min Height (z)');
  minLength = new LoadableAttribute('Min Length (y)');
  minWidth = new LoadableAttribute('Min Width (x)');
  percentToleranceHeight = new LoadableAttribute('Percent Tolerance Height (z)');
  percentToleranceLength = new LoadableAttribute('Percent Tolerance Length (y)');
  percentToleranceWidth = new LoadableAttribute('Percent Tolerance Width (x)');
  requireTextureDimensionsBePowersOfTwo = new LoadableAttribute('Require Texture Dimensions be Powers of 2');

  getAttributes() {
    return [
      this.minFileSizeInKb,
      this.maxFileSizeInKb,
      this.maxTriangleCount,
      this.maxMaterialCount,
      this.requireTextureDimensionsBePowersOfTwo,
      this.minLength,
      this.maxLength,
      this.minWidth,
      this.maxWidth,
      this.minHeight,
      this.maxHeight,
      this.percentToleranceLength,
      this.percentToleranceWidth,
      this.percentToleranceHeight,
    ];
  }

  private loadFromSchemaObject(obj: SchemaJSONInterface) {
    this.loaded = true;
    this.maxFileSizeInKb.loadValue(obj.fileSizeInKb.max);
    this.maxHeight.loadValue(obj.dimensions.maximum.height);
    this.maxLength.loadValue(obj.dimensions.maximum.length);
    this.maxMaterialCount.loadValue(obj.maxMaterialCount);
    this.maxTriangleCount.loadValue(obj.maxTriangleCount);
    this.maxWidth.loadValue(obj.dimensions.maximum.width);
    this.minFileSizeInKb.loadValue(obj.fileSizeInKb.min);
    this.minHeight.loadValue(obj.dimensions.minimum.height);
    this.minLength.loadValue(obj.dimensions.minimum.length);
    this.minWidth.loadValue(obj.dimensions.minimum.width);
    this.percentToleranceHeight.loadValue(obj.dimensions.percentTolerance.height);
    this.percentToleranceLength.loadValue(obj.dimensions.percentTolerance.length);
    this.percentToleranceWidth.loadValue(obj.dimensions.percentTolerance.width);
    this.requireTextureDimensionsBePowersOfTwo.loadValue(obj.requireTextureDimensionsBePowersOfTwo);
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
