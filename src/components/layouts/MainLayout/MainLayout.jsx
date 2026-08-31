import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Navbar from "./Navbar";
import { PureReadingProvider } from "@/context/PureReadingContext";
import usePureReading from "@/hooks/usePureReading";

const MainLayoutContent = () => {
    const location = useLocation();
    const { isPureReading } = usePureReading();

    return (
        <div className={styles.layoutContainer}>
            {!isPureReading && <Navbar key={location.pathname} />}
            <main
                id="main-content"
                tabIndex={-1}
                className={`${styles.mainContent} ${isPureReading ? "!pt-0" : ""}`}
            >
                <Outlet />
            </main>
        </div>
    );
};

const MainLayout = () => {
    return (
        <PureReadingProvider>
            <MainLayoutContent />
        </PureReadingProvider>
    );
};

export default MainLayout;
