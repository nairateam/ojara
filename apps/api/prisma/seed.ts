/**
 * Seeds plans, a platform admin, and a demo store ("demo.ojara.localhost").
 * Idempotent: safe to run repeatedly. Runs as the schema owner (DATABASE_MIGRATION_URL), which is
 * not subject to RLS, so it can write across tenants.
 */
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PLAN_KEYS, PLANS } from '@ojara/shared';
import { hashPassword } from 'better-auth/crypto';
import { PrismaClient } from '../src/generated/prisma/client.js';

try {
  process.loadEnvFile('.env');
} catch {
  // env provided by the shell / CI
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set to run the seed`);
  return value;
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: required('DATABASE_MIGRATION_URL') }) });

async function upsertUserWithPassword(email: string, name: string, password: string, role: 'USER' | 'PLATFORM_ADMIN') {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const id = randomUUID();
  const user = await prisma.user.create({ data: { id, email, name, role, emailVerified: true } });
  await prisma.account.create({
    data: { id: randomUUID(), accountId: id, providerId: 'credential', userId: id, password: await hashPassword(password) },
  });
  return user;
}

async function main() {
  // 1. Plans
  for (const key of PLAN_KEYS) {
    const plan = PLANS[key];
    await prisma.plan.upsert({
      where: { key },
      create: { key, name: plan.name, priceKobo: plan.priceKobo, limits: { ...plan.limits } },
      update: { name: plan.name, priceKobo: plan.priceKobo, limits: { ...plan.limits } },
    });
  }

  // 2. Platform admin
  const admin = await upsertUserWithPassword(
    process.env.SEED_ADMIN_EMAIL ?? 'admin@ojara.localhost',
    'Ojara Admin',
    required('SEED_ADMIN_PASSWORD'),
    'PLATFORM_ADMIN',
  );

  // 3. Demo merchant + store
  const merchant = await upsertUserWithPassword('demo@ojara.localhost', 'Adunni Okafor', 'Demo-Merchant-123', 'USER');
  const free = await prisma.plan.findUniqueOrThrow({ where: { key: 'FREE' } });

  const store = await prisma.store.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Adùnní Threads',
      slug: 'demo',
      status: 'PUBLISHED',
      planId: free.id,
      primaryColor: '#2B2F6B',
      contactEmail: 'hello@adunnithreads.ng',
      contactPhone: '+234 803 000 0000',
      city: 'Lagos',
      state: 'Lagos',
      pickupEnabled: true,
      pickupAddress: '12 Admiralty Way, Lekki Phase 1, Lagos',
    },
  });

  await prisma.storeMember.upsert({
    where: { storeId_userId: { storeId: store.id, userId: merchant.id } },
    update: {},
    create: { storeId: store.id, userId: merchant.id, role: 'OWNER' },
  });

  const hasSubscription = await prisma.subscription.findFirst({ where: { storeId: store.id } });
  if (!hasSubscription) {
    await prisma.subscription.create({ data: { storeId: store.id, planId: free.id, status: 'ACTIVE' } });
  }

  const category = await prisma.category.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'adire' } },
    update: {},
    create: { storeId: store.id, name: 'Adire', slug: 'adire', position: 0 },
  });

  const products = [
    { slug: 'indigo-adire-shirt', name: 'Indigo Adire Shirt', basePriceKobo: 2_850_000, sku: 'ADT-SHIRT-01', sizes: ['S', 'M', 'L'] },
    { slug: 'kampala-wrap-dress', name: 'Kampala Wrap Dress', basePriceKobo: 4_200_000, promoPriceKobo: 3_800_000, sku: 'ADT-DRESS-02', sizes: ['M', 'L'] },
    { slug: 'aso-oke-tote', name: 'Aso-Oke Tote Bag', basePriceKobo: 1_500_000, sku: 'ADT-TOTE-03', sizes: [] },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {},
      create: {
        storeId: store.id,
        categoryId: category.id,
        name: p.name,
        slug: p.slug,
        description: `${p.name}, hand-dyed in Abeokuta.`,
        status: 'PUBLISHED',
        basePriceKobo: p.basePriceKobo,
        promoPriceKobo: p.promoPriceKobo ?? null,
        sku: p.sku,
      },
    });
    const variants = p.sizes.length ? p.sizes : [null];
    for (const size of variants) {
      const sku = size ? `${p.sku}-${size}` : `${p.sku}-OS`;
      await prisma.productVariant.upsert({
        where: { storeId_sku: { storeId: store.id, sku } },
        update: {},
        create: { storeId: store.id, productId: product.id, sku, options: size ? { size } : {}, stockQuantity: 12 },
      });
    }
  }

  const hasZone = await prisma.deliveryZone.findFirst({ where: { storeId: store.id } });
  if (!hasZone) {
    await prisma.deliveryZone.createMany({
      data: [
        { storeId: store.id, name: 'Lagos Island', feeKobo: 250_000, areas: ['Lekki', 'Ajah', 'Victoria Island', 'Ikoyi'] },
        { storeId: store.id, name: 'Lagos Mainland', feeKobo: 300_000, areas: ['Yaba', 'Surulere', 'Ikeja'] },
      ],
    });
  }

  await prisma.auditLog.create({ data: { action: 'seed.completed', entity: 'System', actorId: admin.id } });

  console.log(`Seeded plans, admin <${admin.email}>, and store "${store.name}" at demo.<ROOT_DOMAIN>`);
  console.log('Demo merchant login: demo@ojara.localhost / Demo-Merchant-123 (local only)');
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
