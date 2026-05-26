import axios from '../utils/axios';

export interface IAuditLog {
    id: number;
    adminEmail: string;
    action: string;
    entityId: string | null;
    details: string | null;
    timestamp: string;
}

class AuditLogService {
    async getAuditLogs(): Promise<IAuditLog[]> {
        const response = await axios.get('/api/admin/audit-logs');
        return response.data;
    }
}

export const auditLogService = new AuditLogService();
