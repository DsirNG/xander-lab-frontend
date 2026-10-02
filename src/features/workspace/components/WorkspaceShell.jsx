import PropTypes from "prop-types";

const WorkspaceShell = ({ sidebar, children }) => (
    <div className="flex h-dvh min-w-0 overflow-hidden bg-canvas">
        {sidebar}

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-canvas">
            {children}
        </main>
    </div>
);

WorkspaceShell.propTypes = {
    sidebar: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
};

export default WorkspaceShell;
