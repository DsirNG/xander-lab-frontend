import { useEffect, useRef } from "react";

/**
 * Starts a new Agent conversation from the shared `?q=` route contract.
 * Both Agent entry points use the same one-shot and cleanup behavior.
 */
const useAgentQueryBootstrap = ({
    conversationId,
    creating,
    queryParam,
    searchParams,
    setInput,
    setSearchParams,
    submitText,
    t,
    toast,
}) => {
    const pendingQueryRef = useRef(null);

    useEffect(() => {
        if (
            !queryParam ||
            conversationId ||
            creating ||
            pendingQueryRef.current === queryParam
        )
            return;

        pendingQueryRef.current = queryParam;
        setInput(queryParam);
        (async () => {
            try {
                await submitText(queryParam);
                const next = new URLSearchParams(searchParams);
                next.delete("q");
                setSearchParams(next, { replace: true });
            } catch (error) {
                toast.error(error.message || t("blog.agentChat.sendFailed"));
            }
        })();
    }, [
        conversationId,
        creating,
        queryParam,
        searchParams,
        setInput,
        setSearchParams,
        submitText,
        t,
        toast,
    ]);
};

export default useAgentQueryBootstrap;
