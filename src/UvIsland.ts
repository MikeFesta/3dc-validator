import { TriangleUvInterface } from './TriangleUv.js';

export interface UvIslandInterface {
  index: number;
  triangles: TriangleUvInterface[];
}

export default class UvIsland implements UvIslandInterface {
  index = undefined as unknown as number;
  triangles = [] as TriangleUvInterface[];

  constructor(triangle: TriangleUvInterface) {
    this.index = triangle.islandIndex;
    this.triangles = [triangle];
  }
}
