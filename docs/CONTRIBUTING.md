# Contributing to Bet Tracker

## Mejoras Sugeridas

Si quieres extender la funcionalidad de la aplicación, aquí hay algunas ideas:

### 🎯 Features Prioritarios

1. **Autenticación de Usuarios**
   - Múltiples usuarios pueden usar la app
   - Cada uno ve solo sus datos
   - Login con email/password o providers (Google, GitHub)

2. **Edición de Transacciones**
   - Poder modificar transacciones existentes
   - Mantener historial de cambios

3. **Categorías/Tags**
   - Etiquetar apuestas por deporte, liga, tipo
   - Filtrar por categorías
   - Análisis por categoría

4. **Metas y Objetivos**
   - Establecer meta mensual de ROI
   - Alertas cuando se alcanza un objetivo
   - Visualización de progreso

5. **Exportar Datos**
   - Exportar a CSV/Excel
   - Generar reportes PDF
   - Backup de datos

### 🔧 Mejoras Técnicas

1. **Tests Unitarios**
   - Jest + React Testing Library
   - Tests para utilidades y cálculos
   - Tests de componentes

2. **Tests E2E**
   - Playwright o Cypress
   - Flujos completos de usuario

3. **Optimizaciones**
   - Paginación para muchas transacciones
   - Virtualización de listas largas
   - Lazy loading de componentes

4. **Internacionalización**
   - Soporte para inglés y español
   - Formatos de moneda configurables

5. **Dark Mode**
   - Tema oscuro
   - Cambio automático según sistema

### 📊 Analytics Avanzados

1. **Más Gráficos**
   - Gráfico de pastel por tipo de apuesta
   - Heatmap de rendimiento por día de semana
   - Comparación mes a mes

2. **Estadísticas Avanzadas**
   - Mejor racha de victorias
   - Peor racha de derrotas
   - Promedio de cuota
   - Rendimiento por hora del día

3. **Predicciones**
   - Proyección de beneficio mensual
   - Recomendaciones de stake basadas en historial

### 🎨 UI/UX

1. **Personalización**
   - Temas de color
   - Reordenar dashboard
   - Ocultar/mostrar widgets

2. **Accesibilidad**
   - Mejorar soporte de screen readers
   - Alto contraste
   - Navegación por teclado

3. **Notificaciones**
   - Push notifications para recordatorios
   - Alertas de metas alcanzadas

## 🏗️ Arquitectura

### Añadir Autenticación

```typescript
// src/lib/auth.ts
import { supabase } from './supabase';

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};
```

Actualizar políticas RLS:

```sql
-- Solo ver transacciones del usuario autenticado
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Agregar columna user_id a transactions
ALTER TABLE transactions ADD COLUMN user_id TEXT;
```

### Añadir Edición

```typescript
// En useTransactions.ts
const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    setTransactions(prev => prev.map(t => t.id === id ? data : t));
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

### Añadir Categorías

```sql
-- Nueva tabla
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT
);

-- Relación con transactions
ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id);
```

## 📝 Convenciones de Código

### TypeScript

- Usar tipos estrictos, evitar `any`
- Exportar interfaces desde `types/index.ts`
- Usar enums para valores fijos

### React

- Componentes funcionales con hooks
- Props interfaces claramente definidas
- Memoización para optimización (useMemo, useCallback)

### Estilos

- Tailwind utility classes
- Componentes reutilizables en `components/`
- Colores desde configuración de Tailwind

### Git

```bash
# Branches
feature/nombre-feature
bugfix/nombre-bug
hotfix/nombre-hotfix

# Commits
feat: añadir autenticación de usuarios
fix: corregir cálculo de ROI
docs: actualizar README con instrucciones
style: ajustar espaciado en dashboard
refactor: simplificar hook useTransactions
```

## 🧪 Testing

Al añadir features:

1. Agregar tests unitarios
2. Probar en múltiples browsers
3. Verificar responsive design
4. Probar funcionalidad offline
5. Validar cálculos manualmente

## 📦 Deployment

Después de cambios:

```bash
# 1. Probar localmente
npm run build
npm run preview

# 2. Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push

# 3. Vercel desplegará automáticamente

# 4. Verificar en producción
```

## 🤝 Pull Requests

Si quieres contribuir:

1. Fork el repositorio
2. Crea una branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

¡Gracias por tu interés en mejorar Bet Tracker! 🎉

