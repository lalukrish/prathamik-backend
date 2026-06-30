// transaction.service.ts
import { transactionRepository } from "./transaction.repository";
import { enrollmentRepository } from "./enrollment.repository";

export const transactionService = {
  async initiate(userId: string, mockTestId: string, amount: number) {
    const existing = await transactionRepository.findByUser(userId);
    const alreadyPending = existing.find(
      (t) => t.mockTestId === mockTestId && t.status === "PENDING",
    );
    if (alreadyPending) return alreadyPending;

    const enrolled = await enrollmentRepository.findOne(userId, mockTestId);
    if (enrolled) throw new Error("Already enrolled in this test.");

    return transactionRepository.create({ userId, mockTestId, amount });
  },

  async confirmDummy(transactionId: string) {
    const txn = await transactionRepository.findById(transactionId);
    if (!txn) throw new Error("Transaction not found.");
    if (txn.status === "SUCCESS") throw new Error("Already confirmed.");

    await transactionRepository.updateStatus(transactionId, "SUCCESS");
    await enrollmentRepository.create(txn.userId, txn.mockTestId as string);

    return { message: "Payment confirmed. Access granted." };
  },

  async getHistory(userId: string) {
    return transactionRepository.findByUser(userId);
  },
};
