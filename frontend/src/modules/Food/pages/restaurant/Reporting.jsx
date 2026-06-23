import { useEffect, useState } from "react";
import { Info, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import apiClient from "@food/api";
import Loader from "@food/components/Loader";

const generateTrendData = (dataArray) => {
  if (!dataArray || !Array.isArray(dataArray)) return [];
  return dataArray.map((value, index) => ({ value, index }));
};

const Sparkline = ({ data, color = "#256fef" }) => {
  const chartData = generateTrendData(data);
  return (
    <div className="h-10 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={true}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function Reporting() {
  const [activeTab, setActiveTab] = useState("live_tracking");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [changes, setChanges] = useState(null);

  useEffect(() => {
    const fetchLiveTracking = async () => {
      try {
        setLoading(true);
        // We assume restaurantAPI has been extended or we can just fetch using raw fetch if it's not
        // Let's use the standard fetch pattern with Authorization header if needed, 
        // or just add it to restaurantAPI temporarily via a direct axios call if the method doesn't exist
        const response = await apiClient.get('/food/restaurant/reports/live-tracking', { contextModule: "restaurant" });
        if (response.data?.success) {
          setMetrics(response.data.data.metrics);
          setChanges(response.data.data.changes);
        }
      } catch (error) {
        console.error("Failed to load reporting data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveTracking();
  }, []);

  if (loading) return <Loader />;

  const formatCurrency = (val) => `₹${val?.toLocaleString("en-IN") || 0}`;
  const formatPercent = (val) => `${val || 0}%`;

  const MetricRow = ({ label, sparklineData, value, change, isCurrency = false, isPercent = false, isNegativeGood = false }) => {
    const isPositive = change > 0;
    const isZero = change === 0;
    
    // For bad orders, positive change is bad (red), negative is good (green)
    let changeColor = "#23b26b"; // green
    let changeBg = "#e9f7ef";
    if (!isZero) {
        if ((isPositive && isNegativeGood) || (!isPositive && !isNegativeGood)) {
            changeColor = "#ef4444"; // red
            changeBg = "#fef2f2";
        }
    } else {
        changeColor = "#6b7280"; // gray
        changeBg = "#f3f4f6";
    }

    return (
      <div className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0">
        <div className="w-1/3 text-sm font-medium text-gray-700">{label}</div>
        <div className="w-1/3 flex justify-center">
          <Sparkline data={sparklineData} />
        </div>
        <div className="w-1/3 flex items-center justify-end gap-4">
          <span className="text-base font-semibold text-gray-900">
            {isCurrency ? formatCurrency(value) : isPercent ? formatPercent(value) : value}
          </span>
          <div 
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold"
            style={{ backgroundColor: changeBg, color: changeColor }}
          >
            {isPositive ? "+" : ""}{change}%
            {isPositive ? <TrendingUp className="h-3 w-3" /> : isZero ? null : <TrendingDown className="h-3 w-3" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("live_tracking")}
            className={`pb-4 text-base font-semibold transition-colors ${
              activeTab === "live_tracking"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Live tracking
          </button>
          <button
            onClick={() => setActiveTab("business_reports")}
            className={`pb-4 text-base font-semibold transition-colors ${
              activeTab === "business_reports"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Business reports
          </button>
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>All outlets</span>
        </div>
      </div>

      {activeTab === "business_reports" ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500">
          Business reports coming soon.
        </div>
      ) : (
        <>
          <div className="rounded-lg bg-blue-50/50 p-3 text-center text-sm text-blue-800">
            Comparison is with previous week. Trendline is of latest 5 days for the same time period.
          </div>

          {metrics && changes ? (
            <div className="space-y-6">
              {/* Sales Overview */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-green-500"></div>
                    <h2 className="text-base font-bold text-gray-900">Sales overview</h2>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="px-6 py-2">
                  <MetricRow 
                    label="Sales" 
                    sparklineData={metrics.sales.trend} 
                    value={metrics.sales.current} 
                    change={changes.sales} 
                    isCurrency 
                  />
                  <MetricRow 
                    label="Delivered orders" 
                    sparklineData={metrics.deliveredOrders.trend} 
                    value={metrics.deliveredOrders.current} 
                    change={changes.deliveredOrders} 
                  />
                  <MetricRow 
                    label="AOV" 
                    sparklineData={metrics.aov.trend} 
                    value={metrics.aov.current} 
                    change={changes.aov} 
                    isCurrency 
                  />
                </div>
              </div>

              {/* Customer Experience */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-yellow-500"></div>
                    <h2 className="text-base font-bold text-gray-900">Customer Experience</h2>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="px-6 py-2">
                  <MetricRow 
                    label="Ratings" 
                    sparklineData={metrics.ratings.trend} 
                    value={metrics.ratings.current} 
                    change={changes.ratings} 
                  />
                  <div className="py-4 text-sm font-semibold text-gray-900">Bad orders</div>
                  <div className="pl-6">
                    <MetricRow 
                        label="Rejected orders" 
                        sparklineData={metrics.rejectedOrders.trend} 
                        value={metrics.rejectedOrders.current} 
                        change={changes.rejectedOrders} 
                        isPercent
                        isNegativeGood
                    />
                    <MetricRow 
                        label="Delayed orders" 
                        sparklineData={metrics.delayedOrders.trend} 
                        value={metrics.delayedOrders.current} 
                        change={changes.delayedOrders} 
                        isPercent
                        isNegativeGood
                    />
                    <MetricRow 
                        label="Poor rated orders" 
                        sparklineData={metrics.poorRatedOrders.trend} 
                        value={metrics.poorRatedOrders.current} 
                        change={changes.poorRatedOrders} 
                        isPercent
                        isNegativeGood
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-gray-500">No data available</div>
          )}
        </>
      )}
    </div>
  );
}
