import {
  component$,
  noSerialize,
  useComputed$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from '@builder.io/qwik';
import styles from './counter.css?inline';
import { Scheduler, request, Event, askFor } from '@flowcards/core';

export const countEvent = new Event<number>('count');

export const scheduler = new Scheduler({
  rootFlow: function* () {
    yield request(countEvent, 100);
    while (true) {
      yield askFor(countEvent);
      console.log('askFor count', countEvent.value);
    }
  },
});

// export function useFCSignal<T>(event: Event<T>) {
//   const signal = useSignal<T | undefined>(event.value);
//   useVisibleTask$(() => {
//     event.registerCallback(() => {
//       signal.value = event.value;
//     });
//   });
//   return useComputed$(() => signal.value);
// }

export default component$(() => {
  useStylesScoped$(styles);
  const count = useSignal(countEvent.value);
  useVisibleTask$(() => {
    console.log('register');
    countEvent.registerCallback(() => {
      console.log('called', countEvent.value);

      count.value = countEvent.value;
    });
  });

  return (
    <div class="counter-wrapper">
      <button onClick$={() => countEvent.set((count.value || 0) - 1)}>-</button>
      <span class={`counter-value ${count.value || 0 % 2 === 0 ? 'odd' : ''}`}>
        {count.value}
      </span>
      <button onClick$={() => countEvent.set((count.value || 0) + 1)}>+</button>
    </div>
  );
});
