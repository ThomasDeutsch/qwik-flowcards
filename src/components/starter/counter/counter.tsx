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

// THE EVENT OBJECT HOLDS INFORMATION ABOUT A SPECIFIC EVENT, LIKE VALUE, OR ISPENDING
export const countEvent = new Event<number>('count');

// THIS IS A COUNTER IN SCENARIO BASED PROGRAMMING:
export const scheduler = new Scheduler({
  rootFlow: function* () {
    yield request(countEvent, 100); // INITIAL EVENT VALUE
    while (true) {
      yield askFor(countEvent); // ASK THE USER TO SUBMIT A NEW COUNT VALUE
      console.log('askFor count', countEvent.value);
    }
  },
});

export function useFCSignal<T>(event: Event<T>) {
  const signal = useSignal<T | undefined>(event.value);
  useVisibleTask$(() => {
    event.registerCallback(() => {
      signal.value = event.value;
    });
  });
  return useComputed$(() => signal.value);
}

export default component$(() => {
  useStylesScoped$(styles);
  // ----- start: i would like to export this into a custom hook.
  //              see the useFCSignal hook.
  const count = useSignal(countEvent.value);
  useVisibleTask$(() => {
    console.log(
      'callback: everytime the event-value chanes, update the signal value'
    );
    countEvent.registerCallback(() => {
      console.log('updating signal value to: ', countEvent.value);
      count.value = countEvent.value;
    });
  });
  // ------ end
  // WILL THROW AN ERROR:
  //const count2 = useFCSignal(countEvent);

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
