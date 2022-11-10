import { EdgeXyzInterface } from './EdgeXyz.js';
import { TriangleUvInterface } from './TriangleUv.js';
import { VertexUvInterface } from './VertexUv.js';

export interface UvIslandInterface {
  outerEdges: EdgeXyzInterface[];
  triangles: TriangleUvInterface[];
  vertices: VertexUvInterface[];
  hasOverlapWithIslandAtResolution: (island: UvIslandInterface, resolution: number) => boolean;
}

export class UvIslandInterface implements UvIslandInterface {
  outerEdges = [] as EdgeXyzInterface[];
  triangles = [] as TriangleUvInterface[];
  vertices = [] as VertexUvInterface[];

  constructor(triangles: TriangleUvInterface[]) {
    this.triangles = triangles;
    this.calculateVertexIndices();
    this.calculateOuterEdges();
  }

  hasOverlapWithIslandAtResolution = (island: UvIslandInterface, resolution: number) => {
    return false;
  };

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////
  private calculateOuterEdges = () => {
    // TODO
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      // TODO: check for matching vertices in the UV space
    });
  };
  private calculateVertexIndices = () => {
    // TODO
    this.triangles.forEach((triangle: TriangleUvInterface) => {
      // TODO: check for matching vertices in the UV space
    });
  };
}
