export type MenuItemProps = {
  id: number;
  name: string;
  query: string;
};

export type TabItemProps = {
  instanceId: string;
};

export const menuItems = [
  {
    id: 1,
    name: "A tab",
    query: "a-tab",
  },
  {
    id: 2,
    name: "B tab",
    query: "b-tab",
  },
  {
    id: 3,
    name: "C tab",
    query: "c-tab",
  },
];
