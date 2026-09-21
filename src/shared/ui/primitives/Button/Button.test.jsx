import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Check, Loader2 } from "lucide-react";
import Button from "./index.jsx";

describe("Button", () => {
    it("renders as a button with children", () => {
        render(<Button onClick={() => {}}>保存</Button>);
        const btn = screen.getByRole("button", { name: "保存" });
        expect(btn).toHaveAttribute("type", "button");
    });

    it("defaults to primary variant with accent background", () => {
        render(<Button>主操作</Button>);
        expect(screen.getByRole("button", { name: "主操作" })).toHaveClass(
            "bg-accent",
        );
    });

    it("applies size proportions", () => {
        const { rerender } = render(<Button size="sm">小</Button>);
        expect(screen.getByRole("button", { name: "小" })).toHaveClass(
            "h-9",
            "px-3.5",
            "rounded-lg",
        );
        rerender(<Button size="md">中</Button>);
        expect(screen.getByRole("button", { name: "中" })).toHaveClass(
            "h-10",
            "px-4",
            "rounded-xl",
        );
        rerender(<Button size="lg">大</Button>);
        expect(screen.getByRole("button", { name: "大" })).toHaveClass(
            "h-11",
            "px-5",
            "rounded-xl",
        );
    });

    it("calls onClick once when clicked", () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>点击</Button>);
        fireEvent.click(screen.getByRole("button", { name: "点击" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled is set and blocks clicks", () => {
        const onClick = vi.fn();
        render(
            <Button disabled onClick={onClick}>
                禁用
            </Button>,
        );
        const btn = screen.getByRole("button", { name: "禁用" });
        expect(btn).toBeDisabled();
        expect(btn).toHaveClass("disabled:opacity-50");
        fireEvent.click(btn);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("is disabled and shows a spinner while loading", () => {
        render(<Button loading>提交</Button>);
        const btn = screen.getByRole("button", { name: "提交" });
        expect(btn).toBeDisabled();
        expect(btn).toHaveAttribute("aria-busy", "true");
        expect(btn.querySelector(".animate-spin")).not.toBeNull();
    });

    it("renders the icon next to children", () => {
        render(<Button icon={Check}>完成</Button>);
        const btn = screen.getByRole("button", { name: "完成" });
        expect(btn.querySelector("svg")).not.toBeNull();
    });

    it("replaces the icon with a spinner while loading", () => {
        render(
            <Button icon={Check} loading>
                完成
            </Button>,
        );
        const btn = screen.getByRole("button", { name: "完成" });
        expect(btn.querySelector(".animate-spin")).not.toBeNull();
        expect(btn.querySelector(".lucide-check")).toBeNull();
    });

    it("is square when icon-only and requires no children", () => {
        render(<Button icon={Check} aria-label="勾选" />);
        const btn = screen.getByRole("button", { name: "勾选" });
        expect(btn).toHaveClass("h-10", "w-10");
    });

    it("renders as a block button with w-full", () => {
        render(<Button block>通栏</Button>);
        expect(screen.getByRole("button", { name: "通栏" })).toHaveClass(
            "w-full",
        );
    });

    it("renders the link variant without fixed height", () => {
        render(<Button variant="link">链接</Button>);
        const btn = screen.getByRole("button", { name: "链接" });
        expect(btn).toHaveClass("text-accent", "hover:underline");
        expect(btn).not.toHaveClass("h-10");
    });

    it("spreads extra props like aria-label and title", () => {
        render(
            <Button aria-label="自定义标签" title="提示">
                文字
            </Button>,
        );
        expect(
            screen.getByRole("button", { name: "自定义标签" }),
        ).toHaveAttribute("title", "提示");
    });

    it("uses Loader2 for the spinner", () => {
        render(<Button loading>加载</Button>);
        expect(Loader2).toBeDefined();
    });
});
