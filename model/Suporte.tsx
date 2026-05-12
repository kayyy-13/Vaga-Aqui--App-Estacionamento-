export interface Suporte {
  id?: string;
  usuarioId: string;
  tipo: 'denúncia' | 'problema' | 'outros';
  descricao: string;
  data: Date;
  status: 'aberto' | 'em análise' | 'resolvido' | 'fechado';
  usuarioNome: string;
}
