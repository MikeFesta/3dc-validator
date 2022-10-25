// This represents a 2D triangle of a UV map
import { PointUvInterface } from './PointUv.js';
import { Vector2 } from '@babylonjs/core';

export interface TriangleUvInterface {
  a: PointUvInterface;
  area: number;
  b: PointUvInterface;
  c: PointUvInterface;
  id: number;
  inverted: boolean;
  maxU: number;
  maxV: number;
  minU: number;
  minV: number;
  overlapping: boolean;
  getSvgPath(color: string): string;
  pointInside(point: PointUvInterface): boolean;
  updateOverlap(testNumber: number, triagle: TriangleUvInterface): void;
}

export class TriangleUv implements TriangleUvInterface {
  a = { u: 0, v: 0 };
  area = 0;
  b = { u: 0, v: 0 };
  c = { u: 0, v: 0 };
  id = 0;
  inverted = false;
  maxU = undefined as unknown as number;
  maxV = undefined as unknown as number;
  minU = undefined as unknown as number;
  minV = undefined as unknown as number;
  overlapping = false;

  constructor(id: number, pointArray: number[]) {
    this.id = id;
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

  public pointInside(point: PointUvInterface): boolean {
    // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
    // https://www.gamedev.net/forums/topic.asp?topic_id=295943
    const b1 = TriangleUv.isCounterClockwise(point, this.a, this.b);
    const b2 = TriangleUv.isCounterClockwise(point, this.b, this.c);
    const b3 = TriangleUv.isCounterClockwise(point, this.c, this.a);
    return b1 == b2 && b2 == b3;
  }

  // TODO: remove test number after development
  updateOverlap(testNumber: number, otherTriangle: TriangleUvInterface) {
    // Only check if no overlaps have been found so far
    if (this.overlapping == false) {
      // Step 1 - skip if it is the same triangle (fastest)
      if (this.id === otherTriangle.id) {
        return; // not overlapping
      }
      // Step 2 - skip any triangle with no area. ensures all 3 points are different
      if (this.area === 0 || otherTriangle.area === 0) {
        return; // not overlapping
      }
      // Step 3 - rectangle check using min/max values from each (fast)
      if (
        this.minU >= otherTriangle.maxU || // right
        this.maxU <= otherTriangle.minU || // left
        this.minV >= otherTriangle.maxV || // above
        this.maxV <= otherTriangle.minV //    below
      ) {
        return; // not overlapping
      }
      // Step 4 - check for shared points (order is not sorted, so 9 checks needed)
      const aMatchesA = this.a.u === otherTriangle.a.u && this.a.v === otherTriangle.a.v;
      const aMatchesB = this.a.u === otherTriangle.b.u && this.a.v === otherTriangle.b.v;
      const aMatchesC = this.a.u === otherTriangle.c.u && this.a.v === otherTriangle.c.v;
      const bMatchesA = this.b.u === otherTriangle.a.u && this.b.v === otherTriangle.a.v;
      const bMatchesB = this.b.u === otherTriangle.b.u && this.b.v === otherTriangle.b.v;
      const bMatchesC = this.b.u === otherTriangle.c.u && this.b.v === otherTriangle.c.v;
      const cMatchesA = this.c.u === otherTriangle.a.u && this.c.v === otherTriangle.a.v;
      const cMatchesB = this.c.u === otherTriangle.b.u && this.c.v === otherTriangle.b.v;
      const cMatchesC = this.c.u === otherTriangle.c.u && this.c.v === otherTriangle.c.v;

      const aMatches = aMatchesA || aMatchesB || aMatchesC;
      const bMatches = bMatchesA || bMatchesB || bMatchesC;
      const cMatches = cMatchesA || cMatchesB || cMatchesC;
      const matchCount = (aMatches ? 1 : 0) + (bMatches ? 1 : 0) + (cMatches ? 1 : 0);

      if (matchCount === 3) {
        // (fast)
        this.overlapping = true;
        otherTriangle.overlapping = true;
        return;
      } else if (matchCount === 2) {
        // (somewhat fast)
        // The non-matching points need to be on opposite sides of the edge to not overlap
        const edgeP1 = aMatches ? this.a : this.b; // if not a, it must be BC
        const edgeP2 = cMatches ? this.c : this.b; // if not c, it must be AB
        const point1 = !aMatches ? this.a : !bMatches ? this.b : this.c; // the one that doesn't match
        let point2 = otherTriangle.a;
        if (!aMatchesB && !bMatchesB && !cMatchesB) {
          point2 = otherTriangle.b;
        } else if (!aMatchesC && !bMatchesC && !cMatchesC) {
          point2 = otherTriangle.c;
        }

        // Linear equation to test which side of the line each point is on. Negative result is one side, positive is the other side
        const side1 = TriangleUv.isCounterClockwise(point1, edgeP1, edgeP2);
        const side2 = TriangleUv.isCounterClockwise(point2, edgeP1, edgeP2);

        // If both sides are the same (positive * positive) or (negative * negative), the value will be > 0
        if (side1 == side2) {
          this.overlapping = true;
          otherTriangle.overlapping = true;
          return;
        } else {
          return; // not overlapping
        }
      } else if (matchCount === 1) {
        // (somewhat slow)
        const commonPoint = aMatches ? this.a : bMatches ? this.b : this.c;
        const point1 = !aMatches ? this.a : this.b; // if a is the common point, points are [b and c]
        const point2 = !cMatches ? this.c : this.b; // if c is the common point, points are [a and b]
        // start with the assumption that other C is the common point, so check [a and b]
        let otherPoint1 = otherTriangle.a;
        let otherPoint2 = otherTriangle.b;
        if (aMatchesA && bMatchesA && cMatchesA) {
          // A is the common point, so check [b and c]
          otherPoint1 = otherTriangle.b;
          otherPoint2 = otherTriangle.c;
        } else if (aMatchesB && bMatchesB && cMatchesB) {
          // B is the common point, so check [a and c]
          otherPoint1 = otherTriangle.a;
          otherPoint2 = otherTriangle.c;
        }

        // 4a. Check if either point is inside the other triangle
        if (
          this.pointInside(otherPoint1) ||
          this.pointInside(otherPoint2) ||
          otherTriangle.pointInside(point1) ||
          otherTriangle.pointInside(point2)
        ) {
          this.overlapping = true;
          otherTriangle.overlapping = true;
          return;
        }

        // 4b. Check for edge intersections
        // For each triangle, check the edge with the non-shared vertex against the two edges that are shared
        if (
          TriangleUv.edgesIntersect(commonPoint, otherPoint1, point1, point2) ||
          TriangleUv.edgesIntersect(commonPoint, otherPoint2, point1, point2) ||
          TriangleUv.edgesIntersect(commonPoint, point1, otherPoint1, otherPoint2) ||
          TriangleUv.edgesIntersect(commonPoint, point2, otherPoint1, otherPoint2)
        ) {
          this.overlapping = true;
          otherTriangle.overlapping = true;
          return;
        }
        return; // not overlapping
      }

      // Step 5 - check if all 3 points are inside of each other (same as 4a, but with 6 checks)
      if (
        this.pointInside(otherTriangle.a) ||
        this.pointInside(otherTriangle.b) ||
        this.pointInside(otherTriangle.c) ||
        otherTriangle.pointInside(this.a) ||
        otherTriangle.pointInside(this.b) ||
        otherTriangle.pointInside(this.c)
      ) {
        this.overlapping = true;
        otherTriangle.overlapping = true;
        return;
      }

      // Step 6 - check for edge intersects (same as 4b, but with 9 checks)
      if (
        TriangleUv.edgesIntersect(this.a, this.b, otherTriangle.a, otherTriangle.b) ||
        TriangleUv.edgesIntersect(this.b, this.c, otherTriangle.a, otherTriangle.b) ||
        TriangleUv.edgesIntersect(this.c, this.a, otherTriangle.a, otherTriangle.b) ||
        TriangleUv.edgesIntersect(this.a, this.b, otherTriangle.b, otherTriangle.c) ||
        TriangleUv.edgesIntersect(this.b, this.c, otherTriangle.b, otherTriangle.c) ||
        TriangleUv.edgesIntersect(this.c, this.a, otherTriangle.b, otherTriangle.c) ||
        TriangleUv.edgesIntersect(this.a, this.b, otherTriangle.c, otherTriangle.a) ||
        TriangleUv.edgesIntersect(this.b, this.c, otherTriangle.c, otherTriangle.a) ||
        TriangleUv.edgesIntersect(this.c, this.a, otherTriangle.c, otherTriangle.a)
      ) {
        this.overlapping = true;
        otherTriangle.overlapping = true;
        return;
      }
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
    this.inverted = TriangleUv.isCounterClockwise(this.a, this.b, this.c);
  }

  private static edgesIntersect(
    p1: PointUvInterface,
    p2: PointUvInterface,
    q1: PointUvInterface,
    q2: PointUvInterface,
  ) {
    //https://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
    return (
      TriangleUv.isCounterClockwise(p1, q1, q2) != TriangleUv.isCounterClockwise(p2, q1, q2) &&
      TriangleUv.isCounterClockwise(p1, p2, q1) != TriangleUv.isCounterClockwise(p1, p2, q2)
    );
  }

  private static isCounterClockwise(p1: PointUvInterface, p2: PointUvInterface, p3: PointUvInterface) {
    return (p3.v - p1.v) * (p2.u - p1.u) > (p2.v - p1.v) * (p3.u - p1.u);
  }

  private loadMinMax() {
    this.maxU = Math.max(this.a.u, this.b.u, this.c.u);
    this.maxV = Math.max(this.a.v, this.b.v, this.c.v);
    this.minU = Math.min(this.a.u, this.b.u, this.c.u);
    this.minV = Math.min(this.a.v, this.b.v, this.c.v);
  }
}
