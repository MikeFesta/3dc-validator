# Khronos 3D Commerce Asset Validator

## SPDX-License-Identifier: Apache-2.0

**This is a work in progress.**

This is a typescript package that contains classes for checking a 3D file, currently only in glTF format, against a 3D Commerce use case schema definition in JSON.

This package is used for both a command line interface, as well as a front-end web interface, published seperately.

## Dependencies
* https://www.babylonjs.com/
* https://github.com/KhronosGroup/glTF-Validator

#### Checks currently available
* File Size (min/max)
* Triangle Count (max)
* Material Count (max)
* Dimensions (min/max)
* Dimensions (product within tolerance)
* Texture Map Resolution Power of 2
* Texture Map Resolution Quadratic

#### Checks to be added
* Texture Map Resolution (min/max)
* Transparent Geometry Separated
* 0-1 UV Texture Space
* Mesh Count
* Node Count
* Primitive Count
* Texture Density
* Hard Edges
* PBR Safe Colors
* UV Overlaps
* UV Margin Size
* Inverted UVs
* Clean Origin for Top Node
* Non-Manifold Edges
