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
    // if (greyblend < 0) {
    // greyblend = 0;
    // }
    newcol[c] = newcol[c] + Math.pow(grey * (1 - greyblend), 1.2);
    newcol[c] = Math.round(newcol[c] * 255);

    // Make it a 0-255 thing
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
