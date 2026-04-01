# Service Layer Pattern - SirojulAnam ConnectHub API

Struktur backend menggunakan **Service Layer Pattern** untuk memisahkan business logic dari routing/controller. Ini membuat kode lebih maintainable, testable, dan scalable.

## Struktur Layer

```
┌─────────────────┐
│     Routes      │  ← HTTP endpoints (GET, POST, PUT, DELETE)
└────────┬────────┘
         │
┌────────▼────────┐
│   Controllers   │  ← Handle request/response, validation, error handling
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  ← Business logic, data transformation
└────────┬────────┘
         │
┌────────▼────────┐
│  EntityManager  │  ← Database operations (MikroORM)
└─────────────────┘
```

## Komponen

### 1. **Routes** (`src/routes/`)
Mendefinisikan HTTP endpoints dan mapping ke controller methods.

```typescript
// src/routes/admins.ts
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
```

### 2. **Controllers** (`src/controllers/`)
Menangani HTTP request/response, validasi input, dan error handling.

```typescript
// src/controllers/admins.ts
getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await this.service.findAll();
    res.json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
};
```

### 3. **Services** (`src/services/`)
Business logic utama, operasi database, dan data transformation.

```typescript
// src/services/admins.ts
async findAll(): Promise<AdminResponse[]> {
  const admins = await this.em.find(Admins, {}, { populate: ['role'] });
  return admins.map((admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    roleId: admin.role.id,
    isActive: admin.isActive,
  }));
}
```

### 4. **Entities** (`src/entities/`)
Database models menggunakan MikroORM.

```typescript
// src/entities/Admins.ts
@Entity()
export class Admins {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  name!: string;
}
```

## Flow Request

```
Client Request
    ↓
GET /api/admins/1
    ↓
Route (admins.ts)
    ↓
Controller (AdminController.getById)
    ↓
Service (AdminService.findById)
    ↓
EntityManager (MikroORM)
    ↓
Database (MariaDB)
    ↓
Response JSON
```

## Contoh Penggunaan

### Membuat Admin Baru

```typescript
// Di service
const admin = await adminService.create({
  name: "John Doe",
  email: "john@example.com",
  passwordHash: await hashPassword("secret123"),
  roleId: 1,
});
```

### HTTP Request

```bash
# Get all admins
curl http://localhost:3000/api/routes/admins

# Get admin by ID
curl http://localhost:3000/api/routes/admins/1

# Create admin
curl -X POST http://localhost:3000/api/routes/admins \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","passwordHash":"hash123","roleId":1}'

# Update admin
curl -X PUT http://localhost:3000/api/routes/admins/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}'

# Delete admin
curl -X DELETE http://localhost:3000/api/routes/admins/1
```

## Menambah Entity Baru

Untuk menambah entity baru (misal: `Videos`), ikuti pola yang sama:

1. **Service**: `src/services/videos.ts`
2. **Controller**: `src/controllers/videos.ts`
3. **Routes**: `src/routes/videos.ts`
4. **Register**: Tambahkan di `src/routes/index.ts`

```typescript
// src/routes/index.ts
import videoRouter from "./videos.ts";
import { VideoController } from "../controllers/videos.js";

const videoController = new VideoController(getEntityManager());
subRoute.use("/videos", setupVideoRoutes(videoController));
```

## Keuntungan Pattern Ini

- **Separation of Concerns** - Setiap layer punya tanggung jawab jelas
- **Testable** - Service bisa di-test tanpa HTTP server
- **Maintainable** - Mudah menemukan dan modify kode
- **Reusable** - Service bisa dipanggil dari multiple controllers
- **Scalable** - Mudah menambah fitur baru tanpa mengacaukan kode existing
