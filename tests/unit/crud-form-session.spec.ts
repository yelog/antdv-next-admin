import { describe, expect, it } from 'vitest';

import { useCrudFormSession } from '@/composables/useCrudFormSession';

type TestRecord = {
  id: string;
  name: string;
};

type TestFormValues = {
  name: string;
  tags: string[];
};

const createDefaultValues = (): TestFormValues => ({
  name: '',
  tags: [],
});

describe('useCrudFormSession', () => {
  it('starts every create and edit action as a new isolated session', () => {
    const session = useCrudFormSession<TestRecord, TestFormValues>(createDefaultValues);
    const createValues = { name: 'draft', tags: ['create'] };

    session.openCreate(createValues);

    expect(session.open.value).toBe(true);
    expect(session.mode.value).toBe('create');
    expect(session.record.value).toBeNull();
    expect(session.sessionKey.value).toBe(1);
    expect(session.initialValues.value).toEqual(createValues);
    expect(session.initialValues.value).not.toBe(createValues);

    createValues.tags.push('mutated');
    expect(session.initialValues.value.tags).toEqual(['create']);

    const record = { id: '1', name: 'Existing' };
    const editValues = { name: record.name, tags: ['edit'] };
    session.openEdit(record, editValues);

    expect(session.mode.value).toBe('edit');
    expect(session.record.value).toBe(record);
    expect(session.sessionKey.value).toBe(2);
    expect(session.initialValues.value).toEqual(editValues);
  });

  it('retains the current session until the close transition finishes', () => {
    const session = useCrudFormSession<TestRecord, TestFormValues>(createDefaultValues);
    const record = { id: '1', name: 'Existing' };
    session.openEdit(record, { name: record.name, tags: [] });

    session.close();

    expect(session.open.value).toBe(false);
    expect(session.record.value).toBe(record);
    expect(session.initialValues.value.name).toBe('Existing');

    session.finishClose();

    expect(session.record.value).toBeNull();
    expect(session.mode.value).toBe('create');
    expect(session.initialValues.value).toEqual(createDefaultValues());
  });

  it('does not let an old close callback clear a newer session', () => {
    const session = useCrudFormSession<TestRecord, TestFormValues>(createDefaultValues);
    session.openEdit({ id: '1', name: 'Old' }, { name: 'Old', tags: [] });
    session.close();

    session.openCreate({ name: 'New', tags: ['fresh'] });
    session.finishClose();

    expect(session.open.value).toBe(true);
    expect(session.mode.value).toBe('create');
    expect(session.initialValues.value).toEqual({ name: 'New', tags: ['fresh'] });
  });
});
