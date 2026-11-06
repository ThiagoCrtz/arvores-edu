export type TreeType = 'BST' | 'AVL';
export type RotationType = 'LL' | 'RR' | 'LR' | 'RL';

export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  /** Altura em nós: folha = 1, árvore vazia = 0. */
  height: number;
}

/** Eventos emitidos pelas operações, usados pela UI para animar e explicar. */
export type TreeEvent =
  | { kind: 'compare'; node: number; target: number; direction: 'left' | 'right' }
  | { kind: 'inserted'; value: number }
  | { kind: 'duplicate'; value: number }
  | { kind: 'not-found'; value: number }
  | { kind: 'removed'; value: number }
  | { kind: 'successor'; removed: number; successor: number }
  | { kind: 'rotation'; type: RotationType; node: number; balance: number; pivot: number };

export interface OperationResult {
  root: TreeNode | null;
  events: TreeEvent[];
  changed: boolean;
}

export type Highlight = 'visit' | 'new' | 'rotate' | 'done';

/** Substitui o que o canvas mostra (usado pelos painéis de passo a passo e percursos). */
export interface ViewOverride {
  root?: TreeNode | null;
  hl: Record<number, Highlight>;
}
