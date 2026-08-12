import React from 'react';
import { formLabelCls } from '../formStyles';

/**
 * FormField - 表单字段（label + 控件 + 可选提示），统一表单区块样式
 * @param {string} label - 字段标签；为空则整段省略
 * @param {string} htmlFor - 关联的控件 id（控制 label 点击聚焦）
 * @param {string} hint - 下方的辅助说明文字
 * @param {string} className - 包裹层额外类名（常用于网格单元格定位）
 * @param {ReactNode} children - 表单控件（input / TimeInput / CustomSelect 等）
 */
const FormField = ({ label, htmlFor, hint, className, children }) => (
  <div className={className}>
    {label ? (
      <label htmlFor={htmlFor} className={formLabelCls}>
        {label}
      </label>
    ) : null}
    {children}
    {hint ? <p className="mt-1 text-xs text-ink-faint">{hint}</p> : null}
  </div>
);

export default FormField;