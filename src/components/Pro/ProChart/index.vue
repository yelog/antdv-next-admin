<template>
  <div class="pro-chart">
    <div v-if="title || subTitle || $slots.extra" class="pro-chart-header">
      <div>
        <h3 v-if="title" class="pro-chart-title">{{ title }}</h3>
        <p v-if="subTitle" class="pro-chart-subtitle">{{ subTitle }}</p>
      </div>
      <slot name="extra" />
    </div>
    <div class="pro-chart-body" :style="{ height: normalizedHeight }">
      <a-spin v-if="loading" class="pro-chart-spin" />
      <v-chart
        v-else
        :option="mergedOption"
        :theme="isDark ? 'dark' : undefined"
        autoresize
        class="pro-chart-canvas"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent
} from 'echarts/components'
import { useThemeStore } from '@/stores/theme'
import type { ProChartType } from '@/types/pro'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent
])

interface Props {
  type: ProChartType
  data: any[]
  height?: number | string
  title?: string
  subTitle?: string
  loading?: boolean
  option?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  loading: false
})

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const normalizedHeight = computed(() => {
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

const generatedOption = computed(() => {
  const { type, data } = props

  if (type === 'pie' || type === 'donut') {
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: type === 'donut' ? ['45%', '70%'] : '70%',
        data: data.map(item => ({ name: item.name, value: item.value })),
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }]
    }
  }

  if (type === 'radar') {
    const indicator = data.map(item => ({ name: item.name, max: item.max ?? 100 }))
    return {
      tooltip: {},
      radar: { indicator },
      series: [{
        type: 'radar',
        data: [{ value: data.map(item => item.value) }]
      }]
    }
  }

  // line, bar, area
  const categories = data.map(item => item.name)
  const values = data.map(item => item.value)

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{
      type: type === 'area' ? 'line' : type,
      data: values,
      smooth: type === 'line' || type === 'area',
      areaStyle: type === 'area' ? {} : undefined
    }]
  }
})

const mergedOption = computed(() => {
  if (props.option) {
    return { ...generatedOption.value, ...props.option }
  }
  return generatedOption.value
})
</script>

<style scoped lang="scss">
.pro-chart {
  .pro-chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .pro-chart-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .pro-chart-subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  .pro-chart-body {
    position: relative;
  }

  .pro-chart-spin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .pro-chart-canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
