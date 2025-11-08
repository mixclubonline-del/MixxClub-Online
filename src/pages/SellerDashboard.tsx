import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Star, Upload, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '@/hooks/useMarketplace';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SellerDashboard = () => {
    const { sellerStats, sellerEarnings, sellerProducts, handleUploadProduct } = useMarketplace();

    const statCards = [
        {
            icon: DollarSign,
            title: 'Total Earnings',
            value: `$${sellerStats.totalEarnings.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            change: '+12.5% this month',
            color: 'from-emerald-500 to-teal-500',
        },
        {
            icon: DollarSign,
            title: 'This Month',
            value: `$${sellerStats.monthlyEarnings.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            change: '+8.2% from last month',
            color: 'from-violet-500 to-pink-500',
        },
        {
            icon: ShoppingCart,
            title: 'Total Sales',
            value: sellerStats.totalSales.toLocaleString(),
            change: `${sellerStats.totalDownloads.toLocaleString()} downloads`,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Star,
            title: 'Average Rating',
            value: sellerStats.averageRating.toFixed(2),
            change: 'Based on all products',
            color: 'from-yellow-500 to-orange-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white">Seller Dashboard</h1>
                            <p className="text-slate-400 mt-1">Manage your products and earnings</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                            <Button className="bg-gradient-to-r from-violet-500 to-pink-500">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New Product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-violet-500/50 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                </div>
                                <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.change}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Earnings chart */}
                    <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Earnings Over Time</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sellerEarnings}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: '#f1f5f9' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    dot={{ fill: '#ec4899', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Quick stats */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Quick Stats</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-300 text-sm">Active Products</span>
                                    <span className="text-white font-bold">{sellerProducts.length}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                    {/* Progress bar for active products */}
                                    <div
                                        className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min((sellerProducts.length / 20) * 100, 100)}%` } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-300 text-sm">Total Downloads</span>
                                    <span className="text-white font-bold">
                                        {sellerStats.totalDownloads.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                    {/* Progress bar for total downloads */}
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min((sellerStats.totalDownloads / 50000) * 100, 100)}%`,
                                        } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-300 text-sm">Avg Rating</span>
                                    <span className="text-white font-bold">
                                        {sellerStats.averageRating.toFixed(2)}/5.0
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 h-2 rounded ${i < Math.floor(sellerStats.averageRating)
                                                ? 'bg-yellow-400'
                                                : 'bg-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products table */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Your Products</h2>
                        <Button className="bg-gradient-to-r from-violet-500 to-pink-500">
                            <Upload className="w-4 h-4 mr-2" />
                            New Product
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                                        Product
                                    </th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                                        Price
                                    </th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                                        Sales
                                    </th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                                        Downloads
                                    </th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                                        Rating
                                    </th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                                        Earnings
                                    </th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellerProducts.slice(0, 5).map((product, i) => (
                                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/30">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl">{product.image}</div>
                                                <div>
                                                    <p className="text-white font-medium line-clamp-1">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-slate-400 text-sm">
                                                        {product.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-white">${product.price}</td>
                                        <td className="py-3 px-4 text-white">142</td>
                                        <td className="py-3 px-4 text-white">
                                            {product.downloads.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-400">★</span>
                                                <span className="text-white">{product.rating.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-white font-bold">
                                            ${(product.price * 142 * 0.7).toLocaleString('en-US', {
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Button variant="ghost" size="sm">
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {sellerProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-400 mb-4">No products yet</p>
                            <Button className="bg-gradient-to-r from-violet-500 to-pink-500">
                                Upload Your First Product
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
