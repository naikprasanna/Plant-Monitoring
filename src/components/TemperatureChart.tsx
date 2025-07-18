import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface TemperatureDataPoint {
  timestamp: number;
  temperature: number;
}

interface TemperatureChartProps {
  isDarkMode?: boolean;
}

const SPIKE_CONFIG = {
  upperThreshold: 5,
  lowerThreshold: -5,
  upperColor: '#e74c3c',
  lowerColor: '#3498db',
  enabled: true
};

const ZOOM_LEVELS = {
  0.005: '1 Second',
  0.02: '30 Seconds',
  0.05: '1 Minute',
  0.1: '5 Minutes',
  0.2: '15 Minutes',
  0.3: '30 Minutes',
  0.5: '1 Hour',
  0.7: '4 Hours',
  0.85: '12 Hours',
  0.95: '1 Day'
};

const TemperatureChart: React.FC<TemperatureChartProps> = ({ isDarkMode = true }) => {
  const [currentZoomLevel, setCurrentZoomLevel] = useState<string>('1 Hour');
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const chartRef = useRef<any>(null);
  const echartsInstanceRef = useRef<echarts.ECharts | null>(null);
  const dataRef = useRef<TemperatureDataPoint[]>([]);
  const zoomStateRef = useRef<{ start: number; end: number }>({ start: 99.99, end: 100 });

  const generateDummyData = (): TemperatureDataPoint[] => {
    const data: TemperatureDataPoint[] = [];
    const now = Date.now();
    const twoDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    
    for (let time = twoDaysAgo; time <= now; time += 1000) {
      const hour = new Date(time).getHours();
      const dayOfWeek = new Date(time).getDay();
      
      const baseTemp = 0;
      const dailyVariation = Math.sin((hour - 6) * Math.PI / 12) * 3;
      const weeklyVariation = Math.sin(dayOfWeek * Math.PI / 7) * 0.5;
      const randomVariation = (Math.random() - 0.5) * 0.5;
      
      let temperature = baseTemp + dailyVariation + weeklyVariation + randomVariation;
      temperature = Math.max(-5, Math.min(5, temperature));
      
      if (Math.random() < 0.001) {
        const spikeDirection = Math.random() > 0.5 ? 1 : -1;
        const spikeIntensity = Math.random() * 10 + 6;
        temperature = spikeDirection * spikeIntensity;
      }
      
      data.push({
        timestamp: time,
        temperature: Math.round(temperature * 10) / 10
      });
    }
    
    return data;
  };

  const detectSpikes = (data: TemperatureDataPoint[]) => {
    if (!SPIKE_CONFIG.enabled) return { upperSpikes: [], lowerSpikes: [] };
    
    const upperSpikes: TemperatureDataPoint[] = [];
    const lowerSpikes: TemperatureDataPoint[] = [];
    
    data.forEach(point => {
      if (point.temperature > SPIKE_CONFIG.upperThreshold) {
        upperSpikes.push(point);
      } else if (point.temperature < SPIKE_CONFIG.lowerThreshold) {
        lowerSpikes.push(point);
      }
    });
    
    return { upperSpikes, lowerSpikes };
  };

  const updateChartData = () => {
    const newPoint: TemperatureDataPoint = {
      timestamp: Date.now(),
      temperature: Math.round((Math.random() - 0.5) * 10 * 10) / 10
    };
    
    dataRef.current = [...dataRef.current, newPoint];
    
    if (echartsInstanceRef.current) {
      const { upperSpikes, lowerSpikes } = detectSpikes(dataRef.current);
      
      echartsInstanceRef.current.setOption({
        series: [
          {
            name: 'Temperature',
            data: dataRef.current.map(item => [item.timestamp, item.temperature])
          },
          {
            name: 'Upper Spikes',
            data: upperSpikes.map(item => [item.timestamp, item.temperature])
          },
          {
            name: 'Lower Spikes',
            data: lowerSpikes.map(item => [item.timestamp, item.temperature])
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            start: zoomStateRef.current.start,
            end: zoomStateRef.current.end
          },
          {
            type: 'slider',
            start: zoomStateRef.current.start,
            end: zoomStateRef.current.end
          }
        ]
      }, false);
    }
  };

  const getZoomLevel = (zoomRange: number): string => {
    for (const [threshold, level] of Object.entries(ZOOM_LEVELS)) {
      if (zoomRange <= parseFloat(threshold)) {
        return level;
      }
    }
    return '1 Week';
  };

  const handleChartEvents = {
    dataZoom: (params: any) => {
      let start, end;
      
      if (params.batch && params.batch.length > 0) {
        const batchItem = params.batch[0];
        start = batchItem.start;
        end = batchItem.end;
      } else if (params.start !== undefined && params.end !== undefined) {
        start = params.start;
        end = params.end;
      } else {
        return;
      }
      
      zoomStateRef.current = { start, end };
      
      const zoomRange = end - start;
      setCurrentZoomLevel(getZoomLevel(zoomRange));

      if (dataRef.current.length > 0) {
        const dataStart = dataRef.current[0].timestamp;
        const dataEnd = dataRef.current[dataRef.current.length - 1].timestamp;
        const totalRange = dataEnd - dataStart;
        const visibleStart = dataStart + (start / 100) * totalRange;
        const visibleEnd = dataStart + (end / 100) * totalRange;
        const visibleRangeHours = (visibleEnd - visibleStart) / (1000 * 60 * 60);
        setIsZoomedIn(visibleRangeHours <= 3);
      }
    }
  };

  const onChartReady = (instance: echarts.ECharts) => {
    echartsInstanceRef.current = instance;
  };

  const getThemeColors = () => {
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const axisColor = isDarkMode ? '#666666' : '#cccccc';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBg = isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    
    return { textColor, axisColor, gridColor, tooltipBg };
  };

  const formatTimeLabel = (value: number) => {
    const date = new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    if (seconds !== 0) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    }
    else if (hours === 0 && minutes === 0) {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric'
      });
    } 
    else {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const formatTooltip = (params: any) => {
    let tooltip = '<div style="padding: 8px;">';
    const { textColor } = getThemeColors();
    
    params.forEach((param: any) => {
      const data = param;
      const date = new Date(data.value[0]);
      const temp = data.value[1];
      
      let color = textColor;
      if (data.seriesName === 'Upper Spikes') {
        color = SPIKE_CONFIG.upperColor;
      } else if (data.seriesName === 'Lower Spikes') {
        color = SPIKE_CONFIG.lowerColor;
      }
      
      tooltip += `
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${date.toLocaleString()}
          </div>
          <div style="color: ${color}; font-size: 16px; font-weight: bold;">
            ${data.seriesName}: ${temp}°C
          </div>
        </div>
      `;
    });
    
    tooltip += '</div>';
    return tooltip;
  };

  useEffect(() => {
    dataRef.current = generateDummyData();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateChartData, 1000);
    return () => clearInterval(interval);
  }, []);

  const { upperSpikes, lowerSpikes } = detectSpikes(dataRef.current);
  const { textColor, axisColor, gridColor, tooltipBg } = getThemeColors();

  const option = {
    title: {
      text: 'Real-time Temperature Monitoring (T1)',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: textColor
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: formatTooltip,
      backgroundColor: tooltipBg,
      borderColor: isDarkMode ? '#333' : '#ddd',
      borderWidth: 1,
      textStyle: { color: textColor }
    },
    legend: {
      data: ['Temperature', 'Upper Spikes', 'Lower Spikes'],
      top: 30,
      textStyle: { color: textColor, fontSize: 12 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: {
        color: textColor,
        fontSize: 9,
        formatter: formatTimeLabel,
        interval: 0,
        rotate: 45,
        margin: 4,
        showMaxLabel: true,
        showMinLabel: true
      },
      splitLine: {
        show: true,
        lineStyle: { color: gridColor, type: 'dashed' }
      },
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      name: 'Temperature (°C)',
      nameTextStyle: { color: textColor, fontSize: 12 },
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: textColor, formatter: '{value}°C' },
      splitLine: { show: true, lineStyle: { color: gridColor } }
    },
    dataZoom: [
      {
        type: 'inside',
        start: zoomStateRef.current.start,
        end: zoomStateRef.current.end,
        zoomLock: false,
        moveOnMouseMove: true,
        minZoom: 0.0001,
        moveOnMouseWheel: true,
        preventDefaultMouseMove: true
      },
      {
        type: 'slider',
        start: zoomStateRef.current.start,
        end: zoomStateRef.current.end,
        height: 20,
        minZoom: 0.0001,
        bottom: 10,
        borderColor: axisColor,
        fillerColor: 'rgba(52, 152, 219, 0.2)',
        handleStyle: { color: '#3498db' },
        rangeMode: ['value', 'value']
      }
    ],
    series: [
      {
        name: 'Temperature',
        type: 'line',
        data: dataRef.current.map(item => [item.timestamp, item.temperature]),
        smooth: true,
        symbol: 'none',
        large: true,
        largeThreshold: 5000,
        progressive: 1000,
        progressiveThreshold: 3000,
        sampling: isZoomedIn ? false : 'lttb',
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#e74c3c' },
              { offset: 0.5, color: '#f39c12' },
              { offset: 1, color: '#3498db' }
            ]
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(231, 76, 60, 0.3)' },
              { offset: 0.5, color: 'rgba(243, 156, 18, 0.2)' },
              { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
            ]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#e74c3c',
            borderColor: '#c0392b',
            borderWidth: 2
          }
        }
      },
      {
        name: 'Upper Spikes',
        type: 'scatter',
        data: upperSpikes.map(item => [item.timestamp, item.temperature]),
        symbol: 'diamond',
        symbolSize: 12,
        itemStyle: {
          color: SPIKE_CONFIG.upperColor,
          borderColor: '#c0392b',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            color: SPIKE_CONFIG.upperColor,
            borderColor: '#c0392b',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: SPIKE_CONFIG.upperColor
          }
        }
      },
      {
        name: 'Lower Spikes',
        type: 'scatter',
        data: lowerSpikes.map(item => [item.timestamp, item.temperature]),
        symbol: 'diamond',
        symbolSize: 12,
        itemStyle: {
          color: SPIKE_CONFIG.lowerColor,
          borderColor: '#2980b9',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            color: SPIKE_CONFIG.lowerColor,
            borderColor: '#2980b9',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: SPIKE_CONFIG.lowerColor
          }
        }
      }
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };

  return (
    <div style={{ width: '90vw', height: '80vh', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '600',
        color: textColor,
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)'
      }}>
        Zoom: {currentZoomLevel}
      </div>

      <ReactECharts 
        ref={chartRef}
        option={option} 
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={handleChartEvents}
        onChartReady={onChartReady}
        notMerge={false}
        lazyUpdate={true}
      />
    </div>
  );
};

export default TemperatureChart; 