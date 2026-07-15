<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('form.title') }}</h2>
      <p class="mb-lg">{{ $t('exampleForm.description') }}</p>

      <ProForm
        ref="formRef"
        :form-items="formItems"
        :grid="{ cols: 2, gutter: 16 }"
        @finish="handleSubmit"
      >
        <template #footer>
          <a-space>
            <a-button type="primary" html-type="submit">
              {{ $t('common.submit') }}
            </a-button>
            <a-button @click="handleReset">
              {{ $t('common.reset') }}
            </a-button>
          </a-space>
        </template>
      </ProForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProFormItem, ProFormOption } from '@/types/pro';
import type { TreeSelectProps } from 'antdv-next';

import { message } from 'antdv-next';
import { computed, ref } from 'vue';

import ProForm from '@/components/Pro/ProForm/index.vue';
import { $t } from '@/locales';
import { commonRules } from '@/utils/formRules';

import {
  createLazyChildren,
  searchRemoteTree,
  searchRemoteUsers,
  type RemoteTreeNode,
} from './remoteData';

const formRef = ref();

const lazyTreeLoading = ref(false);
const lazyTreeData = ref<RemoteTreeNode[]>([
  { title: 'North Region', value: 'north-region' },
  { title: 'South Region', value: 'south-region' },
  { title: 'Headquarters', value: 'headquarters', isLeaf: true },
]);
function toProFormOptions(nodes: RemoteTreeNode[]): ProFormOption[] {
  return nodes.map((node) => ({
    label: node.title,
    value: node.value,
    children: node.children ? toProFormOptions(node.children) : undefined,
  }));
}

async function waitForRemoteData(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));
}

async function searchRemoteUserOptions(keyword: string): Promise<ProFormOption[]> {
  await waitForRemoteData();
  return searchRemoteUsers(keyword);
}

async function searchRemoteTreeOptions(keyword: string): Promise<ProFormOption[]> {
  await waitForRemoteData();
  const results = searchRemoteTree(keyword);
  return toProFormOptions(results);
}

const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'username',
    label: $t('user.username'),
    type: 'input',
    required: true,
    rules: [commonRules.length(3, 20), commonRules.username()],
    props: {
      placeholder: $t('login.usernamePlaceholder'),
    },
  },
  {
    name: 'email',
    label: $t('user.email'),
    type: 'input',
    required: true,
    rules: [commonRules.email()],
  },
  {
    name: 'password',
    label: $t('login.password'),
    type: 'password',
    required: true,
    rules: [commonRules.password()],
  },
  {
    name: 'confirmPassword',
    label: $t('profile.confirmPassword'),
    type: 'password',
    required: true,
    dependencies: ['password'],
    rules: [
      ({ getFieldValue }: { getFieldValue: (field: string) => unknown }) =>
        commonRules.confirmPassword(getFieldValue),
    ],
  },
  {
    name: 'phone',
    label: $t('user.phone'),
    type: 'input',
    rules: [commonRules.phone()],
  },
  {
    name: 'age',
    label: $t('exampleForm.age'),
    type: 'number',
    rules: [commonRules.range(1, 150, $t('exampleForm.ageRange'))],
    props: {
      min: 1,
      max: 150,
    },
  },
  {
    name: 'gender',
    label: $t('user.gender'),
    type: 'select',
    required: true,
    options: [
      { label: $t('user.male'), value: 'male' },
      { label: $t('user.female'), value: 'female' },
    ],
  },
  {
    name: 'role',
    label: $t('user.role'),
    type: 'select',
    required: true,
    options: [
      { label: $t('exampleForm.roles.admin'), value: 'admin' },
      { label: $t('exampleForm.roles.user'), value: 'user' },
      { label: $t('exampleForm.roles.guest'), value: 'guest' },
    ],
  },
  {
    name: 'interests',
    label: $t('exampleForm.interests'),
    type: 'checkbox',
    options: [
      { label: $t('exampleForm.interestOptions.reading'), value: 'reading' },
      { label: $t('exampleForm.interestOptions.sports'), value: 'sports' },
      { label: $t('exampleForm.interestOptions.music'), value: 'music' },
      { label: $t('exampleForm.interestOptions.travel'), value: 'travel' },
    ],
  },
  {
    name: 'birthDate',
    label: $t('exampleForm.birthDate'),
    type: 'datePicker',
    props: {
      format: 'YYYY-MM-DD',
    },
  },
  {
    name: 'status',
    label: $t('common.status'),
    type: 'switch',
    valuePropName: 'checked',
    initialValue: true,
  },
  {
    name: 'score',
    label: $t('exampleForm.score'),
    type: 'rate',
    initialValue: 3,
  },
  {
    name: 'progress',
    label: $t('exampleForm.progress'),
    type: 'slider',
    initialValue: 50,
    props: {
      min: 0,
      max: 100,
    },
  },
  {
    name: 'remoteUser',
    label: $t('exampleForm.remote.selectTitle'),
    type: 'select',
    searchMode: 'remote',
    remoteSearch: searchRemoteUserOptions,
    placeholder: $t('exampleForm.remote.selectPlaceholder'),
    tooltip: $t('exampleForm.remote.selectHint'),
  },
  {
    name: 'lazyOrganization',
    label: $t('exampleForm.remote.lazyTreeTitle'),
    type: 'treeSelect',
    options: toProFormOptions(lazyTreeData.value),
    placeholder: $t('exampleForm.remote.lazyTreePlaceholder'),
    tooltip: $t('exampleForm.remote.lazyTreeHint'),
    searchable: false,
    props: {
      loadData: loadLazyTreeData,
      loading: lazyTreeLoading.value,
    },
  },
  {
    name: 'remoteOrganization',
    label: $t('exampleForm.remote.searchTreeTitle'),
    type: 'treeSelect',
    searchMode: 'remote',
    remoteSearch: searchRemoteTreeOptions,
    placeholder: $t('exampleForm.remote.searchTreePlaceholder'),
    tooltip: $t('exampleForm.remote.searchTreeHint'),
  },
  {
    name: 'bio',
    label: $t('user.bio'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 4,
      maxLength: 500,
      showCount: true,
      placeholder: $t('exampleForm.bioPlaceholder'),
    },
  },
]);

const handleSubmit = (values: Record<string, unknown>) => {
  console.log('Form values:', values);
  message.success($t('exampleForm.submitSuccess'));
};

const handleReset = () => {
  formRef.value?.resetFields();
};

function appendLazyChildren(nodes: RemoteTreeNode[], parentValue: string): RemoteTreeNode[] {
  return nodes.map((node) => {
    if (node.value === parentValue) {
      return node.children ? node : { ...node, children: createLazyChildren(parentValue) };
    }
    if (!node.children) return node;
    return { ...node, children: appendLazyChildren(node.children, parentValue) };
  });
}

const loadLazyTreeData: TreeSelectProps['loadData'] = async (node) => {
  const parentValue = typeof node.value === 'string' ? node.value : '';
  if (!parentValue || node.children) return;

  lazyTreeLoading.value = true;
  await new Promise<void>((resolve) => setTimeout(resolve, 500));
  lazyTreeData.value = appendLazyChildren(lazyTreeData.value, parentValue);
  lazyTreeLoading.value = false;
};
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}
</style>
