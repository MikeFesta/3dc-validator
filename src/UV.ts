import { EdgeUvInterface } from './EdgeUv.js';
import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { Svg, SvgInterface } from './Svg.js';
import SquareUv, { SquareUvInterface } from './SquareUv.js';
import { TriangleUvInterface } from './TriangleUv.js';
import UvIsland, { UvIslandInterface } from './UvIsland.js';
import { VertexUvInterface } from './VertexUv.js';

export interface MaxMinLoadableAttributeInterface {
  max: LoadableAttributeInterface;
  min: LoadableAttributeInterface;
}

export interface UVInterface {
  edges: EdgeUvInterface[];
  invertedTriangleCount: LoadableAttributeInterface;
  islands: UvIslandInterface[];
  name: string;
  overlapCount: LoadableAttributeInterface;
  svgGutterOverlaps: SvgInterface;
  svgInvertedTriangles: SvgInterface;
  svgLayout: SvgInterface;
  triangles: TriangleUvInterface[];
  pixelGrid: SquareUvInterface[];
  u: MaxMinLoadableAttributeInterface;
  v: MaxMinLoadableAttributeInterface;
  vertices: VertexUvInterface[];
  isInRangeZeroToOne: () => boolean;
  hasEnoughMarginAtResolution: (resolution: number) => boolean;
}

export class UV implements UVInterface {
  edges = [] as EdgeUvInterface[];
  invertedTriangleCount = new LoadableAttribute('Number of inverted triangles', 0);
  islands = [] as UvIslandInterface[];
  svgGutterOverlaps = null as unknown as SvgInterface;
  svgInvertedTriangles = null as unknown as Svg;
  svgLayout = null as unknown as Svg;
  name = '';
  overlapCount = new LoadableAttribute('Number of overlapping triangles', 0);
  triangles = [] as TriangleUvInterface[];
  pixelGrid = [] as SquareUvInterface[];
  u = {
    max: new LoadableAttribute('Max U value', 0),
    min: new LoadableAttribute('Min U value', 0),
  };
  v = {
    max: new LoadableAttribute('Max V value', 0),
    min: new LoadableAttribute('Min V value', 0),
  };
  vertices = [] as VertexUvInterface[];

  constructor(name: string, triangles: TriangleUvInterface[]) {
    this.name = name;
    // TODO: Cleanup - take out svgs for V1
    this.svgInvertedTriangles = new Svg(name + '-uvs-inverted');
    this.svgLayout = new Svg(name + '-uvs');
    this.triangles = triangles;

    // TODO: Cleanup - have these functions take in and return data instead of using this.
    this.calculateUvIslands(this.triangles);
    this.calculateInvertedTriangleCount(); // TODO: pass triangles to each of these as well. it make it more clear that they need to be initialized
    this.calculateMaxMinExtents();
    this.calculateOverlapCount();
    this.generateSvgs();
  }

  public isInRangeZeroToOne = () => {
    return (
      (this.u.max.value as number) <= 1 &&
      (this.u.min.value as number) >= 0 &&
      (this.v.max.value as number) <= 1 &&
      (this.v.min.value as number) >= 0
    );
  };

