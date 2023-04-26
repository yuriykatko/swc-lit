import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

declare global {
  interface HTMLElementTagNameMap {
    "example-element": ExampleElement;
  }
}

@customElement("example-element")
export class ExampleElement extends LitElement {
  @property({ type: Boolean }) isVisible = false;

  @query("#query-element") queryElement: HTMLElement;

  async show(): Promise<void> {
    this.isVisible = true;
    this.shadowRoot?.querySelector("#shadow-root-element")?.classList.add("visible");
    this.queryElement?.classList.add("visible");
  }
  
  render(): TemplateResult {
    return html`
      <span id="class-map-element" class=${classMap({ visible: this.isVisible })}></span>
      <span id="shadow-root-element"></span>
      <span id="query-element"></span>
    `;
  }
}
