import EdgeUv, { EdgeUvInterface } from './EdgeUv.js';
import EdgeXyz, { EdgeXyzInterface } from './EdgeXyz.js';
import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import TriangleUv, { TriangleUvInterface } from './TriangleUv.js';
import TriangleXyz, { TriangleXyzInterface } from './TriangleXyz.js';
import { UV, UVInterface } from './UV.js';
import VertexUv, { VertexUvInterface } from './VertexUv.js';
import VertexXyz, { VertexXyzInterface } from './VertexXyz.js';
import { AbstractMesh } from '@babylonjs/core';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';
import { UvIslandInterface } from './UvIsland.js';
import { Svg, SvgInterface } from './Svg.js';

export interface PrimitiveInterface {
  densityMax: LoadableAttributeInterface;
  densityMin: LoadableAttributeInterface;
  edgesUv: EdgeUvInterface[];
  edgesXyz: EdgeXyzInterface[];
  hardEdgeCount: number;
  mesh: AbstractMesh;
  name: string;
  nonManifoldEdgeCount: number;
  svgIslands: SvgInterface;
  trianglesUv: TriangleUvInterface[];
  trianglesXyz: TriangleXyzInterface[];
  uv: UVInterface;
  verticesUv: VertexUvInterface[];
  verticesXyz: VertexXyzInterface[];
}

export class Primitive implements PrimitiveInterface {
  densityMax = new LoadableAttribute('Highest pixel density', 0);
  densityMin = new LoadableAttribute('Lowest pixel density', 0);
  edgesUv = [] as EdgeUvInterface[];
  edgesXyz = [] as EdgeXyzInterface[];
  hardEdgeCount = 0;
  mesh = null as unknown as AbstractMesh;
  name = '';
  nonManifoldEdgeCount = 0;
  svgIslands = null as unknown as SvgInterface;
  trianglesUv = [] as TriangleUvInterface[];
  trianglesXyz = [] as TriangleXyzInterface[];
  uv = null as unknown as UVInterface;
  verticesUv = [] as VertexUvInterface[];
  verticesXyz = [] as VertexXyzInterface[];

