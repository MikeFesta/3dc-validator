import { ReportItem, ReportItemInterface } from './ReportItem.js';

export interface ReportInterface {
  // TODO: group these into a sub-objects to match schema structure
  dimensionsMax: ReportItemInterface;
  dimensionsMin: ReportItemInterface;
  fileSize: ReportItemInterface;
  gltfValidator: ReportItemInterface;
  materialCount: ReportItemInterface;
  meshCount: ReportItemInterface;
  nodeCount: ReportItemInterface;
  pixelsPerMeterMax: ReportItemInterface;
  pixelsPerMeterMin: ReportItemInterface;
  primitiveCount: ReportItemInterface;
  productDimensionsWithinTolerance: ReportItemInterface;
  rootNodeCleanTransform: ReportItemInterface;
  textureDimensionsMaxHeight: ReportItemInterface;
  textureDimensionsMaxWidth: ReportItemInterface;
  textureDimensionsMinHeight: ReportItemInterface;
  textureDimensionsMinWidth: ReportItemInterface;
  texturesPowerOfTwo: ReportItemInterface;
  texturesQuadratic: ReportItemInterface;
  triangleCount: ReportItemInterface;
  uvsInZeroToOneRange: ReportItemInterface;
  getItems: () => ReportItemInterface[];
}

export class Report implements ReportInterface {
  dimensionsMax = new ReportItem(
    'Dimensions Not Too Big',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  dimensionsMin = new ReportItem(
    'Dimensions Not Too Small',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  fileSize = new ReportItem(
    'File Size',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec01_FileFormatsAndAssetStructure/FileFormatsAndAssetStructure.md',
  );
  gltfValidator = new ReportItem('glTF Validator', 'https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html');
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
  pixelsPerMeterMax = new ReportItem(
    'Maximum Pixels per Meter',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  pixelsPerMeterMin = new ReportItem(
    'Minimum Pixels per Meter',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  primitiveCount = new ReportItem(
    'Primitive Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#maximum-number-of-draw-calls-and-triangles',
  );
  productDimensionsWithinTolerance = new ReportItem(
    'Dimensions Match Product',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec02_CoordinateSystemAndScaleUnit/CoordinateSystemAndScaleUnit.md',
  );
  rootNodeCleanTransform = new ReportItem(
    'Root Node has Clean Transform',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#best-practice',
  );
  textureDimensionsMaxHeight = new ReportItem(
    'Texture Height <= Max',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMaxWidth = new ReportItem(
    'Texture Width <= Max',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMinHeight = new ReportItem(
    'Texture Height >= Min',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  textureDimensionsMinWidth = new ReportItem(
    'Texture Width >= Min',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec99_PublishingTargets/PublishingTargets.md#3d-commerce-publishing-guidelines-v10',
  );
  texturesPowerOfTwo = new ReportItem(
    'Texture Dimensions are Powers of 2',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#powers-of-two',
  );
  texturesQuadratic = new ReportItem(
    'Texture Dimensions are Square (width=height)',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#texture-dimensions-square-vs-rectangular',
  );
  triangleCount = new ReportItem(
    'Triangle Count',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec03_Geometry/Geometry.md#polygonal-count',
  );
  uvsInZeroToOneRange = new ReportItem(
    'UVs in 0 to 1 Range',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md',
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
      this.uvsInZeroToOneRange,
      this.pixelsPerMeterMax,
      this.pixelsPerMeterMin,
    ];
  }
}
