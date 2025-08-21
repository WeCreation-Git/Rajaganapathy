import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, FileText, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

type RecentBill = {
  id: string;
  bill_number: string | null;
  amount: number;
  issue_date: string;
  companies?: { company_name: string | null } | null;
};

type Product = {
  id: string;
  name: string;
  unitPrice: number;
};

const Dashboard = () => {
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalBills, setTotalBills] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [recentBills, setRecentBills] = useState<RecentBill[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Counts
        const [companiesRes, productsRes, billsRes] = await Promise.all([
          supabase
            .from("companies")
            .select("id", { count: "exact", head: true })
            .or("isactive.is.null,isactive.eq.true"),
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase
            .from("bills")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
        ]);

        setTotalCompanies(companiesRes.count ?? 0);
        setTotalProducts(productsRes.count ?? 0);
        setTotalBills(billsRes.count ?? 0);

        // Total revenue from paid incoming bills
        const { data: revenueBills } = await supabase
          .from("bills")
          .select("amount, status, type, is_active")
          .eq("is_active", true)
          .eq("status", "paid")
          .eq("type", "incoming");
        const revenueSum = (revenueBills ?? []).reduce((sum, b) => sum + (b.amount || 0), 0);
        setTotalRevenue(revenueSum);

        // Recent bills (3)
        const { data: recent } = await supabase
          .from("bills")
          .select(
            `id, bill_number, amount, issue_date, companies ( company_name )`
          )
          .eq("is_active", true)
          .order("issue_date", { ascending: false })
          .limit(3);
        setRecentBills((recent as unknown as RecentBill[]) || []);

        // Top products by price (no sales data table available)
        const { data: products } = await supabase
          .from("products")
          .select('id, name, "unitPrice"')
          ;
        const sorted = (products as unknown as Product[] | null) ?? [];
        sorted.sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0));
        setTopProducts(sorted.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(
    () => [
      { title: "Total Companies", value: totalCompanies.toString(), icon: Building2, color: "text-primary" },
      { title: "Active Products", value: totalProducts.toString(), icon: Package, color: "text-accent" },
      { title: "Bills Generated", value: totalBills.toString(), icon: FileText, color: "text-warning" },
      { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    ],
    [totalCompanies, totalProducts, totalBills, totalRevenue]
  );

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return "today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your billing management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon as any;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "—" : stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && recentBills.length === 0 ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : recentBills.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent bills</div>
              ) : (
                recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bill.bill_number ? `Bill #${bill.bill_number}` : `Bill ${bill.id}`}</p>
                      <p className="text-sm text-muted-foreground">{bill.companies?.company_name || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(bill.amount || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(bill.issue_date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && topProducts.length === 0 ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : topProducts.length === 0 ? (
                <div className="text-sm text-muted-foreground">No products found</div>
              ) : (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Price</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(product.unitPrice || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Add Company</p>
                <p className="text-sm text-muted-foreground">Register a new company</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium">Generate Bill</p>
                <p className="text-sm text-muted-foreground">Create a new bill</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-muted-foreground">Check performance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;