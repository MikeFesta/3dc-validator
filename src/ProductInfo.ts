import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute';
import { ProductInfoJSONInterface } from './ProductInfoJSON';
import { readFile } from 'fs/promises';

export interface ProductInfoInterface {
  dimensionsDepth: LoadableAttributeInterface;
  dimensionsHeight: LoadableAttributeInterface;
  dimensionsWidth: LoadableAttributeInterface;
  loaded: boolean;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class ProductInfo implements ProductInfoInterface {
  dimensionsDepth = new LoadableAttribute('Product Depth (y)');
  dimensionsHeight = new LoadableAttribute('Product Height (z)');
  dimensionsWidth = new LoadableAttribute('Product Width (x)');

  loaded = false;

  getAttributes() {
    return [this.dimensionsDepth, this.dimensionsHeight, this.dimensionsWidth];
  }

  private loadFromProductInfoObject(obj: ProductInfoJSONInterface) {
    this.dimensionsWidth.loadValue(obj.dimensions.width);
    this.dimensionsHeight.loadValue(obj.dimensions.height);
    this.dimensionsDepth.loadValue(obj.dimensions.depth);
    this.loaded = true;
  }

  // This version is for the browser and the file comes from an <input type='file'> element
  public async loadFromFileInput(file: File): Promise<void> {
    const loader = new Promise((resolve, reject) => {
      const fileReader = new FileReader(); // FileReader is not available in node.js
      fileReader.onload = async function () {
        const schemaText = fileReader.result as string;
        const schemaData = JSON.parse(schemaText) as ProductInfoJSONInterface;
        // FileReader is not async be default, so this wrapper is needed.
        resolve(schemaData);
      };
      fileReader.onerror = function (e) {
        reject(e);
      };
      fileReader.readAsText(file);
    });

    const obj = (await loader) as ProductInfoJSONInterface;
    this.loadFromProductInfoObject(obj);
  }

  // This version is for node.js and the file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    const schemaText = await readFile(filepath, 'utf-8');
    const obj = JSON.parse(schemaText) as ProductInfoJSONInterface;
    this.loadFromProductInfoObject(obj);
  }
}
