import { ReportItem, ReportItemInterface } from './ReportItem.js';

export interface ReportInterface {
  // TODO: group these into a sub-objects to match schema structure
  gltfValidator: ReportItemInterface;
  fileSize: ReportItemInterface;
  triangleCount: ReportItemInterface;
  materialCount: ReportItemInterface;
  texturesPowerOfTwo: ReportItemInterface;
  texturesQuadratic: ReportItemInterface;
  textureDimensionsMaxHeight: ReportItemInterface;
  textureDimensionsMinHeight: ReportItemInterface;
  textureDimensionsMaxWidth: ReportItemInterface;
  textureDimensionsMinWidth: ReportItemInterface;
  dimensionsMax: ReportItemInterface;
  dimensionsMin: ReportItemInterface;
  productDimensionsWithinTolerance: ReportItemInterface;
  getItems: () => ReportItemInterface[];
}

export class Report implements ReportInterface {
  gltfValidator = new ReportItem('glTF Validator');
  fileSize = new ReportItem('File Size');
  triangleCount = new ReportItem('Triangle Count');
  materialCount = new ReportItem('Material Count');
  texturesPowerOfTwo = new ReportItem('Texture Dimensions are Powers of 2');
  texturesQuadratic = new ReportItem('Texture Dimensions are Quadratic (width=height)');
  textureDimensionsMaxHeight = new ReportItem('Texture Height <= Max');
  textureDimensionsMinHeight = new ReportItem('Texture Height >= Min');
  textureDimensionsMaxWidth = new ReportItem('Texture Width <= Max');
  textureDimensionsMinWidth = new ReportItem('Texture Width >= Min');
  dimensionsMax = new ReportItem('Dimensions Not Too Big');
  dimensionsMin = new ReportItem('Dimensions Not Too Small');
  productDimensionsWithinTolerance = new ReportItem('Dimensions Match Product');
  getItems() {
    return [
      this.gltfValidator,
      this.fileSize,
      this.triangleCount,
      this.materialCount,
      this.texturesPowerOfTwo,
      this.texturesQuadratic,
      this.textureDimensionsMaxHeight,
      this.textureDimensionsMinHeight,
      this.textureDimensionsMaxWidth,
      this.textureDimensionsMinWidth,
      this.dimensionsMax,
      this.dimensionsMin,
      this.productDimensionsWithinTolerance,
    ];
  }
}
