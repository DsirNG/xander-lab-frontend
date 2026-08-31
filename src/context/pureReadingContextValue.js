import { createContext } from "react";

const PureReadingContext = createContext({
    isPureReading: false,
    setIsPureReading: () => {},
    togglePureReading: () => {},
});

export default PureReadingContext;
