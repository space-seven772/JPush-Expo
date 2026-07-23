/**
 * Android settings.gradle 配置
 * 添加 JPush 模块引用
 */

import { ExpoConfig } from 'expo/config';
import { withSettingsGradle } from 'expo/config-plugins';
import { syncGeneratedContents, syncGeneratedContentsAtEnd } from '../utils/generateCode';
import { VendorChannelConfig } from '../types';

/**
 * 生成 JPush 模块配置
 */
const getJPushModules = (): string => {
  return `include ':jpush-react-native'
project(':jpush-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/jpush-react-native/android')

include ':jcore-react-native'
project(':jcore-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/jcore-react-native/android')`;
};

/**
 * 生成华为 AGConnect 所需的 libs version catalog 定义。
 * AGConnect 插件运行时调用 versionCatalogs.named("libs")，因此必须在
 * settings.gradle 中定义 libs catalog；仅华为通道启用时注入，避免污染其他场景。
 */
const getLibsVersionCatalog = (): string => {
  return `dependencyResolutionManagement {
    versionCatalogs {
        libs {
            from(files("../gradle/libs.versions.toml"))
        }
    }
}`;
};

export function applyAndroidSettingsGradle(
  contents: string,
  vendorChannels?: VendorChannelConfig
): string {
  let nextContents = syncGeneratedContents({
    src: contents,
    newSrc: getJPushModules(),
    tag: 'jpush-modules',
    anchor: /include\s+['"]?:app['"]?/,
    offset: -1,
    comment: '//',
  }).contents;

  // 仅在华为通道启用时注入 libs version catalog，避免污染无华为场景
  const isHuaweiEnabled = vendorChannels?.huawei?.enabled === true;
  nextContents = syncGeneratedContentsAtEnd({
    src: nextContents,
    newSrc: isHuaweiEnabled ? getLibsVersionCatalog() : '',
    tag: 'jpush-libs-version-catalog',
    comment: '//',
  }).contents;

  return nextContents;
}

/**
 * 配置 Android settings.gradle
 * 添加 jpush-react-native 和 jcore-react-native 模块；
 * 华为通道启用时额外注入 libs version catalog 供 AGConnect 使用
 */
export function withAndroidSettingsGradle(
  config: ExpoConfig,
  props: { vendorChannels?: VendorChannelConfig }
): ExpoConfig {
  return withSettingsGradle(config, (config) => {
    console.log('\n[MX_JPush_Expo] 配置 Android settings.gradle ...');
    config.modResults.contents = applyAndroidSettingsGradle(
      config.modResults.contents,
      props?.vendorChannels
    );
    return config;
  });
}
