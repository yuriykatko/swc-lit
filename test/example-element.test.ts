import { html } from "@open-wc/testing";
import { describe, it, expect } from "@jest/globals";
import { TestHarness } from "../test-harness";

import type { ExampleElement } from "../src/example-element";

import "../src/example-element";

class Harness extends TestHarness<ExampleElement> {
    static async simple() {
      return await this.fixture(
        html`<example-element></example-element>`
      );
    }
}

describe("example-element tests", () => {
    it("can change element class using classMap", async () => {
        const main = await Harness.simple();
        const { element } = main;
        const classMapElement = main.qs<HTMLElement>("#class-map-element");

        expect(classMapElement.className).toEqual("  ");

        element.show();

        element.requestUpdate();
        await element.updateComplete;

        expect(classMapElement.className).toEqual("visible");
    });

    it("can change element class using shadowRoot selector", async () => {
        const main = await Harness.simple();
        const { element } = main;
        const shadowRootElement = main.qs<HTMLElement>("#shadow-root-element");

        expect(shadowRootElement?.className).toEqual("");

        element.show();

        element.requestUpdate();
        await element.updateComplete;

        expect(shadowRootElement.className).toEqual("visible");
    })

    it("can change element class using @query decorator", async () => {
        const main = await Harness.simple();
        const { element } = main;

        expect(element.queryElement).toBeDefined();
        expect(element.queryElement?.className).toEqual("");

        await element.show();

        element.requestUpdate();
        await element.updateComplete;

        expect(element.queryElement.className).toEqual("visible");
    });
})
 