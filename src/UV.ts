import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { TriangleUvInterface } from './TriangleUv.js';
import { Svg, SvgInterface } from './Svg.js';

export interface MaxMinLoadableAttributeInterface {
  max: LoadableAttributeInterface;
  min: LoadableAttributeInterface;
}

export interface UVInterface {
  invertedTriangleCount: LoadableAttributeInterface;
  name: string;
  overlapCount: LoadableAttributeInterface;
  svgInvertedTriangles: SvgInterface;
  svgLayout: SvgInterface;
  triangles: TriangleUvInterface[];
  u: MaxMinLoadableAttributeInterface;
  v: MaxMinLoadableAttributeInterface;
  isInRangeZeroToOne: () => boolean;
}

export class UV implements UVInterface {
  invertedTriangleCount = new LoadableAttribute('Number of inverted triangles', 0);
  svgInvertedTriangles = null as unknown as Svg;
  svgLayout = null as unknown as Svg;
  name = '';
  overlapCount = new LoadableAttribute('Number of overlapping triangles', 0);
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
    this.svgInvertedTriangles = new Svg(name + '-uvs-inverted');
    this.svgLayout = new Svg(name + '-uvs');
    this.triangles = triangles;

    this.calculateInvertedTriangleCount();
    this.calculateMaxMinExtents();
    this.calculateOverlapCount();
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

  private calculateInvertedTriangleCount = () => {
    let invertedTriangles = 0;
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (triangle.inverted) {
        invertedTriangles++;
      }
    });
    this.invertedTriangleCount.loadValue(invertedTriangles);
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

  private calculateOverlapCount = () => {
    // Test each triangle against each other - O(n*n)
    // This will be too slow for large models. tried testing a photogrammetry scan with 250k tris and had to cancel.
    // would have been about 10 hours
    // on the plus side, only took 10 seconds for the stained glass lamp
    // how can I cut down on the number of checks? already pulling the ones marked overlapping
    // could just report fail instead of the total count to stop as soon as one is found
    // maybe force pass/fail without count if tri-count is > than some limit, perhaps 10k
    // could also stop counting after 100 overlaps found
    let i = 0;
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      this.triangles.forEach((triangleToCompare: TriangleUvInterface) => {
        triangle.updateOverlap(i, triangleToCompare);
        i++; // TODO: remove after development and testing
      });
    });
    let overlappingTrianglesCount = 0;
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      if (triangle.overlapping) {
        overlappingTrianglesCount++;
      }
    });
    this.overlapCount.loadValue(overlappingTrianglesCount);
  };

  private generateSvgs = () => {
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      this.svgLayout.pathData += triangle.getSvgPath('#000');
      if (triangle.inverted) {
        this.svgInvertedTriangles.pathData += triangle.getSvgPath('#f00');
      }
    });
  };
}
