/**
 * TABLA DE RAREZAS DEL RPG
 */
export const RAREZAS = {
    COMUN: {
        id: "comun",
        nombre: "Común",
        color: "§7",
        bonoDanioTexto: "+0%",
        multiplicadorDanioArma: 1.0,
        pesoLoot: 1
    },
    RARO: {
        id: "raro",
        nombre: "Raro",
        color: "§9",
        bonoDanioTexto: "+25% Daño Físico",
        multiplicadorDanioArma: 1.25,
        pesoLoot: 2
    },
    EPICO: {
        id: "epico",
        nombre: "Épico",
        color: "§5",
        bonoDanioTexto: "+60% Daño Físico",
        multiplicadorDanioArma: 1.60,
        pesoLoot: 3
    },
    LEGENDARIO: {
        id: "legendario",
        nombre: "Legendario",
        color: "§6",
        bonoDanioTexto: "+150% Daño Físico",
        multiplicadorDanioArma: 2.50,
        pesoLoot: 5
    }
};

/**
 * CONFIGURACIÓN DE BALANCE DE ESTADÍSTICAS Y COMBATE
 */
export const CONFIG_STATS = {
    nivelMaximo: 100,

    // Escalado de Mobs Estándar
    mob: {
        vidaExtraPorNivel: 4.0,     // +4 HP por nivel
        danioExtraPorNivel: 0.15    // +15% de daño base por nivel
    },

    // Escalado de Bosses Especiales
    boss: {
        probabilidadAparicion: 0.12,  // 12% de los mobs compatibles se coronan como Boss
        vidaExtraPorNivel: 18.0,      // +18 HP por nivel (HP masiva)
        danioExtraPorNivel: 0.40,     // +40% de daño base por nivel
        prefijoVisual: "§5[BOSS]§r ",
        intervaloEvalTicks: 60,       // Evaluar IA cada 3 segs
        rangoDeteccion: 16,
        cooldownTeleportSeg: 10,
        
        // Instakill si el jugador tiene armadura insuficiente
        instakill: {
            activo: true,
            minimoPiezasRequeridas: 3,
            mensaje: "§c¡Un Golpe Mortal del Boss te aniquiló por no llevar suficiente armadura!"
        },

        // Explosión Creeper Boss
        creeper: {
            radioBase: 3,
            radioMaximo: 9,
            causaFuego: true
        }
    },

    // Escalado de Jugador
    jugador: {
        xpBasePorNivel: 100,
        factorCrecimientoXP: 1.12,
        danioExtraPorNivel: 0.03, // +3% de daño por nivel (Nivel 50: x2.5, Nivel 100: x4.0)
        xpMultiplicadorBoss: 5
    },

    // Probabilidades de distribución de niveles en spawn
    probabilidadesNivelSpawn: {
        bajo: { min: 1, max: 20, prob: 0.60 },
        medio: { min: 21, max: 50, prob: 0.30 },
        alto: { min: 51, max: 99, prob: 0.09 },
        jefe: { min: 100, max: 100, prob: 0.01 }
    },

    // Probabilidad de tener afijos/efectos según el nivel del mob
    escaladoAfijos: [
        { nivelMin: 1, nivelMax: 15, probTener: 0.15, maxAfijos: 1 },
        { nivelMin: 16, nivelMax: 35, probTener: 0.35, maxAfijos: 1 },
        { nivelMin: 36, nivelMax: 65, probTener: 0.60, maxAfijos: 2 },
        { nivelMin: 66, nivelMax: 89, probTener: 0.85, maxAfijos: 3 },
        { nivelMin: 90, nivelMax: 100, probTener: 1.00, maxAfijos: 3 }
    ]
};

/**
 * CATÁLOGO DE MODIFICADORES / AFIJOS DE CRIATURAS
 */
export const CONFIG_AFIJOS = [
    {
        id: "fuerza_1",
        nombre: "Fuerte",
        etiqueta: "§4[Fuerza I]",
        nivelMinimo: 5,
        probabilidad: 0.35,
        efectos: [{ tipo: "strength", nivel: 1 }]
    },
    {
        id: "fuerza_2",
        nombre: "Colosal",
        etiqueta: "§4[Fuerza II]",
        nivelMinimo: 40,
        probabilidad: 0.20,
        efectos: [{ tipo: "strength", nivel: 2 }]
    },
    {
        id: "velocidad_1",
        nombre: "Veloz",
        etiqueta: "§b[Velocidad I]",
        nivelMinimo: 10,
        probabilidad: 0.35,
        efectos: [{ tipo: "speed", nivel: 1 }]
    },
    {
        id: "velocidad_2",
        nombre: "Centella",
        etiqueta: "§b[Velocidad II]",
        nivelMinimo: 45,
        probabilidad: 0.15,
        efectos: [{ tipo: "speed", nivel: 2 }]
    },
    {
        id: "resistencia",
        nombre: "Acorazado",
        etiqueta: "§8[Acorazado]",
        nivelMinimo: 20,
        probabilidad: 0.30,
        efectos: [{ tipo: "resistance", nivel: 1 }]
    },
    {
        id: "regeneracion",
        nombre: "Vampírico",
        etiqueta: "§d[Regeneración]",
        nivelMinimo: 30,
        probabilidad: 0.20,
        efectos: [{ tipo: "regeneration", nivel: 1 }]
    },
    {
        id: "salto",
        nombre: "Saltarín",
        etiqueta: "§a[Salto]",
        nivelMinimo: 15,
        probabilidad: 0.25,
        efectos: [{ tipo: "jump_boost", nivel: 2 }]
    },
    {
        id: "fuego",
        nombre: "Ígneo",
        etiqueta: "§6[Resistencia al Fuego]",
        nivelMinimo: 20,
        probabilidad: 0.30,
        efectos: [{ tipo: "fire_resistance", nivel: 1 }]
    },
    {
        id: "invisibilidad",
        nombre: "Espectral",
        etiqueta: "§7[Fantasmal]",
        nivelMinimo: 50,
        probabilidad: 0.10,
        efectos: [{ tipo: "invisibility", nivel: 1 }]
    }
];

/**
 * LISTAS DE CLASIFICACIÓN DE ENTIDADES
 */
export const FILTRO_ENTIDADES = {
    // Entidades excluidas de recibir niveles y estadísticas
    excluidas: [
        "minecraft:player",
        "minecraft:item",
        "minecraft:xp_orb",
        "minecraft:arrow",
        "minecraft:splash_potion",
        "minecraft:lingering_potion",
        "minecraft:snowball",
        "minecraft:egg",
        "minecraft:ender_pearl",
        "minecraft:eye_of_ender_signal",
        "minecraft:firework_rocket",
        "minecraft:trident",
        "minecraft:fishing_hook",
        "minecraft:lightning_bolt",
        "minecraft:tnt",
        "minecraft:falling_block",
        "minecraft:boat",
        "minecraft:chest_boat",
        "minecraft:minecart",
        "minecraft:chest_minecart",
        "minecraft:hopper_minecart",
        "minecraft:command_block_minecart",
        "minecraft:armor_stand",
        "minecraft:npc"
    ],

    // Mobs que pueden coronarse como BOSSES
    candidatosBoss: [
        "minecraft:zombie",
        "minecraft:skeleton",
        "minecraft:spider",
        "minecraft:creeper",
        "minecraft:drowned",
        "minecraft:husk",
        "minecraft:stray"
    ]
};
