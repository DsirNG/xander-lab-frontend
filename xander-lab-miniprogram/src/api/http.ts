import Taro from '@tarojs/taro'

type ApiResult<T> = {
  code: number
  message: string
  data: T
}

const API_ORIGIN = process.env.TARO_ENV === 'h5' ? '' : 'https://xander.dsircity.top'

export class ApiError extends Error {
  code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export async function request<T>(
  path: string,
  options: Omit<Taro.request.Option, 'url' | 'success' | 'fail'> = {},
): Promise<T> {
  const response = await Taro.request<ApiResult<T>>({
    ...options,
    url: `${API_ORIGIN}${path}`,
    timeout: 15000,
    header: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.header,
    },
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new ApiError(`请求失败（${response.statusCode}）`, response.statusCode)
  }

  if (!response.data || ![0, 200].includes(response.data.code)) {
    throw new ApiError(response.data?.message || '服务暂时不可用', response.data?.code || -1)
  }

  return response.data.data
}
