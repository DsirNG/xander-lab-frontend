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
 * 根据 demoKey 或 customCode 解析演示组件
 * @param {string} demoKey - 注册表中的 key
 * @param {string} customCode - 用户输入的 JSX 代码
 * @param {string} libCode - 底层库注入代码
 * @param {string} wrapperCode - 环境包裹代码
 * @returns {React.ReactNode} 渲染的演示组件
 */
export const resolveDemo = (demoKey, customCode, libCode = '', wrapperCode = '') => {
    // 1. 优先从注册表中查找静态组件
    if (demoKey && DEMO_REGISTRY[demoKey]) {
        return DEMO_REGISTRY[demoKey];
    }

    // 2. 注册表里没有，但有 customCode → 渲染沙箱并预填代码
    if (customCode) {
        return (
            <LiveDemoSandbox
                initialCode={customCode}
                libraryCode={libCode}
                wrapperCode={wrapperCode}
                previewOnly={true}
            />
        );
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
