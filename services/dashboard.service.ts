import { prisma as prismaClient } from "../lib/prisma";
import { createHttpError } from "../utils/httpError";

const prisma: any = prismaClient;

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SUPPORTED_PERIODS = ["thisYear", "lastYear", "thisMonth", "lastMonth", "last3Months", "last6Months"] as const;

type Period = (typeof SUPPORTED_PERIODS)[number];

type DateRange = { start: Date; end: Date };

type PeriodConfig = {
  period: Period;
  label: string;
  currentRange: DateRange;
  previousRange: DateRange;
  bucketType: "day" | "month";
  bucketCount: number;
  year: number;
};

type Bucket = {
  label: string;
  start: Date;
  end: Date;
  revenue: number;
  payments: number;
};

const getMonthRange = (date = new Date(), monthOffset = 0): DateRange => {
  const reference = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  return { start, end };
};

const getYearRange = (date = new Date(), yearOffset = 0): DateRange & { year: number } => {
  const year = date.getFullYear() + yearOffset;
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { start, end, year };
};

const shiftRange = ({ start, end }: DateRange, amount: number, unit: "month" | "year"): DateRange => {
  const shiftedStart = new Date(start);
  const shiftedEnd = new Date(end);

  if (unit === "month") {
    shiftedStart.setMonth(shiftedStart.getMonth() + amount);
    shiftedEnd.setMonth(shiftedEnd.getMonth() + amount);
  } else {
    shiftedStart.setFullYear(shiftedStart.getFullYear() + amount);
    shiftedEnd.setFullYear(shiftedEnd.getFullYear() + amount);
  }

  return { start: shiftedStart, end: shiftedEnd };
};

const getRangeForPeriod = (period: Period, now = new Date()): PeriodConfig => {
  switch (period) {
    case "thisYear": {
      const current = getYearRange(now, 0);
      return {
        period,
        label: "This year",
        currentRange: { start: current.start, end: current.end },
        previousRange: shiftRange(current, -1, "year"),
        bucketType: "month",
        bucketCount: 12,
        year: current.year,
      };
    }
    case "lastYear": {
      const current = getYearRange(now, -1);
      return {
        period,
        label: "Last year",
        currentRange: { start: current.start, end: current.end },
        previousRange: shiftRange(current, -1, "year"),
        bucketType: "month",
        bucketCount: 12,
        year: current.year,
      };
    }
    case "thisMonth": {
      const current = getMonthRange(now, 0);
      const totalDays = new Date(current.start.getFullYear(), current.start.getMonth() + 1, 0).getDate();
      return {
        period,
        label: "This month",
        currentRange: current,
        previousRange: getMonthRange(now, -1),
        bucketType: "day",
        bucketCount: totalDays,
        year: current.start.getFullYear(),
      };
    }
    case "lastMonth": {
      const current = getMonthRange(now, -1);
      const totalDays = new Date(current.start.getFullYear(), current.start.getMonth() + 1, 0).getDate();
      return {
        period,
        label: "Last month",
        currentRange: current,
        previousRange: getMonthRange(now, -2),
        bucketType: "day",
        bucketCount: totalDays,
        year: current.start.getFullYear(),
      };
    }
    case "last3Months": {
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const start = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 2, 1);
      const end = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1);
      return {
        period,
        label: "Last 3 months",
        currentRange: { start, end },
        previousRange: {
          start: new Date(start.getFullYear(), start.getMonth() - 3, 1),
          end: new Date(start.getFullYear(), start.getMonth(), 1),
        },
        bucketType: "month",
        bucketCount: 3,
        year: end.getFullYear(),
      };
    }
    case "last6Months": {
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const start = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 5, 1);
      const end = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1);
      return {
        period,
        label: "Last 6 months",
        currentRange: { start, end },
        previousRange: {
          start: new Date(start.getFullYear(), start.getMonth() - 6, 1),
          end: new Date(start.getFullYear(), start.getMonth(), 1),
        },
        bucketType: "month",
        bucketCount: 6,
        year: end.getFullYear(),
      };
    }
    default:
      throw createHttpError(400, `period must be one of: ${SUPPORTED_PERIODS.join(", ")}`);
  }
};

const buildChartBuckets = ({ currentRange, bucketType, bucketCount }: PeriodConfig): Bucket[] => {
  if (bucketType === "day") {
    return Array.from({ length: bucketCount }, (_, index) => ({
      label: String(index + 1),
      start: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), index + 1),
      end: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), index + 2),
      revenue: 0,
      payments: 0,
    }));
  }

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(currentRange.start.getFullYear(), currentRange.start.getMonth() + index, 1);
    const bucketEnd = new Date(currentRange.start.getFullYear(), currentRange.start.getMonth() + index + 1, 1);

    return {
      label: `${MONTH_LABELS[bucketStart.getMonth()]} ${bucketStart.getFullYear()}`,
      start: bucketStart,
      end: bucketEnd,
      revenue: 0,
      payments: 0,
    };
  });
};

