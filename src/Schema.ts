import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { SchemaJSONInterface } from './SchemaJSON.js';

export interface SchemaInterface {
  loaded: boolean;
  maxFileSizeInKb: LoadableAttributeInterface;
  maxHeight: LoadableAttributeInterface;
  maxLength: LoadableAttributeInterface;
  maxMaterialCount: LoadableAttributeInterface;
  maxMeshCount: LoadableAttributeInterface;
  maxNodeCount: LoadableAttributeInterface;
  maxPixelsPerMeter: LoadableAttributeInterface;
  maxPrimitiveCount: LoadableAttributeInterface;
  maxTextureHeight: LoadableAttributeInterface;
  maxTextureWidth: LoadableAttributeInterface;
  maxTriangleCount: LoadableAttributeInterface; // TODO: rename maxMin
  maxWidth: LoadableAttributeInterface;
  minFileSizeInKb: LoadableAttributeInterface;
  minHeight: LoadableAttributeInterface;
  minLength: LoadableAttributeInterface;
  minMaterialCount: LoadableAttributeInterface;
  minMeshCount: LoadableAttributeInterface;
  minNodeCount: LoadableAttributeInterface;
  minPixelsPerMeter: LoadableAttributeInterface;
  minPrimitiveCount: LoadableAttributeInterface;
  minTextureHeight: LoadableAttributeInterface;
  minTextureWidth: LoadableAttributeInterface;
  minWidth: LoadableAttributeInterface;
  notInvertedUVs: LoadableAttributeInterface;
  notOverlappingUVs: LoadableAttributeInterface;
  pbrColorMax: LoadableAttributeInterface;
  pbrColorMin: LoadableAttributeInterface;
  percentToleranceHeight: LoadableAttributeInterface;
  percentToleranceLength: LoadableAttributeInterface;
  percentToleranceWidth: LoadableAttributeInterface;
  requireCleanRootNodeTransform: LoadableAttributeInterface;
  requireTextureDimensionsBePowersOfTwo: LoadableAttributeInterface;
  requireTextureDimensionsBeQuadratic: LoadableAttributeInterface;
  requireUVRangeZeroToOne: LoadableAttributeInterface;
  resolutionNeededForUvMargin: LoadableAttributeInterface;
  version: LoadableAttributeInterface;

  getAttributes: () => LoadableAttributeInterface[];
  loadFromFileInput(file: File): Promise<void>;
  loadFromFileSystem(filepath: string): Promise<void>;
}

