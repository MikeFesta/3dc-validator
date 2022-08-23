import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { NodeTransform, NodeTransformInterface } from './NodeTransform.js';
import { UV, UVInterface } from './UV.js';
import {
  GltfValidatorReportInterface,
  GltfValidatorReportInfoInterface,
  GltfValidatorReportInfoResourceInterface,
} from './GltfValidatorReport.js';
import { readFile, stat } from 'fs/promises';
//@ts-ignore
import { validateBytes } from 'gltf-validator';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Logger } from '@babylonjs/core/Misc/logger.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { EncodeArrayBufferToBase64 } from '@babylonjs/core/Misc/stringTools.js';
import { Scene } from '@babylonjs/core/scene.js';
import '@babylonjs/loaders/glTF/2.0/glTFLoader.js';

export interface ModelInterface {
  // TODO: group these into a sub-objects to match schema structure
  gltfValidatorReport: GltfValidatorReportInterface;
  fileSizeInKb: LoadableAttributeInterface;
  height: LoadableAttributeInterface;
  length: LoadableAttributeInterface;
  loaded: boolean;
  materialCount: LoadableAttributeInterface;
  meshCount: LoadableAttributeInterface;
  nodeCount: LoadableAttributeInterface;
  primitiveCount: LoadableAttributeInterface;
  texturesMaxHeight: LoadableAttributeInterface;
  texturesMaxWidth: LoadableAttributeInterface;
  texturesMinHeight: LoadableAttributeInterface;
  texturesMinWidth: LoadableAttributeInterface;
  texturesPowerOfTwo: LoadableAttributeInterface;
  texturesQuadratic: LoadableAttributeInterface;
  triangleCount: LoadableAttributeInterface;
  width: LoadableAttributeInterface;
  rootNodeTransform: NodeTransformInterface;
  uv: UVInterface;
  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Model implements ModelInterface {
  gltfValidatorReport = null as unknown as GltfValidatorReportInterface;
  fileSizeInKb = new LoadableAttribute('File size in Kb', 0);
  height = new LoadableAttribute('Height in Meters', 0);
  length = new LoadableAttribute('Length in Meters', 0);
  loaded = false;
  materialCount = new LoadableAttribute('Material Count', 0);
  meshCount = new LoadableAttribute('Mesh Count', 0);
  nodeCount = new LoadableAttribute('Node Count', 0);
  primitiveCount = new LoadableAttribute('Primitive Count', 0);
  texturesMaxHeight = new LoadableAttribute('Max Texture Height', 0);
  texturesMaxWidth = new LoadableAttribute('Max Texture Width', 0);
  texturesMinHeight = new LoadableAttribute('Min Texture Height', 0);
  texturesMinWidth = new LoadableAttribute('Min Texture Width', 0);
  texturesPowerOfTwo = new LoadableAttribute('Texture Dimensions are Powers of 2', false);
  texturesQuadratic = new LoadableAttribute('Textures Have the Same Width and Height', false);
  triangleCount = new LoadableAttribute('Triangle Count', 0);
  width = new LoadableAttribute('Width in Meters', 0);
  rootNodeTransform = new NodeTransform();
  uv = new UV();

  getAttributes() {
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
      this.uv.u.max,
      this.uv.u.max,
      this.uv.u.max,
      this.uv.u.max,
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

  private allTexturesArePowersOfTwo(reportInfo: GltfValidatorReportInfoInterface) {
    let nonPowerOfTwoTextureFound = false;
    reportInfo.resources.forEach((resource: GltfValidatorReportInfoResourceInterface) => {
      if (resource.image) {
        if (!this.numberIsPowerOfTwo(resource.image.height) || !this.numberIsPowerOfTwo(resource.image.width)) {
          nonPowerOfTwoTextureFound = true;
        }
      }
    });
    return !nonPowerOfTwoTextureFound;
  }

  private getTextureSizes(reportInfo: GltfValidatorReportInfoInterface) {
    let maxHeight = 0;
    let minHeight = 0;
    let maxWidth = 0;
    let minWidth = 0;

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
    return { maxHeight, minHeight, maxWidth, minWidth };
  }

  private allTexturesAreQuadratic(reportInfo: GltfValidatorReportInfoInterface) {
    let nonQuadraticTextureFound = false;
    reportInfo.resources.forEach((resource: GltfValidatorReportInfoResourceInterface) => {
      if (resource.image) {
        if (resource.image.height != resource.image.width) {
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

    this.loadDimensions(scene);
    this.loadObjectCountsFromScene(scene);
    this.loadRootNodeTransform(scene);
    this.loadUVs(scene);
  }

  // UVs should be in the 0-1 Range and not Inverted
  private loadUVs(scene: Scene) {
    let maxU = undefined as unknown as number;
    let maxV = undefined as unknown as number;
    let minU = undefined as unknown as number;
    let minV = undefined as unknown as number;
    // Loop through each mesh
    scene.meshes.forEach(mesh => {
      const uvData = mesh.getVerticesData(VertexBuffer.UVKind);
      if (uvData) {
        // UV data float array has 2 floats per vertex (u,v)
        for (let i = 0; i < uvData.length; i = i + 2) {
          const u = uvData[i];
          const v = uvData[i + 1];
          if (maxU === undefined || maxU < u) {
            maxU = u;
          }
          if (maxV === undefined || maxV < v) {
            maxV = v;
          }
          if (minU === undefined || minU > u) {
            minU = u;
          }
          if (minV === undefined || minV > v) {
            minV = v;
          }
        }
      }
    });

    if (maxU !== undefined) {
      this.uv.u.max.loadValue(maxU);
    }
    if (minU !== undefined) {
      this.uv.u.min.loadValue(minU);
    }
    if (maxV !== undefined) {
      this.uv.v.max.loadValue(maxV);
    }
    if (minV !== undefined) {
      this.uv.v.min.loadValue(minV);
    }

    // TODO: alpha.11 - check for inverted UVs
  }

  // Dimensions - from the root node, get bounds of all child meshes
  private loadDimensions(scene: Scene) {
    // TODO: move toFixed into the report
    const { min, max } = scene.meshes[0].getHierarchyBoundingVectors();
    this.height.loadValue(+(max.y - min.y).toFixed(6) as number);
    this.length.loadValue(+(max.x - min.x).toFixed(6) as number);
    this.width.loadValue(+(max.z - min.z).toFixed(6) as number);
  }

  // Get the location, rotation, and scale of the rooot node
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
  private loadObjectCountsFromScene(scene: Scene) {
    let meshCount = 0;
    let nodeCount = -1; // Note: Babylon adds a parent __root__ node for Right Hand to Left Hand coordinate system conversion that should be ignored
    let primitiveCount = 0;

    // each of these objects are registered as AbstractMeshes
    scene.meshes.forEach(abstractMesh => {
      if (!abstractMesh.isVerticesDataPresent || abstractMesh.getTotalVertices() === 0) {
        // Nodes have 0 vertices
        nodeCount++;
      } else {
        meshCount++;
        // Each mesh is comprised of 1 or more primitives (SubMeshes in BabylonJS)
        // Primitives are used for multiple materials on the same mesh
        // The Blender glTF exporter breaks multi-material objects into distinct meshes, so each mesh only has 1 SubMesh
        // QUESTION: BabylonJS team - what, if any, glTF settings create more than 1 SubMesh?
        primitiveCount += abstractMesh.subMeshes.length;
      }
    });

    this.meshCount.loadValue(meshCount);
    this.nodeCount.loadValue(nodeCount);
    this.primitiveCount.loadValue(primitiveCount);
  }

  private async loadWithGltfValidator(data: ArrayBuffer) {
    return new Promise<void>((resolve, reject) => {
      const binaryData = new Uint8Array(data);
      validateBytes(binaryData)
        .then((report: GltfValidatorReportInterface) => {
          this.gltfValidatorReport = report;
          // TODO: Get these from Babylon instead
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
}
