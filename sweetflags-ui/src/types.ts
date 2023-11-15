export interface App {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdBy: string;
  }

  export interface AppCreatePayload {
    name: string;
    description: string;
    isActive: boolean;
    createdBy: string;
  }

  export interface Environment {
    id: string;
    name: string;
    description: string;
    environment: string;
    isActive: boolean;
    evaluationStrategy: string;
    evaluationPercentage?: number;
    allowedUsers?: User[];
    disallowedUsers?: User[];
  }
  
  export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    app: App;
    environments: [
      {
        environment: Environment;
        isActive: boolean;
        evaluationStrategy: string;
        evaluationPercentage?: number;
        allowedUsers?: User[];
        disallowedUsers?: User[];
        id: string;
      }
      
    ]
    createdBy: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  }

  export interface User {
    id: string;
    externalId: string;
    name: string;
    app: App;
    metadata: Object;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  }

  export interface FeatureFlagCreatePayload {
    name: string;
    description: string;
    appId: string;
    isActive: boolean;
    evaluationStrategy: string;
    createdBy: string;
    evaluationPercentage?: number;
    allowedUsers?: string[];
    disallowedUsers?: string[];
  }

  export interface EnvironmentCreatePayload {
    name: string;
    description: string;
    appId: string;
    isActive: boolean;
    createdBy: string;
  }

  export interface Log {
    id: string;
    user: string;
    action: string;
    targetType: string;
    targetId: string;
    message: string;
    createdAt: string;
    updatedAt: string;
  }