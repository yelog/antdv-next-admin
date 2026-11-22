<template>
  <div class="dashboard-container">
    <header class="workspace-heading">
      <div>
        <h1>{{ t('dashboard.workspaceTitle') }}</h1>
        <p>{{ t('dashboard.welcomeUser', { name: displayName }) }}</p>
      </div>
      <time :datetime="dateKey"><CalendarOutlined aria-hidden="true" />{{ dateLabel }}</time>
    </header>

    <dl class="workspace-metrics">
      <div v-for="metric in metrics" :key="metric.title">
        <dt>{{ metric.title }}</dt>
        <dd>{{ metric.value == null ? '—' : numberFormat.format(metric.value) }}</dd>
      </div>
    </dl>
    <div v-if="failed" class="fetch-note" role="status">
      {{ t('dashboard.loadFailed') }}
      <button type="button" class="text-action" @click="loadOverview">
        {{ t('common.refresh') }}
      </button>
    </div>

    <div class="workspace-columns">
      <section class="workspace-panel trend-panel" aria-labelledby="activity-title">
        <div class="panel-heading">
          <div>
            <h2 id="activity-title">{{ trendTitle }}</h2>
            <p>{{ activitySource }}</p>
          </div>
          <span class="date-range">{{ rangeLabel }}</span>
        </div>
        <div v-if="activityReady" class="trend-content">
          <div class="period-total">
            <strong>{{ numberFormat.format(trendTotal) }}</strong>
            <span>{{ t(canReadLogs ? 'dashboard.logUnit' : 'dashboard.pageUnit') }}</span>
          </div>
          <div class="chart-frame" aria-hidden="true">
            <ProChart type="bar" :data="chartData" :height="181" :option="chartOption" />
          </div>
          <ul class="sr-only" :aria-label="trendTitle">
            <li v-for="day in chartData" :key="day.name">{{ day.name }} · {{ day.value }}</li>
          </ul>
        </div>
        <p v-else class="panel-state">
          {{ t(loading ? 'common.loading' : 'dashboard.noReading') }}
        </p>
      </section>

      <section
        v-if="canReadLogs"
        class="workspace-panel recent-panel"
        aria-labelledby="recent-title"
      >
        <div class="panel-heading">
          <h2 id="recent-title">{{ t('dashboard.recentLogs') }}</h2>
          <RouterLink class="text-action" to="/system/log">
            {{ t('dashboard.openLogs') }}<ArrowRightOutlined aria-hidden="true" />
          </RouterLink>
        </div>
        <ol v-if="activity?.recent.length" class="recent-list">
          <li v-for="log in activity.recent" :key="log.id">
            <span class="event-icon" :class="{ 'has-error': log.status === 'fail' }">
              <ExclamationCircleOutlined v-if="log.status === 'fail'" aria-hidden="true" />
              <FileTextOutlined v-else aria-hidden="true" />
            </span>
            <div class="event-label">
              <strong
                >{{
                  te(`log.modules.${log.module}`) ? t(`log.modules.${log.module}`) : log.module
                }}
                · {{ t(`log.actionTypes.${log.action}`) }}</strong
              >
              <small>{{ log.username }} · {{ t(`log.${log.status}`) }}</small>
            </div>
            <time :datetime="dayjs(log.createTime).format()">{{
              formatLogTime(log.createTime)
            }}</time>
          </li>
        </ol>
        <p v-else class="panel-state">
          {{
            t(loading ? 'common.loading' : activity ? 'dashboard.noLogs' : 'dashboard.noReading')
          }}
        </p>
      </section>

      <section
        class="workspace-panel shortcuts-panel"
        :class="{ 'full-width': canReadLogs }"
        aria-labelledby="shortcuts-title"
      >
        <div class="panel-heading">
          <h2 id="shortcuts-title">{{ t('dashboard.shortcuts') }}</h2>
          <span v-if="showShortcutHint" class="shortcut-hint">{{
            t('dashboard.shortcutHint')
          }}</span>
        </div>
        <ul class="shortcuts">
          <li v-for="link in shortcuts" :key="link.path">
            <RouterLink :to="link.path">
              <IconView v-if="link.icon" :icon="link.icon" aria-hidden="true" />
              <span class="shortcut-label">
                <strong>{{ link.leafTitle }}</strong>
                <small>{{ t(`dashboard.linkOrigin.${link.origin}`) }}</small>
              </span>
              <ArrowRightOutlined class="link-arrow" aria-hidden="true" />
            </RouterLink>
          </li>
        </ul>
        <p v-if="!shortcuts.length" class="panel-state">{{ t('common.noData') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRightOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@antdv-next/icons';
import dayjs from 'dayjs';
import {
  computed,
  defineAsyncComponent,
  onActivated,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import { getOperationLogList } from '@/api/log';
import { getRoleList } from '@/api/role';
import { getUserList } from '@/api/user';
import IconView from '@/components/Icon/index.vue';
import { useMenuDestinations } from '@/composables/useMenuDestinations';
import { usesMockData } from '@/constants/environment';
import { useAuthStore } from '@/stores/auth';
import { MENU_HISTORY_LIMIT, useMenuPreferencesStore } from '@/stores/menuPreferences';
import { useThemeStore } from '@/stores/theme';

import {
  buildActivityDays,
  readActivityOverview,
  workspaceLinks,
  type ActivityOverview,
} from './overview';

const ProChart = defineAsyncComponent(() => import('@/components/Pro/ProChart/index.vue'));
const { t, te, locale } = useI18n();
const auth = useAuthStore();
const theme = useThemeStore();
const preferences = useMenuPreferencesStore();
const destinations = useMenuDestinations();
const today = ref(new Date());
const userCount = ref<number | null>(null);
const roleCount = ref<number | null>(null);
const activity = shallowRef<ActivityOverview | null>(null);
const loading = ref(false);
const failed = ref(false);
let revision = 0;

const displayName = computed(() => auth.user?.realName || auth.user?.username);
const dateKey = computed(() => dayjs(today.value).format('YYYY-MM-DD'));
const dateLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: 'full' }).format(today.value),
);
const numberFormat = computed(() => new Intl.NumberFormat(locale.value));
const pages = computed(() =>
  destinations.value.filter((item) => item.path.startsWith('/') && item.path !== '/dashboard'),
);
const accessible = computed(() => new Set(pages.value.map((item) => item.path)));
const canReadLogs = computed(() => accessible.value.has('/system/log'));
const canReadUsers = computed(() => accessible.value.has('/organization/user'));
const canReadRoles = computed(() => accessible.value.has('/organization/role'));
const recent = computed(() =>
  preferences.history.filter((item) => accessible.value.has(item.path)),
);
const favorites = computed(() =>
  preferences.favoritePaths.filter((path) => accessible.value.has(path)),
);
const shortcuts = computed(() =>
  workspaceLinks(
    pages.value,
    favorites.value,
    recent.value.map((item) => item.path),
  ),
);
const showShortcutHint = computed(() =>
  shortcuts.value.some((link) => link.origin === 'suggested'),
);

