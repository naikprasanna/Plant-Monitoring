import * as signalR from '@microsoft/signalr';

export interface PlantTemperatureData {
  timestamp: number;
  temperature: number;
}

class SignalRService {
  private connection: signalR.HubConnection;
  private listeners: Set<(data: PlantTemperatureData) => void> = new Set();

  constructor() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5142';
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${backendUrl}/planttemperaturehub`)
      .withAutomaticReconnect()
      .build();
  }

  async startConnection(): Promise<void> {
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.start();
      console.log('SignalR Connected!');
      
      this.connection.on('ReceivePlantTemperature', (data: PlantTemperatureData) => {
        console.log('🌡️ Plant Temperature Received:', data);
        this.listeners.forEach(listener => listener(data));
      });
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      throw err;
    }
  }

  onPlantTemperatureReceived(callback: (data: PlantTemperatureData) => void): void {
    this.listeners.add(callback);
  }

  removeListener(callback: (data: PlantTemperatureData) => void): void {
    this.listeners.delete(callback);
  }
}

export default new SignalRService(); 