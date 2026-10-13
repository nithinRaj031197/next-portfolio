/** One lens for the whole site: depth is conveyed by position and fog, never by FOV changes. */
export const FOV = 38;
export const CAMERA_REST_Z = 7;
export const TAN_HALF_FOV = Math.tan((FOV * Math.PI) / 360);
