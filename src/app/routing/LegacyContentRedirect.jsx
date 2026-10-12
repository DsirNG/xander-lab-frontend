import { Navigate, useParams, useSearchParams } from "react-router-dom";

const LegacyContentRedirect = ({ view }) => {
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const next = new URLSearchParams(searchParams);
    next.set("view", view);
    if (id) next.set("planId", id);
    return <Navigate to={`/app?${next}`} replace />;
};

export default LegacyContentRedirect;
