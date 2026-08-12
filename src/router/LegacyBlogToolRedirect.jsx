import { Navigate, useParams } from 'react-router-dom';

/** Preserve historic blog-tool links while routing the artifact into Dindor. */
const LegacyBlogToolRedirect = () => {
  const { taskId } = useParams();
  const target = taskId
    ? `/workspace/agent?blogTaskId=${encodeURIComponent(taskId)}`
    : '/workspace/agent';
  return <Navigate to={target} replace />;
};

export default LegacyBlogToolRedirect;
