/**
 * 工作台首页骨架屏
 * 与 WorkspaceHomePage 布局逐区块对应：顶栏 / Hero / 快捷操作 / 继续进行 / 今日概览 / 右侧栏
 */
const BLOCK = 'animate-pulse rounded bg-[#e9eaf4]/60';

const WorkspaceHomeSkeleton = () => (
  <div className="h-full min-h-0 overflow-y-auto text-body text-[#555b7b]" aria-busy="true" aria-label="loading">
    <div className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-5 px-5">
      <div className={`${BLOCK} h-9 w-28`} />
      <div className="flex items-center gap-3">
        <div className={`${BLOCK} hidden h-9 w-[15rem] rounded-full lg:block`} />
        <div className={`${BLOCK} h-9 w-9 rounded-full`} />
        <div className={`${BLOCK} hidden h-9 w-28 rounded-full sm:block`} />
      </div>
    </div>

    <div className="px-5 pb-5">
      <div className="flex flex-col items-stretch gap-5 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="min-h-[12.5rem] rounded-2xl bg-[linear-gradient(105deg,#f1f0ff_0%,#f8f9ff_72%)] px-10 py-7">
            <div className="space-y-3">
              <div className={`${BLOCK} h-8 w-64 max-w-full`} />
              <div className={`${BLOCK} h-5 w-80 max-w-full`} />
              <div className={`${BLOCK} mt-5 h-14 max-w-[56rem] rounded-[1.125rem]`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={`${BLOCK} min-h-[5rem] rounded-2xl`} />
            ))}
          </div>

          <section className="space-y-3">
            <div className={`${BLOCK} h-5 w-24`} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[1, 2, 3].map((section) => (
                <div key={section} className="rounded-2xl border border-[#e9eaf3] bg-white/55 p-4">
                  <div className={`${BLOCK} h-5 w-28`} />
                  <div className="mt-3 divide-y divide-[#eef0f6]">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="flex min-h-11 items-center gap-2 py-2">
                        <div className={`${BLOCK} h-6 w-6 rounded-full`} />
                        <div className={`${BLOCK} h-4 min-w-0 flex-1`} />
                        <div className={`${BLOCK} h-3 w-12 shrink-0`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className={`${BLOCK} h-5 w-24`} />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((stat) => (
                <div key={stat} className="min-h-[8.5rem] rounded-2xl border border-[#e9eaf3] bg-white/48 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${BLOCK} h-10 w-10 rounded-xl`} />
                    <div className={`${BLOCK} h-4 w-20`} />
                  </div>
                  <div className={`${BLOCK} mt-2 ml-[3.25rem] h-7 w-24`} />
                  <div className={`${BLOCK} mt-2 ml-[3.25rem] h-3 w-28`} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:w-[20rem] xl:grid-cols-1">
          <div className="h-[24rem] rounded-2xl border border-[#e7e9f1] bg-white/70 p-5">
            <div className={`${BLOCK} h-5 w-28`} />
            <div className="mt-3 divide-y divide-[#eceef4]">
              {[1, 2, 3, 4, 5].map((todo) => (
                <div key={todo} className="flex min-h-[3.5rem] gap-3 py-2.5">
                  <div className={`${BLOCK} mt-0.5 h-4 w-4 rounded`} />
                  <div className="min-w-0 flex-1">
                    <div className={`${BLOCK} h-4 w-40 max-w-full`} />
                    <div className={`${BLOCK} mt-1.5 h-3 w-24`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[24rem] rounded-2xl border border-[#e7e9f1] bg-white/70 p-5">
            <div className={`${BLOCK} h-5 w-24`} />
            <div className="mt-4 flex flex-col gap-2.5">
              {[1, 2, 3].map((suggestion) => (
                <div
                  key={suggestion}
                  className="flex-1 rounded-xl border border-[#ececf6] bg-[linear-gradient(120deg,#f6f4ff_0%,#fbfbff_100%)] p-3"
                >
                  <div className="flex gap-3">
                    <div className={`${BLOCK} mt-0.5 h-5 w-5`} />
                    <div className="min-w-0 flex-1">
                      <div className={`${BLOCK} h-4 w-32 max-w-full`} />
                      <div className={`${BLOCK} mt-1.5 h-3 w-full`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
);

export default WorkspaceHomeSkeleton;