export class Schema implements SchemaInterface {
  // TODO: I should probably change all the defaults to not run the test
  loaded = false;
  maxFileSizeInKb = new LoadableAttribute('Max file size in Kb', 5120); //    5mb per Asset Creation Guidelines
  maxHeight = new LoadableAttribute('Max Height (z)', -1); //                 Not specified in Asset Creation Guidelines. -1 to ignore
  maxLength = new LoadableAttribute('Max Length (y)', -1); //                 Not specified in Asset Creation Guidelines. -1 to ignore
  maxMaterialCount = new LoadableAttribute('Max Material Count', 5); //       5 per RFP Specifications
  maxMeshCount = new LoadableAttribute('Max Mesh Count', -1); //              Not specified in Asset Creation Guidelines. -1 to ignore
  maxNodeCount = new LoadableAttribute('Max Node Count', -1); //              Not specified in Asset Creation Guidelines. -1 to ignore
  maxPixelsPerMeter = new LoadableAttribute('Max Pixels per Meter', -1); //   Not specified in Asset Creation Guidelines
  maxPrimitiveCount = new LoadableAttribute('Max Primitive Count', -1); //    Not specified in Asset Creation Guidelines. -1 to ignore
  maxTextureHeight = new LoadableAttribute('Max Texture Height', 2048); //    2048 per Asset Creation Guidelines
  maxTextureWidth = new LoadableAttribute('Max Texture Width', 2048); //      2048 per Asset Creation Guidelines
  maxTriangleCount = new LoadableAttribute('Max Triangle Count', 100000); //  100k per Asset Creation Guidelines
  maxWidth = new LoadableAttribute('Max Width (x)', -1); //                   Not specified in Asset Creation Guidelines. -1 to ignore
  minFileSizeInKb = new LoadableAttribute('Min file size in Kb', 1); //       1kb to check that the file is not empty
  minHeight = new LoadableAttribute('Min Height (z)', -1); //                 Not specified in Asset Creation Guidelines. -1 to ignore
  minLength = new LoadableAttribute('Min Length (y)', -1); //                 Not specified in Asset Creation Guidelines. -1 to ignore
  minMaterialCount = new LoadableAttribute('Min Material Count', -1); //      Not specified in Asset Creation Guidelines. -1 to ignore
  minMeshCount = new LoadableAttribute('Min Mesh Count', -1); //              Not specified in Asset Creation Guidelines. -1 to ignore
  minNodeCount = new LoadableAttribute('Min Node Count', -1); //              Not specified in Asset Creation Guidelines. -1 to ignore
  minPixelsPerMeter = new LoadableAttribute('Min Pixels per Meter', -1); //   Not specified in Asset Creation Guidelines. -1 to ignore
  minPrimitiveCount = new LoadableAttribute('Min Primitive Count', -1); //    Not specified in Asset Creation Guidelines. -1 to ignore
  minTextureHeight = new LoadableAttribute('Min Texture Height', 512); //     512 is the smallest mentioned in the Asset Creation Guidelines
  minTextureWidth = new LoadableAttribute('Min Texture Width', 512); //       512 is the smallest mentioned in the Asset Creation Guidelines
  minTriangleCount = new LoadableAttribute('Min Triangle Count', -1); //      Not specified in Asset Creation Guidelines. -1 to ignore
  minWidth = new LoadableAttribute('Min Width (x)', -1); //                   Not specified in Asset Creation Guidelines. -1 to ignore
  notInvertedUVs = new LoadableAttribute('No Inverted UVs', true); //         Inverted UVs are not recommended, per the Asset Creation Guidelines
  notOverlappingUVs = new LoadableAttribute('No Overlapping UVs', true); //   Overlapping UVs are not recommended, per the Asset Creation Guidelines
  pbrColorMax = new LoadableAttribute('Color max value is PBR safe', 243); // 243, per Asset Creation Guidelines
  pbrColorMin = new LoadableAttribute('Color min value is PBR safe', 30); //  30, per Asset Creation Guidelines
  percentToleranceHeight = new LoadableAttribute('Percent Tolerance Height (z)', 3); // 3% per RFP Specifications
  percentToleranceLength = new LoadableAttribute('Percent Tolerance Length (y)', 3); // 3% per RFP Specifications
  percentToleranceWidth = new LoadableAttribute('Percent Tolerance Width (x)', 3); //   3% per RFP Specifications
  requireBeveledEdges = new LoadableAttribute('Require Beveled Edges', false); //   Not required, edge computation is a little slow
  requireManifoldEdges = new LoadableAttribute('Require Manifold Edges', false); // Not required, edge computation is a little slow
  requireTextureDimensionsBePowersOfTwo = new LoadableAttribute('Require Texture Dimensions be Powers of 2', true); // Recommended in the Asset Creation Guidelines
  requireTextureDimensionsBeQuadratic = new LoadableAttribute(
    'Require Texture Dimensions be Quadratic (height = width)',
    false,
  ); // Not specified in Asset Creation Guidelines
  requireCleanRootNodeTransform = new LoadableAttribute('Require Root Node Have a Clean Transform', false); // Not specified in Asset Creation Guidelines
  requireUVRangeZeroToOne = new LoadableAttribute('Require UV range 0 to 1', false); // Not specified in Asset Creation Guidelines
  resolutionNeededForUvMargin = new LoadableAttribute('UV Gutter Wide Enough', -1); // Not specified in Asset Creation Guidelines. -1 to ignore
  version = new LoadableAttribute('Version', '1.0.0');

  getAttributes() {
    return [
      this.version,
      this.minFileSizeInKb,
      this.maxFileSizeInKb,
      this.maxTriangleCount,
      this.maxMaterialCount,
      this.minMaterialCount,
      this.maxMeshCount,
      this.minMeshCount,
      this.maxNodeCount,
      this.maxPrimitiveCount,
      this.minTextureWidth,
      this.maxTextureWidth,
      this.minTextureHeight,
      this.maxTextureHeight,
      this.requireTextureDimensionsBePowersOfTwo,
      this.requireTextureDimensionsBeQuadratic,
      this.pbrColorMax,
      this.pbrColorMin,
      this.minLength,
      this.maxLength,
      this.minWidth,
      this.maxWidth,
      this.minHeight,
      this.maxHeight,
      this.percentToleranceLength,
      this.percentToleranceWidth,
      this.percentToleranceHeight,
      this.requireCleanRootNodeTransform,
      this.requireUVRangeZeroToOne,
      this.maxPixelsPerMeter,
      this.minPixelsPerMeter,
      this.notInvertedUVs,
      this.notOverlappingUVs,
      this.resolutionNeededForUvMargin,
    ];
  }

