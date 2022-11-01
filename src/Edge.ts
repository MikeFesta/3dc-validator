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
      // Compute the angle between the normal vectors (used to check beveled edges vs hard edges)
      this.faceAngleInRadians = Vector3.GetAngleBetweenVectors(
        this.triangles[0].normal,
        this.triangles[1].normal,
        Vector3.Cross(this.triangles[0].normal, this.triangles[1].normal),
      );
      // Currently, having only 2 faces for the edge is enough to consider it manifold
      // Other factors to check for manifoldness (reserved for a future update):
      // - Opposite facing normals
      // - Surfaces connected to one vertex
      // https://cgtyphoon.com/fundamentals/types-of-non-manifold-geometry/
      this.nonManifold = false;
    } else if (this.triangles.length === 1) {
      // Open Geometry (2-manifold with boundries) - OK to have
      this.nonManifold = false;
    } else {
      // More than 2 faces can indicate these non-manifold conditions:
      // - T-type
      // - Internal Faces
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
