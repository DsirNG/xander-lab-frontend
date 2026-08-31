import { useEffect, useRef, useState } from "react";
import { blogService } from "../services/blogService";

/**
 * 博客发布页数据加载：分类、标签、编辑态文章
 */
const usePublishData = ({ editId, isEditMode, onDataReady }) => {
    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [categories, setCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);

    const onDataReadyRef = useRef(onDataReady);
    useEffect(() => {
        onDataReadyRef.current = onDataReady;
    }, [onDataReady]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const [catData, tagData] = await Promise.all([
                    blogService.getCategories({ signal: controller.signal }),
                    blogService.getAllTags({ signal: controller.signal }),
                ]);

                const formattedOptions = catData.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                }));
                setCategories(formattedOptions);
                setAvailableTags(tagData.map((item) => item.name));

                if (isEditMode) {
                    const post = await blogService.getMyBlogById(editId, {
                        signal: controller.signal,
                    });
                    onDataReadyRef.current?.({ post, formattedOptions });
                } else {
                    onDataReadyRef.current?.({ post: null, formattedOptions });
                }
            } catch (err) {
                if (err.name === "CanceledError" || err.code === "ERR_CANCELED")
                    return;
                console.error("Failed to fetch data:", err);
                onDataReadyRef.current?.({ error: err });
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
    }, [editId, isEditMode]);

    return { pageLoading, categories, availableTags };
};

export default usePublishData;
