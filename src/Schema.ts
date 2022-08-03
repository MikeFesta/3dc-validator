import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute';
import { SchemaJSONInterface } from './SchemaJSON';
import { readFile } from 'fs/promises';

export interface SchemaInterface {
  maxFileSizeInKb: LoadableAttributeInterface;
  minFileSizeInKb: LoadableAttributeInterface;
  maxTriangleCount: LoadableAttributeInterface;
  maxMaterialCount: LoadableAttributeInterface;
  requireTextureDimensionsBePowersOfTwo: LoadableAttributeInterface;
  dimensionsMaxWidth: LoadableAttributeInterface;
  dimensionsMaxHeight: LoadableAttributeInterface;
  dimensionsMaxDepth: LoadableAttributeInterface;
  dimensionsMinWidth: LoadableAttributeInterface;
  dimensionsMinHeight: LoadableAttributeInterface;
  dimensionsMinDepth: LoadableAttributeInterface;
  dimensionsPercentToleranceWidth: LoadableAttributeInterface;
  dimensionsPercentToleranceHeight: LoadableAttributeInterface;
  dimensionsPercentToleranceDepth: LoadableAttributeInterface;
  loaded: boolean;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Schema implements SchemaInterface {
  maxFileSizeInKb = new LoadableAttribute('Max file size in Kb');
  minFileSizeInKb = new LoadableAttribute('Min file size in Kb');
  maxTriangleCount = new LoadableAttribute('Max Triangle Count');
  maxMaterialCount = new LoadableAttribute('Max Material Count');
  requireTextureDimensionsBePowersOfTwo = new LoadableAttribute('Require Texture Dimensions be Powers of 2');
  dimensionsMaxWidth = new LoadableAttribute('Max Width (x)');
  dimensionsMaxHeight = new LoadableAttribute('Max Height (z)');
  dimensionsMaxDepth = new LoadableAttribute('Max Depth (y)');
  dimensionsMinWidth = new LoadableAttribute('Min Width (x)');
  dimensionsMinHeight = new LoadableAttribute('Min Height (z)');
  dimensionsMinDepth = new LoadableAttribute('Min Depth (y)');
  dimensionsPercentToleranceWidth = new LoadableAttribute('Percent Tolerance Width (x)');
  dimensionsPercentToleranceHeight = new LoadableAttribute('Percent Tolerance Height (z)');
  dimensionsPercentToleranceDepth = new LoadableAttribute('Percent Tolerance Depth (y)');

  loaded = false;

  getAttributes() {
    return [
      this.maxFileSizeInKb,
      this.minFileSizeInKb,
      this.maxTriangleCount,
      this.maxMaterialCount,
      this.requireTextureDimensionsBePowersOfTwo,
      this.dimensionsMaxWidth,
      this.dimensionsMaxHeight,
      this.dimensionsMaxDepth,
      this.dimensionsMinWidth,
      this.dimensionsMinHeight,
      this.dimensionsMinDepth,
      this.dimensionsPercentToleranceWidth,
      this.dimensionsPercentToleranceHeight,
      this.dimensionsPercentToleranceDepth,
    ];
  }

  private loadFromSchemaObject(obj: SchemaJSONInterface) {
    this.maxFileSizeInKb.loadValue(obj.fileSizeInKb.max);
    this.minFileSizeInKb.loadValue(obj.fileSizeInKb.min);
    this.maxTriangleCount.loadValue(obj.maxTriangleCount);
    this.maxMaterialCount.loadValue(obj.maxMaterialCount);
    this.requireTextureDimensionsBePowersOfTwo.loadValue(obj.requireTextureDimensionsBePowersOfTwo);
    this.dimensionsMaxWidth.loadValue(obj.dimensions.maximum.width);
    this.dimensionsMaxHeight.loadValue(obj.dimensions.maximum.height);
    this.dimensionsMaxDepth.loadValue(obj.dimensions.maximum.depth);
    this.dimensionsMinWidth.loadValue(obj.dimensions.minimum.width);
    this.dimensionsMinHeight.loadValue(obj.dimensions.minimum.height);
    this.dimensionsMinDepth.loadValue(obj.dimensions.minimum.depth);
    this.dimensionsPercentToleranceWidth.loadValue(obj.dimensions.percentTolerance.width);
    this.dimensionsPercentToleranceHeight.loadValue(obj.dimensions.percentTolerance.height);
    this.dimensionsPercentToleranceDepth.loadValue(obj.dimensions.percentTolerance.depth);
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
