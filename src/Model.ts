import { ModelAttribute, ModelAttributeInterface } from './ModelAttribute';
import { readFile, stat } from 'fs/promises';
//@ts-ignore
import { validateBytes } from 'gltf-validator';

export interface ModelInterface {
  fileSizeInKb: ModelAttributeInterface;
  triangleCount: ModelAttributeInterface;
  materialCount: ModelAttributeInterface;
  texturesPowerOfTwo: ModelAttributeInterface;
  loaded: boolean;
  getAttributes: () => ModelAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Model implements ModelInterface {
  fileSizeInKb = new ModelAttribute('File size in Kb');
  triangleCount = new ModelAttribute('Triangle Count');
  materialCount = new ModelAttribute('Material Count');
  texturesPowerOfTwo = new ModelAttribute('Texture Dimensions are Powers of 2');
  loaded = false;

  getAttributes() {
    return [this.fileSizeInKb];
  }

  public async getBufferFromFileInput(file: File): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          if (reader.result) {
            const buffer = new Uint8Array(reader.result as ArrayBuffer);
            resolve(buffer);
          } else {
            reject();
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        reject();
      }
    });
  }

  // This version is for the browser and the file comes from an <input type='file'> element
  public async loadFromFileInput(file: File): Promise<void> {
    try {
      this.fileSizeInKb.loadValue(Math.round(file.size / 1024)); // bytes to Kb
      const buffer = await this.getBufferFromFileInput(file);
      await this.loadFromGlb(buffer);
      this.loaded = true;
    } catch (err) {
      throw new Error('Unable to load file');
    }
  }

  // This version is for node.js and the file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    const fileStats = await stat(filepath);
    this.fileSizeInKb.loadValue(Number((fileStats.size / 1024).toFixed(0)));
    const fileData = await readFile(filepath);
    await this.loadFromGlb(new Uint8Array(fileData));
    this.loaded = true;
  }

  private numberIsPowerOfTwo(n: number): boolean {
    // bitwise check that all trailing bits are 0
    // Power of two numbers are 0x100...00
    return n > 0 && (n & (n - 1)) === 0;
  }

  private allTexturesArePowersOfTwo(reportInfo: any) {
    let nonPowerOfTwoTextureFound = false;
    // TODO: create a type definition for reportInfo
    reportInfo.resources.forEach((resource: any) => {
      if (resource.image) {
        if (!this.numberIsPowerOfTwo(resource.image.height) || !this.numberIsPowerOfTwo(resource.image.width)) {
          nonPowerOfTwoTextureFound = true;
        }
      }
    });
    return !nonPowerOfTwoTextureFound;
  }

  private async loadFromGlb(binaryData: Uint8Array) {
    return new Promise<void>((resolve, reject) => {
      // Use the GLTF Validator to get the triangle count
      validateBytes(binaryData)
        .then((report: any) => {
          this.triangleCount.loadValue(report.info.totalTriangleCount);
          this.materialCount.loadValue(report.info.materialCount);
          this.texturesPowerOfTwo.loadValue(this.allTexturesArePowersOfTwo(report.info));
          // May want to pass the results from the validator report
          resolve();
        })
        .catch((error: any) => {
          console.error('Validation failed: ', error);
          reject();
        });
    });
  }

  // For parsing the file
  // https://threejs.org/docs/#examples/en/loaders/GLTFLoader
}