const metrics = computed(() => {
  const items = [];
  if (canReadUsers.value) items.push({ title: t('dashboard.totalUsers'), value: userCount.value });
  if (canReadRoles.value) items.push({ title: t('dashboard.roleCount'), value: roleCount.value });
  if (canReadLogs.value)
    items.push({
      title: t('dashboard.todayOperations'),
      value: activity.value?.days.at(-1)?.value,
    });
  if (!items.length) items.push({ title: t('layout.recentMenus'), value: recent.value.length });
  items.push({ title: t('dashboard.accessiblePages'), value: pages.value.length });
  if (items.length < 4)
    items.push({ title: t('layout.favoriteMenus'), value: favorites.value.length });
  return items;
});

const days = computed(() =>
  canReadLogs.value && activity.value
    ? activity.value.days
    : buildActivityDays(
        today.value,
        canReadLogs.value
          ? []
          : recent.value.map((item) => dayjs(item.timestamp).format('YYYY-MM-DD')),
      ),
);
const trendTitle = computed(() =>
  t(canReadLogs.value ? 'dashboard.operationTrend' : 'dashboard.pageTrend'),
);
const activityReady = computed(() => !canReadLogs.value || activity.value !== null);
const activitySource = computed(() =>
  canReadLogs.value
    ? t(usesMockData ? 'dashboard.demoLogSource' : 'log.operationLog')
    : t('dashboard.localHistorySource', { count: MENU_HISTORY_LIMIT }),
);
const trendTotal = computed(
  () => activity.value?.total ?? days.value.reduce((sum, day) => sum + day.value, 0),
);
const rangeLabel = computed(
  () => `${dayjs(days.value[0].date).format('MM/DD')} – ${dayjs(today.value).format('MM/DD')}`,
);
const chartData = computed(() =>
  days.value.map((day) => ({ name: dayjs(day.date).format('MM/DD'), value: day.value })),
);
const chartOption = computed(() => ({
  grid: { left: 4, right: 6, top: 10, bottom: 3, containLabel: true },
  xAxis: {
    type: 'category',
    data: chartData.value.map((item) => item.name),
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: { fontSize: 11, hideOverlap: true },
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    splitNumber: 3,
    splitLine: { lineStyle: { type: 'dashed', color: theme.isDark ? '#454a52' : '#dce1e7' } },
  },
  series: [
    {
      type: 'bar',
      name: t(canReadLogs.value ? 'dashboard.logUnit' : 'dashboard.pageUnit'),
      data: chartData.value.map((item) => item.value),
      barMaxWidth: 34,
      itemStyle: { borderRadius: [3, 3, 0, 0] },
    },
  ],
}));

