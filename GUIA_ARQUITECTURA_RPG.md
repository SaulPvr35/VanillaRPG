# Guía Maestra y Arquitectura: Addon RPG MCPE

Documento técnico y de referencia rápida para el desarrollo, mantenimiento y escalabilidad del Addon RPG para **Minecraft Bedrock Edition** utilizando la Scripting API (`@minecraft/server`).

---

## 1. Reglas y Convenciones del Proyecto

Para mantener el código ordenado, predecible y fácil de expandir:

1. **Modularidad estricta y Desacoplamiento**:
   - Nunca escribir toda la lógica en un solo archivo ni en `main.js`.
   - Cada entidad, lógica o subsistema debe encapsularse en su respectiva clase o módulo dentro de `clases/`, `config/` o `sistemas/`.
2. **Convención de Idioma**:
   - **Español**: Nombres de variables, clases, métodos propios, archivos creados y comentarios (`EntidadRPG`, `generarNivel`, `configStats.js`, `gestorLoot.js`).
   - **Inglés**: Únicamente funciones, métodos y propiedades nativas de la API de Bedrock (`world.afterEvents.entitySpawn`, `getComponent("minecraft:health")`, `nameTag`, etc.).
3. **Centralización del Balance (Single Source of Truth)**:
   - **Estadísticas y Balance**: Residen en [`configStats.js`](file:///c:/Users/palom/Documents/VSC/Mine/MiAddonRPG/BP_RPG/scripts/config/configStats.js) (curvas de vida, daño, multiplicadores, afijos, XP de jugador).
   - **Tablas de Botín y Probabilidades**: Residen en [`configDrops.js`](file:///c:/Users/palom/Documents/VSC/Mine/MiAddonRPG/BP_RPG/scripts/config/configDrops.js) (drops de enemigos, cofres del mundo, pesca).
   - [`variablesGlobales.js`](file:///c:/Users/palom/Documents/VSC/Mine/MiAddonRPG/BP_RPG/scripts/config/variablesGlobales.js) actúa como fachada unificadora para mantener retrocompatibilidad.
4. **Resiliencia y Manejo de Errores**:
   - Todo listener o evento que interactúe con entidades del mundo debe estar contenido en bloques `try...catch`.
   - El fallo de una entidad o cofre individual jamás debe detener o romper el ciclo del addon completo.

---

## 2. Estructura de Directorios Actualizada

```text
MiAddonRPG/
├── RP_RPG/                              # Resource Pack (Texturas, textos, modelos)
│   ├── manifest.json                    # Manifiesto con módulo "resources"
│   ├── pack_icon.png                    # Icono del paquete de recursos
│   └── texts/
│       └── es_MX.lang                   # Traducciones y cadenas localizadas
│
├── BP_RPG/                              # Behavior Pack (Lógica y scripts)
│   ├── manifest.json                    # Manifiesto con módulo "script" (@minecraft/server 1.14.0)
│   ├── pack_icon.png                    # Icono del paquete de comportamientos
│   └── scripts/
│       ├── main.js                      # Punto de entrada (inicialización de todos los subsistemas)
│       ├── config/
│       │   ├── configStats.js           # Balance de stats (mobs, bosses, afijos, jugador, rarezas)
│       │   ├── configDrops.js           # Tablas de botín (enemigos, cofres del mundo, pesca)
│       │   └── variablesGlobales.js     # Fachada unificada exportadora
│       ├── clases/
│       │   ├── EntidadRPG.js            # Modelo de criaturas (vida escalada, niveles 1-100, afijos)
│       │   └── ObjetoRPG.js             # Generador de ItemStacks (rarezas, lore, encantamientos nativos)
│       └── sistemas/
│           ├── generadorNiveles.js      # Spawns, combate, instakill por armadura y daño escalado
│           ├── sistemaJugadorRPG.js     # Nivel del jugador (Lv. 1-100), XP por victoria y +3% daño/lvl
│           ├── armasRPG.js              # Irrompibilidad 100% y minería en área 3x3 para picos legendarios
│           ├── gestorLoot.js            # Drops escalados al morir enemigos y drops vanilla multiplicados
│           ├── cofresYPescaRPG.js       # Inyección de botín en cofres naturales y pesca con caña
│           └── habilidadesBoss.js       # Teletransporte táctico a espaldas y auras debilitantes
└── GUIA_ARQUITECTURA_RPG.md             # Este documento
```

---

## 3. Módulos y Responsabilidades

### 3.1. Configuración (`scripts/config/`)
| Archivo | Responsabilidad |
| :--- | :--- |
| **`configStats.js`** | Define multiplicadores de vida/daño para mobs (+4 HP/lvl) y Bosses (+18 HP/lvl), probabilidades de spawn de nivel (1-100), catálogo de afijos y progresión de XP del jugador (+3% daño/lvl). |
| **`configDrops.js`** | Tablas de recompensas por rareza (Común, Raro, Épico, Legendario), libros encantados nativos (*Filo VI/VII, Saqueo V, Fortuna IV*) y probabilidades de cofres/pesca. |
| **`variablesGlobales.js`** | Enruta y expone `CONFIG_RPG` manteniendo compatibilidad sin modificar imports en sistemas existentes. |

### 3.2. Clases (`scripts/clases/`)
| Archivo | Responsabilidad |
| :--- | :--- |
| **`EntidadRPG.js`** | Encapsula cualquier criatura de Minecraft. Asigna su nivel (1 a 100), vida matemática, afijos proporcionales al nivel y nameTag multilínea: `[Lv. X] Nombre [Afijos]` y `❤ VidaActual/VidaTotal | ⚔ Daño`. |
| **`ObjetoRPG.js`** | Construye `ItemStack` con componente `minecraft:enchantable` real, etiquetas de color, descripción de lore y bonificadores de daño (+25%, +60%, +150%). |

### 3.3. Sistemas y Eventos (`scripts/sistemas/`)
| Archivo | Responsabilidad |
| :--- | :--- |
| **`generadorNiveles.js`** | Escucha `entitySpawn` para detectar cualquier mob vivo automáticamente y `entityHurt` para procesar el daño real (integrando el nivel del jugador y bonos de armas). |
| **`sistemaJugadorRPG.js`** | Controla el nivel RPG del jugador (1 a 100). Guarda XP mediante `DynamicProperties`, avisa al subir de nivel y multiplica el daño saliente. |
| **`armasRPG.js`** | Detecta rotura de bloques con picos Legendarios para minar en área **3x3 (9 bloques)** y repara el desgaste a 0 para garantizar **Irrompibilidad al 100%**. |
| **`gestorLoot.js`** | Al morir un mob (`entityDie`), premia al jugador con XP, multiplica los drops vanilla naturales según nivel y genera ítems RPG según la rareza. |
| **`cofresYPescaRPG.js`** | Inyecta botín arcano en cofres naturales al abrirlos por primera vez (40% prob) y permite pescar tesoros arcanos con caña (8% prob). |
| **`habilidadesBoss.js`** | Bucle de IA periódico (`system.runInterval`): teletransporta al Boss si el jugador se aleja a más de 7 bloques y activa auras de lentitud y ceguera. |

---

## 4. Guía Rápida para Modificar y Escalar el Addon

### ¿Cómo agregar un nuevo Afijo/Efecto a los Mobs?
Abre [`configStats.js`](file:///c:/Users/palom/Documents/VSC/Mine/MiAddonRPG/BP_RPG/scripts/config/configStats.js) y añade un nuevo objeto al arreglo `CONFIG_AFIJOS`:
```javascript
{
    id: "veneno",
    nombre: "Tóxico",
    etiqueta: "§2[Veneno]",
    nivelMinimo: 30,
    probabilidad: 0.25,
    efectos: [{ tipo: "poison", nivel: 1 }]
}
```

### ¿Cómo agregar un nuevo Drop o Libro Arcano?
Abre [`configDrops.js`](file:///c:/Users/palom/Documents/VSC/Mine/MiAddonRPG/BP_RPG/scripts/config/configDrops.js) y agrega el ítem dentro de la rareza deseada (`RARO`, `EPICO` o `LEGENDARIO`):
```javascript
{
    item: "minecraft:enchanted_book",
    min: 1,
    max: 1,
    nombre: "Grimorio de Protección Suprema",
    opciones: { encantamientoIlegal: { idNativo: "protection", nombre: "Protección", nivelRomano: "VI", nivelNumerico: 6 } }
}
```

### ¿Cómo ajustar la dificultad o vida de los Bosses?
En [`configStats.js`](file:///c:/Users/palom/Documents/VSC/Mine/MiAddonRPG/BP_RPG/scripts/config/configStats.js), sección `CONFIG_STATS.boss`:
- Modifica `vidaExtraPorNivel` (actualmente `18.0`).
- Modifica `probabilidadAparicion` (actualmente `0.12` = 12%).
- Ajusta o desactiva el instakill en `instakill.activo` o `minimoPiezasRequeridas`.

---

## 5. Empaquetado y Distribución (.mcaddon)

Para compilar el addon tras cualquier cambio y actualizar el archivo de instalación directa:
```powershell
./empaquetar.ps1
```
El script generará el archivo [`MiAddonRPG.mcaddon`](file:///c:/Users/palom/Documents/VSC/Mine/MiAddonRPG.mcaddon) listo para importar con doble clic en Minecraft Bedrock.
