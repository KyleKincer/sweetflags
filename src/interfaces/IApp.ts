

export interface IApp extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: string;
}