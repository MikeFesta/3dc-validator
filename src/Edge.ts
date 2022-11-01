import { float, Vector3 } from '@babylonjs/core';
import { TriangleXyzInterface } from './TriangleXyz';
import { VertexInterface } from './Vertex';

export interface EdgeInterface {
  faceAngleInRadians: float;
  index: number;
  nonManifold: boolean;
  triangles: TriangleXyzInterface[];
  vertexA: VertexInterface;
  vertexB: VertexInterface;
  calculateAttributes(): void;
  checkForMatch(edge: EdgeInterface): boolean;
}

export default class Edge implements EdgeInterface {
  faceAngleInRadians = undefined as unknown as number;
  index = undefined as unknown as number;
  nonManifold = undefined as unknown as boolean;
  triangles = [] as TriangleXyzInterface[];
  vertexA = null as unknown as VertexInterface;
  vertexB = null as unknown as VertexInterface;

  constructor(a: VertexInterface, b: VertexInterface) {
    this.vertexA = a;
    this.vertexB = b;
  }

  public calculateAttributes(): void {
    if (this.triangles.length === 2) {
      // Compute the angle between the triangle normal vectors
      this.faceAngleInRadians = Vector3.GetAngleBetweenVectors(
        this.triangles[0].normal,
        this.triangles[1].normal,
        Vector3.Cross(this.triangles[0].normal, this.triangles[1].normal),
      );
      // TODO: may be other factors to check for manifoldness
      // https://cgtyphoon.com/fundamentals/types-of-non-manifold-geometry/
      this.nonManifold = false;
    } else {
      this.nonManifold = true;
    }
  }

  public checkForMatch(edge: EdgeInterface): boolean {
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
