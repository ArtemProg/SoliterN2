// @ts-check

export class Subject {
    
    #observers;

    constructor() {
        this.#observers = [];
    }

    addObserver(observer) {
        const isExist = this.#observers.includes(observer);
        if (isExist) {
            return;
        }
        this.#observers.push(observer);
    }

    removeObserver(observer) {
        const observerIndex = this.#observers.indexOf(observer);
        if (observerIndex === -1) {
            return;
        }
        this.#observers.splice(observerIndex, 1);
    }

    notify(event, data) {
        for (const observer of this.#observers) {
            observer.onEvent(event, data);
        }
    }
}

export class Observer {
    onEvent(event, data) {
        
    }
}

export const SubjectMixin = Base => class extends Base {
    
    #observers;

    constructor(...args) {
        super(...args);
        this.#observers = [];
    }

    addObserver(observer) {
        const isExist = this.#observers.includes(observer);
        if (isExist) {
            return;
        }
        this.#observers.push(observer);
    }

    removeObserver(observer) {
        const observerIndex = this.#observers.indexOf(observer);
        if (observerIndex === -1) {
            return;
        }
        this.#observers.splice(observerIndex, 1);
    }

    notify(event, data) {
        for (const observer of this.#observers) {
            observer.onEvent(event, data);
        }
    }
};