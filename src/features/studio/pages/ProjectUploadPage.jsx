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
        navigate(`/workspace/studio/compiler/${project.id}`);
      } catch (err) {
        setError(err.message || '项目构建失败');
      } finally {
        setIsBuilding(false);
      }
    },
    [navigate, zipFile]
  );

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/workspace/studio"
          className="mb-6 inline-flex items-center gap-2 text-body font-bold text-ink-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          返回 Studio
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleBuild}
            className="rounded-lg border border-border bg-canvas p-5 shadow-sm"
          >
            <div className="mb-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white shadow-lg shadow-accent/20">
                <FileArchive className="h-6 w-6" />
              </div>
              <p className="text-micro font-bold uppercase tracking-widest text-accent">
                Project Upload
              </p>
              <h1 className="mt-2 text-2xl font-black text-ink">
                上传项目 zip
              </h1>
              <p className="mt-2 max-w-2xl text-body leading-6 text-ink-muted">
                上传包含 `package.json` 的完整项目压缩包，点击构建后进入编译器页面查看文件结构和运行状态。
              </p>
            </div>

            <label className="group flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface px-5 py-10 text-center transition-colors hover:border-accent/50 hover:bg-accent/5">
              <UploadCloud className="mb-4 h-12 w-12 text-ink-faint transition-colors group-hover:text-accent" />
              <span className="text-base font-bold text-ink-secondary">
                {zipFile ? zipFile.name : '点击选择或拖入项目 zip'}
              </span>
              <span className="mt-2 text-body text-ink-faint">
                支持 `.zip`，建议根目录包含 `package.json`
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={(event) => setZipFile(event.target.files[0] || null)}
                className="mt-5 max-w-full text-body text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-canvas file:px-4 file:py-2 file:text-body file:font-bold file:text-accent hover:file:bg-surface-muted file:cursor-pointer cursor-pointer"
              />
            </label>

            {error && (
              <div className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-body font-semibold text-danger">
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-caption leading-5 text-ink-muted">
                构建成功后会自动跳转到编译器。
              </p>
              <button
                type="submit"
                disabled={!zipFile || isBuilding}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-body font-black text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
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

          <aside className="rounded-lg border border-border bg-canvas p-5 shadow-sm">
            <h2 className="text-body font-black text-ink">构建前检查</h2>
            <div className="mt-4 grid gap-3">
              {['包含 package.json', '依赖安装脚本可运行', '构建输出可被预览'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-3 text-body font-semibold text-ink-muted">
                  <CheckCircle2 className="h-4 w-4 text-success" />
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
