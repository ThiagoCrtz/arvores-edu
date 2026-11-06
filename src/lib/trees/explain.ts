import type { TreeEvent } from './types';

const ROT: Record<string, (n: number, bf: number, p: number) => string> = {
  LL: (n, bf) => `Desbalanceamento do tipo LL no nó ${n} (fator ${bf > 0 ? '+' : ''}${bf}). Aplicando rotação simples à direita para restaurar o equilíbrio.`,
  RR: (n, bf) => `Desbalanceamento do tipo RR no nó ${n} (fator ${bf}). Aplicando rotação simples à esquerda para restaurar o equilíbrio.`,
  LR: (n, bf, p) => `Desbalanceamento do tipo LR no nó ${n} (fator +${bf}). Rotação dupla: primeiro à esquerda em torno do filho, subindo ${p}, depois à direita em ${n}.`,
  RL: (n, bf, p) => `Desbalanceamento do tipo RL no nó ${n} (fator ${bf}). Rotação dupla: primeiro à direita em torno do filho, subindo ${p}, depois à esquerda em ${n}.`,
};

export function explainEvent(e: TreeEvent): string {
  switch (e.kind) {
    case 'compare':
      return e.direction === 'left'
        ? `${e.target} < ${e.node}: segue para a subárvore esquerda.`
        : `${e.target} > ${e.node}: segue para a subárvore direita.`;
    case 'inserted': return `Posição livre encontrada: ${e.value} inserido como nova folha.`;
    case 'duplicate': return `${e.value} já existe na árvore. Duplicatas não são permitidas, nada foi alterado.`;
    case 'not-found': return `${e.value} não foi encontrado na árvore.`;
    case 'removed': return `Nó ${e.value} removido.`;
    case 'successor': return `${e.removed} tem dois filhos: seu valor é substituído pelo sucessor em ordem (${e.successor}), que é então removido da subárvore direita.`;
    case 'rotation': return ROT[e.type](e.node, e.balance, e.pivot);
  }
}
