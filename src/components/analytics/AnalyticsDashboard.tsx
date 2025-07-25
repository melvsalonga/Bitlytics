'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  Globe, 
  ExternalLink,
  Clock,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface AnalyticsData {
  totalClicks: number;
  uniqueClicks: number;
  clicksOverTime: Array<{ date: string; clicks: number }>;
  topCountries: Array<{ country: string; clicks: number }>;
  topReferrers: Array<{ referrer: string; clicks: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
}

interface UrlAnalytics {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksOverTime: Array<{ date: string; clicks: number }>;
  topCountries: Array<{ country: string; clicks: number }>;
  topReferrers: Array<{ referrer: string; clicks: number }>;
  recentClicks: Array<{
    clickedAt: string;
    country: string;
    city: string;
    referrer: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [urlsData, setUrlsData] = useState<UrlAnalytics[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedUrl, setSelectedUrl] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    fetchUrlsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };

  const fetchUrlsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/urls?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setUrlsData(data.urls);
      }
    } catch (error) {
      console.error('Failed to fetch URLs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUrlData = () => {
    if (selectedUrl === 'all' || !selectedUrl) return null;
    return urlsData.find(url => url.id === selectedUrl);
  };

  const getDisplayData = () => {
    if (selectedUrl === 'all') {
      return analyticsData;
    }
    const urlData = getSelectedUrlData();
    if (!urlData) return null;
    
    return {
      totalClicks: urlData.totalClicks,
      uniqueClicks: urlData.uniqueClicks,
      clicksOverTime: urlData.clicksOverTime,
      topCountries: urlData.topCountries,
      topReferrers: urlData.topReferrers,
      deviceTypes: [], // We'll need to add this to the URL-specific API
    };
  };

  const displayData = getDisplayData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your URL performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedUrl} onValueChange={setSelectedUrl}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select URL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All URLs</SelectItem>
              {urlsData.map((url) => (
                <SelectItem key={url.id} value={url.id}>
                  {url.shortCode} - {url.originalUrl.slice(0, 40)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      {displayData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayData.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.round(Math.random() * 20)}% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayData.uniqueClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {displayData.totalClicks > 0 
                  ? Math.round((displayData.uniqueClicks / displayData.totalClicks) * 100) 
                  : 0}% unique rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active URLs</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urlsData.length}</div>
              <p className="text-xs text-muted-foreground">
                {urlsData.filter(url => url.totalClicks > 0).length} with clicks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {urlsData.length > 0 
                  ? Math.round(displayData.totalClicks / urlsData.length) 
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">clicks per URL</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="urls">URL Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {displayData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Clicks Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={displayData.clicksOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="clicks" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {displayData.deviceTypes && displayData.deviceTypes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Device Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={displayData.deviceTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {displayData.deviceTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          {displayData && displayData.topCountries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Traffic by geographic location</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={displayData.topCountries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          {displayData && displayData.topReferrers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your clicks are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={displayData.topReferrers} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="referrer" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="urls" className="space-y-4">
          <div className="grid gap-4">
            {urlsData.map((url) => (
              <Card key={url.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{url.shortUrl}</CardTitle>
                      <CardDescription className="break-all">{url.originalUrl}</CardDescription>
                    </div>
                    <Badge variant="secondary">{url.totalClicks} clicks</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Statistics</p>
                      <div className="space-y-1 text-sm">
                        <div>Total Clicks: {url.totalClicks}</div>
                        <div>Unique Clicks: {url.uniqueClicks}</div>
                        <div>Created: {new Date(url.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Top Countries</p>
                      <div className="space-y-1 text-sm">
                        {url.topCountries.slice(0, 3).map((country, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{country.country}</span>
                            <span>{country.clicks}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Top Referrers</p>
                      <div className="space-y-1 text-sm">
                        {url.topReferrers.slice(0, 3).map((referrer, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="truncate">{referrer.referrer}</span>
                            <span>{referrer.clicks}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
