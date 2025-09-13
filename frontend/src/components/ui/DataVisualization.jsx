import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  AlertCircle
} from 'lucide-react';

/**
 * Simple bar chart component
 */
export const SimpleBarChart = ({
  data = [],
  xKey = 'label',
  yKey = 'value',
  color = '#3b82f6',
  height = 200,
  showValues = true,
  className = ''
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Calculate dimensions
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = height - (padding * 2);
    const barWidth = chartWidth / data.length;
    const maxValue = Math.max(...data.map(item => item[yKey]));

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = (item[yKey] / maxValue) * chartHeight;
      const x = padding + (index * barWidth) + (barWidth * 0.1);
      const y = height - padding - barHeight;
      const width = barWidth * 0.8;

      // Draw bar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, barHeight);

      // Draw value
      if (showValues) {
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          item[yKey].toLocaleString('id-ID'),
          x + width / 2,
          y - 5
        );
      }

      // Draw label
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        item[xKey],
        x + width / 2,
        height - padding + 15
      );
    });
  }, [data, xKey, yKey, color, height, showValues]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
};

/**
 * Simple line chart component
 */
export const SimpleLineChart = ({
  data = [],
  xKey = 'label',
  yKey = 'value',
  color = '#3b82f6',
  height = 200,
  showPoints = true,
  className = ''
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Calculate dimensions
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = height - (padding * 2);
    const maxValue = Math.max(...data.map(item => item[yKey]));
    const minValue = Math.min(...data.map(item => item[yKey]));
    const valueRange = maxValue - minValue;

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - ((item[yKey] - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    if (showPoints) {
      data.forEach((item, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = height - padding - ((item[yKey] - minValue) / valueRange) * chartHeight;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      ctx.fillText(item[xKey], x, height - padding + 15);
    });
  }, [data, xKey, yKey, color, height, showPoints]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
};

/**
 * Simple pie chart component
 */
export const SimplePieChart = ({
  data = [],
  labelKey = 'label',
  valueKey = 'value',
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  height = 200,
  showLegend = true,
  className = ''
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Calculate dimensions
    const centerX = rect.width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);

    // Draw pie slices
    let currentAngle = 0;
    data.forEach((item, index) => {
      const sliceAngle = (item[valueKey] / total) * 2 * Math.PI;

      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      currentAngle += sliceAngle;
    });
  }, [data, labelKey, valueKey, colors, height]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
      />
      {showLegend && (
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm">{item[labelKey]}</span>
              <span className="text-sm text-muted-foreground">
                ({item[valueKey].toLocaleString('id-ID')})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Metric card with trend
 */
export const MetricCard = ({
  title,
  value,
  change,
  changeType = 'percentage',
  trend = 'neutral',
  icon: Icon,
  color = 'blue',
  className = ''
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (val) => {
    if (changeType === 'percentage') {
      return `${val}%`;
    } else if (changeType === 'currency') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'USD'
      }).format(val);
    } else {
      return val.toLocaleString('id-ID');
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Chart container with controls
 */
export const ChartContainer = ({
  title,
  description,
  children,
  onRefresh,
  onDownload,
  onSettings,
  loading = false,
  error = null,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {onSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div className="space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Data table with visualization
 */
export const DataTableWithVisualization = ({
  data = [],
  columns = [],
  visualization,
  onRowClick,
  className = ''
}) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowClick = (row) => {
    onRowClick?.(row);
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_, index) => index));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {visualization && (
        <div className="mb-6">
          {visualization}
        </div>
      )}

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                {columns.map((column, index) => (
                  <th key={index} className="p-4 text-left font-medium">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleRowClick(row)}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => handleSelectRow(rowIndex)}
                      className="rounded"
                    />
                  </td>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-4">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * KPI dashboard
 */
export const KPIDashboard = ({
  metrics = [],
  onRefresh,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          trend={metric.trend}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default {
  SimpleBarChart,
  SimpleLineChart,
  SimplePieChart,
  MetricCard,
  ChartContainer,
  DataTableWithVisualization,
  KPIDashboard
};
