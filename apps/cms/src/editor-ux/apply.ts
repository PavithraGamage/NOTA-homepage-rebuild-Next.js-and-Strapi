import type { Core } from '@strapi/strapi';
import { EDITOR_COPY, type ViewCopy } from './copy';

type EditMetadata = { label?: string; description?: string; placeholder?: string; [key: string]: unknown };
type ListMetadata = { label?: string; [key: string]: unknown };
type ViewConfiguration = {
  settings: Record<string, unknown>;
  metadatas: Record<string, { edit?: EditMetadata; list?: ListMetadata }>;
  layouts: Record<string, unknown>;
};

/** The subset of the content-manager's configuration services we use. */
type ConfigurationService = {
  findConfiguration(model: unknown): Promise<ViewConfiguration>;
  updateConfiguration(model: unknown, configuration: ViewConfiguration): Promise<unknown>;
};

/**
 * Merges our copy into Strapi's stored view configuration. Only labels, descriptions,
 * placeholders and the main field are touched; layout changes made in the admin are kept.
 * Pure so it can be unit-tested without a running Strapi.
 */
export function mergeViewCopy(current: ViewConfiguration, copy: ViewCopy, attributeNames: string[]): {
  configuration: ViewConfiguration;
  unknownFields: string[];
} {
  const metadatas = { ...current.metadatas };
  const unknownFields: string[] = [];

  for (const [field, text] of Object.entries(copy.fields)) {
    if (!attributeNames.includes(field)) {
      unknownFields.push(field);
      continue;
    }
    const existing = metadatas[field] ?? {};
    metadatas[field] = {
      ...existing,
      edit: {
        ...existing.edit,
        label: text.label,
        description: text.description ?? '',
        placeholder: text.placeholder ?? '',
      },
      list: { ...existing.list, label: text.label },
    };
  }

  const settings =
    copy.mainField && attributeNames.includes(copy.mainField) ? { ...current.settings, mainField: copy.mainField } : current.settings;

  return { configuration: { ...current, settings, metadatas }, unknownFields };
}

/** Applies EDITOR_COPY on every boot. Strapi only writes when something changed. */
export async function applyEditorCopy(strapi: Core.Strapi): Promise<void> {
  const contentManager = strapi.plugin('content-manager');
  const services = {
    'content-type': contentManager.service('content-types') as ConfigurationService & { findContentType(uid: string): unknown },
    component: contentManager.service('components') as ConfigurationService & { findComponent(uid: string): unknown },
  };

  for (const [uid, copy] of Object.entries(EDITOR_COPY)) {
    const schema = copy.kind === 'component' ? strapi.components[uid as keyof typeof strapi.components] : strapi.contentTypes[uid as keyof typeof strapi.contentTypes];
    if (!schema) {
      strapi.log.error(`[editor-ux] no ${copy.kind} named ${uid}; update src/editor-ux/copy.ts`);
      continue;
    }

    const service = services[copy.kind];
    const model = copy.kind === 'component' ? services.component.findComponent(uid) : services['content-type'].findContentType(uid);
    const current = await service.findConfiguration(model);
    const { configuration, unknownFields } = mergeViewCopy(current, copy, Object.keys(schema.attributes));

    if (unknownFields.length) {
      strapi.log.error(`[editor-ux] ${uid} has no field(s) ${unknownFields.join(', ')}; update src/editor-ux/copy.ts`);
    }
    await service.updateConfiguration(model, configuration);
  }
  strapi.log.info(`[editor-ux] applied labels and help text to ${Object.keys(EDITOR_COPY).length} views`);
}
