import { blogPlanService } from "./services/blogPlanService";
import { blogAgentService } from "./services/blogAgentService";
import { blogService } from "./services/blogService";

/** Workspace dashboard capabilities owned by the blog feature. */
export const listBlogPlans = (params, config) =>
    blogPlanService.listPlans(params, config);
export const listMyBlogs = (params, config) =>
    blogService.getMyBlogs(params, config);
export const getBlogAgentTask = (id, config) =>
    blogAgentService.getTask(id, config);
export const publishBlogAgentTask = (id, config) =>
    blogAgentService.publishTask(id, config);
