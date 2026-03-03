# Antdv Next Admin

[![CI/CD](https://github.com/yelog/antdv-next-admin/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yelog/antdv-next-admin/actions/workflows/ci-cd.yml)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | **한국어**

Vue 3 + TypeScript + Ant Design Vue로 구축된 현대적이고 기능이 풍부한 관리자 대시보드 스캐폴드입니다.

## 미리보기

**라이브 데모:** [https://antdv-next-admin.yelog.org/dashboard](https://antdv-next-admin.yelog.org/dashboard)

![스크린샷](docs/images/screenshot.png)

> 기본 계정: admin / 123456 또는 user / 123456

## 기능

### 핵심 기능
- 최신 기술 스택: Vue 3 + Vite + TypeScript + Pinia
- UI 컴포넌트: Ant Design Vue (antdv-next)
- 레이아웃 시스템: 수직/수평 모드를 지원하는 반응형 레이아웃
- 멀티 탭: KeepAlive 기반 탭 시스템 (고정, 새로고침, 컨텍스트 메뉴 지원)
- 테마 시스템: 라이트/다크/자동 3가지 모드 지원
- 국제화 (i18n): 완전한 한국어/영어 전환, 런타임 지원
- 권한 시스템: 동적 라우트, 버튼 레벨 권한, 디렉티브 권한을 포함한 RBAC
- 목 데이터: 개발 환경을 위한 완전한 목 데이터 지원

### 고급 기능
- 환경 설정:
  - 6가지 프리셋 테마 색상 (새벽 블루, 오로라 그린, 퍼플, 황혼 레드, 석양 오렌지, 시안)
  - 사이드바 테마 전환 (다크/라이트)
  - 레이아웃 모드 전환 (수직/수평)
  - 5가지 페이지 전환 애니메이션
  - 회색 모드 / 색각 지원 모드

- 세련된 디자인:
  - 부드러운 애니메이션
  - 섬세한 인터랙션 피드백
  - 반응형 디자인
  - 일관된 디자인 언어

### Pro 컴포넌트
- ProTable: 고급 테이블 컴포넌트
  - 검색 폼 자동 생성
  - 열 설정 (표시/숨기기, 정렬, 고정)
  - 페이지네이션, 새로고침, 밀도 전환 내장
  - 다양한 값 타입 렌더링 (날짜, 태그, 진행률 등)

- ProForm: 고급 폼 컴포넌트
  - 설정 기반 폼 생성
  - 자동 레이아웃 및 유효성 검사
  - 다양한 폼 타입 지원
  - 제출/초기화 로직 내장

- ProModal: 고급 모달 컴포넌트
  - 드래그, 전체 화면 지원
  - 폼 자동 통합
  - 통합된 확인/취소 로직

### 비즈니스 컴포넌트
- 리치 텍스트 에디터: TipTap 기반, 이미지, 링크, 포맷팅 지원
- CAPTCHA 컴포넌트: 슬라이더, 퍼즐, 포인트 클릭, 회전
- 아이콘 피커: Iconify 라이브러리 검색 및 선택
- 워터마크: 텍스트/이미지 워터마크, 투명도 및 각도 설정 가능

## 빠른 시작

### 설치

```bash
npm install
```

### 개발 서버 시작

```bash
npm run dev
```

`http://localhost:3000` 접속

### 기본 계정

```
관리자 계정:
사용자명: admin
비밀번호: 123456

일반 사용자 계정:
사용자명: user
비밀번호: 123456
```

### 빌드

```bash
npm run build
```

### 프로덕션 빌드 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```
antdv-next-admin/
├── public/                     # 정적 에셋
├── src/
│   ├── api/                    # API 인터페이스
│   ├── assets/                 # 에셋 파일
│   │   └── styles/             # 전역 스타일
│   ├── components/             # 컴포넌트
│   │   ├── Layout/             # 레이아웃 컴포넌트
│   │   ├── Pro/                # Pro 컴포넌트
│   │   ├── Permission/         # 권한 컴포넌트
│   │   ├── Editor/             # 리치 텍스트 에디터
│   │   ├── Captcha/            # CAPTCHA 컴포넌트
│   │   └── IconPicker/         # 아이콘 피커
│   ├── composables/            # 컴포저블 함수
│   ├── directives/             # 커스텀 디렉티브
│   ├── locales/                # 국제화 파일
│   ├── router/                 # 라우터 설정
│   ├── stores/                 # Pinia 스토어
│   ├── types/                  # TypeScript 타입
│   ├── utils/                  # 유틸리티 함수
│   └── views/                  # 페이지 뷰
├── mock/                       # 목 데이터
├── docs/                       # 문서
└── ...설정 파일
```

## 기술 스택

### 핵심 프레임워크
- Vue 3.4+ - 점진적 JavaScript 프레임워크
- TypeScript 5+ - JavaScript의 상위 집합
- Vite 5+ - 차세대 프론트엔드 빌드 도구

### UI & 스타일링
- Ant Design Vue - 엔터프라이즈 UI 컴포넌트 라이브러리
- CSS Variables - 현대적인 테마 시스템
- SCSS - CSS 전처리기

### 상태 관리 & 라우팅
- Pinia 2+ - Vue 공식 상태 관리
- Vue Router 4+ - Vue 공식 라우터

### 유틸리티
- vue-i18n - 국제화
- Axios - HTTP 클라이언트
- dayjs - 날짜 처리
- lodash-es - 유틸리티 라이브러리

### 개발 도구
- vite-plugin-mock-dev-server - 목 서버
- ESLint - 코드 린팅
- Prettier - 코드 포맷팅

## 개발 가이드

### 요구사항

- Node.js >= 18
- npm >= 8 또는 pnpm >= 8

### 환경 변수

**개발 환경 (.env.development):**
```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
```

**프로덕션 환경 (.env.production):**
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### 권한 사용 방법

**디렉티브 방식:**
```vue
<a-button v-permission="'user.create'">사용자 생성</a-button>
<a-button v-permission="['user.edit', 'user.delete']">작업</a-button>
<a-button v-permission.all="['user.edit', 'user.approve']">승인</a-button>
```

**컴포저블 방식:**
```ts
const { can, canAll } = usePermission()

if (can('user.create')) {
  // 생성 권한 있음
}

if (canAll(['user.edit', 'user.approve'])) {
  // 두 권한 모두 있음
}
```

**컴포넌트 방식:**
```vue
<PermissionButton permission="user.create">
  <a-button>사용자 생성</a-button>
</PermissionButton>
```

## 목 API

개발 환경에서 자동으로 활성화되는 완전한 목 데이터 시스템이 포함되어 있습니다.

### 사용 가능한 목 API

- **인증**: 로그인, 로그아웃, 사용자 정보 조회
- **사용자 관리**: 목록, 생성, 수정, 삭제
- **역할 관리**: 완전한 CRUD
- **권한 관리**: 목록, 권한 트리
- **부서 관리**: 목록, 트리 구조
- **사전 관리**: 타입 목록, 데이터 조회
- **시스템 설정**: 설정 목록, 수정
- **파일 관리**: 업로드, 목록
- **로그 관리**: 로그 목록
- **대시보드**: 통계 데이터, 차트 데이터

## 하이라이트

### 멀티 테마 지원
6가지 프리셋 색상 × 3가지 모드 (라이트/다크/자동) = 18가지 테마 조합

### 유연한 레이아웃
- 수직 레이아웃 (사이드바 왼쪽)
- 수평 레이아웃 (메뉴 상단)
- 반응형 모바일 대응

### 멀티 탭 시스템
- 탭 캐싱 (KeepAlive)
- 고정 탭 (affix/pinned)
- 컨텍스트 메뉴 (새로고침, 고정, 닫기, 다른 탭 닫기, 왼쪽/오른쪽 닫기, 모두 닫기)
- 영구 저장

### 전역 검색
키보드 단축키 `Ctrl/Cmd + K`로 전역 메뉴 검색 열기.

### 국제화
완전한 중국어/영어 번역, 런타임 전환 지원.

## 기여

Issue와 Pull Request를 환영합니다! 자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

## 라이선스

MIT License

## 감사의 말

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design Vue](https://antdv.com/)
- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- [Ant Design Pro Vue](https://pro.antdv.com/)

---

Made with ❤️ by Claude Code