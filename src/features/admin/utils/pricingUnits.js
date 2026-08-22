/**
 * 1 元 = 10 积分，1 积分 = 1000 毫积分。
 * 因此：元/1M tokens × 10 = 毫积分/1K tokens。
 */
export const YUAN_PER_M_TO_MILLI_PER_1K = 10

export const yuanPerMToMilliPer1k = (yuan) => (
  Math.round(Number(yuan) * YUAN_PER_M_TO_MILLI_PER_1K)
)

export const milliPer1kToYuanPerM = (milli) => (
  Number(milli) / YUAN_PER_M_TO_MILLI_PER_1K
)
