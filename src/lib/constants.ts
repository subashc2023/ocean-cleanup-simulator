export const PRODUCTION_START_YEAR = 1950;
export const CLEANUP_START_YEAR = 2024;
export const MAX_PROJECTION_YEAR = 2100;
export const DEFAULT_COST_PER_KG_EUR = 5.22;
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const DEFAULT_EXCHANGE_RATE = 0.93; 
export const TEAM_SEAS_START = new Date('2021-10-29').getFullYear();
export const TEAM_SEAS_END = new Date('2024-07-17').getFullYear();
export const TEAM_SEAS_TOTAL_TONS = 17000;
export const TEAM_SEAS_DAILY_RATE = TEAM_SEAS_TOTAL_TONS / 
  ((TEAM_SEAS_END - TEAM_SEAS_START) * 365); // Convert to daily rate 
export const TEAM_SEAS_COST = 34000000; // $34M
export const TEAM_SEAS_POUNDS = 34000000; // 34M pounds
export const TEAM_SEAS_TONS = TEAM_SEAS_POUNDS / 2204.62; // Convert pounds to metric tons
export const TEAM_SEAS_DURATION_DAYS = 
  (new Date('2024-07-17').getTime() - new Date('2021-10-29').getTime()) / (1000 * 60 * 60 * 24);
export const TEAM_SEAS_DAILY_RATE = TEAM_SEAS_TONS / TEAM_SEAS_DURATION_DAYS; 