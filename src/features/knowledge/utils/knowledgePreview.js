/**
 * Knowledge preview helpers shared by the drawer and full viewer.
 * These helpers stay inside the knowledge feature because their data shape
 * and chapter offset semantics belong to the knowledge domain.
 */

export function formatKnowledgeDateTime(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function findKnowledgeChapter(chapters, chapterId) {
    if (!Array.isArray(chapters) || chapterId == null) return null;

    for (const chapter of chapters) {
        if (chapter.id === chapterId) return chapter;
        const nested = findKnowledgeChapter(chapter.children, chapterId);
        if (nested) return nested;
    }

    return null;
}

export function getKnowledgeChapterContent({
    fullContent,
    fallbackText = "",
    chapter,
}) {
    if (
        chapter &&
        chapter.startOffset != null &&
        chapter.endOffset != null &&
        fullContent
    ) {
        return fullContent.substring(chapter.startOffset, chapter.endOffset);
    }

    return fullContent ?? fallbackText;
}
