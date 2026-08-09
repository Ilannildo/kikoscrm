import { randomUUID } from 'node:crypto';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const PASSWORD = '12345678';

/**
 * IMPORTANTE:
 *
 * Esta função precisa utilizar exatamente o mesmo algoritmo/formato
 * configurado no Better Auth.
 *
 * Se você já possui uma função de hash de senha no projeto,
 * importe-a aqui em vez de criar outra implementação.
 */
async function hashPassword(password: string) {

  return await bcrypt.hash(password, 10)
}

/**
 * Cria um usuário e seu Account de credencial do Better Auth.
 */
async function createUserWithAccount(params: {
  name: string;
  email: string;
  role: 'admin' | 'seller';
  picture?: string;
}) {
  const userId = randomUUID();
  const accountId = randomUUID();

  const passwordHash = await hashPassword(PASSWORD);

  const user = await prisma.user.create({
    data: {
      id: userId,
      name: params.name,
      email: params.email,

      /*
       * A senha utilizada pelo Better Auth fica no Account.
       */
      password: null,

      role: params.role,

      emailVerified: true,
      emailVerifiedAt: new Date(),

      picture: params.picture,
      image: params.picture,

      accounts: {
        create: {
          id: accountId,

          /*
           * Better Auth email/password
           */
          accountId: userId,
          providerId: 'credential',

          password: passwordHash,
        },
      },
    },
    include: {
      accounts: true,
    },
  });

  return user;
}

