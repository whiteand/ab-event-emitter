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

export class EventEmitter<
  EventConfig extends Record<string, any> = Record<string, any>
> {
  private listenersDict: Partial<ListenersDict<EventConfig>>;
  private listenedEvents: MutableList<keyof EventConfig>;

  constructor() {
    this.listenersDict = {};
    this.listenedEvents = new MutableList();
  }

  public on<E extends keyof EventConfig>(
    event: E,
    listener: EventListener<EventConfig, E>
  ): () => void {
    if (this.listenersDict[event]) {
      this.listenersDict[event].prepend(listener);
      if (this.listenersDict[event].length() === 1) {
        this.listenedEvents.prepend(event);
      }
      return () => {
        this.off(event, listener);
      };
    }

    const listenersList = new MutableList<EventListener<EventConfig, E>>();
    listenersList.prepend(listener);
    this.listenersDict[event] = listenersList;
    this.listenedEvents.prepend(event);
    return () => {
      this.off(event, listener);
    };
  }
  public off<E extends keyof EventConfig>(
    event: E,
    listener: EventListener<EventConfig, E>
  ): EventEmitter<EventConfig> {
    const listeners = this.listenersDict[event];
    if (listeners) {
      listeners.remove(listener);

      if (listeners.length() === 0) {
        this.listenedEvents.remove(event);
        delete this.listenersDict[event];
      }
      return this;
    }
  }

  public emit<E extends keyof EventConfig>(
    event: E,
    data: EventConfig[E]
  ): EventEmitter<EventConfig> {
    const listeners = this.listenersDict[event];
    if (listeners) {
      listeners.iterate((callback) => callback(data));
    }
    return this;
  }

  public offAll(): EventEmitter<EventConfig> {
    this.listenersDict = {};
    this.listenedEvents = new MutableList();
    return this;
  }

  public listenersNumber<E extends keyof EventConfig>(event: E): number {
    const listenersList = this.listenersDict[event];
    return listenersList ? listenersList.length() : 0;
  }

  public getListenedEvents(): (keyof EventConfig)[] {
    return this.listenedEvents.toArray();
  }

  public getListeners<E extends keyof EventConfig>(
    event: E
  ): EventListener<EventConfig, E>[] {
    const listeners = this.listenersDict[event];
    return listeners ? listeners.toArray() : [];
  }
}
