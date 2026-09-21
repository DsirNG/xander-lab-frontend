import { formatPoints, pointsService } from "./services/pointsService";

/** Public account capabilities consumed by workspace and agent surfaces. */
export const getPointsOverview = (config) => pointsService.overview(config);
export { formatPoints };