async function main() {
  console.log('🌱 Iniciando seed do CRM Kikos Fitness...');

  /*
   * ============================================================
   * LIMPEZA
   * ============================================================
   */

  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  /*
   * ============================================================
   * USERS + BETTER AUTH ACCOUNTS
   * ============================================================
   */

  console.log('👤 Criando usuários...');

  const admin = await createUserWithAccount({
    name: 'Administrador Kikos',
    email: 'admin@kikosfitness.com.br',
    role: 'admin',
    picture: 'https://i.pravatar.cc/150?img=12',
  });

  const carlos = await createUserWithAccount({
    name: 'Carlos Eduardo',
    email: 'carlos@kikosfitness.com.br',
    role: 'seller',
    picture: 'https://i.pravatar.cc/150?img=11',
  });

  const mariana = await createUserWithAccount({
    name: 'Mariana Souza',
    email: 'mariana@kikosfitness.com.br',
    role: 'seller',
    picture: 'https://i.pravatar.cc/150?img=32',
  });

  const rafael = await createUserWithAccount({
    name: 'Rafael Almeida',
    email: 'rafael@kikosfitness.com.br',
    role: 'seller',
    picture: 'https://i.pravatar.cc/150?img=13',
  });

  const juliana = await createUserWithAccount({
    name: 'Juliana Martins',
    email: 'juliana@kikosfitness.com.br',
    role: 'seller',
    picture: 'https://i.pravatar.cc/150?img=44',
  });

  console.log('   ✓ Administrador Kikos');
  console.log('   ✓ Carlos Eduardo');
  console.log('   ✓ Mariana Souza');
  console.log('   ✓ Rafael Almeida');
  console.log('   ✓ Juliana Martins');

  /*
   * ============================================================
   * LEADS
   * ============================================================
   */

  const leadData = [
    {
      name: 'Academia Corpo & Movimento',
      email: 'contato@corpoemovimento.com.br',
      phone: '(11) 98821-4532',
      company: 'Academia Corpo & Movimento',
      source: 'Site',
      status: 'qualified' as const,
      sellerId: carlos.id,
      notes:
        'Academia com aproximadamente 800 alunos. Interesse em renovar o parque de musculação e cardio.',
      createdAt: new Date('2026-05-12'),
    },

    {
      name: 'Felipe Rodrigues',
      email: 'felipe.rodrigues@gmail.com',
      phone: '(11) 99721-3321',
      company: 'Studio Fit Premium',
      source: 'Instagram',
      status: 'contacted' as const,
      sellerId: mariana.id,
      notes:
        'Proprietário de studio boutique. Busca equipamentos compactos para expansão.',
      createdAt: new Date('2026-05-18'),
    },

    {
      name: 'Patrícia Oliveira',
      email: 'patricia@smartgym.com.br',
      phone: '(21) 99231-4421',
      company: 'Smart Gym',
      source: 'Indicação',
      status: 'converted' as const,
      sellerId: rafael.id,
      notes:
        'Rede de academias com 3 unidades. Primeiro projeto focado na unidade de Botafogo.',
      createdAt: new Date('2026-04-08'),
    },

    {
      name: 'Marcelo Fernandes',
      email: 'marcelo@evolucaofitness.com.br',
      phone: '(31) 99832-2198',
      company: 'Evolução Fitness',
      source: 'Google Ads',
      status: 'new' as const,
      sellerId: juliana.id,
      notes: 'Lead recém-chegado solicitando catálogo comercial.',
      createdAt: new Date('2026-07-21'),
    },

    {
      name: 'Camila Santos',
      email: 'camila.santos@gmail.com',
      phone: '(41) 99121-8832',
      company: 'CS Personal Training',
      source: 'Instagram',
      status: 'qualified' as const,
      sellerId: carlos.id,
      notes:
        'Personal trainer montando novo espaço para atendimento individual.',
      createdAt: new Date('2026-06-03'),
    },

    {
      name: 'Academia Performance',
      email: 'compras@academiaperformance.com.br',
      phone: '(51) 99872-1102',
      company: 'Academia Performance',
      source: 'Evento',
      status: 'converted' as const,
      sellerId: mariana.id,
      notes:
        'Academia tradicional com aproximadamente 1.500 alunos ativos.',
      createdAt: new Date('2026-03-14'),
    },

    {
      name: 'André Martins',
      email: 'andre.martins@gmail.com',
      phone: '(85) 99128-7732',
      company: 'AM Fitness',
      source: 'WhatsApp',
      status: 'contacted' as const,
      sellerId: rafael.id,
      notes:
        'Solicitou orçamento para esteira, bicicleta e equipamentos de musculação.',
      createdAt: new Date('2026-06-22'),
    },

    {
      name: 'Renata Costa',
      email: 'renata@wellnesscenter.com.br',
      phone: '(71) 99981-2211',
      company: 'Wellness Center',
      source: 'Site',
      status: 'lost' as const,
      sellerId: juliana.id,
      notes:
        'Projeto cancelado devido à mudança de endereço da academia.',
      createdAt: new Date('2026-02-17'),
    },

    {
      name: 'Bruno Carvalho',
      email: 'bruno@maxperformance.com.br',
      phone: '(19) 99782-3321',
      company: 'Max Performance',
      source: 'Indicação',
      status: 'qualified' as const,
      sellerId: carlos.id,
      notes:
        'Interessado em montar uma academia de aproximadamente 500m².',
      createdAt: new Date('2026-07-02'),
    },

    {
      name: 'Fernanda Lima',
      email: 'fernanda@fitlife.com.br',
      phone: '(62) 99122-8731',
      company: 'FitLife Academia',
      source: 'Google',
      status: 'new' as const,
      sellerId: mariana.id,
      notes:
        'Solicitou contato comercial para conhecer as linhas profissionais.',
      createdAt: new Date('2026-07-28'),
    },

    {
      name: 'Rodrigo Almeida',
      email: 'rodrigo@ironhouse.com.br',
      phone: '(48) 99832-1922',
      company: 'Iron House',
      source: 'Feira',
      status: 'contacted' as const,
      sellerId: rafael.id,
      notes:
        'Academia em expansão. Avaliando fornecedores para nova unidade.',
      createdAt: new Date('2026-06-11'),
    },

    {
      name: 'Larissa Mendes',
      email: 'larissa@vitalfit.com.br',
      phone: '(81) 99731-2219',
      company: 'Vital Fit',
      source: 'Instagram',
      status: 'qualified' as const,
      sellerId: juliana.id,
      notes:
        'Interessada em equipamentos para área de cardio e funcional.',
      createdAt: new Date('2026-07-10'),
    },

    {
      name: 'Gustavo Nascimento',
      email: 'gustavo@primefitness.com.br',
      phone: '(27) 99821-9921',
      company: 'Prime Fitness',
      source: 'Site',
      status: 'converted' as const,
      sellerId: carlos.id,
      notes:
        'Cliente recorrente. Nova compra para substituição de equipamentos.',
      createdAt: new Date('2026-01-20'),
    },

    {
      name: 'Aline Ferreira',
      email: 'aline@movimentofit.com.br',
      phone: '(13) 99871-8821',
      company: 'Movimento Fit',
      source: 'Facebook',
      status: 'lost' as const,
      sellerId: mariana.id,
      notes:
        'Cliente optou por fornecedor concorrente devido ao prazo de entrega.',
      createdAt: new Date('2026-02-03'),
    },

    {
      name: 'Eduardo Costa',
      email: 'eduardo@newgym.com.br',
      phone: '(61) 99932-1122',
      company: 'New Gym',
      source: 'Google Ads',
      status: 'qualified' as const,
      sellerId: rafael.id,
      notes:
        'Projeto de nova academia com previsão de abertura no próximo trimestre.',
      createdAt: new Date('2026-07-25'),
    },
  ];

  const leads = [];

  for (const data of leadData) {
    const lead = await prisma.lead.create({
      data,
    });

    leads.push(lead);
  }

  /*
   * ============================================================
   * DEALS
   * ============================================================
   */

  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        name: 'Projeto Academia Corpo & Movimento',
        value: 185000,
        status: 'in_progress',
        description:
          'Projeto de renovação do parque de equipamentos da academia.',
        leadId: leads[0].id,
        sellerId: carlos.id,
        createdAt: new Date('2026-05-20'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'Studio Fit Premium — Equipamentos',
        value: 78000,
        status: 'new',
        description:
          'Equipamentos para expansão do studio boutique.',
        leadId: leads[1].id,
        sellerId: mariana.id,
        createdAt: new Date('2026-06-01'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'Smart Gym — Unidade Botafogo',
        value: 325000,
        status: 'won',
        description:
          'Fornecimento completo de equipamentos para nova unidade.',
        leadId: leads[2].id,
        sellerId: rafael.id,
        createdAt: new Date('2026-04-20'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'CS Personal Training',
        value: 42000,
        status: 'in_progress',
        description:
          'Montagem de espaço para treinamento personalizado.',
        leadId: leads[4].id,
        sellerId: carlos.id,
        createdAt: new Date('2026-06-15'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'Academia Performance — Renovação',
        value: 410000,
        status: 'won',
        description:
          'Renovação e ampliação do parque de equipamentos.',
        leadId: leads[5].id,
        sellerId: mariana.id,
        createdAt: new Date('2026-03-25'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'AM Fitness — Linha Cardio',
        value: 97000,
        status: 'in_progress',
        description:
          'Aquisição de esteiras, bicicletas e equipamentos de cardio.',
        leadId: leads[6].id,
        sellerId: rafael.id,
        createdAt: new Date('2026-07-01'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'Wellness Center',
        value: 145000,
        status: 'lost',
        description:
          'Projeto cancelado pelo cliente.',
        leadId: leads[7].id,
        sellerId: juliana.id,
        createdAt: new Date('2026-03-01'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'Max Performance — Nova Academia',
        value: 265000,
        status: 'new',
        description:
          'Projeto completo para nova academia de aproximadamente 500m².',
        leadId: leads[8].id,
        sellerId: carlos.id,
        createdAt: new Date('2026-07-10'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'Prime Fitness — Reposição',
        value: 118000,
        status: 'won',
        description:
          'Reposição e atualização de equipamentos existentes.',
        leadId: leads[12].id,
        sellerId: carlos.id,
        createdAt: new Date('2026-02-10'),
      },
    }),

    prisma.deal.create({
      data: {
        name: 'New Gym — Projeto Inicial',
        value: 350000,
        status: 'in_progress',
        description:
          'Projeto de equipamentos para nova academia.',
        leadId: leads[14].id,
        sellerId: rafael.id,
        createdAt: new Date('2026-07-30'),
      },
    }),
  ]);

  /*
   * ============================================================
   * COMMENTS
   * ============================================================
   */

  await prisma.comment.createMany({
    data: [
      {
        content:
          'Cliente demonstrou bastante interesse na linha profissional. Solicitou uma proposta completa.',
        authorId: carlos.id,
        leadId: leads[0].id,
        createdAt: new Date('2026-05-14'),
      },

      {
        content:
          'Realizada reunião com o proprietário. Projeto deverá contemplar musculação e cardio.',
        authorId: carlos.id,
        leadId: leads[0].id,
        createdAt: new Date('2026-05-20'),
      },

      {
        content:
          'Cliente solicitou revisão dos equipamentos de cardio antes da apresentação final.',
        authorId: carlos.id,
        dealId: deals[0].id,
        createdAt: new Date('2026-06-03'),
      },

      {
        content:
          'Proposta enviada por e-mail. Aguardando retorno do cliente.',
        authorId: mariana.id,
        leadId: leads[1].id,
        createdAt: new Date('2026-06-04'),
      },

      {
        content:
          'Negociação avançou. Cliente aprovou o projeto inicial.',
        authorId: rafael.id,
        dealId: deals[2].id,
        createdAt: new Date('2026-05-02'),
      },

      {
        content:
          'Contrato aprovado pelo cliente. Venda concluída.',
        authorId: rafael.id,
        dealId: deals[2].id,
        createdAt: new Date('2026-05-12'),
      },

      {
        content:
          'Cliente pediu condições especiais para pagamento à vista.',
        authorId: mariana.id,
        dealId: deals[4].id,
        createdAt: new Date('2026-04-02'),
      },

      {
        content:
          'Projeto aprovado. Pedido encaminhado para faturamento.',
        authorId: mariana.id,
        dealId: deals[4].id,
        createdAt: new Date('2026-04-17'),
      },

      {
        content:
          'Cliente solicitou nova apresentação com foco nos equipamentos de cardio.',
        authorId: rafael.id,
        leadId: leads[6].id,
        createdAt: new Date('2026-07-08'),
      },

      {
        content:
          'Nova unidade prevista para abertura no próximo trimestre.',
        authorId: rafael.id,
        dealId: deals[9].id,
        createdAt: new Date('2026-08-01'),
      },
    ],
  });

  /*
   * ============================================================
   * ACTIVITIES
   * ============================================================
   */

  await prisma.activity.createMany({
    data: [
      {
        type: 'LEAD_CREATED',
        leadId: leads[0].id,
        userId: carlos.id,
        metadata: {
          source: 'Site',
        },
        createdAt: new Date('2026-05-12'),
      },

      {
        type: 'LEAD_UPDATED',
        leadId: leads[0].id,
        userId: carlos.id,
        metadata: {
          field: 'status',
          from: 'new',
          to: 'contacted',
        },
        createdAt: new Date('2026-05-13'),
      },

      {
        type: 'LEAD_UPDATED',
        leadId: leads[0].id,
        userId: carlos.id,
        metadata: {
          field: 'status',
          from: 'contacted',
          to: 'qualified',
        },
        createdAt: new Date('2026-05-20'),
      },

      {
        type: 'DEAL_CREATED',
        leadId: leads[0].id,
        dealId: deals[0].id,
        userId: carlos.id,
        metadata: {
          value: 185000,
        },
        createdAt: new Date('2026-05-20'),
      },

      {
        type: 'DEAL_UPDATED',
        dealId: deals[0].id,
        leadId: leads[0].id,
        userId: carlos.id,
        metadata: {
          field: 'value',
          from: 160000,
          to: 185000,
        },
        createdAt: new Date('2026-06-03'),
      },

      {
        type: 'LEAD_CREATED',
        leadId: leads[2].id,
        userId: rafael.id,
        metadata: {
          source: 'Indicação',
        },
        createdAt: new Date('2026-04-08'),
      },

      {
        type: 'DEAL_CREATED',
        leadId: leads[2].id,
        dealId: deals[2].id,
        userId: rafael.id,
        metadata: {
          value: 325000,
        },
        createdAt: new Date('2026-04-20'),
      },

      {
        type: 'DEAL_STATUS_CHANGED',
        leadId: leads[2].id,
        dealId: deals[2].id,
        userId: rafael.id,
        metadata: {
          from: 'new',
          to: 'in_progress',
        },
        createdAt: new Date('2026-04-25'),
      },

      {
        type: 'DEAL_WON',
        leadId: leads[2].id,
        dealId: deals[2].id,
        userId: rafael.id,
        metadata: {
          value: 325000,
        },
        createdAt: new Date('2026-05-12'),
      },

      {
        type: 'LEAD_CREATED',
        leadId: leads[5].id,
        userId: mariana.id,
        metadata: {
          source: 'Evento',
        },
        createdAt: new Date('2026-03-14'),
      },

      {
        type: 'DEAL_CREATED',
        leadId: leads[5].id,
        dealId: deals[4].id,
        userId: mariana.id,
        metadata: {
          value: 410000,
        },
        createdAt: new Date('2026-03-25'),
      },

      {
        type: 'DEAL_STATUS_CHANGED',
        leadId: leads[5].id,
        dealId: deals[4].id,
        userId: mariana.id,
        metadata: {
          from: 'in_progress',
          to: 'won',
        },
        createdAt: new Date('2026-04-17'),
      },

      {
        type: 'DEAL_WON',
        leadId: leads[5].id,
        dealId: deals[4].id,
        userId: mariana.id,
        metadata: {
          value: 410000,
        },
        createdAt: new Date('2026-04-17'),
      },

      {
        type: 'LEAD_CREATED',
        leadId: leads[6].id,
        userId: rafael.id,
        metadata: {
          source: 'WhatsApp',
        },
        createdAt: new Date('2026-06-22'),
      },

      {
        type: 'DEAL_CREATED',
        leadId: leads[6].id,
        dealId: deals[5].id,
        userId: rafael.id,
        metadata: {
          value: 97000,
        },
        createdAt: new Date('2026-07-01'),
      },

      {
        type: 'LEAD_CREATED',
        leadId: leads[7].id,
        userId: juliana.id,
        metadata: {
          source: 'Site',
        },
        createdAt: new Date('2026-02-17'),
      },

      {
        type: 'DEAL_CREATED',
        leadId: leads[7].id,
        dealId: deals[6].id,
        userId: juliana.id,
        metadata: {
          value: 145000,
        },
        createdAt: new Date('2026-03-01'),
      },

      {
        type: 'DEAL_STATUS_CHANGED',
        leadId: leads[7].id,
        dealId: deals[6].id,
        userId: juliana.id,
        metadata: {
          from: 'in_progress',
          to: 'lost',
          reason: 'Projeto cancelado',
        },
        createdAt: new Date('2026-03-15'),
      },

      {
        type: 'DEAL_LOST',
        leadId: leads[7].id,
        dealId: deals[6].id,
        userId: juliana.id,
        metadata: {
          value: 145000,
          reason: 'Mudança de endereço',
        },
        createdAt: new Date('2026-03-15'),
      },

      {
        type: 'LEAD_CREATED',
        leadId: leads[12].id,
        userId: carlos.id,
        metadata: {
          source: 'Site',
        },
        createdAt: new Date('2026-01-20'),
      },

      {
        type: 'DEAL_CREATED',
        leadId: leads[12].id,
        dealId: deals[8].id,
        userId: carlos.id,
        metadata: {
          value: 118000,
        },
        createdAt: new Date('2026-02-10'),
      },

      {
        type: 'DEAL_WON',
        leadId: leads[12].id,
        dealId: deals[8].id,
        userId: carlos.id,
        metadata: {
          value: 118000,
        },
        createdAt: new Date('2026-02-28'),
      },

      {
        type: 'LEAD_CREATED',
        leadId: leads[14].id,
        userId: rafael.id,
        metadata: {
          source: 'Google Ads',
        },
        createdAt: new Date('2026-07-25'),
      },

      {
        type: 'DEAL_CREATED',
        leadId: leads[14].id,
        dealId: deals[9].id,
        userId: rafael.id,
        metadata: {
          value: 350000,
        },
        createdAt: new Date('2026-07-30'),
      },

      {
        type: 'COMMENT_CREATED',
        leadId: leads[0].id,
        userId: carlos.id,
        metadata: {
          comment: 'Cliente demonstrou bastante interesse.',
        },
        createdAt: new Date('2026-05-14'),
      },

      {
        type: 'COMMENT_CREATED',
        dealId: deals[2].id,
        leadId: leads[2].id,
        userId: rafael.id,
        metadata: {
          comment: 'Venda aprovada.',
        },
        createdAt: new Date('2026-05-12'),
      },
    ],
  });

  /*
   * ============================================================
   * RESUMO
   * ============================================================
   */

  const [
    userCount,
    accountCount,
    leadCount,
    dealCount,
    commentCount,
    activityCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.lead.count(),
    prisma.deal.count(),
    prisma.comment.count(),
    prisma.activity.count(),
  ]);

  console.log('');
  console.log('✅ Seed concluído!');
  console.log('');
  console.log('📊 Dados criados:');
  console.log(`   Usuários:    ${userCount} `);
  console.log(`   Accounts:    ${accountCount} `);
  console.log(`   Leads:       ${leadCount} `);
  console.log(`   Deals:       ${dealCount} `);
  console.log(`   Comentários: ${commentCount} `);
  console.log(`   Atividades:  ${activityCount} `);
  console.log('');
  console.log('🔐 Usuários:');
  console.log('   admin@kikosfitness.com.br');
  console.log('   carlos@kikosfitness.com.br');
  console.log('   mariana@kikosfitness.com.br');
  console.log('   rafael@kikosfitness.com.br');
  console.log('   juliana@kikosfitness.com.br');
  console.log('');
  console.log(`🔑 Senha: ${PASSWORD} `);
  console.log('');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
