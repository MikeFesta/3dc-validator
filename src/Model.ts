import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute';
import { readFile, stat } from 'fs/promises';
//@ts-ignore
import { validateBytes } from 'gltf-validator';
import * as BABYLON from 'babylonjs';
import { GLTFFileLoader } from 'babylonjs-loaders';
import { EncodeArrayBufferToBase64 } from 'babylonjs';

export interface ModelInterface {
  fileSizeInKb: LoadableAttributeInterface;
  triangleCount: LoadableAttributeInterface;
  materialCount: LoadableAttributeInterface;
  texturesPowerOfTwo: LoadableAttributeInterface;
  width: LoadableAttributeInterface;
  height: LoadableAttributeInterface;
  depth: LoadableAttributeInterface;
  loaded: boolean;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Model implements ModelInterface {
  fileSizeInKb = new LoadableAttribute('File size in Kb');
  triangleCount = new LoadableAttribute('Triangle Count');
  materialCount = new LoadableAttribute('Material Count');
  texturesPowerOfTwo = new LoadableAttribute('Texture Dimensions are Powers of 2');
  width = new LoadableAttribute('Width in Meters');
  height = new LoadableAttribute('Height in Meters');
  depth = new LoadableAttribute('Depth in Meters');

  loaded = false;

  getAttributes() {
    return [this.fileSizeInKb];
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

  private async loadWithBabylon(data: string | File) {
    const engine = new BABYLON.NullEngine();
    const scene = new BABYLON.Scene(engine);
    const loader = new GLTFFileLoader(); // need this to make glb loading available to SceneLoader

    await BABYLON.SceneLoader.AppendAsync('', data, scene);

    // Dimensions - from the root node, get bounds of all child meshes
    const { min, max } = scene.meshes[0].getHierarchyBoundingVectors();
    this.width.loadValue(max.x - min.x);
    this.height.loadValue(max.y - min.y);
    this.depth.loadValue(max.z - min.z);
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
          // TODO: only use the validator to get the report
          resolve();
        })
        .catch((error: any) => {
          console.error('Validation failed: ', error);
          reject();
        });
    });
  }
}
