<template>
  <section class="sales-example" aria-labelledby="sales-title">
    <header>
      <h1 id="sales-title">{{ t('dashboard.salesExample') }}</h1>
      <p>{{ t('dashboard.salesSource') }}</p>
    </header>
    <div class="sales-grid">
      <section class="sales-panel">
        <ProChart
          type="bar"
          :title="t('dashboard.monthlyRevenue')"
          :data="monthlyRevenue"
          :height="244"
        />
        <details>
          <summary>{{ t('dashboard.showValues') }}</summary>
          <dl>
            <div v-for="month in monthlyRevenue" :key="month.name">
              <dt>{{ month.name }}</dt>
              <dd>{{ currency.format(month.value) }}</dd>
            </div>
          </dl>
        </details>
      </section>
      <section class="sales-panel">
        <ProChart
          type="donut"
          :title="t('dashboard.orderChannels')"
          :data="channels"
          :height="244"
          :option="channelOptions"
        />
        <dl>
          <div v-for="channel in channels" :key="channel.name">
            <dt>{{ channel.name }}</dt>
            <dd>{{ channel.value }}%</dd>
          </div>
        </dl>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';

const ProChart = defineAsyncComponent(() => import('@/components/Pro/ProChart/index.vue'));
const { t, locale } = useI18n();
const currency = computed(
  () =>
    new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0,
    }),
);
const revenue = [34000, 48000, 44000, 62000, 58000, 70000, 66000, 72000];
const monthlyRevenue = computed(() => {
  const format = new Intl.DateTimeFormat(locale.value, { month: 'short' });
  return revenue.map((value, month) => ({ name: format.format(new Date(2025, month, 1)), value }));
});
const channels = computed(() => [
  { name: t('dashboard.online'), value: 46 },
  { name: t('dashboard.store'), value: 34 },
  { name: t('dashboard.partner'), value: 20 },
]);
const channelOptions = computed(() => ({
  legend: { show: false },
  series: [{ type: 'pie', radius: ['48%', '73%'], data: channels.value, label: { show: false } }],
}));
</script>

<style scoped>
.sales-example {
  display: grid;
  gap: 20px;
  min-width: 0;
}
.sales-example h1 {
  font-size: 26px;
  margin: 0;
}
.sales-example header p {
  margin: 4px 0 0;
  color: var(--color-text-muted);
}
.sales-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
}
.sales-panel {
  min-width: 0;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--color-border-secondary);
  background: var(--color-bg-container);
}
summary {
  cursor: pointer;
  color: var(--color-text-secondary);
  width: fit-content;
}
dl {
  margin: 8px 0 0;
}
dl div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid var(--color-border-secondary);
  padding: 6px 0;
}
dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
@container (max-width: 700px) {
  .sales-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
