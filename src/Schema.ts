import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { SchemaJSONInterface } from './SchemaJSON.js';
import { readFile } from 'fs/promises';

export interface SchemaInterface {
  loaded: boolean;
  maxFileSizeInKb: LoadableAttributeInterface;
  maxHeight: LoadableAttributeInterface;
  maxLength: LoadableAttributeInterface;
  maxMaterialCount: LoadableAttributeInterface;
  maxTextureHeight: LoadableAttributeInterface;
  maxTextureWidth: LoadableAttributeInterface;
  maxTriangleCount: LoadableAttributeInterface;
  maxWidth: LoadableAttributeInterface;
  minFileSizeInKb: LoadableAttributeInterface;
  minHeight: LoadableAttributeInterface;
  minLength: LoadableAttributeInterface;
  minTextureHeight: LoadableAttributeInterface;
  minTextureWidth: LoadableAttributeInterface;
  minWidth: LoadableAttributeInterface;
  percentToleranceHeight: LoadableAttributeInterface;
  percentToleranceLength: LoadableAttributeInterface;
  percentToleranceWidth: LoadableAttributeInterface;
  requireTextureDimensionsBePowersOfTwo: LoadableAttributeInterface;
  requireTextureDimensionsBeQuadratic: LoadableAttributeInterface;
  version: LoadableAttributeInterface;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Schema implements SchemaInterface {
  loaded = false;
  maxFileSizeInKb = new LoadableAttribute('Max file size in Kb', 5120); // 5mb per Asset Creation Guidelines
  maxHeight = new LoadableAttribute('Max Height (z)', 10); // Not specified in Asset Creation Guidelines, 10m seems reasonable for products
  maxLength = new LoadableAttribute('Max Length (y)', 10); // Not specified in Asset Creation Guidelines, 10m seems reasonable for products
  maxMaterialCount = new LoadableAttribute('Max Material Count', 5); // 5 per RFP Specifications
  maxTextureHeight = new LoadableAttribute('Max Texture Height', 2048); // 2048 per Asset Creation Guidelines
  maxTextureWidth = new LoadableAttribute('Max Texture Width', 2048); // 2048 per Asset Creation Guidelines
  maxTriangleCount = new LoadableAttribute('Max Triangle Count', 100000); // 100k per Asset Creation Guidelines
  maxWidth = new LoadableAttribute('Max Width (x)', 10); // Not specified in Asset Creation Guidelines, 10m seems reasonable for products
  minFileSizeInKb = new LoadableAttribute('Min file size in Kb', -1); // No minimum in Asset Creation Guidelines, -1 means not tested
  minHeight = new LoadableAttribute('Min Height (z)', 0.01); // Not specified in Asset Creation Guidelines, 1cm seems reasonable for products
  minLength = new LoadableAttribute('Min Length (y)', 0.01); // Not specified in Asset Creation Guidelines, 1cm seems reasonable for products
  minTextureHeight = new LoadableAttribute('Max Texture Height', 512); // 512 is the smallest mentioned in the Asset Creation Guidelines
  minTextureWidth = new LoadableAttribute('Max Texture Width', 512); // 512 is the smallest mentioned in the Asset Creation Guidelines
  minWidth = new LoadableAttribute('Min Width (x)', 0.01); // Not specified in Asset Creation Guidelines, 1cm seems reasonable for products
  percentToleranceHeight = new LoadableAttribute('Percent Tolerance Height (z)', 3); // 3% per RFP Specifications
  percentToleranceLength = new LoadableAttribute('Percent Tolerance Length (y)', 3); // 3% per RFP Specifications
  percentToleranceWidth = new LoadableAttribute('Percent Tolerance Width (x)', 3); // 3% per RFP Specifications
  requireTextureDimensionsBePowersOfTwo = new LoadableAttribute('Require Texture Dimensions be Powers of 2', true);
  requireTextureDimensionsBeQuadratic = new LoadableAttribute(
    'Require Texture Dimensions be Quadratic (height = width)',
    false,
  );
  version = new LoadableAttribute('Version', '1.0.0');

  getAttributes() {
    return [
      this.version,
      this.minFileSizeInKb,
      this.maxFileSizeInKb,
      this.maxTriangleCount,
      this.maxMaterialCount,
      this.minTextureWidth,
      this.maxTextureWidth,
      this.minTextureHeight,
      this.maxTextureHeight,
      this.requireTextureDimensionsBePowersOfTwo,
      this.requireTextureDimensionsBeQuadratic,
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
    this.maxTextureHeight.loadValue(obj.textures.maximum.height);
    this.maxTextureWidth.loadValue(obj.textures.maximum.width);
    this.maxTriangleCount.loadValue(obj.maxTriangleCount);
    this.maxWidth.loadValue(obj.dimensions.maximum.width);
    this.minFileSizeInKb.loadValue(obj.fileSizeInKb.min);
    this.minHeight.loadValue(obj.dimensions.minimum.height);
    this.minLength.loadValue(obj.dimensions.minimum.length);
    this.minTextureHeight.loadValue(obj.textures.minimum.height);
    this.minTextureWidth.loadValue(obj.textures.minimum.width);
    this.minWidth.loadValue(obj.dimensions.minimum.width);
    this.percentToleranceHeight.loadValue(obj.dimensions.percentTolerance.height);
    this.percentToleranceLength.loadValue(obj.dimensions.percentTolerance.length);
    this.percentToleranceWidth.loadValue(obj.dimensions.percentTolerance.width);
    this.requireTextureDimensionsBePowersOfTwo.loadValue(obj.textures.requireDimensionsBePowersOfTwo);
    this.requireTextureDimensionsBeQuadratic.loadValue(obj.textures.requireDimensionsBeQuadratic);
    this.version.loadValue(obj.version);
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
