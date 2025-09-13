import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from '@/components/ui';
import {
  BarChart3,
  RefreshCw,
  Download,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';

/**
 * Basic chart component
 */
export const BasicChart = ({
  title,
  description,
  data = [],
  type = 'line',
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      // Simple chart implementation using HTML5 Canvas
      const canvas = chartRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();

      // Set canvas size
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw chart based on type
      drawChart(ctx, data, type, rect.width, rect.height);
    }
  }, [data, type]);

  const drawChart = (ctx, data, chartType, width, height) => {
    if (!data || data.length === 0) return;

    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Find min/max values
    const values = data.map(item => typeof item === 'number' ? item : item.value || 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Set up drawing context
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.lineWidth = 2;

    if (chartType === 'line') {
      drawLineChart(ctx, data, padding, chartWidth, chartHeight, minValue, range);
    } else if (chartType === 'bar') {
      drawBarChart(ctx, data, padding, chartWidth, chartHeight, minValue, range);
    } else if (chartType === 'pie') {
      drawPieChart(ctx, data, width / 2, height / 2, Math.min(width, height) / 2 - padding);
    }
  };

  const drawLineChart = (ctx, data, padding, width, height, minValue, range) => {
    ctx.beginPath();
    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - ((item.value - minValue) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  };

  const drawBarChart = (ctx, data, padding, width, height, minValue, range) => {
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = ((item.value - minValue) / range) * height;
      const y = padding + height - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);
    });
  };

  const drawPieChart = (ctx, data, centerX, centerY, radius) => {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    let currentAngle = 0;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();

      // Use different colors for each slice
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      currentAngle += sliceAngle;
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>{title}</span>
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>{title}</span>
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Failed to load chart data
              </p>
              {onRefresh && (
                <Button size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={chartRef}
            style={{ width: '100%', height: `${height}px` }}
            {...props}
          />
          {data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No data available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Line chart component
 */
export const LineChart = ({
  title,
  description,
  data = [],
  xAxisKey = 'x',
  yAxisKey = 'y',
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  return (
    <BasicChart
      title={title}
      description={description}
      data={data}
      type="line"
      height={height}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
      {...props}
    />
  );
};

/**
 * Bar chart component
 */
export const BarChart = ({
  title,
  description,
  data = [],
  xAxisKey = 'x',
  yAxisKey = 'y',
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  return (
    <BasicChart
      title={title}
      description={description}
      data={data}
      type="bar"
      height={height}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
      {...props}
    />
  );
};

/**
 * Pie chart component
 */
export const PieChart = ({
  title,
  description,
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  return (
    <BasicChart
      title={title}
      description={description}
      data={data}
      type="pie"
      height={height}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
      {...props}
    />
  );
};

/**
 * Area chart component
 */
export const AreaChart = ({
  title,
  description,
  data = [],
  xAxisKey = 'x',
  yAxisKey = 'y',
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  return (
    <BasicChart
      title={title}
      description={description}
      data={data}
      type="area"
      height={height}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
      {...props}
    />
  );
};

/**
 * Scatter chart component
 */
export const ScatterChart = ({
  title,
  description,
  data = [],
  xAxisKey = 'x',
  yAxisKey = 'y',
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  return (
    <BasicChart
      title={title}
      description={description}
      data={data}
      type="scatter"
      height={height}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
      {...props}
    />
  );
};

/**
 * Donut chart component
 */
export const DonutChart = ({
  title,
  description,
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  return (
    <BasicChart
      title={title}
      description={description}
      data={data}
      type="donut"
      height={height}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
      {...props}
    />
  );
};

/**
 * Gauge chart component
 */
export const GaugeChart = ({
  title,
  description,
  value = 0,
  max = 100,
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  const percentage = (value / max) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted-foreground"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${percentage * 2.51} 251`}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground">of {max}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Progress chart component
 */
export const ProgressChart = ({
  title,
  description,
  data = [],
  height = 300,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" style={{ height: `${height}px` }}>
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.value}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Chart dashboard component
 */
export const ChartDashboard = ({
  charts = [],
  loading = false,
  error = null,
  onRefresh,
  onExport,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load charts</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || 'An error occurred while loading the charts'}
            </p>
            {onRefresh && (
              <Button onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart, index) => (
            <div key={index} className="col-span-1">
              {chart.type === 'line' && <LineChart {...chart} />}
              {chart.type === 'bar' && <BarChart {...chart} />}
              {chart.type === 'pie' && <PieChart {...chart} />}
              {chart.type === 'area' && <AreaChart {...chart} />}
              {chart.type === 'scatter' && <ScatterChart {...chart} />}
              {chart.type === 'donut' && <DonutChart {...chart} />}
              {chart.type === 'gauge' && <GaugeChart {...chart} />}
              {chart.type === 'progress' && <ProgressChart {...chart} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Chart with filters
 */
export const FilterableChart = ({
  title,
  description,
  data = [],
  filters = [],
  onFilterChange,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...selectedFilters, [filterKey]: value };
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filters.length > 0 && (
          <div className="flex items-center space-x-4 mb-6">
            {filters.map((filter) => (
              <div key={filter.key} className="flex items-center space-x-2">
                <span className="text-sm font-medium">{filter.label}:</span>
                <Select
                  value={selectedFilters[filter.key] || ''}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={filter.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        <BasicChart
          data={data}
          onRefresh={onRefresh}
          onExport={onExport}
          {...props}
        />
      </CardContent>
    </Card>
  );
};

export default {
  BasicChart,
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ScatterChart,
  DonutChart,
  GaugeChart,
  ProgressChart,
  ChartDashboard,
  FilterableChart
};
