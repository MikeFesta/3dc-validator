import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { ProductInfoJSONInterface } from './ProductInfoJSON.js';

export interface ProductInfoInterface {
  height: LoadableAttributeInterface;
  length: LoadableAttributeInterface;
  width: LoadableAttributeInterface;
  loaded: boolean;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class ProductInfo implements ProductInfoInterface {
  height = new LoadableAttribute('Product Height', -1); // -1 indicates not to test (default)
  length = new LoadableAttribute('Product Length', -1); // -1 indicates not to test (default)
  width = new LoadableAttribute('Product Width', -1); // -1 indicates not to test (default)

  loaded = false;

  getAttributes() {
    return [this.length, this.height, this.width];
  }

  private loadFromProductInfoObject(obj: ProductInfoJSONInterface) {
    this.height.loadValue(obj.dimensions.height);
    this.length.loadValue(obj.dimensions.length);
    this.width.loadValue(obj.dimensions.width);
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
    const { promises } = await import('fs');
    const schemaText = await promises.readFile(filepath, 'utf-8');
    const obj = JSON.parse(schemaText) as ProductInfoJSONInterface;
    this.loadFromProductInfoObject(obj);
  }
}
