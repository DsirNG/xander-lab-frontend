import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Code2,
  Copy,
  FileCode2,
  Loader2,
  Plus,
  UploadCloud,
} from 'lucide-react';
import { uploadComponent } from '../services/studioService';

const defaultCode = `export default function DemoComponent() {
  return (
    <div className="p-6">
      <h2>Hello Studio</h2>
    </div>
  );
}`;

export default function ComponentUploadPage() {
  const navigate = useNavigate();
  const componentInputRef = useRef(null);
  const [componentFile, setComponentFile] = useState(null);
  const [fileName, setFileName] = useState('DemoComponent.jsx');
  const [code, setCode] = useState(defaultCode);
  const [externalCss, setExternalCss] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState('');

  const activeFileName = useMemo(
    () => componentFile?.name || fileName,
    [componentFile?.name, fileName]
  );

  const handleUploadFile = useCallback(async (event) => {
    const file = event.target.files[0] || null;
    setComponentFile(file);

    if (file) {
      setFileName(file.name);
      setCode(await file.text());
    }
  }, []);

  const handleCreateBlank = useCallback(() => {
    setComponentFile(null);
    setFileName('DemoComponent.jsx');
    setCode(defaultCode);
    if (componentInputRef.current) componentInputRef.current.value = '';
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
  }, [code]);

  const handleBuild = useCallback(
    async (event) => {
      event.preventDefault();

      setIsBuilding(true);
      setError('');

      try {
        const file = componentFile || new File([code], fileName, { type: 'text/plain' });
        const { project } = await uploadComponent(file, null, externalCss);
        navigate(`/studio/compiler/${project.id}`);
      } catch (err) {
        setError(err.message || '组件构建失败');
      } finally {
        setIsBuilding(false);
      }
    },
    [code, componentFile, externalCss, fileName, navigate]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/studio"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          返回 Studio
        </Link>

        <form onSubmit={handleBuild} className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg shadow-slate-900/15">
              <FileCode2 className="h-6 w-6" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
              Component Upload
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">
              组件上传 / 新建
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              支持 `tsx`、`jsx`、`js`、`vue` 等文件，也可以在线新建空白文件后粘贴代码。
            </p>

            <div className="mt-6 grid gap-3">
              <label className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 transition-colors hover:border-primary/50">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <UploadCloud className="h-4 w-4 text-primary" />
                  上传组件文件
                </span>
                <input
                  ref={componentInputRef}
                  type="file"
                  accept=".tsx,.jsx,.js,.ts,.vue,.css,.json"
                  onChange={handleUploadFile}
                  className="mt-3 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary hover:file:bg-slate-100 file:cursor-pointer cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={handleCreateBlank}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                新增空白文件
              </button>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-500">文件名</span>
                <input
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-500">外部 CSS 地址</span>
                <textarea
                  rows={3}
                  value={externalCss}
                  onChange={(event) => setExternalCss(event.target.value)}
                  placeholder="https://cdn.example.com/library.css"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>
            </div>
          </aside>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <Code2 className="h-4 w-4 text-slate-400" />
                <span className="truncate text-sm font-black text-slate-800">
                  {activeFileName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:text-primary"
              >
                <Copy className="h-3.5 w-3.5" />
                复制代码
              </button>
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
              className="min-h-[540px] w-full resize-none bg-slate-950 p-5 font-mono text-[13px] leading-6 text-slate-100 outline-none"
            />

            {error && (
              <div className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                构建后会生成预览项目，并进入编译器页面继续查看文件。
              </p>
              <button
                type="submit"
                disabled={!code.trim() || !fileName.trim() || isBuilding}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isBuilding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                {isBuilding ? '构建中' : '构建并进入编译器'}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
