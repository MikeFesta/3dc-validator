import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { NodeTransform, NodeTransformInterface } from './NodeTransform.js';
import { Primitive, PrimitiveInterface } from './Primitive.js';
import { GltfJsonInterface, GltfJsonMeshInterface } from './GltfJson.js';
import {
  GltfValidatorReportInterface,
  GltfValidatorReportInfoInterface,
  GltfValidatorReportInfoResourceInterface,
} from './GltfValidatorReport.js';
import { readFile, stat } from 'fs/promises';
//@ts-ignore
import { validateBytes } from 'gltf-validator';
import { AbstractMesh } from '@babylonjs/core';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Logger } from '@babylonjs/core/Misc/logger.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { EncodeArrayBufferToBase64 } from '@babylonjs/core/Misc/stringTools.js';
import { Scene } from '@babylonjs/core/scene.js';
import { GLTFFileLoader } from '@babylonjs/loaders';
import '@babylonjs/loaders/glTF/2.0/glTFLoader.js';
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0/glTFLoader.js';

export interface ModelInterface {
  gltfJson: GltfJsonInterface;
  gltfValidatorReport: GltfValidatorReportInterface;
  fileSizeInKb: LoadableAttributeInterface;
  height: LoadableAttributeInterface;
  invertedFaceCount: LoadableAttributeInterface;
  length: LoadableAttributeInterface;
  loaded: boolean;
  materialCount: LoadableAttributeInterface;
  maxUvDensity: LoadableAttributeInterface;
  meshCount: LoadableAttributeInterface;
  minUvDensity: LoadableAttributeInterface;
  nodeCount: LoadableAttributeInterface;
  primitives: PrimitiveInterface[];
  primitiveCount: LoadableAttributeInterface;
  rootNodeTransform: NodeTransformInterface;
  texturesMaxHeight: LoadableAttributeInterface;
  texturesMaxWidth: LoadableAttributeInterface;
  texturesMinHeight: LoadableAttributeInterface;
  texturesMinWidth: LoadableAttributeInterface;
  texturesPowerOfTwo: LoadableAttributeInterface;
  texturesQuadratic: LoadableAttributeInterface;
  triangleCount: LoadableAttributeInterface;
  u: {
    max: LoadableAttributeInterface;
    min: LoadableAttributeInterface;
  };
  v: {
    max: LoadableAttributeInterface;
    min: LoadableAttributeInterface;
  };
  width: LoadableAttributeInterface;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
  uvIsInRangeZeroToOne: () => boolean;
}

export class Model implements ModelInterface {
  gltfJson = null as unknown as GltfJsonInterface;
  gltfValidatorReport = null as unknown as GltfValidatorReportInterface;
  fileSizeInKb = new LoadableAttribute('File size in Kb', 0);
  height = new LoadableAttribute('Height in Meters', 0);
  invertedFaceCount = new LoadableAttribute('Inverted Faces', 0);
  length = new LoadableAttribute('Length in Meters', 0);
  loaded = false;
  materialCount = new LoadableAttribute('Material Count', 0);
  maxUvDensity = new LoadableAttribute('Max UV Density', 0);
  meshCount = new LoadableAttribute('Mesh Count', 0);
  minUvDensity = new LoadableAttribute('Min UV Density', 0);
  nodeCount = new LoadableAttribute('Node Count', 0);
  primitives = [] as PrimitiveInterface[];
  primitiveCount = new LoadableAttribute('Primitive Count', 0);
  rootNodeTransform = new NodeTransform();
  texturesMaxHeight = new LoadableAttribute('Max Texture Height', 0);
  texturesMaxWidth = new LoadableAttribute('Max Texture Width', 0);
  texturesMinHeight = new LoadableAttribute('Min Texture Height', 0);
  texturesMinWidth = new LoadableAttribute('Min Texture Width', 0);
  texturesPowerOfTwo = new LoadableAttribute('Texture Dimensions are Powers of 2', false);
  texturesQuadratic = new LoadableAttribute('Textures Have the Same Width and Height', false);
  triangleCount = new LoadableAttribute('Triangle Count', 0);
  u = {
    max: new LoadableAttribute('Max U value', 0),
    min: new LoadableAttribute('Min U value', 0),
  };
  v = {
    max: new LoadableAttribute('Max V value', 0),
    min: new LoadableAttribute('Min V value', 0),
  };
  width = new LoadableAttribute('Width in Meters', 0);

