// This represents a 2D triangle of a UV map
import { PointUvInterface } from './PointUv.js';
import { Vector2 } from '@babylonjs/core';

export interface TriangleUvInterface {
  a: PointUvInterface;
  area: number;
  b: PointUvInterface;
  c: PointUvInterface;
  inverted: boolean;
  maxU: number;
  maxV: number;
  minU: number;
  minV: number;
  overlapping: boolean;
  getSvgPath(color: string): string;
  updateOverlap(triagle: TriangleUvInterface): void;
}

export class TriangleUv implements TriangleUvInterface {
  a = { u: 0, v: 0 };
  area = 0;
  b = { u: 0, v: 0 };
  c = { u: 0, v: 0 };
  inverted = false;
  maxU = undefined as unknown as number;
  maxV = undefined as unknown as number;
  minU = undefined as unknown as number;
  minV = undefined as unknown as number;
  overlapping = false;

  constructor(pointArray: number[]) {
    if (pointArray.length == 6) {
      this.a.u = pointArray[0];
      this.a.v = pointArray[1];
      this.b.u = pointArray[2];
      this.b.v = pointArray[3];
      this.c.u = pointArray[4];
      this.c.v = pointArray[5];
      this.calculateArea();
      this.calculateInverted();
      this.loadMinMax();
    }
  }

  getSvgPath(color: string): string {
    return (
      '<path fill="' +
      color +
      '" d="m ' +
      (1000 * this.a.u).toFixed(3) +
      ' ' +
      (1000 * this.a.v).toFixed(3) +
      ' L ' +
      (1000 * this.b.u).toFixed(3) +
      ' ' +
      (1000 * this.b.v).toFixed(3) +
      ' ' +
      (1000 * this.c.u).toFixed(3) +
      ' ' +
      (1000 * this.c.v).toFixed(3) +
      'Z"/>'
    );
  }
  updateOverlap(otherTriangle: TriangleUvInterface) {
    // TODO: O.13 - Overlapping UVs
    // Only check if no overlaps have been found so far
    if (this.overlapping == false) {
      // Step 1 - quick rectangle check using min/max values from each (fastest)
      // Step 2 - check for shared points
      // * 3 shared points - this.overlapping = true; (fast)
      // * 2 shared points - the 3rd points need to be on opposite sides of the edge (fast)
      // * 1 shared point - check each set of 2 points to see if they are inside each other, then check for edge intersects (slow)
      // * 0 shared points - check each set of 3 points to see if they are inside each other, then check for edge intersects (slowest)
    }
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  private calculateArea() {
    // Compute the UV area using Heron's formula
    // Note: units are a percentage of the 0-1 UV area
    const uvA = new Vector2(this.a.u, this.a.v);
    const uvB = new Vector2(this.b.u, this.b.v);
    const uvC = new Vector2(this.c.u, this.c.v);
    const uvAB = Vector2.Distance(uvA, uvB);
    const uvAC = Vector2.Distance(uvA, uvC);
    const uvBC = Vector2.Distance(uvB, uvC);
    const uvHalfPerimeter = (uvAB + uvBC + uvAC) / 2;
    this.area = Math.sqrt(
      uvHalfPerimeter * (uvHalfPerimeter - uvAB) * (uvHalfPerimeter - uvBC) * (uvHalfPerimeter - uvAC),
    );
  }
  private calculateInverted() {
    // https://stackoverflow.com/questions/17592800/how-to-find-the-orientation-of-three-points-in-a-two-dimensional-space-given-coo
    if ((this.b.v - this.a.v) * (this.c.u - this.b.u) - (this.b.u - this.a.u) * (this.c.v - this.b.v) < 0) {
      this.inverted = true;
    }
  }
  private getMaxOf2(first: number, second: number): number {
    if (first >= second) {
      return first;
    }
    return second;
  }
  private getMaxOf3(first: number, second: number, third: number): number {
    return this.getMaxOf2(this.getMaxOf2(first, second), third);
  }
  private getMinOf2(first: number, second: number): number {
    if (first <= second) {
      return first;
    }
    return second;
  }
  private getMinOf3(first: number, second: number, third: number): number {
    return this.getMinOf2(this.getMinOf2(first, second), third);
  }
  private loadMinMax() {
    this.maxU = this.getMaxOf3(this.a.u, this.b.u, this.c.u);
    this.maxV = this.getMaxOf3(this.a.v, this.b.v, this.c.v);
    this.minU = this.getMinOf3(this.a.u, this.b.u, this.c.u);
    this.minV = this.getMinOf3(this.a.v, this.b.v, this.c.v);
  }
}