  constructor(mesh: AbstractMesh) {
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
    this.edgesXyz.forEach(edge => {
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

    if (faceIndicies && faceIndicies.length > 0) {
      let densityMax = undefined as unknown as number;
      let densityMin = undefined as unknown as number;
      const uvData = mesh.getVerticesData(VertexBuffer.UVKind);
      const xyzData = mesh.getVerticesData(VertexBuffer.PositionKind);

      // TODO: Optimize - break down where the time is spent on each triangle
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
          // TODO: Optimize - only compute vertex indices and edges if needed (ie for hard edge and/or non-manifold count)
          let vertexA = new VertexXyz(xyzData[indexA * 3], xyzData[indexA * 3 + 1], xyzData[indexA * 3 + 2]);
          let vertexB = new VertexXyz(xyzData[indexB * 3], xyzData[indexB * 3 + 1], xyzData[indexB * 3 + 2]);
          let vertexC = new VertexXyz(xyzData[indexC * 3], xyzData[indexC * 3 + 1], xyzData[indexC * 3 + 2]);

          if (this.verticesXyz.length === 0) {
            // Assume that these 3 vertices are distinct
            // TODO: Edge Case - rewrite this to not assume all points are distinct
            vertexA.index = 0;
            this.verticesXyz.push(vertexA);
            vertexB.index = 1;
            this.verticesXyz.push(vertexB);
            vertexC.index = 2;
            this.verticesXyz.push(vertexC);
          } else {
            // search all existing points for duplicates O(n * log(n))
            for (let i = 0; i < this.verticesXyz.length; i++) {
              if (vertexA.index === undefined && this.verticesXyz[i].checkForMatch(vertexA)) {
                vertexA = this.verticesXyz[i];
              }
              if (vertexB.index === undefined && this.verticesXyz[i].checkForMatch(vertexB)) {
                vertexB = this.verticesXyz[i];
              }
              if (vertexC.index === undefined && this.verticesXyz[i].checkForMatch(vertexC)) {
                vertexC = this.verticesXyz[i];
              }
            }
            let nextIndex = this.verticesXyz.length;
            if (vertexA.index === undefined) {
              vertexA.index = nextIndex;
              this.verticesXyz.push(vertexA);
              nextIndex++;
            }
            if (vertexB.index === undefined) {
              vertexB.index = nextIndex;
              this.verticesXyz.push(vertexB);
              nextIndex++;
            }
            if (vertexC.index === undefined) {
              vertexC.index = nextIndex;
              this.verticesXyz.push(vertexC);
            }
          }

          // Triangle
          const triangle = new TriangleXyz(vertexA, vertexB, vertexC);
          this.trianglesXyz.push(triangle);
          // TODO: Optional - push the triangle to the VertexXyz, as is being done for EdgeXyz and VertexUv

          // Edges
          let edgeAB = new EdgeXyz(vertexA, vertexB);
          let edgeBC = new EdgeXyz(vertexB, vertexC);
          let edgeCA = new EdgeXyz(vertexC, vertexA);

          // Only record edges once
          if (this.edgesXyz.length === 0) {
            edgeAB.index = 0;
            this.edgesXyz.push(edgeAB);
            edgeBC.index = 1;
            this.edgesXyz.push(edgeBC);
            edgeCA.index = 2;
            this.edgesXyz.push(edgeCA);
          } else {
            for (let i = 0; i < this.edgesXyz.length; i++) {
              if (edgeAB.index === undefined && this.edgesXyz[i].checkForMatch(edgeAB)) {
                edgeAB = this.edgesXyz[i];
              }
              if (edgeBC.index === undefined && this.edgesXyz[i].checkForMatch(edgeBC)) {
                edgeBC = this.edgesXyz[i];
              }
              if (edgeCA.index === undefined && this.edgesXyz[i].checkForMatch(edgeCA)) {
                edgeCA = this.edgesXyz[i];
              }
            }

            let nextIndex = this.edgesXyz.length;
            if (edgeAB.index === undefined) {
              edgeAB.index = nextIndex;
              this.edgesXyz.push(edgeAB);
              nextIndex++;
            }
            if (edgeBC.index === undefined) {
              edgeBC.index = nextIndex;
              this.edgesXyz.push(edgeBC);
              nextIndex++;
            }
            if (edgeCA.index === undefined) {
              edgeCA.index = nextIndex;
              this.edgesXyz.push(edgeCA);
            }
          }

          // Add the triangle to the edges
          edgeAB.triangles.push(triangle);
          edgeBC.triangles.push(triangle);
          edgeCA.triangles.push(triangle);
        }
        if (uvData) {
          let vertexA = new VertexUv(uvData[indexA * 2], uvData[indexA * 2 + 1]);
          let vertexB = new VertexUv(uvData[indexB * 2], uvData[indexB * 2 + 1]);
          let vertexC = new VertexUv(uvData[indexC * 2], uvData[indexC * 2 + 1]);

          if (this.verticesUv.length === 0) {
            // Assume the first triangle has 3 distinct points
            // TODO: Edge Case - rewrite this to not assume all points are distinct
            vertexA.setIndex(0);
            this.verticesUv.push(vertexA);
            vertexB.setIndex(1);
            this.verticesUv.push(vertexB);
            vertexC.setIndex(2);
            this.verticesUv.push(vertexC);
          } else {
            // search all existing points for duplicates O(n * log(n))
            for (let i = 0; i < this.verticesUv.length; i++) {
              if (vertexA.index === undefined && this.verticesUv[i].checkForMatch(vertexA)) {
                vertexA = this.verticesUv[i];
              }
              if (vertexB.index === undefined && this.verticesUv[i].checkForMatch(vertexB)) {
                vertexB = this.verticesUv[i];
              }
              if (vertexC.index === undefined && this.verticesUv[i].checkForMatch(vertexC)) {
                vertexC = this.verticesUv[i];
              }
            }
            // Insert new vertices if they are unique
            let nextIndex = this.verticesUv.length;
            if (vertexA.index === undefined) {
              vertexA.setIndex(nextIndex);
              this.verticesUv.push(vertexA);
              nextIndex++;
            }
            if (vertexB.index === undefined) {
              vertexB.setIndex(nextIndex);
              this.verticesUv.push(vertexB);
              nextIndex++;
            }
            if (vertexC.index === undefined) {
              vertexC.setIndex(nextIndex);
              this.verticesUv.push(vertexC);
            }
          }

          const triangle = new TriangleUv(i / 3, vertexA, vertexB, vertexC);
          this.trianglesUv.push(triangle);

          // Link the triange to the vertices (used for island computation)
          vertexA.triangles.push(triangle);
          vertexB.triangles.push(triangle);
          vertexC.triangles.push(triangle);

          let edgeAB = new EdgeUv(triangle.a, triangle.b);
          let edgeBC = new EdgeUv(triangle.b, triangle.c);
          let edgeCA = new EdgeUv(triangle.c, triangle.a);

          if (this.edgesUv.length === 0) {
            // assume initial edges are not the same
            // TODO: Test this assumption
            edgeAB.index = 0;
            edgeAB.triangles.push(triangle);
            this.edgesUv.push(edgeAB);
            edgeBC.index = 1;
            edgeBC.triangles.push(triangle);
            this.edgesUv.push(edgeBC);
            edgeCA.index = 2;
            edgeCA.triangles.push(triangle);
            this.edgesUv.push(edgeCA);
          } else {
            for (let i = 0; i < this.edgesUv.length; i++) {
              if (edgeAB.index === undefined && this.edgesUv[i].checkForMatch(edgeAB)) {
                edgeAB = this.edgesUv[i];
              }
              if (edgeBC.index === undefined && this.edgesUv[i].checkForMatch(edgeBC)) {
                edgeBC = this.edgesUv[i];
              }
              if (edgeCA.index === undefined && this.edgesUv[i].checkForMatch(edgeCA)) {
                edgeCA = this.edgesUv[i];
              }
            }

            // Link the triangle to the edge
            edgeAB.triangles.push(triangle);
            edgeBC.triangles.push(triangle);
            edgeCA.triangles.push(triangle);

            let nextIndex = this.edgesUv.length;
            if (edgeAB.index === undefined) {
              edgeAB.index = nextIndex;
              this.edgesUv.push(edgeAB);
              nextIndex++;
            }
            if (edgeBC.index === undefined) {
              edgeBC.index = nextIndex;
              this.edgesUv.push(edgeBC);
              nextIndex++;
            }
            if (edgeCA.index === undefined) {
              edgeCA.index = nextIndex;
              this.edgesUv.push(edgeCA);
            }
          }

          // Link the edges to the vertices (not strictly needed, but may be useful in the future)
          vertexA.edges.push(edgeAB, edgeCA);
          vertexB.edges.push(edgeAB, edgeBC);
          vertexC.edges.push(edgeBC, edgeCA);
        }
        if (xyzData && uvData) {
          // Calculate min/max density as 0-1 UV percentage per meter.
          // The pixel density depends on the texture resolution and is computed in Validator.ts vs all image files.
          // V2: It would be preferable to compute pixels here using only images linked to this primitive's material
          const meshArea = this.trianglesXyz[this.trianglesXyz.length - 1].area;
          const uvArea = this.trianglesUv[this.trianglesUv.length - 1].area;
          const density = meshArea == 0 ? 0 : uvArea / meshArea;
          if (densityMax === undefined || density > densityMax) {
            densityMax = density;
          }
          if (densityMin === undefined || density < densityMin) {
            densityMin = density;
          }
        }
      }
      if (densityMax !== undefined) {
        this.densityMax.loadValue(densityMax);
      }
      if (densityMin !== undefined) {
        this.densityMin.loadValue(densityMin);
      }

      // Group UVs into islands for the purpose of margin testing
      // An island is a group of triangles that are connected by one or more vertices
      // A recursive process propogates the smallest vertex index across the entire island
      this.trianglesUv.forEach((triangle: TriangleUvInterface) => {
        triangle.calculateIslandIndex();
      });

      // Create the UV object. The triangles should already have island indices
      this.uv = new UV(mesh.name, this.trianglesUv);

      // TODO: Remove after testing
      this.svgIslands = new Svg('islands');

      this.uv.islands.forEach((island: UvIslandInterface) => {
        const uniqueColor = ((island.index + 1) * 100000) % 16777215;
        let svgColor = uniqueColor.toString(16).padStart(6, '0');
        // avoid red to make errors stand out more
        svgColor = '00' + svgColor.substring(2, 6);
        island.triangles.forEach((triangle: TriangleUvInterface) => {
          this.svgIslands.pathData += triangle.getSvgPath('#' + svgColor);
        });
      });
    }
  };
}
