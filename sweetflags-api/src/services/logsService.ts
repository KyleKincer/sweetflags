import { isValidObjectId } from "mongoose";
import Log from "../models/LogModel";

class LogsService {
    async getAllLogs(page: number, limit: number): Promise<{ logs: any[], totalPages: number, currentPage: number }> {
        const logsDocs = await Log.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();
        const logs = logsDocs.map(log => log.toObject());
        const totalLogs = await Log.countDocuments().exec();
        const totalPages = Math.ceil(totalLogs / limit);
        return { logs: logs, totalPages: totalPages, currentPage: page };
    }

    async getLogsByTarget(target: string, page: number, limit: number): Promise<{ logs: any[], totalPages: number, currentPage: number }> {
        if (!isValidObjectId(target)) {
            throw new Error('Invalid target ID');
        }

        const logsDocs = await Log.find({ targetId: target }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();
        const logs = logsDocs.map(log => log.toObject());
        const totalLogs = await Log.countDocuments({ targetId: target }).exec();
        const totalPages = Math.ceil(totalLogs / limit);
        return { logs: logs, totalPages: totalPages, currentPage: page };
    }

}

export default new LogsService();