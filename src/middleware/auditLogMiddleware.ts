import AuditLog from '../models/AuditLog';
import { Document } from 'mongoose';

export async function createAuditLog(originalDoc: Document | null, updatedDoc: Document, operation: String, updatedBy: String) {
    if (!originalDoc) {
        const auditLog = new AuditLog({
            documentId: updatedDoc._id,
            documentType: (updatedDoc as any).constructor.modelName,
            operation,
            updateDetails: updatedDoc.toObject(),
            updatedBy,
            timestamp: new Date()
        });
        await auditLog.save();
        return;
    }

    const original = originalDoc.toObject();
    const updated = updatedDoc.toObject();
    const updateDetails: any = {};

    Object.keys(updated).forEach((key) => {
        if (key !== 'updatedAt' && key !== '__v' && JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
            updateDetails[key] = {
                old: original[key],
                new: updated[key],
            };
        }
    });

    if (Object.keys(updateDetails).length === 0) {
        return;
    }

    const auditLog = new AuditLog({
        documentId: originalDoc._id,
        documentType: (originalDoc as any).constructor.modelName,
        operation,
        updateDetails,
        updatedBy,
        timestamp: new Date()
    });

    try {
        await auditLog.save();
    } catch (err) {
        console.error(err);
    }
}
