import { cloneDeep } from 'lodash-es';
import { ref, shallowRef } from 'vue';

export type CrudFormMode = 'create' | 'edit';

export function useCrudFormSession<TRecord, TValues extends object>(
  createDefaultValues: () => TValues,
) {
  const open = ref(false);
  const mode = ref<CrudFormMode>('create');
  const record = shallowRef<TRecord | null>(null);
  const initialValues = shallowRef<TValues>(cloneDeep(createDefaultValues()));
  const sessionKey = ref(0);

  const startSession = (nextMode: CrudFormMode, nextRecord: TRecord | null, values: TValues) => {
    mode.value = nextMode;
    record.value = nextRecord;
    initialValues.value = cloneDeep(values);
    sessionKey.value += 1;
    open.value = true;
  };

  const openCreate = (values: TValues = createDefaultValues()) => {
    startSession('create', null, values);
  };

  const openEdit = (nextRecord: TRecord, values: TValues) => {
    startSession('edit', nextRecord, values);
  };

  const close = () => {
    open.value = false;
  };

  const finishClose = () => {
    if (open.value) {
      return;
    }

    mode.value = 'create';
    record.value = null;
    initialValues.value = cloneDeep(createDefaultValues());
  };

  return {
    open,
    mode,
    record,
    initialValues,
    sessionKey,
    openCreate,
    openEdit,
    close,
    finishClose,
  };
}
