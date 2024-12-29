export interface CountryData {
  name: string;
  percent: number;
  color: string;
  metricTons: number;
}

export const COUNTRY_DATA: CountryData[] = [
  { name: 'Philippines', percent: 35.2, metricTons: 356371, color: '#8B0000' },
  { name: 'India', percent: 12.5, metricTons: 126513, color: '#4B0082' },
  { name: 'Malaysia', percent: 7.2, metricTons: 73098, color: '#006400' },
  { name: 'China', percent: 7.0, metricTons: 70707, color: '#800000' },
  { name: 'Indonesia', percent: 5.6, metricTons: 56333, color: '#000080' },
  { name: 'Myanmar', percent: 3.9, metricTons: 40000, color: '#3B0D11' },
  { name: 'Brazil', percent: 3.7, metricTons: 37799, color: '#004040' },
  { name: 'Vietnam', percent: 2.8, metricTons: 28221, color: '#1A0F3C' },
  { name: 'Bangladesh', percent: 2.4, metricTons: 24640, color: '#2F4F4F' },
  { name: 'Thailand', percent: 2.3, metricTons: 22806, color: '#2D0922' },
  { name: 'Rest of World', percent: 17.4, metricTons: 176012, color: '#1C1C1C' }
]; 