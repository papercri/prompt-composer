
# Prompt Composer

Prompt Composer es una aplicación web construida con Next.js y TypeScript que permite crear, organizar y combinar frases para generar prompts de manera rápida y eficiente. Las frases se pueden guardar en carpetas, arrastrar y soltar, y generar un prompt completo listo para copiar y usar en ChatGPT u otras IA.

## Características

- Inicio de sesión con Google o GitHub.
- Gestión de frases libres: agregar, eliminar, arrastrar y doble click para insertar en el prompt.
- Gestión de carpetas: crear, eliminar y arrastrar frases dentro de carpetas.
- Área de prompt editable: combinación de frases y texto manual.
- Copiar y borrar el prompt completo manteniendo saltos de línea.
- Interfaz moderna y responsiva, adaptada a escritorio, tablet y móvil.

## Tecnologías

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase (Autenticación y almacenamiento de datos)
- Drag & Drop nativo para mover frases entre secciones

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/papercri/prompt-composer.git
cd prompt-composer
```

2. Instalar dependencias:

```bash
npm install
# o
yarn install
# o
pnpm install
```

3. Configurar variables de entorno para Firebase:

Crea un archivo `.env.local` con tu configuración de Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

1. Inicia sesión con Google o GitHub.
2. Crea frases libres o carpetas para organizar tus frases.
3. Arrastra frases entre libre y carpetas según necesites.
4. Doble click en cualquier frase para añadirla al prompt.
5. Copia el prompt completo con el botón "Copiar" o bórralo con "Borrar".

## Contribución

Si deseas contribuir, haz un fork del repositorio, crea una rama con tu feature o fix y envía un pull request.

## Licencia

Este proyecto está disponible bajo la licencia MIT.