  public getAttributes() {
    return [
      this.fileSizeInKb,
      this.triangleCount,
      this.materialCount,
      this.meshCount,
      this.nodeCount,
      this.primitiveCount,
      this.texturesMaxHeight,
      this.texturesMinHeight,
      this.texturesMaxWidth,
      this.texturesMinWidth,
      this.texturesPowerOfTwo,
      this.texturesQuadratic,
      this.length,
      this.width,
      this.height,
      this.rootNodeTransform.location.x,
      this.rootNodeTransform.location.y,
      this.rootNodeTransform.location.z,
      this.rootNodeTransform.rotation.x,
      this.rootNodeTransform.rotation.y,
      this.rootNodeTransform.rotation.z,
      this.rootNodeTransform.scale.x,
      this.rootNodeTransform.scale.y,
      this.rootNodeTransform.scale.z,
      this.u.max,
      this.u.min,
      this.v.max,
      this.v.min,
      this.maxUvDensity,
      this.minUvDensity,
      this.invertedFaceCount,
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
      throw new Error('Unable to load file: ' + file.name);
    }
  }

  // This version is for node.js and the file comes from the file system
  public async loadFromFileSystem(filepath: string): Promise<void> {
    try {
      const fileStats = await stat(filepath);
      this.fileSizeInKb.loadValue(Number((fileStats.size / 1024).toFixed(0)));
      if (this.fileSizeInKb.value === 0) {
        throw new Error('File size is zero');
      }
      const fileDataBuffer = await readFile(filepath);
      await this.loadWithGltfValidator(fileDataBuffer);
      const data = 'data:;base64,' + EncodeArrayBufferToBase64(fileDataBuffer);
      await this.loadWithBabylon(data);
      this.loaded = true;
    } catch (err) {
      throw new Error('Unable to load file: ' + filepath);
    }
  }

  public uvIsInRangeZeroToOne = () => {
    return (
      (this.u.max.value as number) <= 1 &&
      (this.u.min.value as number) >= 0 &&
      (this.v.max.value as number) <= 1 &&
      (this.v.min.value as number) >= 0
    );
  };

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  private allTexturesArePowersOfTwo(reportInfo: GltfValidatorReportInfoInterface) {
    let nonPowerOfTwoTextureFound = false;
    if (reportInfo.resources) {
      reportInfo.resources.forEach((resource: GltfValidatorReportInfoResourceInterface) => {
        if (resource.image) {
          if (!this.numberIsPowerOfTwo(resource.image.height) || !this.numberIsPowerOfTwo(resource.image.width)) {
            nonPowerOfTwoTextureFound = true;
          }
        }
      });
    }
    return !nonPowerOfTwoTextureFound;
  }

  private allTexturesAreQuadratic(reportInfo: GltfValidatorReportInfoInterface) {
    let nonQuadraticTextureFound = false;
    if (reportInfo.resources) {
      reportInfo.resources.forEach((resource: GltfValidatorReportInfoResourceInterface) => {
        if (resource.image) {
          if (resource.image.height != resource.image.width) {
            nonQuadraticTextureFound = true;
          }
        }
      });
    }
    return !nonQuadraticTextureFound;
  }

  private calculateDimensions(scene: Scene) {
    // Dimensions - from the __root__ node, get bounds of all child meshes
    if (scene.meshes.length > 0) {
      const { min, max } = scene.meshes[0].getHierarchyBoundingVectors();
      // Round to precision of 6
      this.height.loadValue(+(max.y - min.y).toFixed(6) as number);
      this.length.loadValue(+(max.x - min.x).toFixed(6) as number);
      this.width.loadValue(+(max.z - min.z).toFixed(6) as number);
    }
  }

