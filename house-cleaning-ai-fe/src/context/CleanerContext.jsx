import { createContext, useContext, useState, useCallback } from "react";

const CleanerContext = createContext();

export const CleanerProvider = ({ children }) => {
    const [cleanerRefreshTrigger, setCleanerRefreshTrigger] = useState(0);

    const triggerCleanerRefresh = useCallback(() => {
        setCleanerRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <CleanerContext.Provider value={{ cleanerRefreshTrigger, triggerCleanerRefresh }}>
            {children}
        </CleanerContext.Provider>
    );
};

export const useCleanerRefresh = () => {
    const context = useContext(CleanerContext);
    if (!context) {
        throw new Error("useCleanerRefresh must be used within CleanerProvider");
    }
    return context;
};
