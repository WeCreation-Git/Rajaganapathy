import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Package, FileText, Calendar } from "lucide-react";
import { useState } from "react";

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState("monthly");

  // Mock data - will be replaced with real analytics
  const analytics = {
    revenue: {
      total: 1370000,
      growth: 15.2,
      trend: "up"
    },
    expenses: {
      total: 890000,
      growth: -8.5,
      trend: "down"
    },
    profit: {
      total: 480000,
      growth: 22.3,
      trend: "up"
    },
    bills: {
      total: 156,
      growth: 12.1,
      trend: "up"
    }
  };

  const topProducts = [
    { name: "Software License", sales: 450000, units: 180, growth: 18.5 },
    { name: "Hardware Components", sales: 320000, units: 145, growth: 12.3 },
    { name: "Consulting Services", sales: 280000, units: 95, growth: -5.2 },
    { name: "Cloud Storage", sales: 220000, units: 78, growth: 25.1 },
    { name: "Technical Support", sales: 180000, units: 65, growth: 8.9 }
  ];

  const topCompanies = [
    { name: "ABC Technologies Ltd", revenue: 380000, bills: 45, growth: 22.1 },
    { name: "XYZ Industries", revenue: 290000, bills: 32, growth: 15.8 },
    { name: "PQR Enterprises", revenue: 240000, bills: 28, growth: -3.2 },
    { name: "DEF Solutions", revenue: 210000, bills: 25, growth: 18.9 },
    { name: "GHI Corp", revenue: 180000, bills: 22, growth: 12.5 }
  ];

  const recentTrends = [
    { period: "This Week", revenue: 125000, bills: 12, avgBill: 10417 },
    { period: "Last Week", revenue: 108000, bills: 9, avgBill: 12000 },
    { period: "2 Weeks Ago", revenue: 95000, bills: 8, avgBill: 11875 },
    { period: "3 Weeks Ago", revenue: 87000, bills: 7, avgBill: 12429 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your billing performance and trends
          </p>
        </div>
        
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.revenue.total.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+{analytics.revenue.growth}%</span>
              <span className="text-muted-foreground">from last {timeFilter.slice(0, -2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.expenses.total.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-success">{analytics.expenses.growth}%</span>
              <span className="text-muted-foreground">from last {timeFilter.slice(0, -2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{analytics.profit.total.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+{analytics.profit.growth}%</span>
              <span className="text-muted-foreground">from last {timeFilter.slice(0, -2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bills
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bills.total}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+{analytics.bills.growth}%</span>
              <span className="text-muted-foreground">from last {timeFilter.slice(0, -2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Placeholder for future implementation */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chart visualization will be implemented with Supabase data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chart visualization will be implemented with Supabase data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.sales.toLocaleString()}</p>
                    <div className="flex items-center space-x-1">
                      {product.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span className={`text-xs ${product.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                        {product.growth > 0 ? '+' : ''}{product.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                <div key={company.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-accent">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{company.bills} bills</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{company.revenue.toLocaleString()}</p>
                    <div className="flex items-center space-x-1">
                      {company.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span className={`text-xs ${company.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                        {company.growth > 0 ? '+' : ''}{company.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Period</th>
                  <th className="pb-3 font-medium text-muted-foreground">Revenue</th>
                  <th className="pb-3 font-medium text-muted-foreground">Bills Generated</th>
                  <th className="pb-3 font-medium text-muted-foreground">Average Bill Value</th>
                  <th className="pb-3 font-medium text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {recentTrends.map((trend, index) => (
                  <tr key={trend.period} className="border-b last:border-0">
                    <td className="py-3 font-medium">{trend.period}</td>
                    <td className="py-3">₹{trend.revenue.toLocaleString()}</td>
                    <td className="py-3">{trend.bills}</td>
                    <td className="py-3">₹{trend.avgBill.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index === 0 ? "Current" : `${index} week${index > 1 ? 's' : ''} ago`}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;