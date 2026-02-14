<template>
  <div class="about-page">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="grid-overlay"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="code-symbols">
          <span class="sym sym-1">&lt;/&gt;</span>
          <span class="sym sym-2">{ }</span>
          <span class="sym sym-3">( )</span>
          <span class="sym sym-4">[ ]</span>
          <span class="sym sym-5">=&gt;</span>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-icon">
          <img :src="logoImg" alt="Logo" class="hero-logo" />
        </div>
        <h1 class="hero-title">Antdv Next Admin</h1>
        <p class="hero-desc">{{ $t('about.description') }}</p>
        <div class="hero-badges">
          <span class="hero-badge" v-for="b in heroBadges" :key="b.label" :style="{ '--badge-bg': b.bg }">
            {{ b.label }}
          </span>
        </div>
      </div>
    </section>

    <a-row :gutter="[16, 16]" class="info-section">
      <!-- Project Info -->
      <a-col :xs="24" :lg="12">
        <a-card :bordered="false" class="info-card">
          <template #title>
            <div class="card-title-row">
              <span class="card-icon-wrap"><ProfileOutlined class="card-icon" /></span>
              <span>{{ $t('about.projectInfo') }}</span>
            </div>
          </template>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">{{ $t('about.projectName') }}</span>
              <span class="info-value fw-medium">Antdv Next Admin</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('about.version') }}</span>
              <span class="info-value">
                <a-tag color="blue" class="version-tag">v{{ version }}</a-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('about.license') }}</span>
              <span class="info-value">
                <a-tag color="green" class="version-tag">MIT License</a-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('about.author') }}</span>
              <span class="info-value fw-medium">yelog</span>
            </div>
            <div class="info-row">
              <span class="info-label">
                <MailOutlined class="row-icon" />
                {{ $t('about.email') }}
              </span>
              <span class="info-value">
                <a href="mailto:yelogeek@gmail.com" class="link">yelogeek@gmail.com</a>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">
                <GithubOutlined class="row-icon" />
                GitHub
              </span>
              <span class="info-value">
                <a
                  href="https://github.com/yelog/antdv-next-admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link"
                >
                  yelog/antdv-next-admin
                  <LinkOutlined class="link-arrow" />
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
              <span class="card-icon-wrap"><CodeOutlined class="card-icon" /></span>
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
              :style="{ '--tech-color': tech.color }"
            >
              <div class="tech-dot"></div>
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
              <span class="card-icon-wrap"><BulbOutlined class="card-icon" /></span>
              <span>{{ $t('about.features') }}</span>
            </div>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col v-for="f in features" :key="f.title" :xs="24" :sm="12" :lg="6">
              <div class="feature-card" :style="{ '--feat-color': f.color }">
                <div class="feature-icon-wrap">
                  <component :is="f.icon" class="feature-icon" />
                </div>
                <div class="feature-text">
                  <span class="feature-title">{{ f.title }}</span>
                  <span class="feature-desc">{{ f.desc }}</span>
                </div>
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
  ProfileOutlined,
  CodeOutlined,
  BulbOutlined,
  GithubOutlined,
  MailOutlined,
  LinkOutlined,
  ApiOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  TableOutlined,
  CloudOutlined
} from '@antdv-next/icons'
import { $t } from '@/locales'
import logoImg from '@/assets/images/logo.png'

const version = __APP_VERSION__

const heroBadges = [
  { label: 'Vue 3', bg: 'rgba(66, 184, 131, 0.25)' },
  { label: 'TypeScript', bg: 'rgba(49, 120, 198, 0.25)' },
  { label: 'Vite', bg: 'rgba(100, 108, 255, 0.25)' },
  { label: 'Ant Design Vue', bg: 'rgba(255, 255, 255, 0.15)' },
]

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
  { title: $t('about.feature1'), desc: $t('about.feature1Desc'), icon: ApiOutlined, color: '#42b883' },
  { title: $t('about.feature2'), desc: $t('about.feature2Desc'), icon: SafetyOutlined, color: '#3178c6' },
  { title: $t('about.feature3'), desc: $t('about.feature3Desc'), icon: SafetyOutlined, color: '#e43961' },
  { title: $t('about.feature4'), desc: $t('about.feature4Desc'), icon: ApartmentOutlined, color: '#646cff' },
  { title: $t('about.feature5'), desc: $t('about.feature5Desc'), icon: GlobalOutlined, color: '#1677ff' },
  { title: $t('about.feature6'), desc: $t('about.feature6Desc'), icon: BgColorsOutlined, color: '#fa8c16' },
  { title: $t('about.feature7'), desc: $t('about.feature7Desc'), icon: TableOutlined, color: '#13c2c2' },
  { title: $t('about.feature8'), desc: $t('about.feature8Desc'), icon: CloudOutlined, color: '#722ed1' },
]
</script>

