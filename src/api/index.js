/**
 * API 层统一出口
 * Unified API Layer Entry Point
 *
 * 使用方式 / Usage:
 *   import http from '@api';
 *   import { get, post, upload, download } from '@api';
 *   import { tokenStorage, HttpError } from '@api';
 */

export {
  default,
  get,
  post,
  put,
  patch,
  del as delete,
  head,
  options,
  upload,
  download,
  all,
  race,
  createCancelToken,
  cancelAllRequests,
  axiosInstance,
  tokenStorage,
  HttpError,
} from './http';
