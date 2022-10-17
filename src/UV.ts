import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { TriangleUvInterface } from './TriangleUv.js';
import { Svg, SvgInterface } from './Svg.js';

export interface MaxMinLoadableAttributeInterface {
  max: LoadableAttributeInterface;
  min: LoadableAttributeInterface;
}

export interface UVInterface {
  invertedFaceCount: LoadableAttributeInterface;
  name: string;
  overlapCount: number;
  svgInvertedFaces: SvgInterface;
  svgLayout: SvgInterface;
  triangles: TriangleUvInterface[];
  u: MaxMinLoadableAttributeInterface;
  v: MaxMinLoadableAttributeInterface;
  isInRangeZeroToOne: () => boolean;
}

export class UV implements UVInterface {
  invertedFaceCount = new LoadableAttribute('Number of inverted faces', 0);
  svgInvertedFaces = null as unknown as Svg;
  svgLayout = null as unknown as Svg;
  name = '';
  overlapCount = 0;
  triangles = [] as TriangleUvInterface[];
  u = {
    max: new LoadableAttribute('Max U value', 0),
    min: new LoadableAttribute('Min U value', 0),
  };
  v = {
    max: new LoadableAttribute('Max V value', 0),
    min: new LoadableAttribute('Min V value', 0),
  };

  constructor(name: string, triangles: TriangleUvInterface[]) {
    this.name = name;
    this.svgInvertedFaces = new Svg(name + '-uvs-inverted');
    this.svgLayout = new Svg(name + '-uvs');
    this.triangles = triangles;

    this.calculateInvertedFaceCount();
    this.calculateMaxMinExtents();
    this.generateSvgs();
  }

  isInRangeZeroToOne = () => {
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

  private generateSvgs = () => {
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      this.svgLayout.pathData += triangle.getSvgPath('#000');
      if (triangle.inverted) {
        this.svgInvertedFaces.pathData += triangle.getSvgPath('#f00');
      }
    });
  };

  private calculateInvertedFaceCount = () => {
    let invertedFaces = 0;
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (triangle.inverted) {
        invertedFaces++;
      }
    });
    this.invertedFaceCount.loadValue(invertedFaces);
  };

  private calculateMaxMinDensity = () => {
    // Find the min/max texel density
    let maxU = undefined as unknown as number;
    let maxV = undefined as unknown as number;
    let minU = undefined as unknown as number;
    let minV = undefined as unknown as number;

    // loop through all triangles and record the min and the max
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (maxU === undefined || triangle.maxU > maxU) {
        maxU = triangle.maxU;
      }
      if (maxV === undefined || triangle.maxV > maxV) {
        maxV = triangle.maxV;
      }
      if (minU === undefined || triangle.minU < minU) {
        minU = triangle.minU;
      }
      if (minV === undefined || triangle.minV < minV) {
        minV = triangle.minV;
      }
    });

    this.u.max.loadValue(maxU);
    this.v.max.loadValue(maxV);
    this.u.min.loadValue(minU);
    this.v.min.loadValue(minV);
  };

  private calculateMaxMinExtents = () => {
    // Find the min/max U and V values
    let maxU = undefined as unknown as number;
    let maxV = undefined as unknown as number;
    let minU = undefined as unknown as number;
    let minV = undefined as unknown as number;

    // loop through all triangles and record the min and the max
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (maxU === undefined || triangle.maxU > maxU) {
        maxU = triangle.maxU;
      }
      if (maxV === undefined || triangle.maxV > maxV) {
        maxV = triangle.maxV;
      }
      if (minU === undefined || triangle.minU < minU) {
        minU = triangle.minU;
      }
      if (minV === undefined || triangle.minV < minV) {
        minV = triangle.minV;
      }
    });

    this.u.max.loadValue(maxU);
    this.v.max.loadValue(maxV);
    this.u.min.loadValue(minU);
    this.v.min.loadValue(minV);
  };
}
