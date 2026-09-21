import { blogPlanService } from "./services/blogPlanService";
import { blogService } from "./services/blogService";

/** Workspace dashboard capabilities owned by the blog feature. */
export const listBlogPlans = (params, config) =>
    blogPlanService.listPlans(params, config);
export const listMyBlogs = (params, config) =>
    blogService.getMyBlogs(params, config);
