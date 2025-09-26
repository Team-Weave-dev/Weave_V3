'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Wind,
  CloudFog,
  Droplets,
  Thermometer,
  Eye,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherWidgetProps, WeatherData, WeatherCondition } from '@/types/dashboard';
import { getWidgetText } from '@/config/brand';
import { typography, layout, colors } from '@/config/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Weather condition to icon mapping
const weatherIcons: Record<WeatherCondition, React.ElementType> = {
  'clear': Sun,
  'partly-cloudy': Cloud,
  'cloudy': Cloud,
  'rain': CloudRain,
  'snow': CloudSnow,
  'storm': CloudLightning,
  'fog': CloudFog,
  'windy': Wind
};

// Weather condition icon colors
const weatherIconColors: Record<WeatherCondition, string> = {
  'clear': 'text-yellow-500',
  'partly-cloudy': 'text-gray-500',
  'cloudy': 'text-gray-600',
  'rain': 'text-blue-600',
  'snow': 'text-blue-300',
  'storm': 'text-purple-600',
  'fog': 'text-gray-400',
  'windy': 'text-teal-500'
};

// Weather condition to gradient background mapping  
const weatherGradients: Record<WeatherCondition, string> = {
  'clear': colors.widget.weather.clear,
  'partly-cloudy': colors.widget.weather.partlyCloudy,
  'cloudy': colors.widget.weather.cloudy,
  'rain': colors.widget.weather.rain,
  'snow': colors.widget.weather.snow,
  'storm': colors.widget.weather.storm,
  'fog': colors.widget.weather.fog,
  'windy': colors.widget.weather.windy
};

// Mock weather data generator
const generateMockWeatherData = (location: string): WeatherData => {
  const conditions: WeatherCondition[] = ['clear', 'partly-cloudy', 'cloudy', 'rain'];
  const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  const today = new Date();
  const forecast = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    forecast.push({
      date,
      dayOfWeek: format(date, 'EEE', { locale: ko }),
      high: Math.floor(Math.random() * 10) + 20,
      low: Math.floor(Math.random() * 10) + 10,
      condition: conditions[Math.floor(Math.random() * conditions.length)] as WeatherCondition,
      precipitation: Math.floor(Math.random() * 100),
      humidity: Math.floor(Math.random() * 40) + 40
    });
  }
  
  return {
    current: {
      location,
      temperature: Math.floor(Math.random() * 15) + 15,
      condition: currentCondition,
      feelsLike: Math.floor(Math.random() * 15) + 15,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      windDirection: 'NW',
      pressure: Math.floor(Math.random() * 50) + 1000,
      uvIndex: Math.floor(Math.random() * 10) + 1,
      visibility: Math.floor(Math.random() * 10) + 5
    },
    forecast,
    lastUpdated: new Date()
  };
};

