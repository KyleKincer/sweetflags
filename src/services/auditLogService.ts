import AuditLog from "../models/AuditLog";
import { IAuditLog } from "../interfaces/IAuditLog";
import { Document } from "mongoose";

class AuditLogService {
    async getAllAuditLogs(page: string, limit: string): Promise<Object> {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const auditLogs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limitNumber)
            .exec();

        const totalAuditLogs = await AuditLog.countDocuments();
        const totalPages = Math.ceil(totalAuditLogs / limitNumber);

        return {
            auditLogs,
            page,
            totalPages,
            limit,
            totalAuditLogs,
        }
    }
}

export default new AuditLogService();