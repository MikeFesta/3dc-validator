export interface GltfJsonMeshInterface {
  name: string;
  primitives: GltfJsonPrimitiveInterface[];
}

export interface GltfJsonPrimitiveInterface {
  indicies: number;
  attributes: object;
  material: number;
}

export interface GltfJsonInterface {
  accessors: object[];
  asset: {
    copyright: string;
    generator: string;
    version: string;
  };
  bufferViews: object[];
  buffers: object[];
  extensionsUsed: string[];
  images: object[];
  materials: object[];
  meshes: GltfJsonMeshInterface[];
  nodes: object[];
  samplers: object[];
  scene: number;
  scenes: object[];
  textures: object[];
}
