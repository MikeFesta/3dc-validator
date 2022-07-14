import { ModelAttribute, ModelAttributeInterface } from './ModelAttribute';
import { stat } from 'fs/promises';

export interface ModelInterface {
  fileSizeInKb: ModelAttributeInterface;
  loaded: boolean;
  getAttributes: () => ModelAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Model implements ModelInterface {
  fileSizeInKb = new ModelAttribute('File size in Kb');
  loaded = false;

  getAttributes() {
    return [this.fileSizeInKb];
  }

  // This version is for the browser and the file comes from an <input type='file'> element
  public async loadFromFileInput(file: File): Promise<void> {
    try {
      this.fileSizeInKb.loadValue(Math.round(file.size / 1024)); // bytes to Kb
      this.loaded = true;
    } catch (err) {
      throw new Error('Unable to load file');
    }
  }

  // This version is for node.js and the file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    const fileStats = await stat(filepath);
    this.fileSizeInKb.loadValue((fileStats.size / 1024).toFixed(0));
    this.loaded = true;
  }
}
