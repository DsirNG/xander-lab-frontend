import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OverviewCard from "./OverviewCard";
import RhythmCard from "./RhythmCard";
import UpcomingCard from "./UpcomingCard";

const PLAN_STATUS = {
    ACTIVE: "ACTIVE",
    RUNNING: "RUNNING",
    PAUSED: "PAUSED",
    FINISHED: "FINISHED",
};

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));
vi.mock("../../services/blogPlanService", () => ({
    PLAN_STATUS: {
        ACTIVE: "ACTIVE",
        RUNNING: "RUNNING",
        PAUSED: "PAUSED",
        FINISHED: "FINISHED",
    },
}));

const todayAt = (hour) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
};

describe("Plan sidebar cards", () => {
    it("shows real overview status counts", () => {
        render(
            <OverviewCard
                total={5}
                plans={[
                    { status: PLAN_STATUS.ACTIVE },
                    { status: PLAN_STATUS.RUNNING },
                    { status: PLAN_STATUS.PAUSED },
                    { status: PLAN_STATUS.FINISHED },
                ]}
            />,
        );
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("shows backend publishing average and seven daily bars", () => {
        render(
            <RhythmCard
                rhythm={{
                    dailyAverage: 2.1,
                    days: Array.from({ length: 7 }, (_, index) => ({
                        date: `2026-08-${24 + index}`,
                        count: index,
                    })),
                }}
            />,
        );
        expect(screen.getByText("2.1")).toBeInTheDocument();
        expect(screen.getAllByTestId("rhythm-bar")).toHaveLength(7);
        expect(
            screen.queryByText("blogPlans.editRhythm"),
        ).not.toBeInTheDocument();
    });

    it("shows only today active plans without a view-all action", () => {
        render(
            <UpcomingCard
                plans={[
                    {
                        id: 1,
                        topic: "Today",
                        status: PLAN_STATUS.ACTIVE,
                        nextRunAt: todayAt(23),
                    },
                    {
                        id: 2,
                        topic: "Paused",
                        status: PLAN_STATUS.PAUSED,
                        nextRunAt: todayAt(22),
                    },
                    {
                        id: 3,
                        topic: "No date",
                        status: PLAN_STATUS.ACTIVE,
                        nextRunAt: null,
                    },
                ]}
            />,
        );
        expect(screen.getByText("Today")).toBeInTheDocument();
        expect(screen.queryByText("Paused")).not.toBeInTheDocument();
        expect(screen.queryByText("blogPlans.viewAll")).not.toBeInTheDocument();
    });
});
