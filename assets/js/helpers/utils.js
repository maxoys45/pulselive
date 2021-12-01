/**
 * Round given number to 2 decimal places.
 * @param {Number} num 
 * @returns Rounded number
 */
export const roundTwoDecimals = num => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}