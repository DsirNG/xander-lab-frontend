import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FormField from "./index.jsx";

describe("FormField", () => {
    it("renders the label with htmlFor when label is provided", () => {
        render(
            <FormField label="用户名" htmlFor="username">
                <input id="username" />
            </FormField>,
        );
        const label = screen.getByText("用户名");
        expect(label.tagName).toBe("LABEL");
        expect(label).toHaveAttribute("for", "username");
    });

    it("omits the label entirely when label is empty", () => {
        render(
            <FormField>
                <input aria-label="field" />
            </FormField>,
        );
        expect(screen.queryByText("用户名")).not.toBeInTheDocument();
    });

    it("renders children", () => {
        render(
            <FormField label="邮箱">
                <input aria-label="email" />
            </FormField>,
        );
        expect(screen.getByLabelText("email")).toBeInTheDocument();
    });

    it("renders the hint below the control", () => {
        render(
            <FormField label="密码" hint="至少 8 位">
                <input aria-label="password" />
            </FormField>,
        );
        expect(screen.getByText("至少 8 位")).toBeInTheDocument();
    });

    it("passes the className to the wrapper", () => {
        const { container } = render(
            <FormField label="标题" className="col-span-2">
                <input aria-label="t" />
            </FormField>,
        );
        expect(container.firstChild).toHaveClass("col-span-2");
    });
});
