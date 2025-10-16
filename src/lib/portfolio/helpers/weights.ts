/**
 * Sums the weights
 * @param weights - The weights to sum. Keys are symbols, values are weights.
 * @returns The sum of the weights
 */
export function sumWeights(weights: Record<string, number>): number {
  return Object.values(weights).reduce((sum, w) => sum + w, 0);
}

/**
 * Asserts that the weights sum to 1
 * @param weights - The weights to assert
 * @throws An error if the weights do not sum to 1
 */
export function assertUnit(weights: Record<string, number>): void {
  const sum = sumWeights(weights);
  const tolerance = 1e-8;
  if (Math.abs(sum - 1) > tolerance) {
    throw new Error(`Allocation weights must sum to 1, got ${sum}`);
  }
}
