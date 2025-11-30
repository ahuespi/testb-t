# Guía de Pre-Commit Hook

Esta guía te ayudará a configurar un hook de pre-commit que verifica automáticamente que tu código compila antes de hacer commit.

## Método 1: Git Hook Manual (Recomendado - Sin dependencias)

### Paso 1: Crear el archivo pre-commit

```bash
cd /Users/amir/workspaces/ahuespi/betapp
mkdir -p .git/hooks
touch .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Paso 2: Editar el archivo

Abre `.git/hooks/pre-commit` y pega el siguiente contenido:

```bash
#!/bin/sh

echo "🔍 Verificando tipos de TypeScript..."

# Ejecutar verificación de tipos
npm run type-check

# Si falla, no permitir el commit
if [ $? -ne 0 ]; then
  echo "❌ Error: La verificación de tipos falló."
  echo "Por favor, corrige los errores de TypeScript antes de hacer commit."
  exit 1
fi

echo "✅ Verificación de tipos exitosa!"
exit 0
```

### Paso 3: Hacer el archivo ejecutable

```bash
chmod +x .git/hooks/pre-commit
```

## Método 2: Usando Husky (Requiere instalación)

### Opción A: Instalación simple

Si no tienes problemas de permisos con npm:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run type-check"
```

### Opción B: Instalación manual de husky

1. Agregar husky al package.json:

```json
{
  "devDependencies": {
    "husky": "^8.0.3"
  },
  "scripts": {
    "prepare": "husky install"
  }
}
```

2. Instalar:

```bash
npm install
npm run prepare
```

3. Crear el hook:

```bash
npx husky add .husky/pre-commit "npm run type-check"
```

## Verificar que funciona

1. Intenta hacer un commit con errores de TypeScript:
   ```bash
   git add .
   git commit -m "test"
   ```

2. Deberías ver:
   ```
   🔍 Verificando tipos de TypeScript...
   ❌ Error: La verificación de tipos falló.
   Por favor, corrige los errores de TypeScript antes de hacer commit.
   ```

3. Corrige los errores y vuelve a intentar:
   ```bash
   git commit -m "test"
   ```

4. Ahora deberías ver:
   ```
   🔍 Verificando tipos de TypeScript...
   ✅ Verificación de tipos exitosa!
   [branch ...] test
   ```

## Scripts disponibles

- `npm run type-check` - Solo verifica tipos sin compilar
- `npm run build` - Compila el proyecto completo (incluye type-check)
- `npm run lint` - Ejecuta el linter de ESLint

## Comandos útiles

### Saltear el pre-commit hook (usar con precaución)
```bash
git commit -m "mensaje" --no-verify
```

### Ver los hooks activos
```bash
ls -la .git/hooks/
```

### Deshabilitar temporalmente
```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

### Habilitar de nuevo
```bash
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

## Troubleshooting

### El hook no se ejecuta
- Verifica que el archivo sea ejecutable: `ls -l .git/hooks/pre-commit`
- Debería mostrar `-rwxr-xr-x` (con `x` en los permisos)
- Si no: `chmod +x .git/hooks/pre-commit`

### El hook falla con "command not found"
- Verifica que npm esté en tu PATH
- Prueba ejecutar manualmente: `npm run type-check`

### Errores de permisos
- Si usas nvm, asegúrate de que tu shell cargue nvm correctamente
- Agrega al inicio del hook:
  ```bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  ```

## Recomendación

Para este proyecto, recomiendo usar el **Método 1 (Git Hook Manual)** ya que:
- ✅ No requiere instalar dependencias adicionales
- ✅ Funciona inmediatamente
- ✅ No tiene problemas de permisos
- ✅ Es fácil de modificar y entender

El hook se almacena en `.git/hooks/` que está en `.gitignore`, por lo que cada desarrollador debe configurarlo localmente.

