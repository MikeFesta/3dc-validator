import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { SchemaJSONInterface } from './SchemaJSON.js';
import { readFile } from 'fs/promises';

export interface SchemaInterface {
  loaded: boolean;
  maxFileSizeInKb: LoadableAttributeInterface;
  maxHeight: LoadableAttributeInterface;
  maxLength: LoadableAttributeInterface;
  maxMaterialCount: LoadableAttributeInterface;
  maxMeshCount: LoadableAttributeInterface;
  maxNodeCount: LoadableAttributeInterface;
  maxPrimitiveCount: LoadableAttributeInterface;
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
  requireCleanRootNodeTransform: LoadableAttributeInterface;
  requireUVRangeZeroToOne: LoadableAttributeInterface;

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
  maxMeshCount = new LoadableAttribute('Max Mesh Count', -1); // Not specified in Asset Creation Guidelines. -1 to ignore
  maxNodeCount = new LoadableAttribute('Max Node Count', -1); // Not specified in Asset Creation Guidelines. -1 to ignore
  maxPrimitiveCount = new LoadableAttribute('Max Primitive Count', -1); // Not specified in Asset Creation Guidelines. -1 to ignore
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
  requireCleanRootNodeTransform = new LoadableAttribute('Require Root Node Have a Clean Transform', false);
  requireUVRangeZeroToOne = new LoadableAttribute('Require UV range 0 to 1', false);

  getAttributes() {
    return [
      this.version,
      this.minFileSizeInKb,
      this.maxFileSizeInKb,
      this.maxTriangleCount,
      this.maxMaterialCount,
      this.maxMeshCount,
      this.maxNodeCount,
      this.maxPrimitiveCount,
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
      this.requireCleanRootNodeTransform,
      this.requireUVRangeZeroToOne,
    ];
  }

  private loadFromSchemaObject(obj: SchemaJSONInterface) {
    // Required Attributes
    this.version.loadValue(obj.version);

    // Optional Attributes (default values will be used if not provided)
    if (obj.fileSizeInKb) {
      this.minFileSizeInKb.loadValue(obj.fileSizeInKb.min);
      this.maxFileSizeInKb.loadValue(obj.fileSizeInKb.max);
    }
    if (obj.maxTriangleCount) {
      this.maxTriangleCount.loadValue(obj.maxTriangleCount);
    }
    if (obj.maxMaterialCount) {
      this.maxMaterialCount.loadValue(obj.maxMaterialCount);
    }
    if (obj.dimensions) {
      if (obj.dimensions.maximum) {
        this.maxLength.loadValue(obj.dimensions.maximum.length);
        this.maxWidth.loadValue(obj.dimensions.maximum.width);
        this.maxHeight.loadValue(obj.dimensions.maximum.height);
      }
      if (obj.dimensions.minimum) {
        this.minLength.loadValue(obj.dimensions.minimum.length);
        this.minWidth.loadValue(obj.dimensions.minimum.width);
        this.minHeight.loadValue(obj.dimensions.minimum.height);
      }
      if (obj.dimensions.percentTolerance) {
        this.percentToleranceLength.loadValue(obj.dimensions.percentTolerance.length);
        this.percentToleranceWidth.loadValue(obj.dimensions.percentTolerance.width);
        this.percentToleranceHeight.loadValue(obj.dimensions.percentTolerance.height);
      }
    }
    if (obj.textures) {
      if (obj.textures.maximum) {
        this.maxTextureWidth.loadValue(obj.textures.maximum.width);
        this.maxTextureHeight.loadValue(obj.textures.maximum.height);
      }
      if (obj.textures.minimum) {
        this.minTextureWidth.loadValue(obj.textures.minimum.width);
        this.minTextureHeight.loadValue(obj.textures.minimum.height);
      }
      if (obj.textures.requireDimensionsBePowersOfTwo) {
        this.requireTextureDimensionsBePowersOfTwo.loadValue(obj.textures.requireDimensionsBePowersOfTwo);
      }
      if (obj.textures.requireDimensionsBeQuadratic) {
        this.requireTextureDimensionsBeQuadratic.loadValue(obj.textures.requireDimensionsBeQuadratic);
      }
    }
    if (obj.objectCount) {
      if (obj.objectCount.meshes) {
        this.maxMeshCount.loadValue(obj.objectCount.meshes.maximum);
      }
      if (obj.objectCount.nodes) {
        this.maxNodeCount.loadValue(obj.objectCount.nodes.maximum);
      }
      if (obj.objectCount.primitives) {
        this.maxPrimitiveCount.loadValue(obj.objectCount.primitives.maximum);
      }
    }
    if (obj.requireCleanRootNodeTransform) {
      this.requireCleanRootNodeTransform.loadValue(obj.requireCleanRootNodeTransform);
    }
    if (obj.uvs?.requireRangeZeroToOne) {
      this.requireUVRangeZeroToOne.loadValue(obj.uvs.requireRangeZeroToOne);
    }

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
