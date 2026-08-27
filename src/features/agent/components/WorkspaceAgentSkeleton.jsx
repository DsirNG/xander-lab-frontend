import React from 'react';

/**
 * 智能体对话页面骨架屏
 * 与 WorkspaceAgentChat 布局逐区块对应：顶部 Header / 对话流 / 底部输入框
 */
const BLOCK = 'animate-pulse rounded bg-[#e9eaf4]/60';

const WorkspaceAgentSkeleton = ({ fullPage = false }) => {
  return (
    <div
      className={`flex h-full w-full min-w-0 flex-col overflow-hidden bg-[#fdfdfe] ${
        fullPage ? 'relative' : ''
      }`}
      aria-busy="true"
      aria-label="loading"
    >
      {/* Top Header skeleton */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-black/[0.03] px-5">
        <div className={`${BLOCK} h-5 w-32`} />
        <div className="flex items-center gap-2">
          <div className={`${BLOCK} h-8 w-8 rounded-lg`} />
        </div>
      </header>

      {/* Main Chat Stream skeleton */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {/* User message skeleton */}
          <div className="flex justify-end">
            <div className="flex w-64 max-w-[75%] flex-col gap-2 rounded-3xl bg-[#f2f1fd]/80 p-4">
              <div className={`${BLOCK} h-4 w-full`} />
              <div className={`${BLOCK} h-4 w-3/4`} />
            </div>
          </div>

          {/* AI Thinking card skeleton */}
          <div className="flex items-start gap-2 rounded-xl border border-[#e9eaf3] bg-white/60 px-3 py-2.5">
            <div className={`${BLOCK} h-4 w-4 rounded-full`} />
            <div className={`${BLOCK} h-4 w-48`} />
          </div>

          {/* AI Response message skeleton */}
          <div className="flex flex-col gap-3.5 py-1">
            <div className="flex items-center gap-2">
              <div className={`${BLOCK} h-5 w-5 rounded-full`} />
              <div className={`${BLOCK} h-4 w-24`} />
            </div>
            <div className={`${BLOCK} h-4 w-full`} />
            <div className={`${BLOCK} h-4 w-[92%]`} />
            <div className={`${BLOCK} h-4 w-[85%]`} />
            <div className={`${BLOCK} h-4 w-[60%]`} />
          </div>

          {/* User message skeleton 2 */}
          <div className="flex justify-end">
            <div className="flex w-52 max-w-[75%] flex-col gap-2 rounded-3xl bg-[#f2f1fd]/80 p-4">
              <div className={`${BLOCK} h-4 w-full`} />
              <div className={`${BLOCK} h-4 w-2/3`} />
            </div>
          </div>

          {/* AI Response message skeleton 2 */}
          <div className="flex flex-col gap-3.5 py-1">
            <div className="flex items-center gap-2">
              <div className={`${BLOCK} h-5 w-5 rounded-full`} />
              <div className={`${BLOCK} h-4 w-20`} />
            </div>
            <div className={`${BLOCK} h-4 w-full`} />
            <div className={`${BLOCK} h-4 w-[78%]`} />
          </div>
        </div>
      </div>

      {/* Bottom Composer skeleton */}
      <div className="shrink-0 bg-gradient-to-t from-[#fdfdfe] via-[#fdfdfe]/90 to-transparent p-4">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-2xl border border-[#e9eaf3] bg-white p-3.5 shadow-sm">
            <div className={`${BLOCK} h-10 w-full rounded-xl`} />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className={`${BLOCK} h-7 w-7 rounded-lg`} />
                <div className={`${BLOCK} h-7 w-7 rounded-lg`} />
              </div>
              <div className={`${BLOCK} h-8 w-20 rounded-xl`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAgentSkeleton;
