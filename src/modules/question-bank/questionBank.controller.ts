import {
    Request,
    Response,
} from "express";

import * as service from "./questionBank.service";

// =====================================================
// CREATE BANK
// =====================================================

export const createQuestionBank =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.createQuestionBank(
                req.user.orgId,
                req.user.id,
                req.body,
            );

        return res.status(201).json({
            success: true,
            data: result,
        });
    };

// =====================================================
// GET ALL
// =====================================================

export const getQuestionBanks =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.getQuestionBanks(
                req.user.orgId,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };

// =====================================================
// GET SINGLE
// =====================================================

export const getQuestionBankById =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.getQuestionBankById(
                req.params.id,
                req.user.orgId,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };

// =====================================================
// UPDATE BANK
// =====================================================

export const updateQuestionBank =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.updateQuestionBank(
                req.params.id,
                req.body,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };

// =====================================================
// DELETE BANK
// =====================================================

export const deleteQuestionBank =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.deleteQuestionBank(
                req.params.id,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };

// =====================================================
// BULK CREATE QUESTIONS
// =====================================================

export const bulkCreateQuestions =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.bulkCreateQuestions(
                req.params.id,
                req.body,
            );

        return res.status(201).json({
            success: true,
            data: result,
        });
    };

// =====================================================
// UPDATE QUESTION
// =====================================================

export const updateQuestion =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.updateQuestion(
                req.params.questionId,
                req.body,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };

// =====================================================
// DELETE QUESTION
// =====================================================

export const deleteQuestion =
    async (
        req: Request,
        res: Response,
    ) => {
        const result =
            await service.deleteQuestion(
                req.params.questionId,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };