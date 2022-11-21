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
  outerEdges = [] as EdgeXyzInterface[]; // TODO: I don't think I need to keep track of this, but if we want it, look for single edges
  triangles = [] as TriangleUvInterface[];
  vertices = [] as VertexUvInterface[]; // not needed

  constructor(triangle: TriangleUvInterface) {
    this.index = triangle.islandIndex;
    this.triangles = [triangle];
  }

  hasOverlapWithIslandAtResolution = (island: UvIslandInterface, resolution: number) => {
    return false;
  };
}
