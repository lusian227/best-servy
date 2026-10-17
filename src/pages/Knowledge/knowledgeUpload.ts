// src/pages/Knowledge/knowledgeUpload.ts

import { supabase } from "../../lib/supabase";
import {
    RecordService,
} from "../../modules/records/services/RecordService";
import type { RecordCategory, OwnerType, Discipline } from '../../modules/records/domain/EngineeringRecord';

const recordService = new RecordService();

// ✅ ADD THIS MAPPING
const KNOWLEDGE_CATEGORY_MAP: Record<
    'Standards' | 'Formulas' | 'Procedures' | 'Materials',
    RecordCategory
> = {
    Standards: 'standard',
    Formulas: 'formula',
    Procedures: 'procedure',
    Materials: 'material',
};

export interface KnowledgeUploadOptions {
    file: File;
    category: 'Standards' | 'Formulas' | 'Procedures' | 'Materials';
    workspaceId?: string;
    projectId?: string;
    userId?: string;
    discipline?: string;
}

export async function uploadKnowledgeDocument({
    file,
    category,
    workspaceId,
    projectId,
    userId = "system",
    discipline = "General Engineering",
}: KnowledgeUploadOptions) {

    console.log("Knowledge upload started:", file.name);

    /*
     * =====================================================
     * STEP 1 — CREATE STORAGE PATH
     * =====================================================
     */

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `knowledge/${category}/${Date.now()}-${safeFileName}`;

    /*
     * =====================================================
     * STEP 2 — UPLOAD PHYSICAL FILE
     * =====================================================
     */

    const { error: uploadError } = await supabase.storage
        .from("records")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
        });

    if (uploadError) {
        console.error("Knowledge storage upload failed:", uploadError);
        throw uploadError;
    }

    /*
     * =====================================================
     * STEP 3 — GET STORAGE URL
     * =====================================================
     */

    const { data: urlData } = supabase.storage
        .from("records")
        .getPublicUrl(filePath);

    const storageUrl = urlData.publicUrl;

    /*
     * =====================================================
     * STEP 4 — CREATE RECORD
     * =====================================================
     */

    // ✅ FIXED: Use mapped category value
    const record = await recordService.create({
        workspaceId: workspaceId ?? "default-workspace",
        projectId: projectId ?? undefined,
        ownerType: "knowledge" as OwnerType,
        ownerId: userId,
        title: file.name,
        description: `Knowledge document uploaded under ${category}.`,
        category: KNOWLEDGE_CATEGORY_MAP[category], // ✅ Mapped to domain value
        discipline: discipline as Discipline,
        createdBy: userId,
        metadata: {
            source: "knowledge",
            knowledgeCategory: category,
            originalFileName: file.name,
            storagePath: filePath,
            storageUrl: storageUrl,
            mimeType: file.type,
            fileSize: file.size,
        },
    });

    /*
     * =====================================================
     * STEP 5 — ATTACH FILE TO RECORD
     * =====================================================
     */

    const updatedRecord = await recordService.uploadFile(
        record.id,
        file,
        storageUrl,
        userId
    );

    console.log("Knowledge document successfully created as record:", updatedRecord);

    return updatedRecord;
}