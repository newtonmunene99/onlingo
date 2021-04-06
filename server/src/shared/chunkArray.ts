/**
 * Returns an array with arrays of the given size.
 *
 * @param {Array} array Array to split
 * @param {number} chunkSize  Size of every group
 * @example
 * ```
 * const result = chunkArray([1, 2, 3, 4, 5, 6, 7, 8], 3); // Split in group of 3 items
console.log(result); // Outputs : [ [1,2,3] , [4,5,6] ,[7,8] ]
 * ```
 */
export const chunkArray = (
  array: Array<any>,
  chunkSize: number,
): Array<any> => {
  const results = [];

  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }

  return results;
};
