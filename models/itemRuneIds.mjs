// All the items that are valid starting items, local storage.
// Used in dataBaseHelpers, when determining the starting item in an optimal build
export const startingItems = new Set([
    1054, // Doran's Shield
    1055, // Doran's Blade
    1056, // Doran's Ring
    1082, // Dark Seal
    1083, // Cull
    1101, // Scorchclaw Pup
    1102, // Gustwalker Hatchling
    1103, // Mosstomper Seedling
    2033, // Corrupting Potion
    3070, // Tear of the Goddess
    3850, // Spellthieef's Edge
    3854, // Steel Shoulderguards
    3858, // Relic Shield
    3862, // Spectral Sickle
    3865, // World Atlas
    3870, // Dream Maker
    3876, // Solstice Sleigh
]);

export const complexRunes = new Set([
    8230, // Phase Rush
    8360, // Unsealed Spellbook
    8345, // Biscuit Delivery
    8304, // Magical Footwear
    8306, // Hexteech Flashtraption
    8313, // Triple Tonic
])

// The local storage of the itemIds of allowed finished items
// Items that are too complex are removed from the list 
// This prevents too complex item from being recommended for a given champion
export const finishedItems = new Set([
    3001, // Evenshroud
    3003, // Archangel's Staff
    3004, // Manamune
    3005, // Ghostcrawlers
    3006, // Berserker's Greaves
    3009, // Boots of Swiftness
    3011, // Chemtech Putrifier
    3020, // Sorcerer's Shoes
    3026, // Guardian Angel
    3031, // Infinity Edge
    3033, // Mortal Reminder
    3036, // Lord Dominik's Regards
    3039, // Atma's Reckoning
    3040, // Seraph's Embrace
    3041, // Mejai's Soulstealer
    3042, // Muramana
    3046, // Phantom Dancer
    3047, // Plated Steelcaps
    // 3050, Zeke's Convergence removed due to complexity
    3053, // Sterak's Gage
    3065, // Spirit Visage
    3068, // Sunfire Aegis
    3071, // Black Cleaver
    3072, // Bloodthirster
    3073, // Experimental Hexplate
    // 3074, Ravenous Hydra removed due to complexity
    3075, // Thornmail
    3078, // Trinity Force
    3083, // Warmog's Armor
    // 3084, Heartsteel removed due to complexity
    3085, // Runaan's Hurricane
    3087, // Statikk Shiv
    3089, // Rabadon's Deathcap
    3091, // Wit's End
    3094, // Rapid Firecannon
    3095, // Stormrazor
    3100, // Lich Bane
    3102, // Banshee's Veil
    // 3107, Redemption removed due to complexity
    // 3109, Knight's Vow removed due to complexity
    3110, // Frozen Heart
    3111, // Mercury's Treads
    3115, // Nashor's Tooth
    3116, // Rylai's Crystal Scepter
    3117, // Mobility Boots
    3118, // Malignance
    3119, // Winter's Approach
    3124, // Guinsoo's Rageblade
    3128, // Deathfire Grasp
    3135, // Void Staff
    3137, // Cryptbloom
    // 3139, Mercurial Scimitar removed due to complexity
    // 3142, Youmuu's Ghostblade removed due to complexity
    // 3143, Randuin's Omen removed due to complexity
    3146, // Hextech Gunbalde
    // 3152, Hextech Rocketbelt removed due to complexity
    3153, // Blade of The Ruined King
    3156, // Maw of Malmortius
    // 3157, Zhonya's Hourglass removed due to complexity
    3158, // Ionian Boots of Lucidity
    3161, // Spear of Shojin
    3165, // Morellonomicon
    3172, // Zephyr
    3179, // Umbral Glaive
    3181, // Hullbreaker
    // 3190, Locket of the Iron Solari removed due to complexity
    // 3193, Gargoyle Stoneplate removed due to complexity
    // 3222, Mikael's Blessing removed due to complexity
    3302, // Terminus
    3430, // Rite Of Ruin
    3504, // Ardent Censer
    3508, // Essence Reaver
    3742, // Dead Man's Plate
    // 3748, Titanic Hydra removed due to complexity
    3814, // Edge of Night
    3857, // Pauldrons of Whiterock
    3860, // Bulwark of the Mountain
    3864, // Black Mist Scythe
    3871, // Zaz'Zak's Realmspike
    4004, // Spectral Cutlass
    4005, // Imperial Mandate
    4010, // BloodLetter's Curse
    4401, // Force of Nature
    4015, // Perplexity
    4628, // Horizon Focus
    4629, // Cosmic Drive
    4633, // Riftmaker
    4636, // Night Harvester
    4637, // Demonic Embrace
    4642, // Bandleglass Mirror
    4644, // Crown of the Shattered Queen
    4645, // Shadowflame
    4646, // Stormsurge
    6035, // Silvermere Dawn
    6333, // Death's Dance
    6609, // Chempunk Chainsword
    6610, // Sundered Sky
    6616, // Staff of Flowing Water
    6617, // Moonstone Renewer
    6620, // Echoes of Helia
    6621, // Dawncore
    // 6630, Goredrinker removed due to complexity
    // 6631, Stridebreaker removed due to complexity
    6632, // Divine Sunderer
    6653, // Liandry's Torment
    6655, // Luden's Companion
    // 6656, Everfrost removed due to complexity
    6657, // Rod of Ages
    6662, // Iceborn Gauntlet
    6664, // Hollow Radiance
    6665, // Jak'Sho, The Protean
    6667, // Radiant Virtue
    // 6671, Galeforce removed due to complexity
    6672, // Kraken Slayer
    6673, // Immortal Shieldbow
    6675, // Navori Quickblades
    6676, // The Collector
    6691, // Duskblade of Draktharr
    6692, // Eclipse
    6693, // Prowler's Claw
    6694, // Serylda's Grudge
    6695, // Serpent's Fang
    6696, // Axiom Arc
    6697, // Hunris
    // 6698, Profane Hydra removed due to complexity
    6699, // Voltaic Cyclosword
    6701, // Opportunity
    7000, // Sandshrike's Claw
    7001, // Syzygy
    7002, // Draktharr's Shadowcarver
    7019, // Reliquary of the Golden Dawn
    // 7020, Shurelya's Requiem removed due to complexity
    7021, // Starcaster
    7037, // Obsidian Cleaver
    7038, // Shojin's Resolve
    7040, // Eye of the Storm
    7050, // Gangplank Placeholder
    8001, // Anathema's Chains
    8020, // Abyssal Mask
]);
