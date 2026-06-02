import type { Component } from 'vue';

import {
  AntDesignOutlined,
  ApartmentOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  BellOutlined,
  BgColorsOutlined,
  BookOutlined,
  BugOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  CoffeeOutlined,
  ColumnHeightOutlined,
  CompassOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  EditOutlined,
  ExpandOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  FolderOutlined,
  FormOutlined,
  GlobalOutlined,
  HighlightOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  LinkOutlined,
  LoadingOutlined,
  ProfileOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SettingOutlined,
  SmileOutlined,
  StopOutlined,
  TableOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
} from '@antdv-next/icons';

const iconMap: Record<string, Component> = {
  AntDesignOutlined,
  ApartmentOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  BellOutlined,
  BgColorsOutlined,
  BookOutlined,
  BugOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  CoffeeOutlined,
  ColumnHeightOutlined,
  CompassOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  EditOutlined,
  ExpandOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  FolderOutlined,
  FormOutlined,
  GlobalOutlined,
  HighlightOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  LinkOutlined,
  LoadingOutlined,
  ProfileOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SettingOutlined,
  SmileOutlined,
  StopOutlined,
  TableOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
};

function normalizeIconName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.startsWith('antdv-next:')) {
    return trimmed.slice('antdv-next:'.length);
  }
  if (trimmed.startsWith('antd:')) {
    return trimmed.slice('antd:'.length);
  }
  return trimmed;
}

export function resolveIcon(name?: string): Component | undefined {
  if (!name) {
    return undefined;
  }

  const iconName = normalizeIconName(name);
  return iconMap[iconName];
}
