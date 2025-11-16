/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/DataContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

export interface Data {
  [key: string]: any; // Her instanceId için data
}

interface DataContextType {
  data: Data;
  setData: (instanceId: string, data: any) => void;
  getData: (instanceId: string) => any;
  removeData: (instanceId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setDataState] = useState<Data>({});

  const setData = (instanceId: string, data: any) => {
    setDataState((prev) => ({
      ...prev,
      [instanceId]: {
        ...prev[instanceId],
        ...data,
      },
    }));
  };

  const getData = (instanceId: string) => {
    return data[instanceId] || {};
  };

  const removeData = (instanceId: string) => {
    setDataState((prev) => {
      const { [instanceId]: removed, ...rest } = prev;
      return rest;
    });
  };

  return (
    <DataContext.Provider value={{ data, setData, getData, removeData }}>
      {children}
    </DataContext.Provider>
  );
};

// Main Hook
export const useAllData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Set Data Hook (instanceId otomatik)
export const useSetData = () => {
  const { setData } = useAllData();
  const [searchParams] = useSearchParams();

  // Search params'dan instanceId'yi al
  const instanceId = searchParams.get("active") || "";

  return (newData: any) => {
    if (instanceId) {
      setData(instanceId, newData);
    }
  };
};

// Get Data Hook (instanceId otomatik)
export const useGetData = () => {
  const { getData } = useAllData();
  const [searchParams] = useSearchParams();

  // Search params'dan instanceId'yi al
  const instanceId = searchParams.get("active") || "";

  return instanceId ? getData(instanceId) : {};
};

export const useData = () => {
  const data = useGetData();
  const setData = useSetData();

  return [data, setData];
};
