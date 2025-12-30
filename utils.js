// Adapted from https://github.com/ilia3101/Javascript-3D-Renderer/

// Normalises a vector (3D only)
export function normalise(vector) {
  // Get length of the vector
  const length = Math.sqrt(
    vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]
  );
  // Divide all parts by length
  const normalised = [
    vector[0] / length,
    vector[1] / length,
    vector[2] / length,
  ];
  return normalised;
}

// Get dot product, useful for shading and matrix
export function dotproduct(vector1, vector2) {
  let dotproduct = 0;
  for (let i = 0; i < vector1.length; i++) {
    dotproduct = dotproduct + vector1[i] * vector2[i];
  }
  return dotproduct;
}

export function shade(
  colour,
  ambient,
  lightvector,
  litecol,
  intensity,
  facenormal,
  greyblend
) {
  const materialCol = [
    parseInt(colour[1], 16) / 15,
    parseInt(colour[2], 16) / 15,
    parseInt(colour[3], 16) / 15,
  ];
  const ambientCol = [
    parseInt(ambient[1], 16) / 15,
    parseInt(ambient[2], 16) / 15,
    parseInt(ambient[3], 16) / 15,
  ];
  const lightCol = [
    parseInt(litecol[1], 16) / 15,
    parseInt(litecol[2], 16) / 15,
    parseInt(litecol[3], 16) / 15,
  ];

  const newcol = new Array(3);
  const lightangle = dotproduct(lightvector, facenormal);
  // Get grey color
  const grey =
    materialCol[0] * 0.299 + materialCol[1] * 0.587 + materialCol[2] * 0.114;

  // Shade all r g b channels
  for (let c = 0; c < 3; c++) {
    // Calculate light contribution for this color channel

    // Add ambient background effect
    newcol[c] = materialCol[c] * ambientCol[c];
    // gamma correction for realistic lighting. 1 = no correction, > 1 brighter, < 1 darker
    const GAMMA = 1.3;
    // adds a small base value to prevent complete darkness
    const OFFSET = 0.06 / 1.06;

    // Main light shading
    // lightangle = how directly the light hits the surface (0-1)
    if (lightangle > 0) {
      // materialCol[c] = material's color intensity for this channel
      // lightCol[c] = light's color intensity for this channel
      const lighting = Math.pow(
        materialCol[c] * lightangle * lightCol[c] * intensity,
        1 / GAMMA
      );
      newcol[c] = newcol[c] + lighting + OFFSET;
    }

    // Grey fresnel effect thing
    if (greyblend < 0) {
      greyblend = 0;
    }
    newcol[c] = newcol[c] + Math.pow(grey * (1 - greyblend), 1.2);

    // Convert from 0-1 to 0-255 range
    newcol[c] = Math.round(newcol[c] * 255);

    // Max 255
    if (newcol[c] > 255) {
      newcol[c] = 255;
    }
  }
  // Return as rgb
  return "rgb(" + newcol[0] + "," + newcol[1] + "," + newcol[2] + ")";
}

// Calculates normal of a triangle from 3 points using cross product method
export function normal(point1, point2, point3) {
  const vectora = [
    point1.x - point2.x,
    point1.y - point2.y,
    point1.z - point2.z,
  ];
  const vectorb = [
    point3.x - point2.x,
    point3.y - point2.y,
    point3.z - point2.z,
  ];
  const crossproduct = [
    vectora[1] * vectorb[2] - vectora[2] * vectorb[1],
    vectora[2] * vectorb[0] - vectora[0] * vectorb[2],
    vectora[0] * vectorb[1] - vectora[1] * vectorb[0],
  ];
  const normal = normalise(crossproduct);
  return normal;
}

// Parse a Wavefront .obj file (text) into a simple JS model format.
// Returns: {
//   vertices: [{x,y,z}],
//   normals: [{x,y,z}],
//   uvs: [{u,v}],
//   faces: [{v:[i,i,i], vn:[i,i,i]? , vt:[i,i,i]? , material:?}],
//   materials: { mtllib?: "name" },
// }
export function parseOBJ(text) {
  const lines = text.split(/\r?\n/);
  const vertices = [];
  const normals = [];
  const uvs = [];
  const faces = [];
  const materials = {};
  let name = "custom_model";
  let currentMaterial = null;

  const resolveIndex = (idx, arrLen) => {
    // OBJ indices are 1-based, negatives are relative to end
    const i = parseInt(idx, 10);
    if (Number.isNaN(i)) return null;
    return i > 0 ? i - 1 : arrLen + i;
  };

  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const parts = line.split(/\s+/);
    const type = parts[0];

    if (type === "v") {
      // vertex
      const x = parseFloat(parts[1] || 0);
      const y = parseFloat(parts[2] || 0);
      const z = parseFloat(parts[3] || 0);
      vertices.push({ x, y, z });
    } else if (type === "vn") {
      const x = parseFloat(parts[1] || 0);
      const y = parseFloat(parts[2] || 0);
      const z = parseFloat(parts[3] || 0);
      normals.push({ x, y, z });
    } else if (type === "vt") {
      const u = parseFloat(parts[1] || 0);
      const v = parseFloat(parts[2] || 0);
      uvs.push({ u, v });
    } else if (type === "f") {
      // face can be v, v/vt, v//vn, v/vt/vn
      const verticesSpec = parts.slice(1).map((token) => {
        const comps = token.split("/");
        return {
          v: comps[0] ? resolveIndex(comps[0], vertices.length) : null,
          vt: comps[1] ? resolveIndex(comps[1], uvs.length) : null,
          vn: comps[2] ? resolveIndex(comps[2], normals.length) : null,
        };
      });

      // triangulate polygon by fan method
      for (let i = 1; i < verticesSpec.length - 1; i++) {
        const a = verticesSpec[0];
        const b = verticesSpec[i];
        const c = verticesSpec[i + 1];
        const face = { v: [a.v, b.v, c.v] };
        if (a.vt !== null || b.vt !== null || c.vt !== null) {
          face.vt = [a.vt, b.vt, c.vt];
        }
        if (a.vn !== null || b.vn !== null || c.vn !== null) {
          face.vn = [a.vn, b.vn, c.vn];
        }
        if (currentMaterial) face.material = currentMaterial;

        // diregard other data (vt, vn) for now
        faces.push(face.v);
      }
    } else if (type === "usemtl") {
      currentMaterial = parts.slice(1).join(" ") || null;
    } else if (type === "mtllib") {
      materials.mtllib = parts.slice(1).join(" ") || null;
    } else if (type === "o" || type === "g") {
      name = parts[1] || name;
    } else {
      // unrecognized line type - ignore
    }
  }

  return { vs: vertices, normals, uvs, fs: faces, materials, name };
}
