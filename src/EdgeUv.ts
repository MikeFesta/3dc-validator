import { TriangleUvInterface } from './TriangleUv';
import { VertexUvInterface } from './VertexUv';

export interface EdgeUvInterface {
  index: number;
  shared: boolean;
  triangles: TriangleUvInterface[];
  vertexA: VertexUvInterface;
  vertexB: VertexUvInterface;
  zeroLength: boolean;
  calculateAttributes(): void;
  checkForMatch(edge: EdgeUvInterface): boolean;
}

export default class EdgeUv implements EdgeUvInterface {
  index = undefined as unknown as number;
  shared = undefined as unknown as boolean;
  triangles = [] as TriangleUvInterface[];
  vertexA = null as unknown as VertexUvInterface;
  vertexB = null as unknown as VertexUvInterface;
  zeroLength = false;

  constructor(a: VertexUvInterface, b: VertexUvInterface) {
    this.vertexA = a;
    this.vertexB = b;
  }

  public calculateAttributes(): void {
    this.shared = this.triangles.length > 1;
    // if both vertices are in the same position, it has zero length
    // TODO: V2 Report zero length UV edges
    this.zeroLength = this.vertexA.index === this.vertexB.index;
  }

  public checkForMatch(edge: EdgeUvInterface): boolean {
    // Treat AB and BA as equal by testing min/max of the index
    if (
      Math.min(this.vertexA.index, this.vertexB.index) === Math.min(edge.vertexA.index, edge.vertexB.index) &&
      Math.max(this.vertexA.index, this.vertexB.index) === Math.max(edge.vertexA.index, edge.vertexB.index)
    ) {
      return true;
    }
    return false;
  }
}
