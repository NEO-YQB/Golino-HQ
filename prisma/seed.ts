import { PrismaClient } from '@prisma/client';
import { INITIAL_DEPARTMENTS } from '../src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Golino HQ Database Seed...');

  for (const dept of INITIAL_DEPARTMENTS) {
    console.log(`Seeding Department: ${dept.nameFa}...`);

    await prisma.department.upsert({
      where: { id: dept.id },
      update: {
        name: dept.name,
        nameFa: dept.nameFa,
        descriptionFa: dept.descriptionFa,
        icon: dept.icon,
        color: dept.color,
        status: dept.status,
      },
      create: {
        id: dept.id,
        name: dept.name,
        nameFa: dept.nameFa,
        descriptionFa: dept.descriptionFa,
        icon: dept.icon,
        color: dept.color,
        status: dept.status,
        activeTasksCount: 0,
        errorCount: 0,
      },
    });

    // Seed Lead Agent
    const lead = dept.leadAgent;
    await prisma.agent.upsert({
      where: { id: lead.id },
      update: {
        name: lead.name,
        roleFa: lead.roleFa,
        departmentId: dept.id,
        isLead: true,
        avatar: lead.avatar,
        model: lead.model,
        status: lead.status,
        specialtyFa: lead.specialtyFa,
        systemPrompt: lead.systemPrompt,
      },
      create: {
        id: lead.id,
        name: lead.name,
        roleFa: lead.roleFa,
        departmentId: dept.id,
        isLead: true,
        avatar: lead.avatar,
        model: lead.model,
        status: lead.status,
        specialtyFa: lead.specialtyFa,
        systemPrompt: lead.systemPrompt,
      },
    });

    // Seed Team Members
    for (const member of dept.members) {
      await prisma.agent.upsert({
        where: { id: member.id },
        update: {
          name: member.name,
          roleFa: member.roleFa,
          departmentId: dept.id,
          isLead: false,
          avatar: member.avatar,
          model: member.model,
          status: member.status,
          specialtyFa: member.specialtyFa,
          assignedChannelsFa: member.assignedChannelsFa,
        },
        create: {
          id: member.id,
          name: member.name,
          roleFa: member.roleFa,
          departmentId: dept.id,
          isLead: false,
          avatar: member.avatar,
          model: member.model,
          status: member.status,
          specialtyFa: member.specialtyFa,
          assignedChannelsFa: member.assignedChannelsFa,
        },
      });
    }
  }

  console.log('✅ Golino HQ Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
