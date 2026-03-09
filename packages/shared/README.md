# @sirojulanam-connecthub/shared

Shared assets untuk semua aplikasi di monorepo ini.

## Struktur

```
packages/shared/
├── assets/
│   ├── images/    # Gambar umum (logo, banner, dll)
│   └── icons/     # Icon files
└── package.json
```

## Cara Menggunakan

### Import langsung dari assets

```ts
// Di apps/web atau apps/admin
import logo from '@sirojulanam-connecthub/shared/assets/images/logo.png'
import icon from '@sirojulanam-connecthub/shared/assets/icons/home.svg'

<img src={logo} alt="Logo" />
```

### Update vite.config.ts

Pastikan vite.config.ts di masing-masing app bisa resolve package ini:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sirojulanam-connecthub/shared': path.resolve(__dirname, '../../packages/shared'),
    },
  },
})
```
