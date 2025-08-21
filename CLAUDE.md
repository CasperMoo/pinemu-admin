# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cool-Admin Vue 3 admin panel built with TypeScript, Element Plus, and the Cool-Admin framework. It's a modular, plugin-based system for rapid CRUD development with AI code generation capabilities.

## Development Commands

```bash
# Install dependencies (use pnpm)
pnpm i

# Development server (runs on http://localhost:9000)
pnpm dev

# Build for production
pnpm build

# Build for static deployment  
pnpm build-static

# Build demo version
pnpm build-demo

# Type checking
pnpm type-check

# Lint and fix
pnpm lint

# Format code
pnpm format
```

## Core Architecture

### Modular System
- **Modules** (`src/modules/`): Feature-specific modules (base, demo, dict, user, etc.)
- **Plugins** (`src/plugins/`): Reusable components and utilities (crud, upload, theme, etc.)
- **Cool Core** (`src/cool/`): Framework core functionality

### Key Directories
- `src/cool/`: Core framework (bootstrap, hooks, module system, router, service layer)
- `src/modules/`: Application modules with their own components, views, stores
- `src/plugins/`: Reusable plugins (CRUD, upload, themes, etc.)
- `src/config/`: Environment configurations (dev, prod, proxy)
- `build/cool/`: Auto-generated EPS (API) definitions and types

### Module Structure
Each module follows this convention:
```
modules/[name]/
├── components/     # Module-specific components  
├── views/         # Pages/views
├── store/         # Pinia stores
├── locales/       # i18n translations
├── config.ts      # Module configuration
└── index.ts       # Module exports
```

## Path Aliases
- `/@/*` → `./src/*`
- `/$/*` → `./src/modules/*` 
- `/#/*` → `./src/plugins/*`
- `/~/*` → `./packages/*`

## EPS System
The framework auto-generates TypeScript definitions from backend APIs:
- `build/cool/eps.d.ts`: Auto-generated API types
- `build/cool/eps.json`: API endpoint definitions
- Access via `service` object (e.g., `service.base.sys.user`)

## CRUD Development
Use the `@cool-vue/crud` package for rapid CRUD development:
- `useCrud()`: Main CRUD hook
- `useTable()`: Table configuration
- `useUpsert()`: Form dialogs (add/edit)
- `useAdvSearch()`: Advanced search

## Module Configuration
Each module requires a `config.ts` with ModuleConfig:
- `enable`: Module status
- `order`: Load priority (higher loads first)
- `components`: Global component registration
- `views`: Route registration for authenticated pages
- `pages`: Route registration for public pages
- `onLoad()`: Initialization hook

## Naming Conventions
- File/component names: kebab-case (e.g., `user-select.vue`)
- Module exports: `use[ModuleName]` pattern (e.g., `useBase()`, `useDict()`)
- Service paths: Follow backend structure (e.g., `service.base.sys.user`)

## Important Notes
- Always use `pnpm` for package management
- EPS definitions auto-refresh when backend changes
- Module `config.ts` files are required for module registration
- Path/name matching for route caching: `/demo/t1` → `demo-t1`
- Service references should not include method names (use `service.base.sys.user`, not `service.base.sys.user.page`)

## Testing
Check package.json scripts and README for project-specific test commands. No standard test framework is immediately apparent in the configuration.