  private calculateUvValues(primitives: PrimitiveInterface[]) {
    // 1. Find the min/max U and V values
    let maxU = undefined as unknown as number;
    let maxV = undefined as unknown as number;
    let minU = undefined as unknown as number;
    let minV = undefined as unknown as number;

    // 2. Count the number of inverted UVs
    let invertedFaceCount = 0;

    // 3. Find the min/max texel density
    let maxDensity = undefined as unknown as number;
    let minDensity = undefined as unknown as number;

    this.primitives.forEach((primitive: Primitive) => {
      // 1.
      if (maxU === undefined || primitive.uv.u.max.value > maxU) {
        maxU = primitive.uv.u.max.value as number;
      }
      if (maxV === undefined || primitive.uv.v.max.value > maxV) {
        maxV = primitive.uv.v.max.value as number;
      }
      if (minU === undefined || primitive.uv.u.min.value < minU) {
        minU = primitive.uv.u.min.value as number;
      }
      if (minV === undefined || primitive.uv.v.min.value < minV) {
        minV = primitive.uv.v.min.value as number;
      }

      // 2.
      invertedFaceCount += primitive.uv.invertedFaceCount.value as number;

      // 3.
      if (maxDensity === undefined || primitive.maxDensity.value > maxDensity) {
        maxDensity = primitive.maxDensity.value as number;
      }
      if (minDensity === undefined || primitive.minDensity.value < minDensity) {
        minDensity = primitive.minDensity.value as number;
      }
    });

    // 1.
    if (maxU !== undefined) {
      this.u.max.loadValue(maxU);
    }
    if (minU !== undefined) {
      this.u.min.loadValue(minU);
    }
    if (maxV !== undefined) {
      this.v.max.loadValue(maxV);
    }
    if (minV !== undefined) {
      this.v.min.loadValue(minV);
    }

    // 2.
    this.invertedFaceCount.loadValue(invertedFaceCount);

    // 3.
    if (maxDensity !== undefined) {
      this.maxUvDensity.loadValue(maxDensity);
    }
    if (minDensity !== undefined) {
      this.minUvDensity.loadValue(minDensity);
    }
  }

  private getTextureSizes(reportInfo: GltfValidatorReportInfoInterface) {
    let maxHeight = 0;
    let minHeight = 0;
    let maxWidth = 0;
    let minWidth = 0;

    if (reportInfo.resources) {
      reportInfo.resources.forEach((resource: GltfValidatorReportInfoResourceInterface) => {
        if (resource.image) {
          if (resource.image.height > maxHeight) {
            maxHeight = resource.image.height;
          }
          if (minHeight === 0 || resource.image.height < minHeight) {
            minHeight = resource.image.height;
          }
          if (resource.image.width > maxWidth) {
            maxWidth = resource.image.width;
          }
          if (minWidth === 0 || resource.image.width < minWidth) {
            minWidth = resource.image.width;
          }
        }
      });
    }
    return { maxHeight, minHeight, maxWidth, minWidth };
  }

  private async loadGltfJson(scene: Scene, data: string | File): Promise<GltfJsonInterface> {
    return await new Promise((resolve, reject) => {
      const fileLoader = new GLTFFileLoader();
      fileLoader.loadFile(
        scene,
        data,
        data => {
          resolve(data.json);
        },
        ev => {
          // progress. nothing to do
        },
        true,
        err => {
          reject();
        },
      );
    });
  }

  private async loadWithBabylon(data: string | File) {
    Logger.LogLevels = Logger.WarningLogLevel; // supress NullEngine welcome message in CLI / unit tests
    const engine = new NullEngine();
    const scene = new Scene(engine);

    this.gltfJson = await this.loadGltfJson(scene, data);
    // Note: the file was already loaded to extract the JSON, but now
    // gets loaded a 2nd time by SceneLoader. There might be a more
    // efficient way to import what's already loaded into the scene.
    await SceneLoader.AppendAsync('', data, scene);

    this.calculateDimensions(scene);
    this.loadObjectCountsFromJson(this.gltfJson);
    this.loadRootNodeTransform(scene);
    this.loadPrimitives(scene);
    this.calculateUvValues(this.primitives);
  }

