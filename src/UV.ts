import EdgeUv, { EdgeUvInterface } from './EdgeUv.js';
import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { Svg, SvgInterface } from './Svg.js';
import SquareUv, { SquareUvInterface } from './SquareUv.js';
import TriangleUv, { TriangleUvInterface } from './TriangleUv.js';
import UvIsland, { UvIslandInterface } from './UvIsland.js';
import VertexUv, { VertexUvInterface } from './VertexUv.js';

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
      // TODO: Optimization - only check pixels within the triangle's min/max instead of the whole pixel grid
      this.pixelGrid.forEach((gridPixel: SquareUvInterface) => {
        if (gridPixel.overlapsTriangle(triangle)) {
          if (gridPixel.islandIndex === undefined) {
            gridPixel.islandIndex = triangle.islandIndex;
          } else if (gridPixel.islandIndex != triangle.islandIndex) {
            gridPixel.overlapping = true;
            // TODO: Optimization - can return once a collision is found
            collisionFound = true; // change to 'return' after testing with svgs
          }
        }
      });
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

  private calculateEdges = (triangles: TriangleUvInterface[], vertices: VertexUvInterface[]): EdgeUvInterface[] => {
    // TODO: Cleanup - this is not is use, moved to Primitive. Confirm nothing is missing
    let edges = [] as EdgeUvInterface[];

    triangles.forEach((triangle: TriangleUvInterface) => {
      let edgeAB = new EdgeUv(triangle.a, triangle.b);
      let edgeBC = new EdgeUv(triangle.b, triangle.c);
      let edgeCA = new EdgeUv(triangle.c, triangle.a);

      if (edges.length === 0) {
        // assume initial edges are not the same
        edgeAB.index = 0;
        edges.push(edgeAB);
        edgeBC.index = 1;
        edges.push(edgeBC);
        edgeCA.index = 2;
        edges.push(edgeCA);
      } else {
        for (let i = 0; i < edges.length; i++) {
          if (edgeAB.index === undefined && edges[i].checkForMatch(edgeAB)) {
            edgeAB = edges[i];
          }
          if (edgeBC.index === undefined && edges[i].checkForMatch(edgeBC)) {
            edgeBC = edges[i];
          }
          if (edgeCA.index === undefined && edges[i].checkForMatch(edgeCA)) {
            edgeCA = edges[i];
          }
        }

        let nextIndex = edges.length;
        if (edgeAB.index === undefined) {
          edgeAB.index = nextIndex;
          edges.push(edgeAB);
          nextIndex++;
        }
        if (edgeBC.index === undefined) {
          edgeBC.index = nextIndex;
          edges.push(edgeBC);
          nextIndex++;
        }
        if (edgeCA.index === undefined) {
          edgeCA.index = nextIndex;
          edges.push(edgeCA);
        }
      }
    });

    return edges;
  };

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
    // TODO: Testing - may not working correctly. most triangles in diffuser.glb were marked overlapping, but there should be zero
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

  private calculateVertices = (triangles: TriangleUvInterface[]): VertexUvInterface[] => {
    // TODO: Cleanup - this is not is use, moved to Primitive. Confirm nothing is missing
    let vertices = [] as VertexUvInterface[];

    triangles.forEach((triangle: TriangleUvInterface) => {
      let vertexA = new VertexUv(triangle.a.u, triangle.a.v);
      let vertexB = new VertexUv(triangle.a.u, triangle.a.v);
      let vertexC = new VertexUv(triangle.a.u, triangle.a.v);

      if (vertices.length === 0) {
        // Assume the first triangle has 3 distinct points
        vertexA.index = 0;
        vertices.push(vertexA);
        vertexB.index = 1;
        vertices.push(vertexB);
        vertexC.index = 2;
        vertices.push(vertexC);
      } else {
        // search all existing points for duplicates O(n * log(n))
        for (let i = 0; i < vertices.length; i++) {
          if (vertexA.index === undefined && vertices[i].checkForMatch(vertexA)) {
            vertexA = vertices[i];
          }
          if (vertexB.index === undefined && vertices[i].checkForMatch(vertexB)) {
            vertexB = vertices[i];
          }
          if (vertexC.index === undefined && vertices[i].checkForMatch(vertexC)) {
            vertexC = vertices[i];
          }
        }
        // Insert new vertices if they are unique
        let nextIndex = vertices.length;
        if (vertexA.index === undefined) {
          vertexA.index = nextIndex;
          vertices.push(vertexA);
          nextIndex++;
        }
        if (vertexB.index === undefined) {
          vertexB.index = nextIndex;
          vertices.push(vertexB);
          nextIndex++;
        }
        if (vertexC.index === undefined) {
          vertexC.index = nextIndex;
          vertices.push(vertexC);
        }
      }
    });

    return vertices;
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
