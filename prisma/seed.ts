/**
 * 初期データのシードスクリプト
 *
 * 使用方法:
 *   bun prisma db seed
 *
 * 注意:
 *   - 開発環境専用（モック認証と併用）
 *   - すでにデータが存在する場合はスキップされます
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const companyName = "サンプル株式会社";
  const companySlug = "sample";

  // 既存の会社があるか確認
  const existingCompany = await prisma.companies.findUnique({
    where: { slug: companySlug },
  });

  if (existingCompany) {
    console.log(`Company "${companyName}" already exists. Skipping...`);
    return;
  }

  // 初期会社を作成
  const company = await prisma.companies.create({
    data: {
      name: companyName,
      slug: companySlug,
    },
  });

  console.log(`Created company: ${company.name} (id: ${company.id})`);

  // モックユーザーを作成
  const user = await prisma.users.create({
    data: {
      clerk_user_id: "user_mock_default",
      email: "sample@test.com",
      name: "サンプルユーザー",
      company_id: company.id,
      role: "owner",
    },
  });

  console.log(`Created user: ${user.email} (id: ${user.id})`);
  console.log("");
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
