<template>
  <div class="about-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-icon">
          <AppstoreOutlined />
        </div>
        <h1 class="hero-title">Antdv Next Admin</h1>
        <p class="hero-desc">{{ $t('about.description') }}</p>
        <div class="hero-badges">
          <a-tag color="blue">Vue 3</a-tag>
          <a-tag color="green">TypeScript</a-tag>
          <a-tag color="orange">Vite</a-tag>
          <a-tag color="purple">Ant Design Vue</a-tag>
        </div>
      </div>
    </section>

    <a-row :gutter="[16, 16]" class="info-section">
      <!-- Project Info -->
      <a-col :xs="24" :lg="12">
        <a-card :bordered="false" class="info-card">
          <template #title>
            <div class="card-title-row">
              <ProfileOutlined class="card-icon" />
              <span>{{ $t('about.projectInfo') }}</span>
            </div>
          </template>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">{{ $t('about.projectName') }}</span>
              <span class="info-value">Antdv Next Admin</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('about.version') }}</span>
              <span class="info-value">
                <a-tag color="blue">v{{ version }}</a-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('about.license') }}</span>
              <span class="info-value">
                <a-tag color="green">MIT License</a-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('about.author') }}</span>
              <span class="info-value">yelog</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('about.email') }}</span>
              <span class="info-value">
                <a href="mailto:yelogeek@gmail.com" class="link">yelogeek@gmail.com</a>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">GitHub</span>
              <span class="info-value">
                <a
                  href="https://github.com/yelog/antdv-next-admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link"
                >
                  <GithubOutlined style="margin-right: 4px" />
                  yelog/antdv-next-admin
                </a>
              </span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Tech Stack -->
      <a-col :xs="24" :lg="12">
        <a-card :bordered="false" class="info-card">
          <template #title>
            <div class="card-title-row">
              <CodeOutlined class="card-icon" />
              <span>{{ $t('about.techStack') }}</span>
            </div>
          </template>
          <div class="tech-grid">
            <a
              v-for="tech in techList"
              :key="tech.name"
              :href="tech.url"
              target="_blank"
              rel="noopener noreferrer"
              class="tech-item"
            >
              <div class="tech-dot" :style="{ background: tech.color }"></div>
              <div class="tech-info">
                <span class="tech-name">{{ tech.name }}</span>
                <span class="tech-version">{{ tech.version }}</span>
              </div>
            </a>
          </div>
        </a-card>
      </a-col>

      <!-- Features -->
      <a-col :span="24">
        <a-card :bordered="false" class="info-card">
          <template #title>
            <div class="card-title-row">
              <BulbOutlined class="card-icon" />
              <span>{{ $t('about.features') }}</span>
            </div>
          </template>
          <a-row :gutter="[16, 12]">
            <a-col v-for="feature in features" :key="feature" :xs="24" :sm="12" :md="8" :lg="6">
              <div class="feature-item">
                <CheckCircleOutlined class="feature-check" />
                <span>{{ feature }}</span>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {
  AppstoreOutlined,
  ProfileOutlined,
  CodeOutlined,
  BulbOutlined,
  GithubOutlined,
  CheckCircleOutlined
} from '@antdv-next/icons'
import { $t } from '@/locales'

const version = __APP_VERSION__

const techList = [
  { name: 'Vue', version: '3.4', color: '#42b883', url: 'https://vuejs.org' },
  { name: 'TypeScript', version: '5.3', color: '#3178c6', url: 'https://www.typescriptlang.org' },
  { name: 'Vite', version: '5.0', color: '#646cff', url: 'https://vite.dev' },
  { name: 'Ant Design Vue', version: 'Next', color: '#1677ff', url: 'https://antdv-next.com' },
  { name: 'Pinia', version: '2.1', color: '#ffd859', url: 'https://pinia.vuejs.org' },
  { name: 'Vue Router', version: '4.2', color: '#42b883', url: 'https://router.vuejs.org' },
  { name: 'Vue I18n', version: '11.0', color: '#42b883', url: 'https://vue-i18n.intlify.dev' },
  { name: 'Axios', version: '1.6', color: '#5a29e4', url: 'https://axios-http.com' },
  { name: 'ECharts', version: '5.4', color: '#e43961', url: 'https://echarts.apache.org' },
  { name: 'Iconify', version: '5.0', color: '#1769aa', url: 'https://iconify.design' },
  { name: 'Tiptap', version: '3.19', color: '#68cef8', url: 'https://tiptap.dev' },
  { name: 'Day.js', version: '1.11', color: '#ff6f61', url: 'https://day.js.org' },
]

const features = [
  $t('about.feature1'),
  $t('about.feature2'),
  $t('about.feature3'),
  $t('about.feature4'),
  $t('about.feature5'),
  $t('about.feature6'),
  $t('about.feature7'),
  $t('about.feature8'),
]
</script>

<style scoped lang="scss">
.about-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  padding: 48px 32px;
  margin-bottom: 16px;
  text-align: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, #000) 100%);
  color: #fff;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .orb {
    position: absolute;
    border-radius: 50%;
    opacity: 0.12;
    background: #fff;
  }

  .orb-1 {
    width: 300px;
    height: 300px;
    top: -80px;
    right: -60px;
  }

  .orb-2 {
    width: 200px;
    height: 200px;
    bottom: -60px;
    left: -40px;
  }

  .orb-3 {
    width: 120px;
    height: 120px;
    top: 40%;
    left: 60%;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  font-size: 32px;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.hero-desc {
  font-size: 16px;
  opacity: 0.85;
  margin: 0 0 20px;
  max-width: 520px;
  margin-inline: auto;
  line-height: 1.6;
}

.hero-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;

  :deep(.ant-tag) {
    margin: 0;
    font-size: 13px;
    padding: 2px 12px;
    border: none;
  }
}

/* Info Cards */
.info-section {
  margin-top: 0;
}

.info-card {
  height: 100%;

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: var(--font-weight-semibold);

    .card-icon {
      font-size: 18px;
      color: var(--color-primary);
    }
  }
}

/* Info List */
.info-list {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--color-border-secondary);

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .info-value {
      color: var(--color-text-primary);
      font-size: 14px;
      text-align: right;
    }
  }
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

/* Tech Grid */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-secondary);
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 4%, transparent);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .tech-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tech-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .tech-name {
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .tech-version {
    font-size: 12px;
    color: var(--color-text-tertiary);
    line-height: 1.3;
  }
}

/* Features */
.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
  padding: 6px 0;

  .feature-check {
    color: var(--color-primary);
    font-size: 16px;
    flex-shrink: 0;
  }
}

@media (max-width: 576px) {
  .hero {
    padding: 32px 20px;
  }

  .hero-title {
    font-size: 24px;
  }

  .hero-desc {
    font-size: 14px;
  }

  .tech-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
