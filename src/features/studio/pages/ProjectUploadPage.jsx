import React, { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileArchive,
  Loader2,
  PackageCheck,
  UploadCloud,
} from 'lucide-react';
import { uploadProject } from '../services/studioService';

export default function ProjectUploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [zipFile, setZipFile] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState('');

  const handleBuild = useCallback(
    async (event) => {
      event.preventDefault();
      if (!zipFile) return;

      setIsBuilding(true);
      setError('');

      try {
        const { project } = await uploadProject(zipFile);
        navigate(`/studio/compiler/${project.id}`);
      } catch (err) {
        setError(err.message || '项目构建失败');
      } finally {
        setIsBuilding(false);
      }
    },
    [navigate, zipFile]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/studio"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          返回 Studio
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleBuild}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <FileArchive className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Project Upload
              </p>
              <h1 className="mt-2 text-2xl font-black text-slate-950">
                上传项目 zip
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                上传包含 `package.json` 的完整项目压缩包，点击构建后进入编译器页面查看文件结构和运行状态。
              </p>
            </div>

            <label className="group flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
              <UploadCloud className="mb-4 h-12 w-12 text-slate-300 transition-colors group-hover:text-primary" />
              <span className="text-base font-bold text-slate-800">
                {zipFile ? zipFile.name : '点击选择或拖入项目 zip'}
              </span>
              <span className="mt-2 text-sm text-slate-400">
                支持 `.zip`，建议根目录包含 `package.json`
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={(event) => setZipFile(event.target.files[0] || null)}
                className="mt-5 max-w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary hover:file:bg-slate-100 file:cursor-pointer cursor-pointer"
              />
            </label>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                构建成功后会自动跳转到编译器。
              </p>
              <button
                type="submit"
                disabled={!zipFile || isBuilding}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isBuilding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackageCheck className="h-4 w-4" />
                )}
                {isBuilding ? '构建中' : '构建并进入编译器'}
              </button>
            </div>
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">构建前检查</h2>
            <div className="mt-4 grid gap-3">
              {['包含 package.json', '依赖安装脚本可运行', '构建输出可被预览'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
