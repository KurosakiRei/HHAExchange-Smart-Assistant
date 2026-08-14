import {
  IncidentFieldDefinition,
  IncidentPayload,
  IncidentSchema,
  IncidentType,
  getValueByPath,
  isFieldRequired,
  isFieldVisible,
  isValuePresent,
} from "./IncidentTypes";
import { deathSchema } from "./forms/DeathSchema";
import { fallSchema } from "./forms/FallSchema";
import { hospitalizationSchema } from "./forms/HospitalizationSchema";

const REGISTRY: Record<IncidentType, IncidentSchema> = {
  hospitalization: hospitalizationSchema,
  fall: fallSchema,
  death: deathSchema,
};

export interface IncidentValidationIssue {
  fieldId: string;
  label: string;
  reason: "required";
}

export class IncidentSchemaRegistry {
  static listIncidentTypes(): IncidentType[] {
    return ["hospitalization", "fall", "death"];
  }

  static getSchema(incidentType: IncidentType): IncidentSchema {
    return REGISTRY[incidentType];
  }

  static getVisibleFields(payload: IncidentPayload): IncidentFieldDefinition[] {
    const schema = this.getSchema(payload.incidentType);
    const fields: IncidentFieldDefinition[] = [];

    schema.sections.forEach((section) => {
      if (section.visibleWhen && !section.visibleWhen(payload)) {
        return;
      }

      section.fields.forEach((field) => {
        if (isFieldVisible(field, payload)) {
          fields.push(field);
        }
      });
    });

    return fields;
  }

  static validateRequired(payload: IncidentPayload): IncidentValidationIssue[] {
    const issues: IncidentValidationIssue[] = [];
    const visibleFields = this.getVisibleFields(payload);

    visibleFields.forEach((field) => {
      if (!isFieldRequired(field, payload)) {
        return;
      }

      const value = getValueByPath(payload, field.bindTo);
      if (!isValuePresent(value)) {
        issues.push({
          fieldId: field.id,
          label: field.label,
          reason: "required",
        });
      }
    });

    return issues;
  }
}