  public hasEnoughMarginAtResolution = (resolution: number): boolean => {
    // Quantize the UV area based on the given resolution in pixels.
    // If a pixel grid is overlapped more than once, there is a collision and therefore not enough margin
    // [+][+][+][+]
    // [+][+][+][+]
    // [+][+][+][+]
    // [+][+][+][+]
    this.pixelGrid = new Array(resolution * resolution);
    const pixelSize = 1 / resolution;
    for (let i = 0; i < this.pixelGrid.length; i++) {
      const row = Math.floor(i / resolution);
      const column = i % resolution;
      const uCenter = row * pixelSize + pixelSize / 2;
      const vCenter = column * pixelSize + pixelSize / 2;
      this.pixelGrid[i] = new SquareUv(uCenter, vCenter, pixelSize * 2);
      // Pixel size is 2x the grid spacing to catch cases where triangles are separated by a grid line
      // a---b
      // |[+]|
      // c---d

      // a---b
      // |[+]|+][+][+]
      // c---d+][+][+]
      //  [+][+][+][+]
      //  [+][+][+][+]

      // [+a---b+][+]
      // [+|[+]|+][+]
      // [+c---d+][+]
      // [+][+][+][+]

      // Without upscaling, close triangles separated at a grid line boundry (such as 0.5) wouldn't be caught
      // +--+ | +--+
      // | /  |  \ |
      // |/   |   \|
      // +   0.5   +
    }

    let collisionFound = false; // TODO: Cleanup - can be removed

    // check each triangle for overlaps
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      // only check pixels within the triangle's min/max (+ margin)
      let gridXStart = Math.floor((triangle.minU - pixelSize / 2) * resolution);
      if (gridXStart < 0) {
        gridXStart = 0;
      }
      let gridXEnd = Math.ceil((triangle.maxU + pixelSize / 2) * resolution);
      if (gridXEnd > resolution) {
        gridXEnd = resolution;
      }
      let gridYStart = Math.floor((triangle.minV - pixelSize / 2) * resolution);
      if (gridYStart < 0) {
        gridYStart = 0;
      }
      let gridYEnd = Math.ceil((triangle.maxV + pixelSize / 2) * resolution);
      if (gridYEnd > resolution) {
        gridYEnd = resolution;
      }
      for (let i = gridXStart; i < gridXEnd; i++) {
        for (let j = gridYStart; j < gridYEnd; j++) {
          const index = i * resolution + j;
          const gridPixel = this.pixelGrid[index];
          if (gridPixel.overlapsTriangle(triangle)) {
            if (gridPixel.islandIndex === undefined) {
              gridPixel.islandIndex = triangle.islandIndex;
            } else if (gridPixel.islandIndex != triangle.islandIndex) {
              gridPixel.overlapping = true;
              // TODO: Optimization - can return once a collision is found
              collisionFound = true; // change to 'return' after testing with svgs
            }
          }
        }
      }
    });

    // TODO: Cleanup - remove svg after testing
    this.svgGutterOverlaps = new Svg('gutter-overlaps');

    this.pixelGrid.forEach((pixel: SquareUvInterface) => {
      // just trying to get a consistent, different color for each island
      let svgColor = 'eeeeee';
      if (pixel.overlapping) {
        svgColor = 'ff0000';
      } else if (pixel.islandIndex !== undefined) {
        const uniqueColor = ((pixel.islandIndex + 1) * 100000) % 16777215;
        svgColor = uniqueColor.toString(16);
        svgColor = svgColor.padStart(6, '0');
        svgColor = '00' + svgColor.substring(2, 6); // remove red to make overlaps stand out
      }
      this.svgGutterOverlaps.pathData += pixel.getSvgPath('#' + svgColor);
    });

    return !collisionFound;
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
    // TODO: Optimize - see if this can be sped up
    // Test each triangle against each other - O(n*n)
    // This will be too slow for large models. tried testing a photogrammetry scan with 250k tris and had to cancel.
    // would have been about 10 hours
    // on the plus side, only took 10 seconds for the stained glass lamp
    // how can I cut down on the number of checks? already pulling the ones marked overlapping
    // could just report fail instead of the total count to stop as soon as one is found
    // maybe force pass/fail without count if tri-count is > than some limit, perhaps 10k
    // could also stop counting after 100 overlaps found
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      this.triangles.forEach((triangleToCompare: TriangleUvInterface) => {
        if (triangle.overlapsTriangle(triangleToCompare)) {
          triangle.overlapping = true;
          triangleToCompare.overlapping = true;
        }
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

  private calculateUvIslands = (triangles: TriangleUvInterface[]) => {
    triangles.forEach((triangle: TriangleUvInterface) => {
      let existingIsland = false;
      this.islands.forEach((island: UvIslandInterface) => {
        if (island.index === triangle.islandIndex) {
          existingIsland = true;
          island.triangles.push(triangle);
        }
      });
      if (!existingIsland) {
        this.islands.push(new UvIsland(triangle));
      }
    });
  };

  private generateSvgs = () => {
    // TODO: Cleanup - remove SVGs until V2
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      this.svgLayout.pathData += triangle.getSvgPath('#000');
      if (triangle.inverted) {
        this.svgInvertedTriangles.pathData += triangle.getSvgPath('#f00');
      }
    });
  };
}