  private loadFromSchemaObject(obj: SchemaJSONInterface) {
    // Required Attributes
    this.version.loadValue(obj.version);

    // Optional Attributes (default values will be used if not provided)
    if (obj.fileSizeInKb !== undefined) {
      if (obj.fileSizeInKb.maximum) {
        this.maxFileSizeInKb.loadValue(obj.fileSizeInKb.maximum);
      }
      if (obj.fileSizeInKb.minimum) {
        this.minFileSizeInKb.loadValue(obj.fileSizeInKb.minimum);
      }
    }
    if (obj.materials !== undefined) {
      if (obj.materials.maximum !== undefined) {
        this.maxMaterialCount.loadValue(obj.materials.maximum);
      }
      if (obj.materials.minimum !== undefined) {
        this.minMaterialCount.loadValue(obj.materials.minimum);
      }
    }
    if (obj.model !== undefined) {
      if (obj.model.objectCount !== undefined) {
        if (obj.model.objectCount.meshes !== undefined) {
          if (obj.model.objectCount.meshes.maximum !== undefined) {
            this.maxMeshCount.loadValue(obj.model.objectCount.meshes.maximum);
          }
          if (obj.model.objectCount.meshes.minimum !== undefined) {
            this.minMeshCount.loadValue(obj.model.objectCount.meshes.minimum);
          }
        }
        if (obj.model.objectCount.nodes !== undefined) {
          if (obj.model.objectCount.nodes.maximum !== undefined) {
            this.maxNodeCount.loadValue(obj.model.objectCount.nodes.maximum);
          }
          if (obj.model.objectCount.nodes.minimum !== undefined) {
            this.minNodeCount.loadValue(obj.model.objectCount.nodes.minimum);
          }
        }
        if (obj.model.objectCount.primitives !== undefined) {
          if (obj.model.objectCount.primitives.maximum !== undefined) {
            this.maxPrimitiveCount.loadValue(obj.model.objectCount.primitives.maximum);
          }
          if (obj.model.objectCount.primitives.minimum !== undefined) {
            this.minPrimitiveCount.loadValue(obj.model.objectCount.primitives.minimum);
          }
        }
      }
      if (obj.model.requireBeveledEdges !== undefined) {
        this.requireBeveledEdges.loadValue(obj.model.requireBeveledEdges);
      }
      if (obj.model.requireCleanRootNodeTransform !== undefined) {
        this.requireCleanRootNodeTransform.loadValue(obj.model.requireCleanRootNodeTransform);
      }
      if (obj.model.requireManifoldEdges !== undefined) {
        this.requireManifoldEdges.loadValue(obj.model.requireManifoldEdges);
      }
      if (obj.model.triangles !== undefined) {
        if (obj.model.triangles.maximum) {
          this.maxTriangleCount.loadValue(obj.model.triangles.maximum);
        }
        if (obj.model.triangles.minimum) {
          this.minTriangleCount.loadValue(obj.model.triangles.minimum);
        }
      }
    }
    if (obj.product !== undefined) {
      if (obj.product.dimensions !== undefined) {
        if (obj.product.dimensions.height !== undefined) {
          if (obj.product.dimensions.height.maximum !== undefined) {
            this.maxHeight.loadValue(obj.product.dimensions.height.maximum);
          }
          if (obj.product.dimensions.height.minimum !== undefined) {
            this.minHeight.loadValue(obj.product.dimensions.height.minimum);
          }
          if (obj.product.dimensions.height.percentTolerance !== undefined) {
            this.percentToleranceHeight.loadValue(obj.product.dimensions.height.percentTolerance);
          }
        }
        console.log('object product dimensions provided');
        if (obj.product.dimensions.length !== undefined) {
          console.log('object product length dimensions provided');
          if (obj.product.dimensions.length.maximum !== undefined) {
            console.log('object product MAX length dimensions provided');
            this.maxLength.loadValue(obj.product.dimensions.length.maximum);
          }
          if (obj.product.dimensions.length.minimum !== undefined) {
            this.minLength.loadValue(obj.product.dimensions.length.minimum);
          }
          if (obj.product.dimensions.length.percentTolerance !== undefined) {
            this.percentToleranceLength.loadValue(obj.product.dimensions.length.percentTolerance);
          }
        }
        if (obj.product.dimensions.width !== undefined) {
          if (obj.product.dimensions.width.maximum !== undefined) {
            this.maxWidth.loadValue(obj.product.dimensions.width.maximum);
          }
          if (obj.product.dimensions.width.minimum !== undefined) {
            this.minWidth.loadValue(obj.product.dimensions.width.minimum);
          }
          if (obj.product.dimensions.width.percentTolerance !== undefined) {
            this.percentToleranceWidth.loadValue(obj.product.dimensions.width.percentTolerance);
          }
        }
      }
    }
    if (obj.textures !== undefined) {
      if (obj.textures.height !== undefined) {
        if (obj.textures.height.maximum !== undefined) {
          this.maxTextureHeight.loadValue(obj.textures.height.maximum);
        }
        if (obj.textures.height.minimum !== undefined) {
          this.minTextureHeight.loadValue(obj.textures.height.minimum);
        }
      }
      if (obj.textures.pbrColorRange !== undefined) {
        if (obj.textures.pbrColorRange.maximum !== undefined) {
          this.pbrColorMax.loadValue(obj.textures.pbrColorRange.maximum);
        }
        if (obj.textures.pbrColorRange.minimum !== undefined) {
          this.pbrColorMin.loadValue(obj.textures.pbrColorRange.minimum);
        }
      }
      if (obj.textures.requireDimensionsBePowersOfTwo !== undefined) {
        this.requireTextureDimensionsBePowersOfTwo.loadValue(obj.textures.requireDimensionsBePowersOfTwo);
      }
      if (obj.textures.requireDimensionsBeQuadratic !== undefined) {
        this.requireTextureDimensionsBeQuadratic.loadValue(obj.textures.requireDimensionsBeQuadratic);
      }
      if (obj.textures.width !== undefined) {
        if (obj.textures.width.maximum !== undefined) {
          this.maxTextureWidth.loadValue(obj.textures.width.maximum);
        }
        if (obj.textures.width.minimum !== undefined) {
          this.minTextureWidth.loadValue(obj.textures.width.minimum);
        }
      }
    }
    if (obj.uvs !== undefined) {
      if (obj.uvs.gutterWidth !== undefined) {
        let minResolutionNeeded = undefined as unknown as number;
        if (obj.uvs.gutterWidth.resolution256 !== undefined) {
          minResolutionNeeded = 256 / obj.uvs.gutterWidth.resolution256;
        }
        if (obj.uvs.gutterWidth.resolution512 !== undefined) {
          const resolution = 512 / obj.uvs.gutterWidth.resolution512;
          if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
            minResolutionNeeded = resolution;
          }
        }
        if (obj.uvs.gutterWidth.resolution1024 !== undefined) {
          const resolution = 1024 / obj.uvs.gutterWidth.resolution1024;
          if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
            minResolutionNeeded = resolution;
          }
        }
        if (obj.uvs.gutterWidth.resolution2048 !== undefined) {
          const resolution = 2048 / obj.uvs.gutterWidth.resolution2048;
          if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
            minResolutionNeeded = resolution;
          }
        }
        if (obj.uvs.gutterWidth.resolution4096 !== undefined) {
          const resolution = 4096 / obj.uvs.gutterWidth.resolution4096;
          if (minResolutionNeeded === undefined || resolution < minResolutionNeeded) {
            minResolutionNeeded = resolution;
          }
        }
        if (minResolutionNeeded === undefined) {
          minResolutionNeeded = -1; // skip this test
        }
        this.resolutionNeededForUvMargin.loadValue(minResolutionNeeded);
      }
      if (obj.uvs.notInverted !== undefined) {
        this.notInvertedUVs.loadValue(obj.uvs.notInverted);
      }
      if (obj.uvs.notOverlapping !== undefined) {
        this.notOverlappingUVs.loadValue(obj.uvs.notOverlapping);
      }
      if (obj.uvs.pixelsPerMeter !== undefined) {
        if (obj.uvs.pixelsPerMeter?.maximum !== undefined) {
          this.maxPixelsPerMeter.loadValue(obj.uvs.pixelsPerMeter.maximum);
        }
        if (obj.uvs.pixelsPerMeter?.minimum !== undefined) {
          this.minPixelsPerMeter.loadValue(obj.uvs.pixelsPerMeter.minimum);
        }
      }
      if (obj.uvs.requireRangeZeroToOne !== undefined) {
        this.requireUVRangeZeroToOne.loadValue(obj.uvs.requireRangeZeroToOne);
      }
    }

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
    const { promises } = await import('fs');
    const schemaText = await promises.readFile(filepath, 'utf-8');
    const schemaObj = JSON.parse(schemaText) as SchemaJSONInterface;
    this.loadFromSchemaObject(schemaObj);
  }
}
