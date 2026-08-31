import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Code2,
    Copy,
    FileCode2,
    Loader2,
    Plus,
    UploadCloud,
} from "lucide-react";
import { uploadComponent } from "../services/studioService";
import StudioTopBar from "../components/StudioTopBar";

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
    const [fileName, setFileName] = useState("DemoComponent.jsx");
    const [code, setCode] = useState(defaultCode);
    const [externalCss, setExternalCss] = useState("");
    const [isBuilding, setIsBuilding] = useState(false);
    const [error, setError] = useState("");

    const activeFileName = useMemo(
        () => componentFile?.name || fileName,
        [componentFile?.name, fileName],
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
        setFileName("DemoComponent.jsx");
        setCode(defaultCode);
        if (componentInputRef.current) componentInputRef.current.value = "";
    }, []);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(code);
    }, [code]);

    const handleBuild = useCallback(
        async (event) => {
            event.preventDefault();

            setIsBuilding(true);
            setError("");

            try {
                const file =
                    componentFile ||
                    new File([code], fileName, { type: "text/plain" });
                const { project } = await uploadComponent(
                    file,
                    null,
                    externalCss,
                );
                navigate(`/workspace/studio/compiler/${project.id}`);
            } catch (err) {
                setError(err.message || "组件构建失败");
            } finally {
                setIsBuilding(false);
            }
        },
        [code, componentFile, externalCss, fileName, navigate],
    );

    return (
        <div className="min-h-dvh bg-surface">
            <StudioTopBar backLabel="返回 Studio" />
            <main className="mx-auto w-full max-w-[1400px] px-4 py-6 px-ultra-tight sm:px-6 lg:px-8">
                <form
                    onSubmit={handleBuild}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]"
                >
                    <aside className="min-w-0 rounded-lg border border-border bg-canvas p-5 shadow-sm">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white shadow-lg shadow-ink/15">
                            <FileCode2 className="h-6 w-6" />
                        </div>
                        <div className="text-micro font-bold uppercase tracking-widest text-accent">
                            Component Upload
                        </div>
                        <div className="mt-2 text-2xl font-black text-ink">
                            组件上传 / 新建
                        </div>
                        <div className="mt-2 text-body leading-6 text-ink-muted">
                            支持 `tsx`、`jsx`、`js`、`vue`
                            等文件，也可以在线新建空白文件后粘贴代码。
                        </div>

                        <div className="mt-6 grid gap-3">
                            <label className="rounded-lg border border-dashed border-border-strong bg-surface p-4 transition-colors hover:border-accent/50">
                                <span className="flex items-center gap-2 text-body font-bold text-ink-secondary">
                                    <UploadCloud className="h-4 w-4 text-accent" />
                                    上传组件文件
                                </span>
                                <input
                                    ref={componentInputRef}
                                    type="file"
                                    accept=".tsx,.jsx,.js,.ts,.vue,.css,.json"
                                    onChange={handleUploadFile}
                                    className="mt-3 w-full text-body text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-canvas file:px-4 file:py-2 file:text-body file:font-bold file:text-accent hover:file:bg-surface-muted file:cursor-pointer cursor-pointer"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleCreateBlank}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-canvas px-4 py-3 text-body font-bold text-ink-secondary transition-colors hover:border-accent/40 hover:text-accent"
                            >
                                <Plus className="h-4 w-4" />
                                新增空白文件
                            </button>

                            <label className="block">
                                <span className="mb-1 block text-caption font-bold text-ink-muted">
                                    文件名
                                </span>
                                <input
                                    value={fileName}
                                    onChange={(event) =>
                                        setFileName(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-body font-semibold text-ink-secondary outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-caption font-bold text-ink-muted">
                                    外部 CSS 地址
                                </span>
                                <textarea
                                    rows={3}
                                    value={externalCss}
                                    onChange={(event) =>
                                        setExternalCss(event.target.value)
                                    }
                                    placeholder="https://cdn.example.com/library.css"
                                    className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-body text-ink-secondary outline-none transition-all placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/10"
                                />
                            </label>
                        </div>
                    </aside>

                    <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-canvas shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-2">
                                <Code2 className="h-4 w-4 text-ink-faint" />
                                <span className="truncate text-body font-black text-ink-secondary">
                                    {activeFileName}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-canvas px-3 py-2 text-caption font-bold text-ink-muted transition-colors hover:text-accent"
                            >
                                <Copy className="h-3.5 w-3.5" />
                                复制代码
                            </button>
                        </div>

                        <textarea
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            spellCheck={false}
                            className="min-h-[540px] w-full resize-none bg-ink p-5 font-mono text-body leading-6 text-surface outline-none"
                        />

                        {error && (
                            <div className="mx-4 mb-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-body font-semibold text-danger">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-caption leading-5 text-ink-muted">
                                构建后会生成预览项目，并进入编译器页面继续查看文件。
                            </div>
                            <button
                                type="submit"
                                disabled={
                                    !code.trim() ||
                                    !fileName.trim() ||
                                    isBuilding
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-body font-black text-white transition-colors hover:bg-ink-secondary disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isBuilding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UploadCloud className="h-4 w-4" />
                                )}
                                {isBuilding ? "构建中" : "构建并进入编译器"}
                            </button>
                        </div>
                    </section>
                </form>
            </main>
        </div>
    );
}
