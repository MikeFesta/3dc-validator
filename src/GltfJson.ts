export interface GltfJsonBufferViewInterface {
  buffer: number;
  byteLength: number;
  byteOffset: number;
}

export interface GltfJsonImageInterface {
  bufferView: number;
  mimeType: string;
  name: string;
}

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
  bufferViews: GltfJsonBufferViewInterface[];
  buffers: object[];
  extensionsUsed: string[];
  images: GltfJsonImageInterface[];
  materials: object[];
  meshes: GltfJsonMeshInterface[];
  nodes: object[];
  samplers: object[];
  scene: number;
  scenes: object[];
  textures: object[];
}
