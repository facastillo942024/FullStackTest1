# Checkout Web — Frontend

SPA de checkout construida con **React + TypeScript + Redux Toolkit** (arquitectura Flux). Mobile-first, resiliente ante recargas mediante `localStorage`, y con validación de tarjeta (Luhn + detección de franquicia) del lado del cliente. Consume el backend REST bajo `/api`.

**En producción:** https://fullstackfecc.duckdns.org

---

## Tabla de contenido

- [Stack](#stack)
- [Flujo de 5 pantallas](#flujo-de-5-pantallas)
- [Arquitectura de estado](#arquitectura-de-estado)
- [Resiliencia y seguridad](#resiliencia-y-seguridad)
- [Puesta en marcha](#puesta-en-marcha)
- [Pruebas y cobertura](#pruebas-y-cobertura)
- [Responsive](#responsive)

---

## Stack

| Aspecto | Tecnología |
| :--- | :--- |
| UI | React 18 + TypeScript |
| Estado | Redux Toolkit (Flux) + react-redux |
| HTTP | Axios |
| Build | Vite 5 |
| Pruebas | Jest + React Testing Library |
| Estilos | CSS mobile-first (Flexbox / Grid) |

---

## Flujo de 5 pantallas

El flujo se modela como una máquina de estados (`checkout.step`) sobre la que se renderiza el catálogo como base y cada paso como overlay:

1. **Catálogo** (`ProductCatalog`): producto, descripción, precio y stock disponible.
2. **Modal de pago y envío** (`PaymentModal`): datos de tarjeta (validación Luhn + logo Visa/MasterCard en vivo) y datos de cliente/entrega. Al enviar, crea la transacción `PENDING`.
3. **Resumen / Backdrop** (`SummaryBackdrop`): desglose de producto + tarifa base + envío, y botón de pago.
4. **Procesamiento** (`ProcessingScreen`): spinner mientras la pasarela procesa.
5. **Resultado** (`ResultScreen`): estado final (Aprobado / Rechazado / Error) y retorno al catálogo con el stock actualizado.

```
catalog ──▶ form ──▶ summary ──▶ processing ──▶ result ──▶ (catalog con stock fresco)
```

---

## Arquitectura de estado

Dos slices de Redux Toolkit:

- **`products`**: catálogo, carga y errores. Thunk `fetchProducts`.
- **`checkout`**: paso actual del flujo, datos del formulario, cantidad, transacción y estado de envío. Thunks `createTransaction` y `payTransaction`.

La lógica de dominio (validaciones, formato de dinero) vive en `src/domain/` desacoplada de React, lo que la hace fácil de testear al 100%.

---

## Resiliencia y seguridad

- **Persistencia en `localStorage`**: el progreso del checkout se guarda en cada cambio, de modo que una recarga de página restaura el paso y los datos. Al volver al catálogo sin transacción, se limpia.
- **Los datos de la tarjeta nunca se persisten**: se mantienen solo en memoria durante el flujo y se descartan tras procesar el pago.

---

## Puesta en marcha

### Requisitos

- Node.js 20+
- El backend corriendo en `http://localhost:3000` (Vite hace proxy de `/api`).

### Pasos

```bash
npm install
cp .env.example .env   # opcional; por defecto usa /api con proxy
npm run dev            # http://localhost:5173
```

### Scripts

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción (`tsc -b && vite build`) |
| `npm run preview` | Previsualiza el build |
| `npm test` | Ejecuta las pruebas |
| `npm run test:cov` | Pruebas + cobertura |
| `npm run lint` | ESLint |

En producción, Nginx sirve el build estático y mapea `/api` al backend, por lo que no se requiere configuración adicional de CORS.

---

## Pruebas y cobertura

```bash
npm run test:cov
```

Resultado (Jest + RTL, 17 suites / 91 pruebas):

| Métrica | Cobertura |
| :--- | :---: |
| Statements | **97.84 %** |
| Branches | **89.18 %** |
| Functions | **96.66 %** |
| Lines | **98.22 %** |

Cubre: validaciones de dominio (Luhn, franquicia, envío, dinero), ambos slices de Redux (reducers y thunks), persistencia en `localStorage`, la capa de API (mockeada), y el render/interacción de los componentes y las 5 pantallas.

---

## Responsive

Diseño **mobile-first** con referencia mínima iPhone SE (375 px de ancho):

- Catálogo en grid de 1 columna en móvil, 2 en ≥640 px y 3 en ≥900 px.
- Los modales se muestran como *bottom sheet* en móvil y centrados en escritorio.
- Uso de Flexbox y CSS Grid, sin desbordamientos horizontales.