  private loadPrimitives(scene: Scene) {
    scene.meshes.forEach((mesh: AbstractMesh) => {
      // exclude the auto-generated __root__ node and anything else with no vertices
      if (mesh.isVerticesDataPresent(VertexBuffer.PositionKind)) {
        this.primitives.push(new Primitive(mesh));
      }
    });
  }

  // Get the location, rotation, and scale of the root node
  private loadRootNodeTransform(scene: Scene) {
    if (scene.meshes.length <= 1) {
      //const rootNode = scene.meshes[0]; // <-- This is not the correct node
      // The top level __root__ node (scene.meshes[0]) is created by BabylonJS for coordinate system conversion (right hand to left hand)
      throw new Error('There are no objects in the scene');
    }
    const rootNode = scene.meshes[1]; // The first real object from the glTF file

    // location
    this.rootNodeTransform.location.x.loadValue(rootNode.position.x);
    this.rootNodeTransform.location.y.loadValue(rootNode.position.y);
    this.rootNodeTransform.location.z.loadValue(rootNode.position.z);
    // rotation
    if (rootNode.rotationQuaternion) {
      // glTF uses Quaternion rotations
      this.rootNodeTransform.rotation.x.loadValue(rootNode.rotationQuaternion.x);
      this.rootNodeTransform.rotation.y.loadValue(rootNode.rotationQuaternion.y);
      this.rootNodeTransform.rotation.z.loadValue(rootNode.rotationQuaternion.z);
    }
    // scale
    this.rootNodeTransform.scale.x.loadValue(rootNode.scaling.x);
    this.rootNodeTransform.scale.y.loadValue(rootNode.scaling.y);
    this.rootNodeTransform.scale.z.loadValue(rootNode.scaling.z);
  }

  // Get number of meshes, nodes, and primitives
  private loadObjectCountsFromJson(json: GltfJsonInterface) {
    this.meshCount.loadValue(json.meshes.length);
    this.nodeCount.loadValue(json.nodes.length);
    let primitiveCount = 0;
    json.meshes.forEach((mesh: GltfJsonMeshInterface) => {
      primitiveCount += mesh.primitives.length;
    });
    this.primitiveCount.loadValue(primitiveCount);
  }

  // Generate a report from the glTF Validator
  private async loadWithGltfValidator(data: ArrayBuffer) {
    return new Promise<void>((resolve, reject) => {
      const binaryData = new Uint8Array(data);
      validateBytes(binaryData)
        .then((report: GltfValidatorReportInterface) => {
          // Keep a copy of the report
          this.gltfValidatorReport = report;
          // These values are available in the glTF validator, so we might as well use them
          this.triangleCount.loadValue(report.info.totalTriangleCount);
          this.materialCount.loadValue(report.info.materialCount);
          this.texturesPowerOfTwo.loadValue(this.allTexturesArePowersOfTwo(report.info));
          this.texturesQuadratic.loadValue(this.allTexturesAreQuadratic(report.info));
          const textureSizes = this.getTextureSizes(report.info);
          this.texturesMaxHeight.loadValue(textureSizes.maxHeight);
          this.texturesMaxWidth.loadValue(textureSizes.maxWidth);
          this.texturesMinHeight.loadValue(textureSizes.minHeight);
          this.texturesMinWidth.loadValue(textureSizes.minWidth);
          this.texturesQuadratic.loadValue(this.allTexturesAreQuadratic(report.info));
          resolve();
        })
        .catch((error: any) => {
          console.error('Validation failed: ', error);
          reject();
        });
    });
  }

  // bitwise check that all trailing bits are 0
  private numberIsPowerOfTwo(n: number): boolean {
    // Power of two numbers are 0x100...00
    return n > 0 && (n & (n - 1)) === 0;
  }
}
