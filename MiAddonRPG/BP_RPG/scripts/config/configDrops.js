/**
 * CONFIGURACIÓN CENTRALIZADA DE TABLAS DE DROPS, COFRES Y PESCA
 */
export const CONFIG_DROPS = {
    // Tasas generales de botín en enemigos
    enemigos: {
        probabilidadDropBase: 0.35,  // 35% base
        probabilidadDropBoss: 0.90,  // 90% garantizado en Bosses
        bonoMaximoPorNivel: 0.40,    // +40% a nivel 100
        multiplicadorVanillaPorNivel: 20 // Cada 20 niveles suelta +1 drop vanilla natural
    },

    // Tasas de aparición en Exploración y Pesca
    cofresYPesca: {
        probabilidadCofreGenerarLoot: 0.40, // 40% al abrir cofre nuevo
        probabilidadPescaLoot: 0.08,        // 8% al pescar con caña
        distribucionRarezas: {
            legendario: 0.04, // 4% (Extremadamente raro)
            epico: 0.18,      // 18%
            raro: 0.45        // 45% (El resto es común/recursos)
        }
    },

    // Catálogo de Drops clasificados por Rareza
    tablasPorRareza: {
        COMUN: [
            { item: "minecraft:iron_nugget", min: 1, max: 4, nombre: "Fragmento de Hierro RPG" },
            { item: "minecraft:coal", min: 1, max: 2, nombre: "Carbón Refinado" },
            { item: "minecraft:raw_copper", min: 1, max: 3, nombre: "Cobre Arcano" },
            { item: "minecraft:arrow", min: 4, max: 8, nombre: "Flecha Reforzada" }
        ],
        RARO: [
            { item: "minecraft:iron_ingot", min: 1, max: 3, nombre: "Lingote Templado" },
            { item: "minecraft:gold_ingot", min: 1, max: 2, nombre: "Oro Purificado" },
            { item: "minecraft:lapis_lazuli", min: 2, max: 5, nombre: "Gema de Lapislázuli" },
            { item: "minecraft:iron_sword", min: 1, max: 1, nombre: "Espada Rara de Hierro" },
            { item: "minecraft:iron_pickaxe", min: 1, max: 1, nombre: "Pico Raro de Explorador" },
            {
                item: "minecraft:enchanted_book",
                min: 1,
                max: 1,
                nombre: "Tomo de Afilado Mayor",
                opciones: { encantamientoIlegal: { idNativo: "sharpness", nombre: "Filo", nivelRomano: "V", nivelNumerico: 5 } }
            }
        ],
        EPICO: [
            { item: "minecraft:diamond", min: 1, max: 2, nombre: "Diamante Prístino" },
            { item: "minecraft:emerald", min: 2, max: 4, nombre: "Esmeralda Antigua" },
            { item: "minecraft:golden_apple", min: 1, max: 1, nombre: "Manzana Dorada Bendecida" },
            { item: "minecraft:diamond_sword", min: 1, max: 1, nombre: "Hoja Épica del Héroe" },
            { item: "minecraft:diamond_pickaxe", min: 1, max: 1, nombre: "Pico Épico del Minero Profundo" },
            {
                item: "minecraft:enchanted_book",
                min: 1,
                max: 1,
                nombre: "Tomo Prohibido de Afilado",
                opciones: { encantamientoIlegal: { idNativo: "sharpness", nombre: "Filo", nivelRomano: "VI", nivelNumerico: 6 } }
            },
            {
                item: "minecraft:enchanted_book",
                min: 1,
                max: 1,
                nombre: "Tomo Arcano de Poder",
                opciones: { encantamientoIlegal: { idNativo: "power", nombre: "Poder", nivelRomano: "VI", nivelNumerico: 6 } }
            }
        ],
        LEGENDARIO: [
            { item: "minecraft:netherite_scrap", min: 1, max: 2, nombre: "Fragmento Ancestral del Vacío" },
            { item: "minecraft:enchanted_golden_apple", min: 1, max: 1, nombre: "Fruto de los Dioses" },
            { item: "minecraft:totem_of_undying", min: 1, max: 1, nombre: "Reliquia de Inmortalidad" },
            { item: "minecraft:diamond_sword", min: 1, max: 1, nombre: "Segadora Legendaria del Abismo" },
            { item: "minecraft:diamond_pickaxe", min: 1, max: 1, nombre: "Destructor Sísmico de Mundos" },
            {
                item: "minecraft:enchanted_book",
                min: 1,
                max: 1,
                nombre: "Grimorio Ancestral de Filo",
                opciones: { encantamientoIlegal: { idNativo: "sharpness", nombre: "Filo", nivelRomano: "VII", nivelNumerico: 7 } }
            },
            {
                item: "minecraft:enchanted_book",
                min: 1,
                max: 1,
                nombre: "Grimorio Arcano de Saqueo",
                opciones: { encantamientoIlegal: { idNativo: "looting", nombre: "Saqueo", nivelRomano: "V", nivelNumerico: 5 } }
            },
            {
                item: "minecraft:enchanted_book",
                min: 1,
                max: 1,
                nombre: "Tomo Supremo de Fortuna",
                opciones: { encantamientoIlegal: { idNativo: "fortune", nombre: "Fortuna", nivelRomano: "IV", nivelNumerico: 4 } }
            }
        ]
    }
};
