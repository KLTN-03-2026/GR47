import { Outlet } from "react-router-dom";
import { CleanerHeader } from "../components/cleaner/header";
import { CleanerFooter } from "../components/cleaner/footer";

export const CleanerWrapper = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#f4f7f6] pb-20">
            <CleanerHeader />
            <main className="flex-grow">
                <Outlet />
            </main>
            <CleanerFooter />
        </div>
    );
};