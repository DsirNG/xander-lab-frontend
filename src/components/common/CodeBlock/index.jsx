/** @deprecated Use @shared/ui/data-display/CodeBlock. */
import CodeBlock from "@shared/ui/data-display/CodeBlock";
import { HtmlSandboxPreview } from "@features/htmlPreview";

export default function LegacyCodeBlock(props) {
    return (
        <CodeBlock
            {...props}
            previewComponent={props.previewComponent || HtmlSandboxPreview}
        />
    );
}
