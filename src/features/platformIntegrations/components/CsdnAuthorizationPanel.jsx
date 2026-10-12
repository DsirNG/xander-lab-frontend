import LocalPlatformAuthorizationPanel from "./LocalPlatformAuthorizationPanel";
import { csdnService } from "../services/publishingService";

const CsdnAuthorizationPanel = () => (
    <LocalPlatformAuthorizationPanel platform="csdn" service={csdnService} />
);

export default CsdnAuthorizationPanel;
