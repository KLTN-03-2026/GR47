export const AdminFooter = () => {
    return (
        <footer className="py-4 px-6 border-t border-slate-200 bg-white shrink-0 mt-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-xs font-medium text-slate-500">
                    © 2026 <strong className="text-slate-900">CleanAI CMS</strong>. Bản quyền thuộc về Công ty TNHH CleanAI.
                </p>
                <p className="text-xs font-medium text-slate-400">
                    Phiên bản hệ thống: <span className="font-bold">v3.1 Pro</span>
                </p>
            </div>
        </footer>
    );
};