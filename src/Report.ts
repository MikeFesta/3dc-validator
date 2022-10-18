import { ReportItem, ReportItemInterface } from './ReportItem.js';

export interface ReportInterface {
  dimensionsMax: ReportItemInterface;
  dimensionsMin: ReportItemInterface;
  fileSize: ReportItemInterface;
  gltfValidator: ReportItemInterface;
  materialCount: ReportItemInterface;
  meshCount: ReportItemInterface;
  nodeCount: ReportItemInterface;
  pbrColorMax: ReportItemInterface;
  pbrColorMin: ReportItemInterface;
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
  uvsInverted: ReportItemInterface;
  uvsInZeroToOneRange: ReportItemInterface;
  uvsOverlap: ReportItemInterface;
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
  pbrColorMax = new ReportItem(
    'Maximum HSV color value for PBR safe colors',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#pbr-colors-and-values',
  );
  pbrColorMin = new ReportItem(
    'Minimum HSV color value for PBR safe colors',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec05_MaterialsAndTextures/MaterialsAndTextures.md#pbr-colors-and-values',
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
  uvsInverted = new ReportItem(
    'Inverted UVs',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md',
  );
  uvsInZeroToOneRange = new ReportItem(
    'UVs in 0 to 1 Range',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md',
  );
  uvsOverlap = new ReportItem(
    'Overlapping UVs',
    'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/full-version/sec04_UVCoordinates/UVCoordinates.md#overlapping-uvs-considerations-in-an-atlas-layout',
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
      this.pbrColorMax,
      this.pbrColorMin,
      this.dimensionsMax,
      this.dimensionsMin,
      this.productDimensionsWithinTolerance,
      this.rootNodeCleanTransform,
      this.uvsInZeroToOneRange,
      this.pixelsPerMeterMax,
      this.pixelsPerMeterMin,
      this.uvsInverted,
      this.uvsOverlap,
    ];
  }
}
