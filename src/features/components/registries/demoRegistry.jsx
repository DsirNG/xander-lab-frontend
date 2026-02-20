import React from 'react';
import { BasicDemo, AlignmentDemo, StatusDemo } from '../pages/codeComponent/demo/demo';
import {
    ToastBasicDemo,
    ToastHoverDemo,
    ToastManualDemo,
    ToastActionDemo,
    ToastStackDemo,
    ToastNoHoverDemo
} from '../pages/codeComponent/demo/ToastDemo';
import LiveDemoSandbox from '../pages/codeComponent/demo/LiveDemoSandbox';

/**
 * 演示组件注册表：将数据库中的 key 映射到实际的 React 演示组件。
 * keys 必须与 `component_scenario` 表中的 `demo_key` 一致。
 */
export const DEMO_REGISTRY = {
    // 自定义选择器
    'BasicDemo': <BasicDemo />,
    'AlignmentDemo': <AlignmentDemo />,
    'StatusDemo': <StatusDemo />,

    // Toast 通知
    'ToastBasicDemo': <ToastBasicDemo />,
    'ToastHoverDemo': <ToastHoverDemo />,
    'ToastManualDemo': <ToastManualDemo />,
    'ToastActionDemo': <ToastActionDemo />,
    'ToastStackDemo': <ToastStackDemo />,
    'ToastNoHoverDemo': <ToastNoHoverDemo />,
};

/**
 * 根据 demoKey 获取对应的演示组件。
 *
 * 优先级：
 * 1. 直接在 DEMO_REGISTRY 中已注册的组件（静态的，最优先）
 * 2. 如果 key 不在注册表中，且 scenario 里带有 `customCode` 字段，则渲染实时沙箱
 * 3. 如果都没有，渲染一个空白的可编辑沙箱（让用户自己写）
 *
 * @param {string} demoKey - 数据库中的 demo_key
 * @param {string} [customCode] - 可选的自定义代码（存在数据库 code 字段中）
 * @returns {React.ReactNode}
 */
export function resolveDemo(demoKey, customCode) {
    // 1. 注册表里有 → 直接用
    if (demoKey && DEMO_REGISTRY[demoKey]) {
        return DEMO_REGISTRY[demoKey];
    }

    // 2. 注册表里没有，但有 customCode → 渲染沙箱并预填代码
    if (customCode) {
        return <LiveDemoSandbox initialCode={customCode} />;
    }

    // 3. 什么都没有 → 提示用户用空沙箱自己写
    if (demoKey) {
        console.warn(
            `[DEMO_REGISTRY] 未找到 key="${demoKey}" 的演示组件，已回退到空白沙箱。` +
            `\n请在 demoRegistry.jsx 中注册该组件，或在数据库 scenario 的 code 字段中存放 JSX 代码。`
        );
    }
    return <LiveDemoSandbox />;
}
