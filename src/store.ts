import type { MultiTabState, TabInstance } from "./types";

export type Listener = () => void;

export interface MultiTabStore {
  getState: () => MultiTabState;
  subscribe: (listener: Listener) => () => void;
  dispatch: (action: Action) => void;
}

export type Action =
  | { type: "OPEN_TAB"; tab: TabInstance; activate: boolean }
  | { type: "CLOSE_TAB"; instanceId: string }
  | { type: "ACTIVATE_TAB"; instanceId: string }
  | { type: "CLOSE_ALL" }
  | { type: "CLOSE_OTHERS"; instanceId: string }
  | { type: "SET_DATA"; instanceId: string; data: Record<string, unknown> }
  | { type: "REMOVE_DATA"; instanceId: string }
  | { type: "RESTORE"; state: Partial<MultiTabState> };

function reducer(state: MultiTabState, action: Action): MultiTabState {
  switch (action.type) {
    case "OPEN_TAB": {
      const activate = action.activate;
      const newActiveId = activate ? action.tab.instanceId : state.activeTabId;
      const newHistory = activate
        ? [
            ...state.activeTabHistory.filter(
              (id) => id !== action.tab.instanceId
            ),
            action.tab.instanceId,
          ]
        : state.activeTabHistory;

      return {
        ...state,
        tabs: [...state.tabs, action.tab],
        activeTabId: newActiveId,
        activeTabHistory: newHistory,
      };
    }
    case "CLOSE_TAB": {
      const newTabs = state.tabs.filter(
        (t) => t.instanceId !== action.instanceId
      );
      const newHistory = state.activeTabHistory.filter(
        (id) => id !== action.instanceId
      ); // Remove from history

      let newActive = state.activeTabId;
      if (state.activeTabId === action.instanceId) {
        // Find the last valid active tab from history
        const previousValidActive =
          newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
        newActive =
          previousValidActive ||
          (newTabs.length > 0 ? newTabs[newTabs.length - 1].instanceId : null);
      }

      const { [action.instanceId]: _removed, ...restData } = state.tabData;
      return {
        tabs: newTabs,
        activeTabId: newActive,
        tabData: restData,
        activeTabHistory: newHistory,
      };
    }
    case "ACTIVATE_TAB": {
      if (!state.tabs.some((t) => t.instanceId === action.instanceId))
        return state;

      const newHistory = [
        ...state.activeTabHistory.filter((id) => id !== action.instanceId),
        action.instanceId,
      ];
      return {
        ...state,
        activeTabId: action.instanceId,
        activeTabHistory: newHistory,
      };
    }
    case "CLOSE_ALL":
      return { tabs: [], activeTabId: null, tabData: {}, activeTabHistory: [] };
    case "CLOSE_OTHERS": {
      const kept = state.tabs.filter((t) => t.instanceId === action.instanceId);
      const keptIds = new Set(kept.map((t) => t.instanceId));
      const keptData: Record<string, Record<string, unknown>> = {};
      for (const id of keptIds) {
        if (state.tabData[id]) keptData[id] = state.tabData[id];
      }
      const newHistory = state.activeTabHistory.filter(
        (id) => id === action.instanceId
      );
      return {
        tabs: kept,
        activeTabId: action.instanceId,
        tabData: keptData,
        activeTabHistory: newHistory,
      };
    }
    case "SET_DATA":
      return {
        ...state,
        tabData: {
          ...state.tabData,
          [action.instanceId]: {
            ...(state.tabData[action.instanceId] ?? {}),
            ...action.data,
          },
        },
      };
    case "REMOVE_DATA": {
      const { [action.instanceId]: _removed, ...rest } = state.tabData;
      return { ...state, tabData: rest };
    }
    case "RESTORE": {
      const restoredActive = action.state.activeTabId;
      const newHistory = restoredActive
        ? [
            ...state.activeTabHistory.filter((id) => id !== restoredActive),
            restoredActive,
          ]
        : state.activeTabHistory;
      return { ...state, ...action.state, activeTabHistory: newHistory };
    }
    default:
      return state;
  }
}

export function createMultiTabStore(
  initialState: MultiTabState
): MultiTabStore {
  let state = initialState;
  const listeners = new Set<Listener>();

  const getState = () => state;

  const dispatch = (action: Action) => {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    dispatch,
    subscribe,
  };
}
