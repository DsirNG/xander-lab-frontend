/** Lightweight Prism registry for the languages rendered by DinQorAI. */
import { PrismLight } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";

PrismLight.registerLanguage("bash", bash);
PrismLight.registerLanguage("shell", bash);
PrismLight.registerLanguage("css", css);
PrismLight.registerLanguage("javascript", javascript);
PrismLight.registerLanguage("js", javascript);
PrismLight.registerLanguage("json", json);
PrismLight.registerLanguage("jsx", jsx);
PrismLight.registerLanguage("markup", markup);
PrismLight.registerLanguage("html", markup);
PrismLight.registerLanguage("htm", markup);
PrismLight.registerLanguage("svg", markup);
PrismLight.registerLanguage("tsx", tsx);
PrismLight.registerLanguage("typescript", typescript);
PrismLight.registerLanguage("ts", typescript);

export default PrismLight;
