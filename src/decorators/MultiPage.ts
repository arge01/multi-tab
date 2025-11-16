export interface CollectMultiPageProps {
  name: string;
  label: string;
  menuId: number;
  page: React.ReactNode;
}

const CollectMultiPageList: CollectMultiPageProps[] = [];

export function CollectMultiPage(metadata: CollectMultiPageProps): () => void {
  return () => {
    CollectMultiPageList.push(metadata as CollectMultiPageProps);
  };
}

export function CollectMultiPageRegistry() {
  return CollectMultiPageList;
}