const applyPaymentsToBuckets = (payments: Array<{ amount: number; createdAt: Date }>, buckets: Bucket[]): void => {
  for (const payment of payments) {
    const bucket = buckets.find((entry) => payment.createdAt >= entry.start && payment.createdAt < entry.end);
    if (!bucket) {
      continue;
    }

    bucket.revenue = Number((bucket.revenue + payment.amount).toFixed(2));
    bucket.payments += 1;
  }
};

const toPercentageChange = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(2));
};

class DashboardService {
  async getAdminOverview({ period = "thisYear" }: { period?: string } = {}) {
    const now = new Date();
    const selectedPeriod = (period || "thisYear") as Period;

    if (!SUPPORTED_PERIODS.includes(selectedPeriod)) {
      throw createHttpError(400, `period must be one of: ${SUPPORTED_PERIODS.join(", ")}`);
    }

    const periodConfig = getRangeForPeriod(selectedPeriod, now);
    const { currentRange, previousRange } = periodConfig;

    const [
      currentUsers,
      previousUsers,
      currentListings,
      previousListings,
      currentRevenueAggregate,
      previousRevenueAggregate,
      currentPendingListings,
      previousPendingListings,
      currentSpamAggregate,
      previousSpamAggregate,
      successfulPayments,
      currentServiceListings,
      currentEventListings,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: currentRange.start, lt: currentRange.end } } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: previousRange.start, lt: previousRange.end } } }),
      prisma.listing.count({ where: { deletedAt: null, createdAt: { gte: currentRange.start, lt: currentRange.end } } }),
      prisma.listing.count({ where: { deletedAt: null, createdAt: { gte: previousRange.start, lt: previousRange.end } } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: currentRange.start, lt: currentRange.end } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: previousRange.start, lt: previousRange.end } },
        _sum: { amount: true },
      }),
      prisma.listing.count({
        where: {
          deletedAt: null,
          status: "PENDING",
          createdAt: { gte: currentRange.start, lt: currentRange.end },
        },
      }),
      prisma.listing.count({
        where: {
          deletedAt: null,
          status: "PENDING",
          createdAt: { gte: previousRange.start, lt: previousRange.end },
        },
      }),
      prisma.listing.aggregate({
        where: { deletedAt: null, createdAt: { gte: currentRange.start, lt: currentRange.end } },
        _sum: { spamReports: true },
      }),
      prisma.listing.aggregate({
        where: { deletedAt: null, createdAt: { gte: previousRange.start, lt: previousRange.end } },
        _sum: { spamReports: true },
      }),
      prisma.payment.findMany({
        where: { status: "SUCCESS", createdAt: { gte: currentRange.start, lt: currentRange.end } },
        select: { amount: true, createdAt: true },
      }),
      prisma.listing.count({
        where: {
          deletedAt: null,
          listingType: "SERVICE",
          createdAt: { gte: currentRange.start, lt: currentRange.end },
        },
      }),
      prisma.listing.count({
        where: {
          deletedAt: null,
          listingType: "EVENT",
          createdAt: { gte: currentRange.start, lt: currentRange.end },
        },
      }),
    ]);

    const chartBuckets = buildChartBuckets(periodConfig);
    applyPaymentsToBuckets(successfulPayments, chartBuckets);

    const currentRevenue = Number((currentRevenueAggregate._sum.amount || 0).toFixed(2));
    const previousRevenue = Number((previousRevenueAggregate._sum.amount || 0).toFixed(2));
    const currentSpamReports = currentSpamAggregate._sum.spamReports || 0;
    const previousSpamReports = previousSpamAggregate._sum.spamReports || 0;

    return {
      statusCode: 200,
      message: "Admin dashboard overview retrieved successfully",
      data: {
        filter: {
          period: periodConfig.period,
          label: periodConfig.label,
          currentRange,
          previousRange,
        },
        overview: {
          totalUsers: {
            value: currentUsers,
            previousValue: previousUsers,
            changePercentage: toPercentageChange(currentUsers, previousUsers),
          },
          totalListings: {
            value: currentListings,
            previousValue: previousListings,
            changePercentage: toPercentageChange(currentListings, previousListings),
            breakdown: { services: currentServiceListings, events: currentEventListings },
          },
          totalRevenue: {
            value: currentRevenue,
            previousValue: previousRevenue,
            changePercentage: toPercentageChange(currentRevenue, previousRevenue),
          },
          pendingListings: {
            value: currentPendingListings,
            previousValue: previousPendingListings,
            changePercentage: toPercentageChange(currentPendingListings, previousPendingListings),
          },
          spamReports: {
            value: currentSpamReports,
            previousValue: previousSpamReports,
            changePercentage: toPercentageChange(currentSpamReports, previousSpamReports),
            note: "Spam reports are aggregated from listings created in the selected period.",
          },
        },
        salesPerformance: {
          period: periodConfig.period,
          label: periodConfig.label,
          currency: "USD",
          totalRevenue: Number(chartBuckets.reduce((sum, bucket) => sum + bucket.revenue, 0).toFixed(2)),
          points: chartBuckets.map((bucket, index) => ({
            index: index + 1,
            label: bucket.label,
            revenue: bucket.revenue,
            payments: bucket.payments,
          })),
        },
      },
    };
  }
}

const dashboardService = new DashboardService();

export default dashboardService;
