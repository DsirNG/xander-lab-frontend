import PropTypes from "prop-types";
import { AgentShowcase } from "@features/agent";
import { GlowingRing3D } from "./LandingIllustrations";

const LandingAgentWindow = ({ t }) => (
    <AgentShowcase t={t} welcomeVisual={GlowingRing3D} />
);

LandingAgentWindow.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingAgentWindow;
