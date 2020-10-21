type TNode<T> = null | { value: T; next: TNode<T> };

class MutableList<T> {
  private list: TNode<T>;
  private len: number;

  constructor() {
    this.list = null;
    this.len = 0;
  }
  prepend(value: T) {
    this.list = { value, next: this.list };
    this.len += 1;
  }

  remove(item: T) {
    if (!this.list) return;
    if (this.list.value === item) {
      this.list = this.list.next;
      this.len -= 1;
      return;
    }
    let current = this.list;
    while (current.next && current.next.value !== item) current = current.next;

    if (!current.next) return;

    current.next = current.next.next;

    this.len -= 1;
  }

  length() {
    return this.len;
  }

  iterate(callback: (item: T) => void) {
    let current = this.list;
    while (current) {
      callback(current.value);
      current = current.next;
    }
  }

  toArray(): T[] {
    const res: T[] = [];
    this.iterate(function (d) {
      res.push(d);
    });
    return res;
  }
}

type EventListener<EventConfig, Event extends keyof EventConfig> = (
  data: EventConfig[Event]
) => void;

type ListenersDict<EventConfig> = {
  [event in keyof EventConfig]: MutableList<EventListener<EventConfig, event>>;
};

const EVENT_EXCLUDED = "ee-event-excluded";
const EVENT_INCLUDED = "ee-event-included";

type TDefaultEvent = typeof EVENT_EXCLUDED | typeof EVENT_INCLUDED;

type DefaultEvents<AdditionalEvents> = {
  [defaultEvent in TDefaultEvent]: keyof AdditionalEvents | TDefaultEvent;
};

export type EventConfig<AdditionalEvents> = AdditionalEvents &
  DefaultEvents<AdditionalEvents>;

export class ABEventEmitter<
  AdditionalEvents extends Record<string, any> = Record<string, any>
> {
  static EventExcluded: typeof EVENT_EXCLUDED = EVENT_EXCLUDED;
  static EventIncluded: typeof EVENT_INCLUDED = EVENT_INCLUDED;
  private listenersDict: Partial<ListenersDict<EventConfig<AdditionalEvents>>>;
  private listenedEvents: MutableList<keyof EventConfig<AdditionalEvents>>;

  constructor() {
    this.listenersDict = {};
    this.listenedEvents = new MutableList();
  }

  public on<E extends keyof EventConfig<AdditionalEvents>>(
    event: E,
    listener: EventListener<EventConfig<AdditionalEvents>, E>
  ): () => void {
    if (this.listenersDict[event]) {
      const listeners = this.listenersDict[event] as MutableList<
        EventListener<EventConfig<AdditionalEvents>, E>
      >;
      listeners.prepend(listener);
      if (listeners.length() === 1) {
        this.listenedEvents.prepend(event);
      }
      return () => {
        this.off(event, listener);
      };
    }

    const listenersList = new MutableList<
      EventListener<EventConfig<AdditionalEvents>, E>
    >();
    listenersList.prepend(listener);
    this.listenersDict[event] = listenersList;
    this.listenedEvents.prepend(event);
    this.emit(ABEventEmitter.EventIncluded, event as any);
    return () => {
      this.off(event, listener);
    };
  }
  public off<E extends keyof EventConfig<AdditionalEvents>>(
    event: E,
    listener?: EventListener<EventConfig<AdditionalEvents>, E>
  ): ABEventEmitter<EventConfig<AdditionalEvents>> {
    if (!listener) {
      return this.offEvent(event);
    }
    const listeners = this.listenersDict[event];
    if (listeners) {
      listeners.remove(listener);

      if (listeners.length() === 0) {
        this.listenedEvents.remove(event);
        delete this.listenersDict[event];
        this.emit(ABEventEmitter.EventExcluded, event as any);
      }
      return this;
    }
    return this;
  }

  public emit<E extends keyof EventConfig<AdditionalEvents>>(
    event: E,
    data: EventConfig<AdditionalEvents>[E]
  ): ABEventEmitter<EventConfig<AdditionalEvents>> {
    const listeners = this.listenersDict[event];
    if (listeners) {
      listeners.iterate((callback) => callback(data));
    }
    return this;
  }

  public offAll(): ABEventEmitter<EventConfig<AdditionalEvents>> {
    this.listenersDict = {};
    this.listenedEvents.iterate((event) => {
      this.emit(ABEventEmitter.EventExcluded, event as any);
    });
    this.listenedEvents = new MutableList();

    return this;
  }

  private offEvent<E extends keyof EventConfig<AdditionalEvents>>(event: E) {
    if (!this.listenersDict[event]) return this;

    this.listenedEvents.remove(event);
    delete this.listenersDict[event];
    this.emit(ABEventEmitter.EventExcluded, event as any);

    return this;
  }

  public listenersNumber<E extends keyof EventConfig<AdditionalEvents>>(
    event: E
  ): number {
    const listenersList = this.listenersDict[event];
    return listenersList ? listenersList.length() : 0;
  }

  public getListenedEvents(): (keyof EventConfig<AdditionalEvents>)[] {
    return this.listenedEvents.toArray();
  }

  public getListeners<E extends keyof EventConfig<AdditionalEvents>>(
    event: E
  ): EventListener<EventConfig<AdditionalEvents>, E>[] {
    const listeners = this.listenersDict[event];
    return listeners ? listeners.toArray() : [];
  }
}
