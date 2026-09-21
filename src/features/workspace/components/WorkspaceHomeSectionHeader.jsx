import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const WorkspaceHomeSectionHeader = ({ title, to }) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="text-title font-semibold text-[#17192d]">
                {title}
            </div>
            {to ? (
                <Link
                    to={to}
                    className="shrink-0 text-caption font-medium text-[#7a72ef] hover:text-[#6258e7]"
                >
                    {t("workspace.home.viewAll")}
                </Link>
            ) : null}
        </div>
    );
};

WorkspaceHomeSectionHeader.propTypes = {
    title: PropTypes.string.isRequired,
    to: PropTypes.string,
};

WorkspaceHomeSectionHeader.defaultProps = {
    to: "",
};

export default WorkspaceHomeSectionHeader;
