// React 相关
import React from 'react'

// 样式文件
import styles from './BrowserWindow.module.css'

/**
 * BrowserWindow - 浏览器窗口样式容器组件
 * 用于包裹 demo 内容，提供浏览器窗口的视觉效果
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 要显示的内容
 * @param {string} [props.className] - 额外的 CSS 类名
 * @param {boolean} [props.showDots=true] - 是否显示浏览器控制点
 * @param {boolean} [props.showCodeLines=false] - 是否显示代码行装饰
 */
const BrowserWindow = ({
    children,
    className = '',
    showDots = true,
    showCodeLines = false
}) => {
    return (
        <div className={`${styles.browserWindow} ${className}`}>
            {showDots && (
                <div className={styles.browserHeader}>
                    <div className={styles.codeDots}>
                        <div className={`${styles.dot} ${styles.dotRed}`} />
                        <div className={`${styles.dot} ${styles.dotYellow}`} />
                        <div className={`${styles.dot} ${styles.dotGreen}`} />
                    </div>
                </div>
            )}

            {showCodeLines && (
                <div className={styles.codeLines}>
                    <div className={`${styles.line} ${styles.lineThreeQuarter}`} />
                    <div className={`${styles.line} ${styles.lineHalf}`} />
                    <div className={`${styles.line} ${styles.lineFull}`} />
                    <div className={`${styles.line} ${styles.lineTwoThird}`} />
                </div>
            )}

            <div className={styles.browserContent}>
                {children}
            </div>
        </div>
    )
}

export default BrowserWindow