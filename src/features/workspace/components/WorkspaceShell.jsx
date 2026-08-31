import PropTypes from "prop-types";

const WorkspaceShell = ({ sidebar, children }) => (
    <div className="flex h-dvh min-w-0 overflow-hidden bg-[#fefefe]">
        {sidebar}

        <main className="min-h-0 min-w-0 flex-1 bg-[#fefefe] p-3 pl-0 lg:p-4 lg:pl-0">
            <div className="mx-auto h-full min-h-0 overflow-hidden rounded-xl border border-[#f4f4fb] bg-[linear-gradient(135deg,#f5f5fe_0%,#fdfdfe_24%)]">
                {children}
            </div>
        </main>
    </div>
);

WorkspaceShell.propTypes = {
    sidebar: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
};

export default WorkspaceShell;