<style scoped lang="scss">
.about-page {
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

/* ===== Hero Banner ===== */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  padding: 56px 32px;
  margin-bottom: 16px;
  text-align: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 65%, #000) 100%);
  color: #fff;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    filter: blur(2px);
  }

  .orb-1 {
    width: 350px;
    height: 350px;
    top: -100px;
    right: -80px;
  }

  .orb-2 {
    width: 240px;
    height: 240px;
    bottom: -80px;
    left: -60px;
  }

  .orb-3 {
    width: 140px;
    height: 140px;
    top: 30%;
    left: 55%;
  }

  .code-symbols {
    .sym {
      position: absolute;
      font-family: var(--font-family-code);
      color: rgba(255, 255, 255, 0.07);
      font-weight: var(--font-weight-bold);
      user-select: none;
    }

    .sym-1 { top: 18%; left: 8%;   font-size: 32px; transform: rotate(-12deg); }
    .sym-2 { top: 25%; right: 12%; font-size: 28px; transform: rotate(8deg); }
    .sym-3 { bottom: 20%; left: 15%;  font-size: 24px; transform: rotate(-6deg); }
    .sym-4 { bottom: 28%; right: 8%;  font-size: 26px; transform: rotate(15deg); }
    .sym-5 { top: 60%; left: 40%;  font-size: 22px; transform: rotate(-4deg); }
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
  width: 68px;
  height: 68px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 34px;
  margin-bottom: 24px;

  .hero-logo {
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
}

.hero-title {
  font-size: 34px;
  font-weight: var(--font-weight-bold);
  margin: 0 0 12px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  color: #fff;
}

.hero-desc {
  font-size: 15px;
  opacity: 0.88;
  margin: 0 auto 24px;
  max-width: 500px;
  line-height: 1.7;
}

.hero-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-badge {
  display: inline-block;
  padding: 3px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.3px;
  background: var(--badge-bg);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* ===== Info Cards ===== */
.info-card {
  height: 100%;
  border: 1px solid var(--color-border-secondary);

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: var(--font-weight-semibold);
  }

  .card-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);

    .card-icon {
      font-size: 16px;
      color: var(--color-primary);
    }
  }
}

/* ===== Project Info List ===== */
.info-list {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid var(--color-border-secondary);
    gap: 24px;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }

    .info-label {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-text-secondary);
      font-size: 14px;
      flex-shrink: 0;

      .row-icon {
        font-size: 14px;
        opacity: 0.65;
      }
    }

    .info-value {
      color: var(--color-text-primary);
      font-size: 14px;
      text-align: right;
      min-width: 0;

      &.fw-medium {
        font-weight: var(--font-weight-medium);
      }
    }
  }
}

.version-tag {
  margin: 0;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary);
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  .link-arrow {
    font-size: 11px;
    opacity: 0.6;
  }
}

/* ===== Tech Stack Grid ===== */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 10px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-secondary);
  background: var(--color-bg-container);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: var(--tech-color);
    background: color-mix(in srgb, var(--tech-color) 4%, var(--color-bg-container));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .tech-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--tech-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--tech-color) 15%, transparent);
  }

  .tech-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .tech-name {
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.35;
  }

  .tech-version {
    font-size: 12px;
    color: var(--color-text-quaternary);
    line-height: 1.3;
  }
}

/* ===== Feature Cards ===== */
.feature-card {
  display: flex;
  gap: 14px;
  padding: 18px 16px;
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-secondary);
  background: var(--color-bg-container);
  height: 100%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: color-mix(in srgb, var(--feat-color) 40%, var(--color-border-secondary));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .feature-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 10px;
    background: color-mix(in srgb, var(--feat-color) 10%, transparent);

    .feature-icon {
      font-size: 20px;
      color: var(--feat-color);
    }
  }

  .feature-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .feature-title {
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .feature-desc {
    font-size: 12px;
    color: var(--color-text-tertiary);
    line-height: 1.5;
  }
}

/* ===== Dark Mode ===== */
:root.dark {
  .info-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .tech-item {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
  }

  .feature-card {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
  }
}

/* ===== Responsive ===== */
@media (max-width: 576px) {
  .hero {
    padding: 36px 20px;
  }

  .hero-title {
    font-size: 24px;
  }

  .hero-desc {
    font-size: 14px;
  }

  .hero-bg .code-symbols {
    display: none;
  }

  .tech-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .feature-card {
    padding: 14px 12px;
  }
}
</style>
