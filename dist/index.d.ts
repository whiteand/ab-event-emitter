declare type EventListener<EventConfig, Event extends keyof EventConfig> = (data: EventConfig[Event]) => void;
export declare class EventEmitter<EventConfig extends Record<string, any> = Record<string, any>> {
    private listenersDict;
    private listenedEvents;
    constructor();
    on<E extends keyof EventConfig>(event: E, listener: EventListener<EventConfig, E>): () => void;
    off<E extends keyof EventConfig>(event: E, listener: EventListener<EventConfig, E>): EventEmitter<EventConfig>;
    emit<E extends keyof EventConfig>(event: E, data: EventConfig[E]): EventEmitter<EventConfig>;
    offAll(): EventEmitter<EventConfig>;
    listenersNumber<E extends keyof EventConfig>(event: E): number;
    getListenedEvents(): (keyof EventConfig)[];
    getListeners<E extends keyof EventConfig>(event: E): EventListener<EventConfig, E>[];
}
export {};
