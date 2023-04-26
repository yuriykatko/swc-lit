import type { LitElement } from "lit";
import { fixture } from "@open-wc/testing";
import type { LitHTMLRenderable } from "@open-wc/testing-helpers/types/src/renderable";

const TEST_HARNESS = Symbol("testHarness");

interface TestedElement extends Readonly<EventTarget> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  readonly [TEST_HARNESS]: Readonly<TestHarness<LitElement>>;
}

interface TestedElementEvent extends Readonly<Event> {
  readonly target: Readonly<TestedElement>;
}

export class TestHarness<T extends LitElement> {
  static eventTypes: string[] = [];

  static async fixture<TH extends TestHarness<LitElement>>(
    // Note: "LitElement" here should be the "T" from "T extends LitElement" if you can find a way to do that
    this: new (element: LitElement) => TH,
    html: LitHTMLRenderable
  ): Promise<TH> {
    const element = await fixture<LitElement>(html);
    element.connectedCallback();
    return new this(element);
  }

  /**
   * records that an event was received for use with `testHarness.lastEvent()`
   *
   * @param event
   * @deprecated add `static eventTypes = ['types', 'of', 'events'`] to the class instead
   */
  static logEvent(event: Readonly<TestedElementEvent>): void {
    const harness = event.target[TEST_HARNESS];
    harness.dispatchedEvents.push({ type: event.type, event });
  }

  ["constructor"]: typeof TestHarness;

  /**
   * the custom element under test
   */
  element: T;

  /**
   * all of the events that the element received from below or dispatched itself
   * (anything that would be caught by element.addEventListener())
   * note that the harness can only track events listed in its static eventTypes property
   */
  dispatchedEvents: { type: string; event: Event }[] = [];

  constructor(element: T) {
    this.element = element;
    this.element[TEST_HARNESS] = this;
    if (this.constructor) {
      for (const eventType of this.constructor.eventTypes) {
        this.element.addEventListener(eventType, (event: Event) => {
          this.dispatchedEvents.push({ type: event.type, event });
        });
      }
    }
    
  }

  /**
   * the element's shadowRoot
   *
   * @throws an error if the element doesn't have a shadow root
   */
  get shadowRoot(): ShadowRoot {
    const { shadowRoot } = this.element;
    if (!shadowRoot) {
      throw new Error(
        `${this.element.constructor.name} element does not have a shadow root`
      );
    }
    return shadowRoot;
  }

  /**
   * shortcut to the element's shadowRoot.querySelector()
   *
   * @param selector
   * @returns {boolean} true if at least one element matches the selector
   */
  hasElementMatchingSelector(selector: string): boolean {
    return Boolean(this.shadowRoot.querySelector(selector));
  }

  /**
   * shortcut to the shadowRoot's querySelector()
   *
   * @param {string} selector
   * @returns {Element} an DOM element
   * @throws an error when an element matching the selector is not found (to test for existence, use {@link this.hasElementMatchingSelector})
   *
   * @example harness.qs<HTMLListItem>('li.active') // returns an HTMLListItem element
   */
  // eslint-disable-next-line etc/no-misused-generics
  qs<E extends Element>(selector: string): E {
    const element: E | null = this.shadowRoot.querySelector<E>(selector);
    if (element === null) {
      throw new Error(`No element found for selector: ${selector}`);
    }

    return element;
  }

  /**
   * shortcut to element.shadowRoot.querySelectorAll()
   * wrapped in an array for convenience
   *
   *
   * @param selector
   * @returns {Array<Element>}
   *
   * @example harness.qs<HTMLListItem>('li.active') // returns an array of HTMLListItem elements
   */
  // eslint-disable-next-line etc/no-misused-generics
  qsa<E extends Element>(selector: string): E[] {
    return Array.from(this.shadowRoot.querySelectorAll<E>(selector));
  }

  /**
   *
   * @param {string} type event type
   * @returns {Event} the last event matching the type received by the element
   */
  // eslint-disable-next-line etc/no-misused-generics
  lastEvent<E extends Event>(eventType: string): E | undefined {
    if (!this.constructor.eventTypes.includes(eventType)) {
      const fix =
        this.constructor.eventTypes.length === 0
          ? `add the following line to your ${this.constructor.name} class:\n\nstatic eventTypes = ['${eventType}'];`
          : `add "${eventType}" to your ${
              this.constructor.name
            } class:\n\nstatic eventTypes = [${this.constructor.eventTypes
              .map((type) => `'${type}'`)
              .join(", ")}, '${eventType}'];`;

      throw new Error(
        `The harness is not listening for '${eventType}' events. To fix this error, ${fix}`
      );
    }

    const events: { type: string; event: Event }[] =
      this.dispatchedEvents.filter(({ type }) => type === eventType);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return events.at(-1)?.event as E | undefined;
  }

  /**
   * shortcut to the element's updateComplete property
   *
   * @see {@link LitElement.updateComplete}
   */
  get updateComplete(): Promise<boolean> {
    return this.element.updateComplete;
  }
}