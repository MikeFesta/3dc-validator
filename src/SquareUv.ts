// This represents a 2D square for a UV map
// Created for a 2D pixel grid for gutter width testing
import { TriangleUvInterface } from './TriangleUv.js';
import VertexUv, { VertexUvInterface } from './VertexUv.js';

export interface SquareUvInterface {
  a: VertexUvInterface;
  b: VertexUvInterface;
  c: VertexUvInterface;
  d: VertexUvInterface;
  islandIndex: number;
  uCenter: number;
  uMax: number;
  uMin: number;
  vCenter: number;
  vMax: number;
  vMin: number;
  overlapping: boolean;
  size: number;
  getSvgPath(color: string): string;
  overlapsTriangle(triagle: TriangleUvInterface): boolean;
  pointInside(u: number, v: number): boolean;
  vertexInside(point: VertexUvInterface): boolean;
}

export default class SquareUv implements SquareUvInterface {
  a = null as unknown as VertexUvInterface;
  b = null as unknown as VertexUvInterface;
  c = null as unknown as VertexUvInterface;
  d = null as unknown as VertexUvInterface;
  islandIndex = undefined as unknown as number;
  uCenter = undefined as unknown as number;
  uMax = undefined as unknown as number;
  uMin = undefined as unknown as number;
  vCenter = undefined as unknown as number;
  vMax = undefined as unknown as number;
  vMin = undefined as unknown as number;
  overlapping = false;
  size = undefined as unknown as number;

  constructor(uCenter: number, vCenter: number, size: number) {
    // a---b
    // | + |
    // c---d
    this.size = size;
    this.uMax = uCenter + size / 2;
    this.uMin = uCenter - size / 2;
    this.vMax = vCenter + size / 2;
    this.vMin = vCenter - size / 2;
    this.a = new VertexUv(this.uMin, this.vMin);
    this.b = new VertexUv(this.uMax, this.vMin);
    this.c = new VertexUv(this.uMin, this.vMax);
    this.d = new VertexUv(this.uMax, this.vMax);
  }

  public getSvgPath(color: string): string {
    // a>>>b
    // ^   v
    // c<<<d
    return (
      '<path fill="' +
      color +
      '" d="m ' +
      (1000 * (this.a.u + this.size / 3)).toFixed(3) +
      ' ' +
      (1000 * (this.a.v + this.size / 3)).toFixed(3) +
      ' L ' +
      (1000 * (this.b.u - this.size / 3)).toFixed(3) +
      ' ' +
      (1000 * (this.b.v + this.size / 3)).toFixed(3) +
      ' ' +
      (1000 * (this.d.u - this.size / 3)).toFixed(3) +
      ' ' +
      (1000 * (this.d.v - this.size / 3)).toFixed(3) +
      ' ' +
      (1000 * (this.c.u + this.size / 3)).toFixed(3) +
      ' ' +
      (1000 * (this.c.v - this.size / 3)).toFixed(3) +
      'Z"/>'
    );
  }

  public overlapsTriangle(triangle: TriangleUvInterface): boolean {
    // Step 1 - check triangle bounding box
    if (
      this.uMin >= triangle.maxU || // right
      this.uMax <= triangle.minU || // left
      this.vMin >= triangle.maxV || // above
      this.vMax <= triangle.minV //    below
    ) {
      return false; // not overlapping
    }
    // Step 2 - check if any points are inside
    if (this.vertexInside(triangle.a) || this.vertexInside(triangle.b) || this.vertexInside(triangle.c)) {
      return true; // one or more points is inside
    }
    // Step 3 - Check if any edges intersect (4x3=12 checks)
    if (
      triangle.lineIntersects(this.a, this.b) ||
      triangle.lineIntersects(this.b, this.d) ||
      triangle.lineIntersects(this.d, this.c) ||
      triangle.lineIntersects(this.c, this.a)
    ) {
      return true;
    }
    return false; // made it here without finding an overlap
  }

  public pointInside(u: number, v: number): boolean {
    return u < this.uMax && u > this.uMin && v < this.vMax && v > this.vMin;
  }

  public vertexInside(point: VertexUvInterface): boolean {
    return this.pointInside(point.u, point.v);
  }
}
