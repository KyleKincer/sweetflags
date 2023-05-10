import { Schema } from "mongoose";

export interface ILog extends Document {
    id: string;
    user: string;
    action: string;
    targetType: string;
    targetId: Schema.Types.ObjectId;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}