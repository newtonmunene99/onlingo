import { createStore } from '@stencil/store';

export type Store = {};

export const { state, onChange } = createStore<Store>({});
