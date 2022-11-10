export interface VertexUvInterface {
  index: number;
  u: number;
  v: number;
  checkForMatch(vertex: VertexUvInterface): boolean;
}

export default class VertexUv implements VertexUvInterface {
  index = undefined as unknown as number;
  u = undefined as unknown as number;
  v = undefined as unknown as number;

  constructor(u: number, v: number) {
    this.u = u;
    this.v = v;
  }

  public checkForMatch(vertex: VertexUvInterface): boolean {
    const precision = 6;
    const e = 10 ^ precision;
    if (Math.round(vertex.u * e) == Math.round(this.u * e) && Math.round(vertex.v * e) == Math.round(this.v * e)) {
      return true;
    }
    return false;
  }
}
