// This represents a 3D triangle of a primitive
import { PointXyzInterface } from './PointXyz.js';
import { TriangleUvInterface } from './TriangleUv.js';
import { Vector3 } from '@babylonjs/core';

export interface TriangleXyzInterface {
  a: PointXyzInterface;
  area: number;
  b: PointXyzInterface;
  c: PointXyzInterface;
  uv: TriangleUvInterface;
}

export class TriangleXyz implements TriangleXyzInterface {
  a = { x: 0, y: 0, z: 0 };
  area = 0;
  b = { x: 0, y: 0, z: 0 };
  c = { x: 0, y: 0, z: 0 };
  uv = null as unknown as TriangleUvInterface;

  constructor(pointArray: number[]) {
    if (pointArray.length == 9) {
      this.a.x = pointArray[0];
      this.a.y = pointArray[1];
      this.a.z = pointArray[2];
      this.b.x = pointArray[3];
      this.b.y = pointArray[4];
      this.b.z = pointArray[5];
      this.c.x = pointArray[6];
      this.c.y = pointArray[7];
      this.c.z = pointArray[8];
      this.calculateArea();
    }
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
}
