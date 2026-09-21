import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import { Plus, RefreshCw, Sparkles, Tag as TagIcon } from "lucide-react";

const KnowledgeDocHeader = ({
    onUpload,
    onCreateFolder,
    onRefresh,
    onCreateTag,
    onSwitchToMirror,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex shrink-0 items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#111426] dark:text-white">
                    {t("knowledgeBase.title", "知识库")}
                </h1>
                <p className="mt-1 text-caption text-[#8b91a9]">
                    {t("knowledgeBase.subtitle", "沉淀有价值的知识，让 AI 理解你的专业")}
                </p>
            </div>

            <div className="flex items-center gap-2.5">
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={onUpload}
                    className="bg-[#7771ed] hover:bg-[#6862e3] text-white rounded-xl shadow-xs"
                >
                    上传文件
                </Button>
                <Button
                    variant="outline"
                    icon={Plus}
                    onClick={onCreateFolder}
                    className="border-[#e9eaf4] bg-white/70 text-[#59617e] hover:bg-white hover:text-[#111426] rounded-xl shadow-2xs"
                >
                    新建文件夹
                </Button>
                <RowActionsMenu
                    size="md"
                    align="right"
                    actions={[
                        {
                            key: "refresh",
                            label: "刷新知识库",
                            icon: RefreshCw,
                            onClick: onRefresh,
                        },
                        {
                            key: "createTag",
                            label: "新建标签",
                            icon: TagIcon,
                            onClick: onCreateTag,
                        },
                        ...(onSwitchToMirror
                            ? [
                                  {
                                      key: "mirror",
                                      label: "知识镜像 / 复习",
                                      icon: Sparkles,
                                      onClick: onSwitchToMirror,
                                  },
                              ]
                            : []),
                    ]}
                />
            </div>
        </div>
    );
};

export default KnowledgeDocHeader;
