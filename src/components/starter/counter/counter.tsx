import {
  component$,
  noSerialize,
  useComputed$,
  useSignal,
  $,
  useStylesScoped$,
  useVisibleTask$,
  useTask$,
} from '@builder.io/qwik';
import styles from './counter.css?inline';
import {
  Scheduler,
  request,
  Event,
  askFor,
  EventUpdateInfo,
} from '@flowcards/core';

// THE EVENT OBJECT HOLDS INFORMATION ABOUT A SPECIFIC EVENT, LIKE VALUE, OR ISPENDING
export const countEvent = new Event<number>('count');
const singalInfo = {
  registerCallback: $(countEvent.registerCallback.bind(countEvent)),
  set: $(countEvent.set.bind(countEvent)),
  validate: $(countEvent.validate.bind(countEvent)),
  isValid: $(countEvent.isValid.bind(countEvent)),
};

// THIS IS A COUNTER IN SCENARIO BASED PROGRAMMING:
export const scheduler = new Scheduler({
  rootFlow: function* () {
    yield request(countEvent, 100); // INITIAL EVENT VALUE
    while (true) {
      yield askFor(countEvent, (next) => next < 106); // ASK THE USER TO SUBMIT A NEW COUNT VALUE
      console.log('askFor count', countEvent.value);
    }
  },
});

export function useFCSignal<T>(signalInfo: any) {
  const signal = useSignal<T | undefined>(signalInfo.value);
  useVisibleTask$(() => {
    console.log('register!');
    signalInfo.registerCallback((info: EventUpdateInfo<T>) => {
      signal.value = info.value;
    }, true);
  });
  return useComputed$(() => {
    return signal.value;
  });
}

export default component$(() => {
  useStylesScoped$(styles);
  const count = useFCSignal<number>(singalInfo);
  const isValid = useComputed$(() =>
    singalInfo.isValid((count.value || 0) + 1)
  );

  return (
    <div class="counter-wrapper">
      <button onClick$={() => singalInfo.set((count.value || 0) - 1)}>-</button>
      <span class={`counter-value ${count.value || 0 % 2 === 0 ? 'odd' : ''}`}>
        {count.value}
      </span>

      <button onClick$={() => singalInfo.set((count.value || 0) + 1)}>+</button>
      {isValid.value ? 'valid' : 'invalid'}
    </div>
  );
});
