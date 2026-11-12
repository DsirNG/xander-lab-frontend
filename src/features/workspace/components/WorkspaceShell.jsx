import PropTypes from "prop-types";

const WorkspaceShell = ({ sidebar, children }) => (
    <div
        className="flex h-dvh min-w-0 flex-col overflow-hidden bg-surface-muted lg:flex-row lg:gap-2 lg:p-2"
    >
        {sidebar}

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-canvas lg:rounded-panel lg:border lg:border-border">
            {children}
        </main>
    </div>
);

WorkspaceShell.propTypes = {
    sidebar: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
};

export default WorkspaceShell;
