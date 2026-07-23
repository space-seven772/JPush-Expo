/**
 * Android 配置集成
 */

import { ExpoConfig } from 'expo/config';
import { withAndroidManifestConfig } from './androidManifest';
import { withAndroidAppBuildGradle } from './appBuildGradle';
import { withAndroidProjectBuildGradle } from './projectBuildGradle';
import { withAndroidSettingsGradle } from './settingsGradle';
import { withAndroidGradleProperties } from './gradleProperties';
import { ResolvedJPushPluginProps } from '../types';

/**
 * 应用所有 Android 配置
 * @param config - Expo config
 * @param props - 已归一化的插件配置
 * @returns Modified config
 */
export function withAndroidConfig(
  config: ExpoConfig,
  props: ResolvedJPushPluginProps
): ExpoConfig {
  config = withAndroidManifestConfig(config);
  config = withAndroidProjectBuildGradle(config, props);
  config = withAndroidAppBuildGradle(config, props);
  config = withAndroidSettingsGradle(config, props);
  config = withAndroidGradleProperties(config, props);

  return config;
}
