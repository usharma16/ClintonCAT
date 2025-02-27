export class SortedArray<T> {
    private _values: T[] = [];

    constructor(...values: T[]) {
        this.value = values;
    }

    private _searchIndex(value: T): number {
        let l = 0;
        let r = this._values.length;
        while (l < r) {
            const mid = ((l + r) / 2) >> 0;
            if (value === this._values[mid]) {
                return mid;
            } else if (value < this._values[mid]) {
                r = mid;
            } else {
                l = mid + 1;
            }
        }
        return r;
    }

    get length(): number {
        return this._values.length;
    }

    get value(): T[] {
        return this._values;
    }

    set value(values: T[]) {
        this._values = values;
        this._values.sort();
    }

    add(value: T) {
        const idx = this._searchIndex(value);
        this._values.splice(idx, 0, value);
    }

    deleteAt(i: number) {
        this._values.splice(i, 1);
    }

    delete(value: T): boolean {
        const idx = this._searchIndex(value);
        if (this._values[idx] == value) {
            this.deleteAt(idx);
            return true;
        }
        return false;
    }

    clear() {
        this._values = [];
    }
}

interface Printable {
    toString(): string;
}

export type ResultCallback<T> = (result: T) => void;

export interface IListener<T> {
    value: T;
    callbacks: Map<string, ResultCallback<T>>;
    addListener(id: string, callback: ResultCallback<T>): void;
    removeListener(id: string): void;
    removeAllListeners(): void;
}

export class ValueListener<T extends Printable> implements IListener<T> {
    private _value: T;
    private readonly _callbacks: Map<string, ResultCallback<T>>;

    constructor(value: T) {
        this._value = value;
        this._callbacks = new Map();
    }

    get value(): T {
        return this._value;
    }

    set value(val: T) {
        this._value = val;
        this.makeCallbacks();
    }

    get callbacks(): Map<string, ResultCallback<T>> {
        return this._callbacks;
    }

    private makeCallbacks() {
        for (const callback of this._callbacks.values()) {
            callback(this._value);
        }
    }

    addListener(id: string, callback: ResultCallback<T>) {
        this._callbacks.set(id, callback);
    }

    removeListener(id: string) {
        this._callbacks.delete(id);
    }

    removeAllListeners() {
        this._callbacks.clear();
    }

    toString(): string {
        return this._value.toString();
    }
}

export class OrderedSetListener<T extends Printable> implements IListener<T[]> {
    private _seen: Set<T>;
    private _value: SortedArray<T>;
    private readonly _callbacks: Map<string, ResultCallback<T[]>>;

    constructor(...values: T[]) {
        this._value = new SortedArray(...values);
        this._seen = new Set(this._value.value);
        this._callbacks = new Map();
    }

    get value(): T[] {
        return this._value.value;
    }

    set value(val: T[]) {
        this._value.value = val;
        this._seen = new Set(val);
        this.makeCallbacks();
    }

    get callbacks(): Map<string, ResultCallback<T[]>> {
        return this._callbacks;
    }

    add(elem: T) {
        if (!this._seen.has(elem)) {
            this._value.add(elem);
            this._seen.add(elem);
            this.makeCallbacks();
        }
    }

    deleteAt(index: number) {
        this._seen.delete(this.value[index]);
        this._value.deleteAt(index);
        this.makeCallbacks();
    }

    delete(elem: T) {
        this._seen.delete(elem);
        if (this._value.delete(elem)) {
            this.makeCallbacks();
        }
    }

    private makeCallbacks() {
        for (const callback of this._callbacks.values()) {
            callback(this.value);
        }
    }

    addListener(id: string, callback: ResultCallback<T[]>) {
        this._callbacks.set(id, callback);
    }

    removeListener(id: string) {
        this._callbacks.delete(id);
    }

    removeAllListeners() {
        this._callbacks.clear();
    }

    toString(): string {
        return this._value.value.toString();
    }
}
