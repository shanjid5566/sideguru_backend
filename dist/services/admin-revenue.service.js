"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const prisma = prisma_1.prisma;
class AdminRevenueService {
    async getRevenueToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const todayRevenue = await prisma.payment.aggregate({
            where: {
                status: "SUCCESS",
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const yesterdayRevenue = await prisma.payment.aggregate({
            where: {
                status: "SUCCESS",
                createdAt: {
                    gte: yesterday,
                    lt: today,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const todayAmount = todayRevenue._sum.amount || 0;
        const yesterdayAmount = yesterdayRevenue._sum.amount || 0;
        const percentageChange = yesterdayAmount > 0 ? ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100 : 0;
        return {
            statusCode: 200,
            message: "Revenue today retrieved successfully",
            data: {
                revenue: todayAmount,
                percentageChange: Number.parseFloat(percentageChange.toFixed(2)),
                comparison: "vs yesterday",
            },
        };
    }
    async getRevenueThisMonth() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const thisMonthStart = new Date(currentYear, currentMonth, 1);
        const thisMonthEnd = new Date(currentYear, currentMonth + 1, 1);
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEnd = new Date(currentYear, currentMonth, 1);
        const thisMonthRevenue = await prisma.payment.aggregate({
            where: {
                status: "SUCCESS",
                createdAt: {
                    gte: thisMonthStart,
                    lt: thisMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const lastMonthRevenue = await prisma.payment.aggregate({
            where: {
                status: "SUCCESS",
                createdAt: {
                    gte: lastMonthStart,
                    lt: lastMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const thisMonthAmount = thisMonthRevenue._sum.amount || 0;
        const lastMonthAmount = lastMonthRevenue._sum.amount || 0;
        const percentageChange = lastMonthAmount > 0 ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;
        return {
            statusCode: 200,
            message: "Revenue this month retrieved successfully",
            data: {
                revenue: thisMonthAmount,
                percentageChange: Number.parseFloat(percentageChange.toFixed(2)),
                comparison: "vs last month",
            },
        };
    }
    async getTotalRevenue() {
        const totalRevenue = await prisma.payment.aggregate({
            where: {
                status: "SUCCESS",
            },
            _sum: {
                amount: true,
            },
        });
        return {
            statusCode: 200,
            message: "Total revenue retrieved successfully",
            data: {
                revenue: totalRevenue._sum.amount || 0,
                description: "Since launch",
            },
        };
    }
    async getSalesPerformance({ year = new Date().getFullYear() } = {}) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = [];
        for (let month = 0; month < 12; month += 1) {
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 1);
            const revenue = await prisma.payment.aggregate({
                where: {
                    status: "SUCCESS",
                    createdAt: {
                        gte: monthStart,
                        lt: monthEnd,
                    },
                },
                _sum: {
                    amount: true,
                },
            });
            monthlyRevenue.push({
                month: months[month],
                revenue: revenue._sum.amount || 0,
            });
        }
        const total = monthlyRevenue.reduce((sum, monthData) => sum + monthData.revenue, 0);
        return {
            statusCode: 200,
            message: "Sales performance retrieved successfully",
            data: {
                year,
                totalRevenue: total,
                monthlyBreakdown: monthlyRevenue,
            },
        };
    }
    async getRevenueStats() {
        const totalPayments = await prisma.payment.count({
            where: {
                status: "SUCCESS",
            },
        });
        const totalRevenue = await prisma.payment.aggregate({
            where: {
                status: "SUCCESS",
            },
            _sum: {
                amount: true,
            },
        });
        const averageTransaction = totalPayments > 0 ? ((totalRevenue._sum.amount || 0) / totalPayments).toFixed(2) : "0";
        const failedPayments = await prisma.payment.count({
            where: {
                status: "FAILED",
            },
        });
        const pendingPayments = await prisma.payment.count({
            where: {
                status: "PENDING",
            },
        });
        return {
            statusCode: 200,
            message: "Revenue statistics retrieved successfully",
            data: {
                totalRevenue: totalRevenue._sum.amount || 0,
                totalTransactions: totalPayments,
                averageTransaction: Number.parseFloat(averageTransaction),
                failedPayments,
                pendingPayments,
            },
        };
    }
}
const adminRevenueService = new AdminRevenueService();
exports.default = adminRevenueService;
