const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const {
  serializeComplaint,
  complaintInclude,
} = require("./complaints.controller");

const listComplaints = asyncHandler(async (req, res) => {
  const { status, targetType } = req.validated.query;

  const complaints = await prisma.complaint.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(targetType ? { targetType } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: complaintInclude,
  });

  res.json({
    items: complaints.map(serializeComplaint),
  });
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { status, moderatorNote } = req.validated.body;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
  });

  if (!complaint) {
    throw new ApiError(404, "Скаргу не знайдено");
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      status,
      moderatorNote: moderatorNote || null,
      moderatorId: req.user.id,
      resolvedAt: ["RESOLVED", "REJECTED"].includes(status) ? new Date() : null,
    },
    include: complaintInclude,
  });

  res.json({
    message: "Статус скарги оновлено",
    item: serializeComplaint(updated),
  });
});

const hideAd = asyncHandler(async (req, res) => {
  const { adId } = req.validated.params;
  const reason =
    req.validated.body?.reason || "Оголошення приховано модератором";

  const ad = await prisma.ad.findFirst({
    where: {
      id: adId,
      status: {
        not: "DELETED",
      },
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  const updated = await prisma.ad.update({
    where: { id: adId },
    data: {
      status: "HIDDEN",
      moderationFlag: "NEEDS_REVIEW",
      moderationReason: reason,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      moderationFlag: true,
      moderationReason: true,
    },
  });

  res.json({
    message: "Оголошення приховано",
    item: updated,
  });
});

const restoreAd = asyncHandler(async (req, res) => {
  const { adId } = req.validated.params;

  const ad = await prisma.ad.findFirst({
    where: {
      id: adId,
      status: "HIDDEN",
    },
  });

  if (!ad) {
    throw new ApiError(404, "Приховане оголошення не знайдено");
  }

  const updated = await prisma.ad.update({
    where: { id: adId },
    data: {
      status: "ACTIVE",
      moderationFlag: "NONE",
      moderationReason: null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      moderationFlag: true,
      moderationReason: true,
    },
  });

  res.json({
    message: "Оголошення відновлено",
    item: updated,
  });
});

const getModerationStats = asyncHandler(async (req, res) => {
  const [
    totalComplaints,
    newComplaints,
    inProgressComplaints,
    resolvedComplaints,
    rejectedComplaints,
    hiddenAds,
    suspiciousAds,
    needsReviewAds,
  ] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: "NEW" } }),
    prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
    prisma.complaint.count({ where: { status: "RESOLVED" } }),
    prisma.complaint.count({ where: { status: "REJECTED" } }),
    prisma.ad.count({ where: { status: "HIDDEN" } }),
    prisma.ad.count({ where: { moderationFlag: "SUSPICIOUS" } }),
    prisma.ad.count({ where: { moderationFlag: "NEEDS_REVIEW" } }),
  ]);

  res.json({
    stats: {
      totalComplaints,
      newComplaints,
      inProgressComplaints,
      resolvedComplaints,
      rejectedComplaints,
      hiddenAds,
      suspiciousAds,
      needsReviewAds,
    },
  });
});

module.exports = {
  listComplaints,
  updateComplaintStatus,
  hideAd,
  restoreAd,
  getModerationStats,
};
