"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed...');
    const hash = (pwd) => bcrypt.hash(pwd, 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@presteza.com.br' },
        update: {},
        create: {
            name: 'Amanda Nunes',
            email: 'admin@presteza.com.br',
            password: await hash('admin123'),
            role: 'ADMIN',
        },
    });
    console.log(`✅ Admin criado: ${admin.email}`);
    const clientUser = await prisma.user.upsert({
        where: { email: 'cliente@exemplo.com.br' },
        update: {},
        create: {
            name: 'Marcos Bonfá',
            email: 'cliente@exemplo.com.br',
            password: await hash('cliente123'),
            role: 'CLIENT',
        },
    });
    console.log(`✅ Cliente criado: ${clientUser.email}`);
    const client = await prisma.client.upsert({
        where: { cnpj: '12.345.678/0001-99' },
        update: {},
        create: {
            companyName: 'Bonfá Serviços Ltda',
            tradeName: 'Bonfá',
            cnpj: '12.345.678/0001-99',
            email: 'cliente@exemplo.com.br',
            phone: '(11) 99999-0000',
            responsibleName: 'Marcos Bonfá',
            status: 'ACTIVE',
            userId: clientUser.id,
        },
    });
    console.log(`✅ Empresa criada: ${client.companyName}`);
    const conversation = await prisma.conversation.upsert({
        where: { clientId: client.id },
        update: {},
        create: { clientId: client.id },
    });
    await prisma.message.create({
        data: {
            conversationId: conversation.id,
            senderId: admin.id,
            type: 'SYSTEM',
            content: '👋 Bem-vindo ao Presteza Contábil! Este é o seu canal direto com o escritório.',
        },
    });
    console.log(`✅ Conversa e mensagem de boas-vindas criadas`);
    await prisma.process.create({
        data: {
            title: 'IRPJ 2025',
            type: 'IRPJ',
            status: 'IN_PROGRESS',
            clientId: client.id,
            assignedToId: admin.id,
            dueDate: new Date('2026-06-30'),
            description: 'Apuração do Imposto de Renda Pessoa Jurídica referente ao exercício 2025.',
        },
    });
    console.log(`✅ Processo de exemplo criado`);
    await prisma.timelineEvent.create({
        data: {
            clientId: client.id,
            title: 'Cadastro realizado',
            description: 'Cliente cadastrado no sistema Presteza Contábil.',
        },
    });
    console.log('\n🎉 Seed concluído!');
    console.log('─────────────────────────────────');
    console.log('👤 Admin     → admin@presteza.com.br   / admin123');
    console.log('👤 Cliente   → cliente@exemplo.com.br  / cliente123');
    console.log('─────────────────────────────────');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map