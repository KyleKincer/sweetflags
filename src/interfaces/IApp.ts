export interface IApp extends Document {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: string;
}

export interface IAppInputDTO {
    name: string;
    description: string;
    isActive: boolean;
    createdBy: string;
}