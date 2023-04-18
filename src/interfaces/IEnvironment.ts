import { Schema } from "mongoose";
import { IApp } from "./IApp";

export interface IEnvironment extends Document {
    id: string;
    name: string;
    app: Schema.Types.ObjectId | IApp;
    description?: string;
    isActive?: boolean;
    createdBy: string;
    updatedBy?: string;
}