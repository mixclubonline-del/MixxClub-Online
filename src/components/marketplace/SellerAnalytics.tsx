import { DollarSign, ShoppingBag, Star, Package, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';

function StatCard({ icon: Icon, label, value, sub }: {
    icon: typeof DollarSign;
    label: string;
    value: string;
    sub?: string;
}) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                </div>
                <div className="p-2.5 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
            </div>
        </Card>
    );
}

function RevenueChart({ data }: { data: { month: string; revenue: number; sales: number }[] }) {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

    return (
        <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Revenue (Last 12 Months)
            </h3>
            <div className="flex items-end gap-1.5 h-40">
                {data.map((d) => {
                    const pct = (d.revenue / maxRevenue) * 100;
                    const label = d.month.split('-')[1];
                    return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full relative group">
                                <div
                                    className="w-full bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary min-h-[2px]"
                                    style={{ height: `${Math.max(pct, 1)}%` }}
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-1.5 py-0.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                                    ${d.revenue.toLocaleString()} • {d.sales} sales
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{label}</span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

function TopProducts({ products }: { products: { id: string; title: string; sales: number; revenue: number }[] }) {
    if (products.length === 0) return null;

    return (
        <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Top Products
            </h3>
            <div className="space-y-3">
                {products.slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                        <span className="text-sm font-mono text-muted-foreground w-5">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.sales} sales</p>
                        </div>
                        <span className="font-semibold text-sm text-primary">${p.revenue.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function RatingTrend({ data }: { data: { month: string; average: number; count: number }[] }) {
    return (
        <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> Rating Trend
            </h3>
            <div className="flex items-end gap-1.5 h-32">
                {data.map((d) => {
                    const pct = (d.average / 5) * 100;
                    const label = d.month.split('-')[1];
                    return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full relative group">
                                <div
                                    className="w-full bg-yellow-400/80 rounded-t transition-all duration-300 hover:bg-yellow-400 min-h-[2px]"
                                    style={{ height: `${d.count > 0 ? Math.max(pct, 5) : 0}%` }}
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-1.5 py-0.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                                    {d.average > 0 ? `${d.average}★ (${d.count})` : 'No reviews'}
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{label}</span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

export default function SellerAnalytics() {
    const { data: analytics, isLoading } = useSellerAnalytics();

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Products Yet</h2>
                <p className="text-muted-foreground">Start selling to see your analytics</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`$${analytics.totalRevenue.toLocaleString()}`}
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Total Sales"
                    value={analytics.totalSales.toString()}
                />
                <StatCard
                    icon={Star}
                    label="Avg Rating"
                    value={analytics.averageRating > 0 ? `${analytics.averageRating}★` : 'N/A'}
                    sub={`${analytics.totalReviews} reviews`}
                />
                <StatCard
                    icon={Package}
                    label="Products"
                    value={analytics.totalProducts.toString()}
                />
            </div>

            {/* Charts row */}
            <RevenueChart data={analytics.revenueByMonth} />

            <div className="grid md:grid-cols-2 gap-6">
                <TopProducts products={analytics.topProducts} />
                <RatingTrend data={analytics.ratingTrend} />
            </div>
        </div>
    );
}
