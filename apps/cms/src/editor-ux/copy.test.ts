import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { mergeViewCopy } from './apply';
import { EDITOR_COPY } from './copy';

type Schema = { attributes: Record<string, unknown> };

/** Reads every component and content-type schema the way Strapi names them. */
function loadSchemas(): Record<string, Schema> {
  const src = path.join(__dirname, '..');
  const schemas: Record<string, Schema> = {};
  const componentsDir = path.join(src, 'components');
  for (const category of fs.readdirSync(componentsDir)) {
    for (const file of fs.readdirSync(path.join(componentsDir, category))) {
      schemas[`${category}.${path.basename(file, '.json')}`] = JSON.parse(
        fs.readFileSync(path.join(componentsDir, category, file), 'utf8'),
      );
    }
  }
  const apiDir = path.join(src, 'api');
  for (const name of fs.readdirSync(apiDir)) {
    const file = path.join(apiDir, name, 'content-types', name, 'schema.json');
    if (fs.existsSync(file)) schemas[`api::${name}.${name}`] = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return schemas;
}

const schemas = loadSchemas();

describe('editor copy', () => {
  it('covers every component and content type', () => {
    expect(Object.keys(EDITOR_COPY).sort()).toEqual(Object.keys(schemas).sort());
  });

  it.each(Object.keys(schemas))('%s: every field has a label, and no copy points at a missing field', (uid) => {
    const attributes = Object.keys(schemas[uid].attributes).sort();
    expect(Object.keys(EDITOR_COPY[uid].fields).sort()).toEqual(attributes);
  });

  it.each(Object.entries(EDITOR_COPY).filter(([, copy]) => copy.mainField))('%s: main field exists', (uid, copy) => {
    expect(Object.keys(schemas[uid].attributes)).toContain(copy.mainField);
  });
});

describe('mergeViewCopy', () => {
  const current = {
    settings: { pageSize: 10, mainField: 'id' },
    metadatas: { title: { edit: { label: 'title', visible: true }, list: { label: 'title', sortable: true } } },
    layouts: { edit: [[{ name: 'title', size: 6 }]], list: ['id', 'title'] },
  };

  it('sets label, help text, placeholder and main field while keeping layout and other settings', () => {
    const { configuration, unknownFields } = mergeViewCopy(
      current,
      { kind: 'component', mainField: 'title', fields: { title: { label: 'Title', description: 'Card heading.', placeholder: 'Writing System' } } },
      ['title'],
    );
    expect(unknownFields).toEqual([]);
    expect(configuration.settings).toEqual({ pageSize: 10, mainField: 'title' });
    expect(configuration.metadatas.title).toEqual({
      edit: { label: 'Title', description: 'Card heading.', placeholder: 'Writing System', visible: true },
      list: { label: 'Title', sortable: true },
    });
    expect(configuration.layouts).toBe(current.layouts);
  });

  it('reports fields that the schema does not have instead of writing them', () => {
    const { configuration, unknownFields } = mergeViewCopy(current, { kind: 'component', fields: { ghost: { label: 'Ghost' } } }, ['title']);
    expect(unknownFields).toEqual(['ghost']);
    expect(configuration.metadatas).not.toHaveProperty('ghost');
  });
});
