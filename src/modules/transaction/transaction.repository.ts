// transaction.repo.ts
import { prisma } from "../../config/db";
import { PaymentStatus } from "@prisma/client";

export const transactionRepository = {
  async create(data: {
    userId: string;
    mockTestId: string;
    amount: number;
    currency?: string;
  }) {
    return prisma.transaction.create({
      data: {
        userId: data.userId,
        mockTestId: data.mockTestId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        status: "PENDING",
      },
    });
  },

  async findByUser(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        mockTest: {
          select: { id: true, title: true, thumbnailUrl: true, category: true },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      include: { mockTest: true, user: true },
    });
  },

  async updateStatus(
    id: string,
    status: PaymentStatus,
    razorpayData?: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    },
  ) {
    return prisma.transaction.update({
      where: { id },
      data: { status, ...razorpayData },
    });
  },
};
