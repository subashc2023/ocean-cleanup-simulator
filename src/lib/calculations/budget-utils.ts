export const formatBudget = (value: number): string => {
  if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  return `${(value / 1000000).toFixed(1)}M`;
};

export const logSliderToPrice = (value: number): number => {
  const minPrice = 0.1;
  const maxPrice = 100;
  const minLog = Math.log(minPrice);
  const maxLog = Math.log(maxPrice);
  const scale = (maxLog - minLog) / 100;
  const result = Math.exp(minLog + scale * value);
  return Number(result.toFixed(2));
};

export const priceToLogSlider = (price: number): number => {
  const minPrice = 0.1;
  const maxPrice = 100;
  const minLog = Math.log(minPrice);
  const maxLog = Math.log(maxPrice);
  const scale = (maxLog - minLog) / 100;
  const value = (Math.log(price) - minLog) / scale;
  return Math.round(value);
}; 