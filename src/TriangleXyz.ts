// This represents a 3D triangle of a primitive
import { TriangleUvInterface } from './TriangleUv.js';
import { VertexInterface } from './Vertex.js';
import { Vector3 } from '@babylonjs/core';

export interface TriangleXyzInterface {
  a: VertexInterface;
  area: number;
  b: VertexInterface;
  c: VertexInterface;
  normal: Vector3;
  uv: TriangleUvInterface;
}

export class TriangleXyz implements TriangleXyzInterface {
  a = null as unknown as VertexInterface;
  area = 0;
  b = null as unknown as VertexInterface;
  c = null as unknown as VertexInterface;
  normal = null as unknown as Vector3;
  uv = null as unknown as TriangleUvInterface;

  constructor(a: VertexInterface, b: VertexInterface, c: VertexInterface) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.calculateArea();
    this.calculateNormal();
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  private calculateArea() {
    // Compute the UV area using Heron's formula
    const positionA = new Vector3(this.a.x, this.a.y, this.a.z);
    const positionB = new Vector3(this.b.x, this.b.y, this.b.z);
    const positionC = new Vector3(this.c.x, this.c.y, this.c.z);
    const positionAB = Vector3.Distance(positionA, positionB);
    const positionAC = Vector3.Distance(positionA, positionC);
    const positionBC = Vector3.Distance(positionB, positionC);
    const positionHalfPerimeter = (positionAB + positionBC + positionAC) / 2;
    this.area = Math.sqrt(
      positionHalfPerimeter *
        (positionHalfPerimeter - positionAB) *
        (positionHalfPerimeter - positionBC) *
        (positionHalfPerimeter - positionAC),
    );
  }

  private calculateNormal() {
    const positionBminusA = new Vector3(this.b.x - this.a.x, this.b.y - this.a.y, this.b.z - this.a.z);
    const positionCminusA = new Vector3(this.c.x - this.a.x, this.c.y - this.a.y, this.c.z - this.a.z);
    this.normal = Vector3.Normalize(Vector3.Cross(positionBminusA, positionCminusA));
  }
}
