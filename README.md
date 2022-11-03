# Khronos 3D Commerce Asset Validator

## SPDX-License-Identifier: Apache-2.0

**This is a work in progress.**

This is a typescript package that contains classes for checking a 3D file, currently only in glTF format, against a 3D Commerce use case schema definition in JSON.

This package can be used by both a command line interface (node), as well as a front-end web interface. See 3dc-validator-cli and 3dc-validator-web for integration examples.

## Checks currently available

- File Size (min/max)
- Triangle Count (max)
- Material Count (max)
- Dimensions (min/max)
- Dimensions (product within tolerance)
- Texture Map Resolution (min/max)
- Texture Map Resolution Power of 2
- Texture Map Resolution Quadratic
- Mesh Count (max)
- Node Count (max)
- Primitive Count (max)
- Clean Origin for Top Node
- 0-1 UV Texture Space
- Texture Density
- Inverted UVs
- UV Overlaps
- PBR Safe Colors
- Beveled Edges (no hard edges >= 90 degrees)
- Non-Manifold Edges

#### Checks to be added

- UV Margin Size
