import type { Plugin } from "vite";
/**
 * Vite 插件：自动转换 .uvue 文件中的 Tailwind 类名为安全字符
 * 并自动注入 rem 转 rpx 的 PostCSS 插件
 */
export declare function tailwindPlugin(): Plugin;
