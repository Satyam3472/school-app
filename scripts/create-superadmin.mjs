import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'kumarsatyam8298380149@gmail.com';
    const password = 'Satyam@123';
    const name = 'Super Admin';
    const role = 'SUPER_ADMIN';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`User with email "${email}" already exists (role: ${existing.role}). Skipping.`);
        return;
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    console.log('✅ Super admin created successfully:');
    console.log(user);
}

main()
    .catch((e) => {
        console.error('❌ Error creating super admin:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
