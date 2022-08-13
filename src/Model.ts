import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { readFile, stat } from 'fs/promises';
//@ts-ignore
import { validateBytes } from 'gltf-validator';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Logger } from '@babylonjs/core/Misc/logger.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { EncodeArrayBufferToBase64 } from '@babylonjs/core/Misc/stringTools.js';
import { Scene } from '@babylonjs/core/scene.js';
import '@babylonjs/loaders/glTF/2.0/glTFLoader.js';

export interface ModelInterface {
  // TODO: group these into a sub-objects to match schema structure
  fileSizeInKb: LoadableAttributeInterface;
  height: LoadableAttributeInterface;
  length: LoadableAttributeInterface;
  loaded: boolean;
  materialCount: LoadableAttributeInterface;
  texturesMaxHeight: LoadableAttributeInterface;
  texturesMaxWidth: LoadableAttributeInterface;
  texturesMinHeight: LoadableAttributeInterface;
  texturesMinWidth: LoadableAttributeInterface;
  texturesPowerOfTwo: LoadableAttributeInterface;
  texturesQuadratic: LoadableAttributeInterface;
  triangleCount: LoadableAttributeInterface;
  width: LoadableAttributeInterface;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Model implements ModelInterface {
  fileSizeInKb = new LoadableAttribute('File size in Kb', 0);
  height = new LoadableAttribute('Height in Meters', 0);
  length = new LoadableAttribute('Length in Meters', 0);
  loaded = false;
  materialCount = new LoadableAttribute('Material Count', 0);
  texturesMaxHeight = new LoadableAttribute('Max Texture Height', 0);
  texturesMaxWidth = new LoadableAttribute('Max Texture Width', 0);
  texturesMinHeight = new LoadableAttribute('Min Texture Height', 0);
  texturesMinWidth = new LoadableAttribute('Min Texture Width', 0);
  texturesPowerOfTwo = new LoadableAttribute('Texture Dimensions are Powers of 2', false);
  texturesQuadratic = new LoadableAttribute('Textures Have the Same Width and Height', false);
  triangleCount = new LoadableAttribute('Triangle Count', 0);
  width = new LoadableAttribute('Width in Meters', 0);

  getAttributes() {
    return [
      this.fileSizeInKb,
      this.triangleCount,
      this.materialCount,
      this.texturesMaxHeight,
      this.texturesMinHeight,
      this.texturesMaxWidth,
      this.texturesMinWidth,
      this.texturesPowerOfTwo,
      this.texturesQuadratic,
      this.length,
      this.width,
      this.height,
    ];
  }

  public async getBufferFromFileInput(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          if (reader.result) {
            const buffer = reader.result as ArrayBuffer;
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
      const fileDataBuffer = await this.getBufferFromFileInput(file);
      await this.loadWithGltfValidator(fileDataBuffer);
      await this.loadWithBabylon(file);
      this.loaded = true;
    } catch (err) {
      throw new Error('Unable to load file');
    }
  }

  // This version is for node.js and the file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    const fileStats = await stat(filepath);
    this.fileSizeInKb.loadValue(Number((fileStats.size / 1024).toFixed(0)));
    const fileDataBuffer = await readFile(filepath);
    await this.loadWithGltfValidator(fileDataBuffer);
    const data = 'data:;base64,' + EncodeArrayBufferToBase64(fileDataBuffer);
    await this.loadWithBabylon(data);
    this.loaded = true;
  }

  private numberIsPowerOfTwo(n: number): boolean {
    // bitwise check that all trailing bits are 0
    // Power of two numbers are 0x100...00
    return n > 0 && (n & (n - 1)) === 0;
  }

  private allTexturesArePowersOfTwo(reportInfo: any) {
    let nonPowerOfTwoTextureFound = false;
    reportInfo.resources.forEach((resource: any) => {
      if (resource.image) {
        if (!this.numberIsPowerOfTwo(resource.image.height) || !this.numberIsPowerOfTwo(resource.image.width)) {
          nonPowerOfTwoTextureFound = true;
        }
      }
    });
    return !nonPowerOfTwoTextureFound;
  }

  private allTexturesAreQuadratic(reportInfo: any) {
    let nonQuadraticTextureFound = false;
    reportInfo.resources.forEach((resource: any) => {
      if (resource.image) {
        if (!resource.image.height != resource.image.width) {
          nonQuadraticTextureFound = true;
        }
      }
    });
    return !nonQuadraticTextureFound;
  }

  private async loadWithBabylon(data: string | File) {
    Logger.LogLevels = Logger.WarningLogLevel; // supress NullEngine welcome message in CLI / unit tests
    const engine = new NullEngine();
    const scene = new Scene(engine);

    await SceneLoader.AppendAsync('', data, scene);

    // Dimensions - from the root node, get bounds of all child meshes
    // Note: uses toFixed to round the number up to 6 decimal places
    const { min, max } = scene.meshes[0].getHierarchyBoundingVectors();
    this.height.loadValue(+(max.y - min.y).toFixed(6) as number);
    this.length.loadValue(+(max.x - min.x).toFixed(6) as number);
    this.width.loadValue(+(max.z - min.z).toFixed(6) as number);
  }

  private async loadWithGltfValidator(data: ArrayBuffer) {
    return new Promise<void>((resolve, reject) => {
      const binaryData = new Uint8Array(data);
      // Use the GLTF Validator to get the triangle count
      validateBytes(binaryData)
        .then((report: any) => {
          // TODO: Get these from Babylon instead
          this.triangleCount.loadValue(report.info.totalTriangleCount);
          this.materialCount.loadValue(report.info.materialCount);
          this.texturesPowerOfTwo.loadValue(this.allTexturesArePowersOfTwo(report.info));
          this.texturesQuadratic.loadValue(this.allTexturesAreQuadratic(report.info));
          // TODO: Load min/max textures
          resolve();
        })
        .catch((error: any) => {
          console.error('Validation failed: ', error);
          reject();
        });
    });
  }
}
