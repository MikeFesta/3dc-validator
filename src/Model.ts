import { ModelAttribute, ModelAttributeInterface } from '@/ModelAttribute';

export interface ModelInterface {
  fileSizeInKb: ModelAttributeInterface;
  loaded: boolean;
  getAttributes: () => ModelAttributeInterface[];
}

export class Model implements ModelInterface {
  fileSizeInKb = new ModelAttribute('File Size in Kb');
  loaded = false;

  getAttributes() {
    return [this.fileSizeInKb];
  }

  public async loadFromFile(file: File): Promise<void> {
    try {
      this.fileSizeInKb.loadValue(Math.round(file.size / 1024)); // bytes to Kb
    } catch (err) {
      throw new Error('Unable to load file');
    }
  }
}
