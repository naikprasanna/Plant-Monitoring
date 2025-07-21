import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TemperatureChart from './TemperatureChart';

// Mock services
vi.mock('../services/signalRService', () => ({
  default: {
    startConnection: vi.fn(),
    onPlantTemperatureReceived: vi.fn(),
    removeListener: vi.fn()
  }
}));

vi.mock('../services/apiService', () => ({
  default: {
    getHistoricalTemperatureData: vi.fn()
  }
}));

// Mock echarts-for-react
vi.mock('echarts-for-react', () => ({
  default: vi.fn(() => <div data-testid="temperature-chart" />)
}));

import apiService from '../services/apiService';
import signalRService from '../services/signalRService';

describe('TemperatureChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getHistoricalTemperatureData).mockResolvedValue([
      { timestamp: 1640995200000, temperature: 23.5 },
      { timestamp: 1640995260000, temperature: 24.1 }
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the chart', () => {
    render(<TemperatureChart />);
    expect(screen.getAllByTestId('temperature-chart').length).toBeGreaterThan(0);
  });

  it('renders with dark mode by default', () => {
    render(<TemperatureChart />);
    expect(screen.getAllByTestId('temperature-chart').length).toBeGreaterThan(0);
  });

  it('renders with light mode when specified', () => {
    render(<TemperatureChart isDarkMode={false} />);
    expect(screen.getAllByTestId('temperature-chart').length).toBeGreaterThan(0);
  });

  it('displays zoom level indicator', () => {
    render(<TemperatureChart />);
    expect(screen.getAllByText(/Zoom:/).length).toBeGreaterThan(0);
  });

  it('connects to SignalR on mount', async () => {
    render(<TemperatureChart />);
    await waitFor(() => {
      expect(signalRService.startConnection).toHaveBeenCalled();
    });
  });

  it('registers temperature listener on mount', async () => {
    render(<TemperatureChart />);
    await waitFor(() => {
      expect(signalRService.onPlantTemperatureReceived).toHaveBeenCalled();
    });
  });

  it('fetches historical data on mount', async () => {
    render(<TemperatureChart />);
    await waitFor(() => {
      expect(apiService.getHistoricalTemperatureData).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(apiService.getHistoricalTemperatureData).mockRejectedValue(new Error('API Error'));
    render(<TemperatureChart />);
    expect(screen.getAllByTestId('temperature-chart').length).toBeGreaterThan(0);
  });

  it('handles SignalR connection errors gracefully', async () => {
    vi.mocked(signalRService.startConnection).mockRejectedValue(new Error('Connection failed'));
    render(<TemperatureChart />);
    expect(screen.getAllByTestId('temperature-chart').length).toBeGreaterThan(0);
  });
}); 