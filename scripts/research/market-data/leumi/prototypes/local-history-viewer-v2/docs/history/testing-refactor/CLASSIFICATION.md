# Test Classification Rules

Use the cheapest layer that can prove the behavior correctly.

| Behavior | Default layer | Why |
|---|---|---|
| pure calculation / validation | Unit | deterministic, no browser required |
| chunk planning | Unit | pure array logic |
| config validation | Unit | pure input/output |
| PaperId validation/canonicalization | Unit | pure data logic |
| response-shape validation | Unit where separable | deterministic contract logic |
| IndexedDB schema/transactions | Playwright | browser storage semantics matter |
| BroadcastChannel | Playwright | browser API semantics matter |
| DOM/viewer interactions | Playwright | user-visible browser behavior |
| mocked fetch wiring through browser adapter | Playwright selectively | integration boundary |
| full recorder→DB→viewer | Playwright checkpoint | broad E2E |
| actual Leumi response/session behavior | Live verification | provider-dependent |

## Anti-patterns

Do not use Playwright merely because production code currently lives under `window.*`.

If the behavior itself is deterministic and browser-independent, extract a small pure module rather than paying browser startup cost forever.

Do not replace browser integration tests with unit mocks for behavior that depends on actual IndexedDB/DOM/BroadcastChannel semantics.

## Frequency target

~~~text
ordinary relevant change
→ fast unit tests

planned browser integration checkpoint
→ full Playwright suite

provider-dependent milestone
→ live verification
~~~

Durable checkpoint details now live in:

~~~text
../../../tests/TESTING_POLICY.md
~~~
