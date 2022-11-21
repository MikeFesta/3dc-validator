import { EdgeXyzInterface } from './EdgeXyz.js';
import { TriangleUvInterface } from './TriangleUv.js';
import { VertexUvInterface } from './VertexUv.js';

export interface UvIslandInterface {
  index: number;
  outerEdges: EdgeXyzInterface[];
  triangles: TriangleUvInterface[];
  vertices: VertexUvInterface[];
  hasOverlapWithIslandAtResolution: (island: UvIslandInterface, resolution: number) => boolean;
}

export default class UvIsland implements UvIslandInterface {
  index = undefined as unknown as number;
  triangles = [] as TriangleUvInterface[];
  // TODO: Cleanup - These didn't end up being needed
  outerEdges = [] as EdgeXyzInterface[]; // remove
  vertices = [] as VertexUvInterface[]; // remove

  constructor(triangle: TriangleUvInterface) {
    this.index = triangle.islandIndex;
    this.triangles = [triangle];
  }

  hasOverlapWithIslandAtResolution = (island: UvIslandInterface, resolution: number) => {
    return false;
  };
}
