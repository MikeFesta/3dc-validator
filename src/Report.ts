import { ReportItem, ReportItemInterface } from './ReportItem.js';

export interface ReportInterface {
  // TODO: group these into a sub-objects to match schema structure
  gltfValidator: ReportItemInterface;
  fileSize: ReportItemInterface;
  triangleCount: ReportItemInterface;
  materialCount: ReportItemInterface;
  meshCount: ReportItemInterface;
  nodeCount: ReportItemInterface;
  primitiveCount: ReportItemInterface;
  texturesPowerOfTwo: ReportItemInterface;
  texturesQuadratic: ReportItemInterface;
  textureDimensionsMaxHeight: ReportItemInterface;
  textureDimensionsMinHeight: ReportItemInterface;
  textureDimensionsMaxWidth: ReportItemInterface;
  textureDimensionsMinWidth: ReportItemInterface;
  dimensionsMax: ReportItemInterface;
  dimensionsMin: ReportItemInterface;
  productDimensionsWithinTolerance: ReportItemInterface;
  rootNodeCleanTransform: ReportItemInterface;
  getItems: () => ReportItemInterface[];
}

export class Report implements ReportInterface {
  gltfValidator = new ReportItem('glTF Validator', 'https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html');
  fileSize = new ReportItem(
    'File Size',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec01_FileFormatsAndAssetStructure/FileFormatsAndAssetStructure.md',
  );
  triangleCount = new ReportItem(
    'Triangle Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#polygonal-count',
  );
  materialCount = new ReportItem(
    'Material Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#multiple-materials-per-model',
  );
  meshCount = new ReportItem(
    'Mesh Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#maximum-number-of-draw-calls-and-triangles',
  );
  nodeCount = new ReportItem(
    'Node Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#maximum-number-of-draw-calls-and-triangles',
  );
  primitiveCount = new ReportItem(
    'Primitive Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#maximum-number-of-draw-calls-and-triangles',
  );
  texturesPowerOfTwo = new ReportItem(
    'Texture Dimensions are Powers of 2',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#powers-of-two',
  );
  texturesQuadratic = new ReportItem(
    'Texture Dimensions are Square (width=height)',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#texture-dimensions-square-vs-rectangular',
  );
  textureDimensionsMaxHeight = new ReportItem(
    'Texture Height <= Max',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMinHeight = new ReportItem(
    'Texture Height >= Min',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMaxWidth = new ReportItem(
    'Texture Width <= Max',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMinWidth = new ReportItem(
    'Texture Width >= Min',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  dimensionsMax = new ReportItem(
    'Dimensions Not Too Big',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  dimensionsMin = new ReportItem(
    'Dimensions Not Too Small',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  productDimensionsWithinTolerance = new ReportItem(
    'Dimensions Match Product',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  rootNodeCleanTransform = new ReportItem(
    'Root Node has Clean Transform',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#best-practice',
  );
  getItems() {
    return [
      this.gltfValidator,
      this.fileSize,
      this.triangleCount,
      this.materialCount,
      this.meshCount,
      this.nodeCount,
      this.primitiveCount,
      this.texturesPowerOfTwo,
      this.texturesQuadratic,
      this.textureDimensionsMaxHeight,
      this.textureDimensionsMinHeight,
      this.textureDimensionsMaxWidth,
      this.textureDimensionsMinWidth,
      this.dimensionsMax,
      this.dimensionsMin,
      this.productDimensionsWithinTolerance,
      this.rootNodeCleanTransform,
    ];
  }
}
