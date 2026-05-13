import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { create } from "zustand";

export type LabOrder = {
  id: string;
  status: "queued" | "reviewing" | "approved";
  amount: number;
};

type LabState = {
  activeOrder: LabOrder;
  renderPressure: number;
  incidentCount: number;
  auditTrail: string[];
};

const initialState: LabState = {
  activeOrder: {
    id: "ord-1001",
    status: "queued",
    amount: 128.4,
  },
  renderPressure: 0,
  incidentCount: 0,
  auditTrail: ["lab:init"],
};

const labSlice = createSlice({
  name: "lab",
  initialState,
  reducers: {
    reviewOrder(state, action: PayloadAction<string>) {
      state.activeOrder.status = "reviewing";
      state.auditTrail.push(`order:review:${action.payload}`);
    },
    approveOrder(state) {
      state.activeOrder.status = "approved";
      state.auditTrail.push("order:approve");
    },
    increaseRenderPressure(state) {
      state.renderPressure += 1;
      state.auditTrail.push(`render-pressure:${state.renderPressure}`);
    },
    markIncident(state, action: PayloadAction<string>) {
      state.incidentCount += 1;
      state.auditTrail.push(`incident:${action.payload}`);
    },
    resetLabState() {
      return initialState;
    },
  },
});

export const labActions = labSlice.actions;

export const labStore = configureStore({
  reducer: {
    lab: labSlice.reducer,
  },
});

export type LabRootState = ReturnType<typeof labStore.getState>;
export type LabDispatch = typeof labStore.dispatch;

export type ZustandLabState = {
  storeId: string;
  inventoryCount: number;
  shipmentStatus: "idle" | "packed" | "shipped";
  eventCount: number;
  setPacked: () => void;
  shipInventory: (count: number) => void;
  reset: () => void;
};

export const useZustandLabStore = create<ZustandLabState>(set => ({
  storeId: "zustand-lab-store",
  inventoryCount: 12,
  shipmentStatus: "idle",
  eventCount: 0,
  setPacked: () =>
    set(state => ({
      shipmentStatus: "packed",
      eventCount: state.eventCount + 1,
    })),
  shipInventory: count =>
    set(state => ({
      inventoryCount: Math.max(0, state.inventoryCount - count),
      shipmentStatus: "shipped",
      eventCount: state.eventCount + 1,
    })),
  reset: () =>
    set({
      storeId: "zustand-lab-store",
      inventoryCount: 12,
      shipmentStatus: "idle",
      eventCount: 0,
    }),
}));
