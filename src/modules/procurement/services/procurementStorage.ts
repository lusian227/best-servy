// src/modules/procurement/services/procurementStorage.ts

import { supabase } from '../../../lib/supabase';
import { generateUUID } from '../../../utils/uuid';  // ✅ ADD THIS

export class ProcurementStorage {
    async uploadEvidence(
        workspaceId: string,
        procurementRequestId: string,
        file: File,
        folder: string = 'evidence'
    ): Promise<{
        path: string;
        url: string;
    }> {
        if (!file || file.size === 0) {
            throw new Error('File is required');
        }

        const extension = file.name.split('.').pop() || 'file';
        const fileName = `${generateUUID()}.${extension}`;  // ✅ FIXED
        const path = `${workspaceId}/procurement/${procurementRequestId}/${folder}/${fileName}`;

        const { error } = await supabase.storage
            .from('procurement-evidence')
            .upload(path, file, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error('❌ Failed to upload evidence:', error);
            throw new Error(`Failed to upload evidence: ${error.message}`);
        }

        const signedUrl = await this.getSignedUrl(path);

        return {
            path,
            url: signedUrl,
        };
    }

    async deleteEvidence(path: string): Promise<void> {
        if (!path) {
            throw new Error('File path is required');
        }

        const { error } = await supabase.storage
            .from('procurement-evidence')
            .remove([path]);

        if (error) {
            console.error('❌ Failed to delete evidence:', error);
            throw new Error(`Failed to delete evidence: ${error.message}`);
        }
    }


    async getSignedUrl(
        path: string,
        expiresIn: number = 3600
    ): Promise<string> {
        if (!path) {
            throw new Error('Storage path is required to view evidence.');
        }

        const { data, error } = await supabase.storage
            .from('procurement-evidence')
            .createSignedUrl(path, expiresIn, {
                download: false,
            });

        if (error) {
            console.error('Failed to create evidence signed URL:', error);
            throw new Error(`Failed to get signed URL: ${error.message}`);
        }

        return data.signedUrl;
    }


    async refreshSignedUrl(path: string): Promise<string> {
        return this.getSignedUrl(path);
    }

    async listEvidence(
        workspaceId: string,
        procurementRequestId: string,
        folder: string = 'evidence'
    ): Promise<{ name: string; path: string; created_at: string }[]> {
        const prefix = `${workspaceId}/procurement/${procurementRequestId}/${folder}/`;

        const { data, error } = await supabase.storage
            .from('procurement-evidence')
            .list(prefix);

        if (error) {
            console.error('❌ Failed to list evidence:', error);
            throw new Error(`Failed to list evidence: ${error.message}`);
        }

        return (data || [])
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map(file => ({
                name: file.name,
                path: prefix + file.name,
                created_at: file.created_at ?? '',
            }));
    }
}

export const procurementStorage = new ProcurementStorage();