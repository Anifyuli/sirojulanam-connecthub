import "dotenv/config";
import { initEntityManager } from "./lib/entityManager.ts";
import { Roles } from "./entities/Roles.ts";
import { Admins } from "./entities/Admins.ts";
import { hashPassword } from "./utils/hash.ts";

async function seed() {
  const orm = await initEntityManager();
  const em = orm.em.fork();

  console.log("🌱 Starting seed...");

  const managerRole = await em.findOne(Roles, { name: "manager" });
  if (!managerRole) {
    const role = new Roles();
    role.name = "manager";
    em.persist(role);
    await em.flush();
    console.log("✅ Created role: manager");
  }

  const editorRole = await em.findOne(Roles, { name: "editor" });
  if (!editorRole) {
    const role = new Roles();
    role.name = "editor";
    em.persist(role);
    await em.flush();
    console.log("✅ Created role: editor");
  }

  const existingAdmin = await em.findOne(Admins, { email: "admin@sirojulanam.org" });
  if (!existingAdmin) {
    const roleManager = await em.findOne(Roles, { name: "manager" });
    
    const admin = new Admins();
    admin.name = "Administrator";
    admin.username = "admin";
    admin.email = "admin@sirojulanam.org";
    admin.passwordHash = await hashPassword("admin123");
    admin.role = roleManager!;
    admin.isActive = true;
    em.persist(admin);
    await em.flush();
    console.log("✅ Created admin: admin@sirojulanam.org / admin123");
  } else {
    console.log("ℹ️  Admin already exists");
  }

  console.log("🎉 Seed completed!");
  await orm.close(true);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