export default function WeatherWidget({
  title,
  location = '서울',
  units = 'celsius',
  showForecast = true,
  maxForecastDays = 5,
  updateInterval = 30,
  useRealData = false,
  onLocationChange,
  onRefresh,
  lang = 'ko',
  gridSize
}: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'current' | 'forecast' | 'details'>('current');
  
  const displayTitle = title || getWidgetText.weather.title(lang);
  
  // 위젯 크기에 따른 레이아웃 결정
  const widgetSize = useMemo(() => {
    if (!gridSize) return 'small';
    const area = gridSize.w * gridSize.h;
    if (area <= 2) return 'minimal';  // 2x1
    if (area <= 4) return 'small';    // 2x2
    if (area <= 9) return 'medium';   // 3x3
    if (area <= 16) return 'large';   // 4x4
    return 'xlarge';                  // 5x5
  }, [gridSize]);
  
  // Load weather data
  const loadWeatherData = async () => {
    setIsLoading(true);
    try {
      // In real implementation, this would call a weather API
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateMockWeatherData(location || '서울');
      setWeatherData(data);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh weather data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateMockWeatherData(location || '서울');
      setWeatherData(data);
      onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Initial load and interval updates
  useEffect(() => {
    loadWeatherData();
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      loadWeatherData();
    }, updateInterval * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location, updateInterval]);
  
  // Get weather icon and color
  const WeatherIcon = weatherData ? weatherIcons[weatherData.current.condition] : Sun;
  const iconColor = weatherData ? weatherIconColors[weatherData.current.condition] : 'text-gray-400';
  
  // Format temperature
  const formatTemp = (temp: number) => {
    const unit = units === 'celsius' ? '°C' : '°F';
    const value = units === 'fahrenheit' ? Math.round(temp * 9/5 + 32) : temp;
    return `${value}${unit}`;
  };
  
  // Get condition text
  const getConditionText = (condition: WeatherCondition) => {
    const conditionMap: Record<WeatherCondition, string> = {
      'clear': getWidgetText.weather.conditions.clear(lang),
      'partly-cloudy': getWidgetText.weather.conditions.partlyCloudy(lang),
      'cloudy': getWidgetText.weather.conditions.cloudy(lang),
      'rain': getWidgetText.weather.conditions.rain(lang),
      'snow': getWidgetText.weather.conditions.snow(lang),
      'storm': getWidgetText.weather.conditions.storm(lang),
      'fog': getWidgetText.weather.conditions.fog(lang),
      'windy': getWidgetText.weather.conditions.windy(lang)
    };
    return conditionMap[condition] || condition;
  };
  
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
          <CardDescription className={typography.text.description}>
            {getWidgetText.weather.loading(lang)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (!weatherData) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
          <CardDescription className={typography.text.description}>
            {getWidgetText.weather.error(lang)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Button onClick={loadWeatherData} variant="outline">
            {getWidgetText.weather.refresh(lang)}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const gradient = weatherGradients[weatherData.current.condition];
  
  // Minimal 사이즈 (2x1) - 간단한 현재 날씨만
  if (widgetSize === 'minimal') {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <div className="h-full p-3 flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            <WeatherIcon className={cn('h-8 w-8', iconColor)} />
            <div>
              <div className="text-xl font-bold">{formatTemp(weatherData.current.temperature)}</div>
              <div className="text-xs opacity-80">{location}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{getConditionText(weatherData.current.condition)}</div>
            <div className="text-xs opacity-70">{weatherData.current.humidity}%</div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Small 사이즈 (2x2) - 기본 정보
  if (widgetSize === 'small') {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
              <CardDescription className={cn(typography.text.description, 'flex items-center gap-1')}>
                <MapPin className="h-3 w-3" />
                {weatherData.current.location}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
      
        <CardContent className="flex-1 p-2">
          <div className="rounded p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WeatherIcon className={cn('h-10 w-10', iconColor)} />
                <div>
                  <div className="text-2xl font-bold">{formatTemp(weatherData.current.temperature)}</div>
                  <div className="text-xs opacity-80">체감 {formatTemp(weatherData.current.feelsLike || weatherData.current.temperature)}</div>
                </div>
              </div>
              <Badge variant="secondary">
                {getConditionText(weatherData.current.condition)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t">
              <div className="text-center">
                <Wind className="h-3 w-3 mx-auto mb-0.5" />
                <div className="text-[10px] opacity-70">바람</div>
                <div className="text-xs font-semibold">{weatherData.current.windSpeed}m/s</div>
              </div>
              <div className="text-center">
                <Droplets className="h-3 w-3 mx-auto mb-0.5" />
                <div className="text-[10px] opacity-70">습도</div>
                <div className="text-xs font-semibold">{weatherData.current.humidity}%</div>
              </div>
              <div className="text-center">
                <Eye className="h-3 w-3 mx-auto mb-0.5" />
                <div className="text-[10px] opacity-70">가시거리</div>
                <div className="text-xs font-semibold">{weatherData.current.visibility}km</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Large 사이즈 (3x3 이상) - 탭 기반 상세 정보
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
            <CardDescription className={cn(typography.text.description, 'flex items-center gap-1')}>
              <MapPin className="h-3 w-3" />
              {weatherData.current.location}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getWidgetText.weather.refresh(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        {widgetSize === 'medium' ? (
          // Medium 사이즈 - 심플한 레이아웃
          <div className="h-full flex flex-col p-4">
            <div className="rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <WeatherIcon className={cn('h-12 w-12', iconColor)} />
                  <div>
                    <div className="text-3xl font-bold">{formatTemp(weatherData.current.temperature)}</div>
                    <div className="text-sm opacity-80">체감 {formatTemp(weatherData.current.feelsLike || weatherData.current.temperature)}</div>
                  </div>
                </div>
                <div>
                  <Badge variant="secondary">
                    {getConditionText(weatherData.current.condition)}
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Wind className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs opacity-70">바람</div>
                  <div className="text-sm font-semibold">{weatherData.current.windSpeed} m/s</div>
                </div>
                <div className="text-center">
                  <Droplets className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs opacity-70">습도</div>
                  <div className="text-sm font-semibold">{weatherData.current.humidity}%</div>
                </div>
                <div className="text-center">
                  <Thermometer className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs opacity-70">기압</div>
                  <div className="text-sm font-semibold">{weatherData.current.pressure}hPa</div>
                </div>
              </div>
            </div>
            
            {/* 간단한 예보 */}
            {showForecast && weatherData.forecast.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">3일 예보</h4>
                {weatherData.forecast.slice(1, 4).map((day, index) => {
                  const DayIcon = weatherIcons[day.condition];
                  const dayIconColor = weatherIconColors[day.condition];
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <DayIcon className={cn('h-4 w-4', dayIconColor)} />
                        <span className="text-sm">{day.dayOfWeek}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{formatTemp(day.high)}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-muted-foreground">{formatTemp(day.low)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Large & XLarge 사이즈 - 탭 기반 레이아웃
          <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)} className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="current" className="flex-1">현재 날씨</TabsTrigger>
              <TabsTrigger value="forecast" className="flex-1">예보</TabsTrigger>
              {widgetSize === 'xlarge' && (
                <TabsTrigger value="details" className="flex-1">상세정보</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="current" className="flex-1 overflow-auto p-4 mt-0">
              <div className="rounded-lg p-6 bg-muted/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <WeatherIcon className={cn('h-16 w-16', iconColor)} />
                    <div>
                      <div className="text-5xl font-bold">{formatTemp(weatherData.current.temperature)}</div>
                      <div className="text-lg opacity-80 mt-1">체감온도 {formatTemp(weatherData.current.feelsLike || weatherData.current.temperature)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {getConditionText(weatherData.current.condition)}
                    </Badge>
                    <div className="text-sm opacity-70 mt-2">UV 지수: {weatherData.current.uvIndex}</div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-5 w-5" />
                      <span className="text-sm opacity-70">바람</span>
                    </div>
                    <div className="text-2xl font-semibold">{weatherData.current.windSpeed} m/s</div>
                    <div className="text-sm opacity-70">{weatherData.current.windDirection}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-5 w-5" />
                      <span className="text-sm opacity-70">습도</span>
                    </div>
                    <div className="text-2xl font-semibold">{weatherData.current.humidity}%</div>
                    <Progress value={weatherData.current.humidity} className="mt-2 h-2" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5" />
                      <span className="text-sm opacity-70">가시거리</span>
                    </div>
                    <div className="text-2xl font-semibold">{weatherData.current.visibility} km</div>
                  </div>
                </div>
                
                {widgetSize === 'xlarge' && (
                  <>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="h-5 w-5" />
                          <span className="text-sm opacity-70">기압</span>
                        </div>
                        <div className="text-xl font-semibold">{weatherData.current.pressure} hPa</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="h-5 w-5" />
                          <span className="text-sm opacity-70">UV 지수</span>
                        </div>
                        <div className="text-xl font-semibold">{weatherData.current.uvIndex || 0}</div>
                        <Progress value={(weatherData.current.uvIndex || 0) * 10} className="mt-2 h-2" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="forecast" className="flex-1 overflow-auto p-4 mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {weatherData.forecast.map((day, index) => {
                    const DayIcon = weatherIcons[day.condition];
                    const dayIconColor = weatherIconColors[day.condition];
                    return (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <DayIcon className={cn('h-8 w-8', dayIconColor)} />
                            <div>
                              <div className="font-medium text-lg">
                                {index === 0 ? '오늘' : day.dayOfWeek}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {getConditionText(day.condition)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-lg">
                                <span className="font-semibold">{formatTemp(day.high)}</span>
                                <span className="text-muted-foreground mx-2">/</span>
                                <span className="text-muted-foreground">{formatTemp(day.low)}</span>
                              </div>
                            </div>
                            {day.precipitation !== undefined && day.precipitation > 0 && (
                              <div className="flex items-center gap-1 text-blue-500">
                                <Droplets className="h-4 w-4" />
                                <span className="text-sm font-medium">{day.precipitation}%</span>
                              </div>
                            )}
                            {day.humidity !== undefined && (
                              <div className="text-sm text-muted-foreground">
                                습도 {day.humidity}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {widgetSize === 'xlarge' && (
              <TabsContent value="details" className="flex-1 overflow-auto p-4 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">대기 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-muted-foreground">기압</div>
                              <div className="text-2xl font-bold">{weatherData.current.pressure} hPa</div>
                            </div>
                            <Thermometer className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-muted-foreground">UV 지수</div>
                              <div className="text-2xl font-bold">{weatherData.current.uvIndex || 0}</div>
                            </div>
                            <Sun className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <Progress value={(weatherData.current.uvIndex || 0) * 10} className="mt-2" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">바람 정보</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">풍속</div>
                            <div className="text-2xl font-bold">{weatherData.current.windSpeed} m/s</div>
                            <div className="text-sm text-muted-foreground mt-1">방향: {weatherData.current.windDirection}</div>
                          </div>
                          <Wind className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">가시성</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">가시거리</div>
                            <div className="text-2xl font-bold">{weatherData.current.visibility || 0} km</div>
                          </div>
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Progress value={((weatherData.current.visibility || 0) / 15) * 100} className="mt-2" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
        
        {/* 하단 업데이트 시간 */}
        <div className="px-4 py-2 border-t mt-auto">
          <div className="text-xs text-muted-foreground text-center">
            {getWidgetText.weather.lastUpdated(lang)}: {format(weatherData.lastUpdated, 'HH:mm', { locale: ko })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}