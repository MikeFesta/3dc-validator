import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { Material, MaterialInterface } from './Material.js';
import { UV, UVInterface } from './UV.js';
import { AbstractMesh } from '@babylonjs/core';
import { TriangleUv } from './TriangleUv.js';
import { TriangleXyz, TriangleXyzInterface } from './TriangleXyz.js';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';

export interface PrimitiveInterface {
  material: MaterialInterface;
  maxDensity: LoadableAttributeInterface;
  minDensity: LoadableAttributeInterface;
  name: string;
  triangles: TriangleXyzInterface[];
  uv: UVInterface;
}

export class Primitive implements PrimitiveInterface {
  material = null as unknown as MaterialInterface;
  maxDensity = new LoadableAttribute('Highest pixel density', 0);
  minDensity = new LoadableAttribute('Lowest pixel density', 0);
  name = '';
  triangles = [] as TriangleXyzInterface[];
  uv = null as unknown as UVInterface;

  constructor(mesh: AbstractMesh) {
    if (mesh.material) {
      this.material = new Material(mesh.material);
    }
    this.name = mesh.name;

    // Copy triangle data to internal representation
    const faceIndicies = mesh.getIndices();
    let uvTriangles = [];
    if (faceIndicies && faceIndicies.length > 0) {
      let maxDensity = undefined as unknown as number;
      let minDensity = undefined as unknown as number;
      const uvData = mesh.getVerticesData(VertexBuffer.UVKind);
      const xyzData = mesh.getVerticesData(VertexBuffer.PositionKind);

      for (let i = 0; i < faceIndicies.length; i = i + 3) {
        // Face = 3 vertices (a,b,c)
        const indexA = faceIndicies[i];
        const indexB = faceIndicies[i + 1];
        const indexC = faceIndicies[i + 2];

        if (xyzData) {
          this.triangles.push(
            new TriangleXyz([
              xyzData[indexA * 3],
              xyzData[indexA * 3 + 1],
              xyzData[indexA * 3 + 2],
              xyzData[indexB * 3],
              xyzData[indexB * 3 + 1],
              xyzData[indexB * 3 + 2],
              xyzData[indexC * 3],
              xyzData[indexC * 3 + 1],
              xyzData[indexC * 3 + 2],
            ]),
          );
        }
        if (uvData) {
          uvTriangles.push(
            new TriangleUv([
              uvData[indexA * 2],
              uvData[indexA * 2 + 1],
              uvData[indexB * 2],
              uvData[indexB * 2 + 1],
              uvData[indexC * 2],
              uvData[indexC * 2 + 1],
            ]),
          );
        }
        if (xyzData && uvData) {
          // Calculate min/max density
          // TODO: R.9 Improved - use texture resolution here instead of Validator.ts
          // Unfortunately mesh.material.getActiveTextures()[0].getSize() always returns 512x512 because of NullEngine
          // Materials can have more than one texture and they can be different resolutions.
          // QUESTION: Should we use the biggest for max, smallest for min or always use the diffuse texture when available?
          const meshArea = this.triangles[this.triangles.length - 1].area;
          const uvArea = uvTriangles[uvTriangles.length - 1].area;
          const density = meshArea == 0 ? 0 : uvArea / meshArea;
          if (maxDensity === undefined || density > maxDensity) {
            maxDensity = density;
          }
          if (minDensity === undefined || density < minDensity) {
            minDensity = density;
          }
        }
      }
      if (maxDensity !== undefined) {
        this.maxDensity.loadValue(maxDensity);
      }
      if (minDensity !== undefined) {
        this.minDensity.loadValue(minDensity);
      }
    }
    this.uv = new UV(mesh.name, uvTriangles);
  }
}