function formatLogTime(value: string): string {
  const time = dayjs(value);
  return time.format(time.isSame(today.value, 'day') ? 'HH:mm' : 'MM/DD');
}

async function loadOverview(): Promise<void> {
  const request = ++revision;
  today.value = new Date();
  loading.value = true;
  failed.value = false;
  async function read<T>(source: Promise<T>, setResult: (value: T) => void): Promise<void> {
    try {
      const result = await source;
      if (request === revision) setResult(result);
    } catch {
      if (request === revision) failed.value = true;
    }
  }
  const queries = [];
  if (canReadUsers.value)
    queries.push(
      read(getUserList({ current: 1, pageSize: 1 }), ({ data }) => {
        userCount.value = data.total;
      }),
    );
  if (canReadRoles.value)
    queries.push(
      read(getRoleList({ current: 1, pageSize: 1 }), ({ data }) => {
        roleCount.value = data.total;
      }),
    );
  if (canReadLogs.value)
    queries.push(
      read(readActivityOverview(today.value, getOperationLogList), (result) => {
        activity.value = result;
      }),
    );
  await Promise.all(queries);
  if (request === revision) loading.value = false;
}

watch(
  [() => auth.user?.id, canReadUsers, canReadRoles, canReadLogs],
  () => {
    activity.value = null;
    userCount.value = null;
    roleCount.value = null;
    void loadOverview();
  },
  { immediate: true },
);
let activatedOnce = false;
onActivated(() => {
  if (activatedOnce) void loadOverview();
  activatedOnce = true;
});
onBeforeUnmount(() => {
  revision += 1;
});
</script>

