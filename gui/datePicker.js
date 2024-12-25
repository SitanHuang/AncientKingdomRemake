/* datePicker.js */
(function (global, $) {
  /**
   * CanonicalDatePicker class
   *
   * - Manually call CanonicalDatePicker.init(inputs) to attach blur handlers
   *   that parse user input and produce a canonical date.
   * - On blur:
   *     1) Parse "Month/Day/Year" (Year can be negative).
   *     2) Use native JS rollover for out-of-range days/months.
   *     3) If parsing fails, default to "1/1/1970".
   *     4) Set the input's .value to a canonical string "M/D/YYYY" or "M/D/-YYYY".
   *     5) Set inputEl._valueAsNumber to the date's Unix timestamp (ms).
   *     6) Fire `change` event only if the canonical string changed from last time.
   * - Destroy with CanonicalDatePicker.destroy(inputs).
   * - Test suite: CanonicalDatePicker.runTests().
   */
  class CanonicalDatePicker {
    constructor() {
      // A registry to track each input -> handler (so we can remove cleanly)
      this._registry = new WeakMap();
    }

    /**
     * init(inputs):
     *   Attach the blur handler to each <input type="canonical-date"> in `inputs`.
     *   `inputs` can be:
     *     - a single <input>
     *     - a parent HTMLElement (we'll find all canonical-date inputs inside)
     *     - an array/NodeList of either <input> or container elements
     */
    init(inputs) {
      const actualInputs = this._resolveCanonicalDateInputs(inputs);

      for (const inputEl of actualInputs) {
        // Skip if already initialized
        if (this._registry.has(inputEl)) continue;

        inputEl._CanonicalDatePicker = this;

        // Prepare the blur handler
        const blurHandler = () => this._onBlur(inputEl);

        // Attach event (use jQuery if present, else vanilla)
        if ($ && typeof $.fn === 'object') {
          $(inputEl).on('blur', blurHandler);
        } else {
          inputEl.addEventListener('blur', blurHandler);
        }

        // Mark as initialized
        this._registry.set(inputEl, blurHandler);

        // Immediately parse & set canonical for whatever is currently in .value
        this._onBlur(inputEl);
      }
    }

    /**
     * destroy(inputs):
     *   Unbind the blur handlers from the specified inputs (or from those inside).
     */
    destroy(inputs) {
      const actualInputs = this._resolveCanonicalDateInputs(inputs);

      for (const inputEl of actualInputs) {
        const blurHandler = this._registry.get(inputEl);
        if (blurHandler) {
          // Remove event
          if ($ && typeof $.fn === 'object') {
            $(inputEl).off('blur', blurHandler);
          } else {
            inputEl.removeEventListener('blur', blurHandler);
          }
          // Remove from registry
          this._registry.delete(inputEl);
        }
      }
    }

    /**
     * runTests():
     *   Prints a variety of test inputs and the resulting canonical parse
     *   in the developer console.
     */
    runTests() {
      // Test inputs, each with a minimal "expected" canonical result
      // (You may refine expected results to suit your BCE logic & rollover outcomes.)
      const tests = [
        { input: "1/1/1", expected: "1/1/1", note: "Jan 1, 1 AD" },
        { input: "1/35/2024", expected: "2/4/2024", note: "rollover from Jan 35 => Feb 4, 2024" },
        { input: "2/29/2023", expected: "3/1/2023", note: "not leap => Mar 1, 2023" },
        { input: "12/31/-1", expected: "12/31/-1", note: "1 BCE" },
        { input: "1/3/-200", expected: "1/3/-200", note: "200 BCE" },
        { input: "hello world", expected: "1/1/1970", note: "fallback to 1970" },
        { input: "-1200", expected: "1/1/-1200", note: "1200 BCE" },
      ];

      let passed = 0;
      const failedTests = [];

      // We'll assume _computeCanonicalDate() uses _tryParseUserString internally
      // and returns a .formatted string, e.g. "M/D/YYYY" or "M/D/-YYYY".
      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        const result = this._computeCanonicalDate(t.input);
        // e.g. { formatted, timestamp, finalYear, finalMonth, finalDay }

        const actual = result.formatted;
        if (actual === t.expected) {
          passed++;
        } else {
          failedTests.push({
            index: i,
            input: t.input,
            expected: t.expected,
            got: actual,
            note: t.note
          });
        }
      }

      const total = tests.length;
      const passRate = ((passed / total) * 100).toFixed(2);

      console.log(`\n========== TEST RESULTS ==========`);
      console.log(`Total tests: ${total}`);
      console.log(`Passed:      ${passed}`);
      console.log(`Failed:      ${failedTests.length}`);
      console.log(`Pass rate:   ${passRate}%\n`);

      if (failedTests.length > 0) {
        console.log("----- FAILED TESTS -----");
        for (const f of failedTests) {
          console.log(
            `Test #${f.index} (Input="${f.input}"):\n` +
            `  Expected: "${f.expected}"\n` +
            `       Got: "${f.got}"\n` +
            (f.note ? `  Note: ${f.note}` : '') + "\n"
          );
        }
      }
      console.log("==================================\n");
    }

    /**
     * ============== Private-ish Methods ==============
     */

    /**
     * When user leaves (blur) the input, parse, roll, set canonical, set _valueAsNumber, trigger change if needed.
     */
    _onBlur(inputEl) {
      const lastVal = inputEl.getAttribute('data-last-canonical-value') || '';
      const rawVal = inputEl.value.trim();
      const { formatted, timestamp } = this._computeCanonicalDate(rawVal);

      // Overwrite the input's display value
      inputEl.value = formatted;
      // Set the numeric timestamp
      inputEl._valueAsNumber = timestamp;

      if (formatted !== lastVal) {
        inputEl.setAttribute('data-last-canonical-value', formatted);
        // Fire real change event
        this._fireNativeChange(inputEl);
      }
    }

    /**
     * _computeCanonicalDate(userString):
     *   1) Try to parse as M/D/YYYY or M/D/-YYYY (delims / . -).
     *   2) If invalid, default to { year:1970, month:1, day:1 }.
     *   3) Use Date(UTC) to let JS handle rollovers (like 35 Jan => 4 Feb).
     *   4) Return { formatted, timestamp, finalYear, finalMonth, finalDay }
     *      - formatted is "M/D/YYYY" or M/D/-YYYY
     *      - timestamp is getTime()
     *      - finalYear/finalMonth/finalDay are the actual rolled values
     */
    _computeCanonicalDate(userString) {
      let parsed = this._tryParseUserString(userString);
      if (!parsed) {
        parsed = { year: 1970, month: 1, day: 1 };
      }

      // Build a date in UTC
      const date = new Date(0);
      // year can be negative => BCE
      date.setUTCFullYear(parsed.year);
      // month is zero-based in JS, day is date
      date.setUTCMonth(parsed.month - 1, parsed.day);

      // Extract the final "rolled" fields
      const finalYear = date.getUTCFullYear();
      const finalMonth = date.getUTCMonth() + 1;
      const finalDay = date.getUTCDate();

      // Format it with negative year if BCE
      const formatted = this._formatCanonical(finalMonth, finalDay, finalYear);

      return {
        formatted,
        timestamp: date.getTime(),
        finalYear,
        finalMonth,
        finalDay
      };
    }

    /**
     * _tryParseUserString(str):
     *   Return {year, month, day} or null if unrecognized.
     *   Accepts "M/D/YYYY", "M/D/-YYYY", or variations with . or - as delimiters.
     */
    _tryParseUserString(str) {
      if (!str) return null;

      // If only a number is provided, we assume it to be year
      if (Number.isInteger(Number(str))) {
        return { year: Number(str), month: 1, day: 1 };
      }

      // First: Attempt the pattern for M or MM + delim + D or DD + delim + Y or -Y
      // e.g. "1/3/-200", "01-03--200", "1.3.-200", etc.
      // Interpreted as M, D, Y in that order.
      const pattern = /^\s*(\-?\d{1,4})[\s\/.\-]+?(\-?\d{1,4})[\s\/.\-]+?(\-?\d{1,4})\s*$/;
      const match = str.match(pattern);
      if (match) {
        // match[1] => month, match[2] => day, match[3] => year
        const month = parseInt(match[1], 10);
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        // We let the actual Date handle rollover/out-of-range,
        // but at least we have a numeric M/D/Y.
        return { year, month, day };
      }

      // If regex fails, fallback to JS Date parsing
      const fallbackDate = new Date(str);
      if (!isNaN(fallbackDate.getTime())) {
        // It's parseable by JavaScript
        return {
          year: fallbackDate.getUTCFullYear(),
          month: fallbackDate.getUTCMonth() + 1, // zero-based
          day: fallbackDate.getUTCDate()
        };
      }

      // If JS parsing also fails, return null
      return null;
    }

    /**
     * Convert numeric month/day/year (possibly negative year)
     * into a string "M/D/YYYY" or "M/D/-YYYY".
     */
    _formatCanonical(m, d, y) {
      return `${m}/${d}/${y}`;
    }

    /**
     * Fire a native 'change' event.
     */
    _fireNativeChange(el) {
      // Modern browsers
      if (typeof Event === 'function') {
        const evt = new Event('change', { bubbles: true });
        el.dispatchEvent(evt);
      } else {
        // Older fallback
        const evtIE = document.createEvent('Event');
        evtIE.initEvent('change', true, true);
        el.dispatchEvent(evtIE);
      }
    }

    /**
     * _resolveCanonicalDateInputs(inputs):
     *   - If an <input type="canonical-date">, return [it].
     *   - If an element container, find inside it.
     *   - If an array/NodeList, flatten them.
     */
    _resolveCanonicalDateInputs(inputs) {
      // Single Element but not <input>? find all inside it.
      if (inputs instanceof Element && inputs.tagName.toLowerCase() !== 'input') {
        return Array.from(inputs.querySelectorAll('input[type="canonical-date"]'));
      }
      // Single <input> directly
      if (inputs instanceof Element && inputs.tagName.toLowerCase() === 'input') {
        return [inputs];
      }
      // If array-like
      if (inputs && typeof inputs.length === 'number') {
        const result = [];
        for (const item of inputs) {
          if (item instanceof Element) {
            if (item.tagName.toLowerCase() === 'input') {
              result.push(item);
            } else {
              result.push(...item.querySelectorAll('input[type="canonical-date"]'));
            }
          }
        }
        return result;
      }
      // else nothing
      return [];
    }

    // Public helper to set a new value programmatically
    updateValue(inputEl, newValue) {
      inputEl.value = newValue;

      this._onBlur(inputEl);
    }
  }

  // Expose exactly one global object.
  global.CanonicalDatePicker = CanonicalDatePicker;

})(window, window.jQuery);
