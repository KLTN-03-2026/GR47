import Booking from '../models/BookingModel.js';
import Cleaner from '../models/CleanerModel.js';

export const getDashboardStats = async (req, res) => {
    try {
        const filter = req.query.filter || 'today';

        const now = new Date();
        let startDate, endDate;

        if (filter === 'week') {
            const firstDay = now.getDate() - now.getDay() + 1;
            startDate = new Date(now.setDate(firstDay));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (filter === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else {
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
        }

        const [completedBookings, activeCleanersCount] = await Promise.all([
            Booking.find({
                Booking_Status: '4',
                createdAt: { $gte: startDate, $lte: endDate }
            }),
            Cleaner.countDocuments({
                Status: 1
            })
        ]);

        const completedOrders = completedBookings.length;
        const revenue = completedBookings.reduce((sum, order) => sum + (order.Total_Amount || 0), 0);

        let chartData = [];
        let maxChartValue = 0;

        if (filter === 'today') {
            const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
            const buckets = { "08:00": 0, "10:00": 0, "12:00": 0, "14:00": 0, "16:00": 0, "18:00": 0, "20:00": 0 };

            completedBookings.forEach(order => {
                const hour = new Date(order.createdAt).getHours();
                if (hour <= 9) buckets["08:00"]++;
                else if (hour <= 11) buckets["10:00"]++;
                else if (hour <= 13) buckets["12:00"]++;
                else if (hour <= 15) buckets["14:00"]++;
                else if (hour <= 17) buckets["16:00"]++;
                else if (hour <= 19) buckets["18:00"]++;
                else buckets["20:00"]++;
            });

            maxChartValue = Math.max(...Object.values(buckets));
            chartData = timeSlots.map(label => ({
                label,
                value: maxChartValue > 0 ? Math.round((buckets[label] / maxChartValue) * 100) : 0
            }));

        } else if (filter === 'week') {
            const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
            const buckets = { "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0, "T7": 0, "CN": 0 };

            completedBookings.forEach(order => {
                const dayIndex = new Date(order.createdAt).getDay();
                const label = dayLabels[dayIndex];
                buckets[label]++;
            });

            maxChartValue = Math.max(...Object.values(buckets));
            const sortedDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
            chartData = sortedDays.map(label => ({
                label,
                value: maxChartValue > 0 ? Math.round((buckets[label] / maxChartValue) * 100) : 0
            }));
        } else {
            chartData = [];
        }

        return res.status(200).json({
            success: true,
            data: {
                kpi: {
                    revenue: revenue,
                    completedOrders: completedOrders,
                    activeCleaners: activeCleanersCount
                },
                chart: chartData
            }
        });

    } catch (error) {
        console.error("❌ Lỗi Thống Kê Dashboard:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi tải biểu đồ',
            loi_that_su_la_gi: error.message
        });
    }
};