<style scoped>
.dashboard-container {
  --workspace-line: var(--color-border-secondary);
  --workspace-muted: var(--color-text-muted);
  display: grid;
  gap: 20px;
  max-width: 1600px;
  min-width: 0;
  margin-inline: auto;
  color: var(--color-text-primary);
}
.workspace-heading,
.workspace-panel,
.workspace-metrics {
  background: var(--color-bg-container);
  border: 1px solid var(--workspace-line);
  border-radius: 12px;
}
.workspace-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding: 17px 24px;
  background-image:
    linear-gradient(90deg, var(--color-bg-container) 38%, transparent),
    linear-gradient(var(--workspace-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--workspace-line) 1px, transparent 1px);
  background-size:
    auto,
    16px 16px,
    16px 16px;
}
.workspace-heading h1 {
  margin: 0;
  font-size: clamp(23px, 2.2vw, 32px);
  line-height: 1.25;
  letter-spacing: -0.035em;
}
.workspace-heading p,
.panel-heading p {
  margin: 4px 0 0;
  color: var(--workspace-muted);
  font-size: 13px;
}
.workspace-heading time {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--color-bg-container);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.workspace-metrics {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  overflow: hidden;
  margin: 0;
}
.workspace-metrics > div {
  padding: 16px 24px;
  border-inline-start: 1px solid var(--workspace-line);
}
.workspace-metrics > div:first-child {
  border-inline-start: 0;
}
.workspace-metrics dt {
  font-size: 13px;
  color: var(--workspace-muted);
}
.workspace-metrics dd,
.period-total strong {
  margin: 4px 0 0;
  font: 600 34px/1.12 var(--font-family-number);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.035em;
}
.workspace-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
  gap: 18px;
  align-items: stretch;
}
.workspace-panel {
  min-width: 0;
  padding: 20px 22px;
}
.panel-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 5px 10px;
}
.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  letter-spacing: -0.02em;
}
.date-range,
.recent-list time {
  color: var(--workspace-muted);
  font: 12px/1.3 var(--font-family-code);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.period-total {
  display: flex;
  gap: 7px;
  align-items: baseline;
  margin-top: 16px;
}
.period-total span,
.shortcut-hint,
.shortcut-label small,
.event-label small {
  font-size: 12px;
  color: var(--workspace-muted);
}
.chart-frame {
  min-height: 181px;
}
.recent-list,
.shortcuts {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}
.recent-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--workspace-line);
}
.event-icon {
  color: var(--workspace-muted);
}
.event-icon.has-error {
  color: var(--color-error-text);
}
.event-label,
.shortcut-label {
  display: grid;
  min-width: 0;
  gap: 2px;
  flex: 1;
}
.event-label strong,
.shortcut-label strong {
  font-size: 14px;
  font-weight: 550;
  overflow-wrap: anywhere;
}
.full-width {
  grid-column: 1 / -1;
}
.shortcuts {
  display: grid;
  gap: 2px;
}
.full-width .shortcuts {
  grid-template-columns: repeat(auto-fit, minmax(min(165px, 100%), 1fr));
}
.shortcuts a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  color: inherit;
  border-radius: 6px;
}
.shortcuts a:hover,
.shortcuts a:focus-visible {
  background: var(--color-bg-layout);
}
.shortcuts a > .app-icon {
  font-size: 18px;
  color: var(--color-text-secondary);
}
.link-arrow {
  color: var(--workspace-muted);
  font-size: 12px;
}
.text-action {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.text-action:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.text-action:focus-visible,
.shortcuts a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.panel-state,
.fetch-note {
  margin: 14px 0;
  color: var(--workspace-muted);
}
.fetch-note .text-action {
  margin-inline-start: 8px;
}
@container (max-width: 720px) {
  .workspace-columns {
    grid-template-columns: minmax(0, 1fr);
  }
  .workspace-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-flow: row;
  }
  .workspace-metrics > div {
    padding: 12px 16px;
  }
  .workspace-metrics > div:nth-child(odd) {
    border-inline-start: 0;
  }
  .workspace-metrics > div:nth-child(n + 3) {
    border-top: 1px solid var(--workspace-line);
  }
  .workspace-heading,
  .workspace-panel {
    padding: 16px;
  }
  .workspace-heading time {
    padding: 0;
    font-size: 12px;
  }
  .dashboard-container,
  .workspace-columns {
    gap: 12px;
  }
  .workspace-metrics dd {
    font-size: 28px;
  }
}
</style>
