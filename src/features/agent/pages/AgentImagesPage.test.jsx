import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
// 这个用例把 @api / react-router 都 mock 掉了，链路里没人再初始化 i18n，
// 不显式引一次的话 t() 只会返回 key，文案断言全落空。
import "@locales";

const getMock = vi.fn();

vi.mock("@api", () => ({
    get: (...args) => getMock(...args),
}));

vi.mock("react-router-dom", () => ({
    useNavigate: () => vi.fn(),
}));

import AgentImagesPage from "./AgentImagesPage";

const EMPTY_TITLE = /还没有生成的图片|No images generated yet/;

describe("AgentImagesPage 首屏加载", () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    it("surfaces the load failure instead of pretending the user has no images", async () => {
        // 回归：loadError 只挂在"有图"那个分支上，首屏请求失败时一张图都没有，
        // 用户看到的是"还没有生成的图片"——一次请求故障被伪装成空数据，
        // 而且没有任何重试入口。
        getMock.mockRejectedValue(new Error("网络不给力"));

        render(<AgentImagesPage />);

        await waitFor(() =>
            expect(screen.getByText("网络不给力")).toBeInTheDocument(),
        );
        expect(screen.queryByText(EMPTY_TITLE)).not.toBeInTheDocument();
    });

    it("offers a retry that actually refetches", async () => {
        getMock.mockRejectedValueOnce(new Error("网络不给力"));
        getMock.mockResolvedValueOnce({ records: [], hasMore: false });

        render(<AgentImagesPage />);

        const retry = await screen.findByRole("button", {
            name: /重新加载|Reload/,
        });
        retry.click();

        await waitFor(() => expect(screen.getByText(EMPTY_TITLE)).toBeInTheDocument());
        expect(getMock).toHaveBeenCalledTimes(2);
    });

    it("keeps the empty state for a request that really returned nothing", async () => {
        getMock.mockResolvedValue({ records: [], hasMore: false });

        render(<AgentImagesPage />);

        await waitFor(() =>
            expect(screen.getByText(EMPTY_TITLE)).toBeInTheDocument(),
        );
    });
});
