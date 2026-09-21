import PropTypes from "prop-types";
import { ImagePlus, Loader2, Sparkles, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

const Img2ThreeUploadPanel = ({
    filePreviewUrl,
    dragActive,
    selectedFile,
    isBusy,
    onDragActiveChange,
    onFileSelect,
    onGenerate,
}) => {
    const { t } = useTranslation();

    const handleDrop = (event) => {
        event.preventDefault();
        onDragActiveChange(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
    };

    return (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <label
                htmlFor="img2three-file"
                onDragEnter={(event) => {
                    event.preventDefault();
                    onDragActiveChange(true);
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    onDragActiveChange(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    onDragActiveChange(false);
                }}
                onDrop={handleDrop}
                className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                    dragActive
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-canvas hover:border-accent"
                }`}
            >
                {filePreviewUrl ? (
                    <img
                        src={filePreviewUrl}
                        alt={t("img2three.preview")}
                        className="mb-4 max-h-48 rounded-xl object-contain shadow-sm"
                    />
                ) : (
                    <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent">
                        <ImagePlus
                            className="h-8 w-8"
                            aria-hidden="true"
                        />
                    </div>
                )}
                <div className="text-body font-semibold text-ink">
                    {t("img2three.uploadHint")}
                </div>
                <div className="mt-2 text-caption text-ink-muted">
                    {t("img2three.dropHint")}
                </div>
                <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    {t("img2three.chooseImage")}
                </span>
                <input
                    id="img2three-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onFileSelect(file);
                    }}
                />
            </label>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="text-caption text-ink-muted">
                    {t("img2three.loginRequired")}
                </div>
                <button
                    type="button"
                    disabled={!selectedFile || isBusy}
                    onClick={onGenerate}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-fg disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isBusy ? (
                        <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <Sparkles
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                    )}
                    {isBusy
                        ? t("img2three.generating")
                        : t("img2three.generate")}
                </button>
            </div>
        </section>
    );
};

Img2ThreeUploadPanel.propTypes = {
    filePreviewUrl: PropTypes.string,
    dragActive: PropTypes.bool.isRequired,
    selectedFile: PropTypes.object,
    isBusy: PropTypes.bool.isRequired,
    onDragActiveChange: PropTypes.func.isRequired,
    onFileSelect: PropTypes.func.isRequired,
    onGenerate: PropTypes.func.isRequired,
};

export default Img2ThreeUploadPanel;
