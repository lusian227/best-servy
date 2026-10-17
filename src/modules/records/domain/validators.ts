import type {
  CreateRecordInput,
  UpdateRecordInput,
} from "./EngineeringRecord";

export function validateCreateRecordInput(
  input: CreateRecordInput
): string[] {
  const errors: string[] = [];

  if (!input.workspaceId) {
    errors.push("workspaceId is required");
  }

  if (!input.projectId) {
    errors.push("projectId is required");
  }

  if (!input.ownerType) {
    errors.push("ownerType is required");
  }

  if (!input.ownerId) {
    errors.push("ownerId is required");
  }

  if (!input.title?.trim()) {
    errors.push("title is required");
  }

  if (!input.category) {
    errors.push("category is required");
  }

  if (!input.discipline) {
    errors.push("discipline is required");
  }

  if (!input.createdBy) {
    errors.push("createdBy is required");
  }

  return errors;
}

export function validateUpdateRecordInput(
  input: UpdateRecordInput
): string[] {
  const errors: string[] = [];

  if (!input.updatedBy) {
    errors.push("updatedBy is required");
  }

  if (input.title !== undefined && !input.title.trim()) {
    errors.push("title cannot be empty");
  }

  return errors;
}
