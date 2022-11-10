import EdgeXyz, { EdgeXyzInterface } from './EdgeXyz.js';
import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { Material, MaterialInterface } from './Material.js';
import { TriangleUv } from './TriangleUv.js';
import { TriangleXyz, TriangleXyzInterface } from './TriangleXyz.js';
import { UV, UVInterface } from './UV.js';
import VertexXyz, { VertexXyzInterface } from './VertexXyz.js';
import { AbstractMesh } from '@babylonjs/core';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';

export interface PrimitiveInterface {
  edges: EdgeXyzInterface[];
  hardEdgeCount: number;
  material: MaterialInterface;
  maxDensity: LoadableAttributeInterface; // TODO: rename to densityMax
  mesh: AbstractMesh;
  minDensity: LoadableAttributeInterface; // TODO: not sure this needs to be a LoadableAttribute
  name: string;
  nonManifoldEdgeCount: number;
  triangles: TriangleXyzInterface[];
  uv: UVInterface;
  verticies: VertexXyzInterface[];
}

export class Primitive implements PrimitiveInterface {
  edges = [] as EdgeXyzInterface[];
  hardEdgeCount = 0;
  material = null as unknown as MaterialInterface;
  maxDensity = new LoadableAttribute('Highest pixel density', 0);
  mesh = null as unknown as AbstractMesh;
  minDensity = new LoadableAttribute('Lowest pixel density', 0);
  name = '';
  nonManifoldEdgeCount = 0;
  triangles = [] as TriangleXyzInterface[];
  uv = null as unknown as UVInterface;
  verticies = [] as VertexXyzInterface[];

  constructor(mesh: AbstractMesh) {
    if (mesh.material) {
      this.material = new Material(mesh.material);
    }
    this.mesh = mesh;
    this.name = mesh.name;

    // Copy binary data to internal representation
    this.loadDataFromMesh(mesh);

    this.calculateEdgeAttributes();
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////
  private calculateEdgeAttributes = () => {
    this.edges.forEach(edge => {
      edge.calculateAttributes();
      if (edge.nonManifold !== undefined && edge.nonManifold) {
        this.nonManifoldEdgeCount++;
      }
      if (edge.faceAngleInRadians !== undefined && edge.faceAngleInRadians >= Math.PI / 2) {
        this.hardEdgeCount++;
      }
    });
  };

  private loadDataFromMesh = (mesh: AbstractMesh) => {
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
          // The glTF 2.0 format does not share verticies between triangles
          // https://github.com/KhronosGroup/glTF/issues/1362
          // The position data is copied to a new location in the binary data
          // To validate certain features, such as hard edges and non-manifold
          // edges, I need to reconstruct shared vertices and track new indices
          // WARNING: This might get really slow with a lot of vertices.
          // TODO: only compute vertex indices and edges if needed (ie for hard edge and/or non-manifold count)
          let vertexA = new VertexXyz(xyzData[indexA * 3], xyzData[indexA * 3 + 1], xyzData[indexA * 3 + 2]);
          let vertexB = new VertexXyz(xyzData[indexB * 3], xyzData[indexB * 3 + 1], xyzData[indexB * 3 + 2]);
          let vertexC = new VertexXyz(xyzData[indexC * 3], xyzData[indexC * 3 + 1], xyzData[indexC * 3 + 2]);

          if (this.verticies.length === 0) {
            // Assume that these 3 vertices are distinct
            vertexA.index = 0;
            this.verticies.push(vertexA);
            vertexB.index = 1;
            this.verticies.push(vertexB);
            vertexC.index = 2;
            this.verticies.push(vertexC);
          } else {
            for (let i = 0; i < this.verticies.length; i++) {
              if (vertexA.index === undefined && this.verticies[i].checkForMatch(vertexA)) {
                vertexA = this.verticies[i];
              }
              if (vertexB.index === undefined && this.verticies[i].checkForMatch(vertexB)) {
                vertexB = this.verticies[i];
              }
              if (vertexC.index === undefined && this.verticies[i].checkForMatch(vertexC)) {
                vertexC = this.verticies[i];
              }
            }
            let nextIndex = this.verticies.length;
            if (vertexA.index === undefined) {
              vertexA.index = nextIndex;
              this.verticies.push(vertexA);
              nextIndex++;
            }
            if (vertexB.index === undefined) {
              vertexB.index = nextIndex;
              this.verticies.push(vertexB);
              nextIndex++;
            }
            if (vertexC.index === undefined) {
              vertexC.index = nextIndex;
              this.verticies.push(vertexC);
            }
          }

          // Triangle
          const triangle = new TriangleXyz(vertexA, vertexB, vertexC);
          // TODO: may want to pass edges to triangle
          this.triangles.push(triangle);

          // Edges
          let edgeAB = new EdgeXyz(vertexA, vertexB);
          let edgeBC = new EdgeXyz(vertexB, vertexC);
          let edgeCA = new EdgeXyz(vertexC, vertexA);

          // Only record edges once
          if (this.edges.length === 0) {
            edgeAB.index = 0;
            this.edges.push(edgeAB);
            edgeBC.index = 1;
            this.edges.push(edgeBC);
            edgeCA.index = 2;
            this.edges.push(edgeCA);
          } else {
            for (let i = 0; i < this.edges.length; i++) {
              if (edgeAB.index === undefined && this.edges[i].checkForMatch(edgeAB)) {
                edgeAB = this.edges[i];
              }
              if (edgeBC.index === undefined && this.edges[i].checkForMatch(edgeBC)) {
                edgeBC = this.edges[i];
              }
              if (edgeCA.index === undefined && this.edges[i].checkForMatch(edgeCA)) {
                edgeCA = this.edges[i];
              }
            }

            let nextIndex = this.edges.length;
            if (edgeAB.index === undefined) {
              edgeAB.index = nextIndex;
              this.edges.push(edgeAB);
              nextIndex++;
            }
            if (edgeBC.index === undefined) {
              edgeBC.index = nextIndex;
              this.edges.push(edgeBC);
              nextIndex++;
            }
            if (edgeCA.index === undefined) {
              edgeCA.index = nextIndex;
              this.edges.push(edgeCA);
            }
          }

          // Add the triangle to the edges
          edgeAB.triangles.push(triangle);
          edgeBC.triangles.push(triangle);
          edgeCA.triangles.push(triangle);
        }
        if (uvData) {
          // TODO: Should triangleUv also have the edge and vertex info?
          uvTriangles.push(
            new TriangleUv(i / 3, [
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
  };
}
