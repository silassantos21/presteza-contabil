<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-3xl">
    <h1 class="text-2xl font-bold">Ajuda</h1>

    <div class="space-y-3">
      <div
        v-for="section in sections"
        :key="section.id"
        class="rounded-lg border border-border bg-card overflow-hidden"
      >
        <button
          class="w-full flex items-center gap-3 px-5 py-4 text-left"
          @click="expanded = expanded === section.id ? null : section.id"
        >
          <div :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', section.bg]">
            <component :is="section.icon" :class="['w-4 h-4', section.iconColor]" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm">{{ section.title }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ section.subtitle }}</p>
          </div>
          <ChevronDown
            class="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
            :class="expanded === section.id ? 'rotate-180' : ''"
          />
        </button>

        <div v-if="expanded === section.id" class="px-5 pb-5 border-t border-border pt-4 space-y-4">
          <p class="text-sm text-muted-foreground leading-relaxed">{{ section.description }}</p>
          <ul class="space-y-2">
            <li
              v-for="item in section.items"
              :key="item.title"
              class="flex items-start gap-2 text-sm"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <div>
                <span class="font-medium">{{ item.title }}:</span>
                <span class="text-muted-foreground ml-1">{{ item.desc }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FolderKanban,
  FileText,
  BarChart2,
  Settings,
  ChevronDown,
} from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const expanded = ref<string | null>(null)

const sections = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Visão geral do escritório',
    icon: LayoutDashboard,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'O Dashboard é a tela inicial do painel administrativo. Exibe um resumo em tempo real das principais métricas do escritório.',
    items: [
      { title: 'Clientes ativos', desc: 'Total de clientes com status "Ativo" no sistema.' },
      { title: 'Processos em andamento', desc: 'Processos com status "Em andamento".' },
      { title: 'Pendentes', desc: 'Processos aguardando início.' },
      { title: 'Concluídos este mês', desc: 'Processos finalizados no período.' },
      { title: 'Processos recentes', desc: 'Lista com os últimos 5 processos cadastrados.' },
    ],
  },
  {
    id: 'chat',
    title: 'Chat',
    subtitle: 'Comunicação com clientes em tempo real',
    icon: MessageSquare,
    bg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    description: 'O Chat permite trocar mensagens em tempo real com os clientes. Cada cliente possui uma conversa dedicada.',
    items: [
      { title: 'Lista de conversas', desc: 'Coluna à esquerda com todos os clientes. Clique para abrir a conversa.' },
      { title: 'Enviar mensagem', desc: 'Digite no campo inferior e pressione Enter ou clique no botão enviar.' },
      { title: 'Nova linha', desc: 'Use Shift+Enter para inserir uma quebra de linha sem enviar.' },
      { title: 'Histórico', desc: 'Clique no ícone de download na topbar para exportar o histórico em .txt.' },
      { title: 'Indicador online', desc: 'O ponto verde indica conexão WebSocket ativa com o servidor.' },
    ],
  },
  {
    id: 'clientes',
    title: 'Clientes',
    subtitle: 'Cadastro e gestão de clientes',
    icon: Users,
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    description: 'Gerencie todos os clientes do escritório: criação, edição, status e acesso ao portal.',
    items: [
      { title: 'Novo cliente', desc: 'Botão no canto superior direito. Informe razão social, responsável, CPF ou CNPJ e e-mail.' },
      { title: 'Editar', desc: 'Ícone de lápis na linha do cliente para atualizar os dados.' },
      { title: 'Excluir', desc: 'Ícone de lixeira. Solicita confirmação antes de remover.' },
      { title: 'Acesso ao portal', desc: 'Ícone de escudo. Cria login e senha para o cliente acessar o portal.' },
      { title: 'Extrato PDF', desc: 'Ícone de documento. Gera PDF com documentos e processos do cliente.' },
      { title: 'Abrir chat', desc: 'Ícone de balão. Atalho para abrir a conversa do cliente no Chat.' },
    ],
  },
  {
    id: 'processos',
    title: 'Processos',
    subtitle: 'Kanban de processos contábeis',
    icon: FolderKanban,
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    description: 'Gerencie processos contábeis em um quadro kanban com quatro colunas de status. Suporta arrastar e soltar para mover entre colunas.',
    items: [
      { title: 'Novo processo', desc: 'Botão superior direito. Informe título, tipo, cliente e data de vencimento.' },
      { title: 'Mover status', desc: 'Arraste o card para outra coluna (Pendente → Em andamento → Concluído → Cancelado).' },
      { title: 'Filtros', desc: 'Filtre por título, cliente ou tipo de processo usando os campos acima do kanban.' },
      { title: 'Vencimento', desc: 'Data em vermelho indica processo vencido.' },
      { title: 'Editar / Excluir', desc: 'Ícones no canto do card para editar dados ou remover o processo.' },
    ],
  },
  {
    id: 'documentos',
    title: 'Documentos',
    subtitle: 'Envio e download de arquivos',
    icon: FileText,
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    description: 'Armazene e gerencie documentos dos clientes. Os arquivos ficam no Cloudflare R2 com URLs assinadas de acesso temporário.',
    items: [
      { title: 'Enviar documento', desc: 'Botão superior direito. Selecione o cliente, o tipo e arraste o arquivo ou clique para selecionar. Máximo 20 MB.' },
      { title: 'Filtrar por cliente', desc: 'Selecione um cliente no filtro para ver apenas os documentos dele.' },
      { title: 'Buscar por nome', desc: 'Campo de busca filtra pelo nome do arquivo em tempo real.' },
      { title: 'Download', desc: 'Ícone de download gera uma URL assinada (válida por 1h) e inicia o download.' },
      { title: 'Excluir', desc: 'Remove o arquivo do banco e do armazenamento em nuvem.' },
      { title: 'Tipos', desc: 'NFS-e, NF-e, Boleto, Contrato, Guia, Outros.' },
    ],
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    subtitle: 'Geração de PDFs',
    icon: BarChart2,
    bg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    description: 'Gere relatórios em PDF diretamente pelo painel. Os PDFs são gerados no servidor e baixados automaticamente.',
    items: [
      { title: 'Relatório de processos', desc: 'PDF com todos os processos agrupados por status.' },
      { title: 'Extrato do cliente', desc: 'PDF individual com todos os documentos e processos de um cliente específico.' },
      { title: 'Extrato rápido', desc: 'Na tela de Clientes, clique no ícone de documento em qualquer linha para gerar o extrato daquele cliente diretamente.' },
    ],
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    subtitle: 'Perfil e preferências da conta',
    icon: Settings,
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    iconColor: 'text-slate-600 dark:text-slate-400',
    description: 'Gerencie seu perfil de administrador: nome, e-mail e senha. Em breve disponível.',
    items: [
      { title: 'Nome e e-mail', desc: 'Atualize as informações de exibição da sua conta.' },
      { title: 'Trocar senha', desc: 'Defina uma nova senha de acesso ao painel.' },
    ],
  },
]
</script>
