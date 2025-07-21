import type { PlantTemperatureData } from './signalRService';

export interface HistoricalTemperatureResponse {
  data: PlantTemperatureData[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5142';
  }

  async getHistoricalTemperatureData(): Promise<PlantTemperatureData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/temperature/historical`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HistoricalTemperatureResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch historical temperature data:', error);
      throw error;
    }
  }
}

export default new ApiService(); 