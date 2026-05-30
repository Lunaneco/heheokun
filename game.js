/**
 * へへおくん - 血圧真拳アクション (横スクロール版)
 * ゲームメインスクリプト
 */

// --- 音響効果クラス (Web Audio API を使用した動的シンセサイズ) ---
class SoundEffects {
    constructor() {
        this.ctx = null;
        this.enabled = false;
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.enabled = true;
        } catch (e) {
            console.warn("Web Audio API がサポートされていません", e);
        }
    }

    playTone(frequency, type, duration, volume = 0.1) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHit() {
        this.playTone(180, 'triangle', 0.08, 0.2);
        setTimeout(() => this.playTone(90, 'sawtooth', 0.06, 0.15), 40);
    }

    playStrongHit() {
        this.playTone(120, 'sawtooth', 0.15, 0.25);
        setTimeout(() => this.playTone(60, 'sawtooth', 0.12, 0.2), 60);
    }

    playCoinThrow() {
        this.playTone(950, 'sine', 0.08, 0.12);
        setTimeout(() => this.playTone(1300, 'sine', 0.08, 0.08), 30);
    }

    playCoinHit() {
        this.playTone(1050, 'sine', 0.04, 0.12);
        this.playTone(1400, 'sine', 0.06, 0.08);
    }

    playHurt() {
        this.playTone(90, 'sawtooth', 0.18, 0.25);
    }

    playHeartbeat(rateFactor) {
        const pitch = 55 + rateFactor * 35;
        this.playTone(pitch, 'sine', 0.15, 0.25);
        setTimeout(() => this.playTone(pitch * 0.8, 'sine', 0.12, 0.15), 140);
    }

    playRevolution() {
        let now = 0;
        for (let i = 0; i < 7; i++) {
            setTimeout(() => {
                this.playTone(180 + i * 140, 'sawtooth', 0.12, 0.15);
            }, now);
            now += 70;
        }
        setTimeout(() => {
            this.playTone(80, 'triangle', 0.6, 0.35);
        }, now);
    }

    playDodge() {
        this.playTone(350, 'triangle', 0.08, 0.12);
    }

    playMeasureStart() {
        this.playTone(400, 'sine', 0.25, 0.08);
        setTimeout(() => this.playTone(500, 'sine', 0.25, 0.08), 120);
    }

    playMeasureSuccess() {
        this.playTone(880, 'sine', 0.08, 0.12);
        setTimeout(() => this.playTone(880, 'sine', 0.08, 0.12), 120);
    }
}

const sounds = new SoundEffects();

const spriteFrame = (x, y, w, h) => ({
    frame: { x, y, w, h },
    spriteSourceSize: { x: 0, y: 0, w, h },
    sourceSize: { w, h }
});

const HEHEOKUN_FRAME_FALLBACKS = {
    heheokun_1: spriteFrame(0, 9, 272, 200),
    heheokun_18: spriteFrame(109, 222, 77, 106),
    heheokun_22: spriteFrame(579, 225, 69, 101),
    heheokun_23: spriteFrame(740, 225, 73, 101),
    heheokun_24: spriteFrame(829, 225, 69, 101),
    heheokun_25: spriteFrame(912, 225, 78, 101),
    heheokun_26: spriteFrame(1005, 225, 70, 101),
    heheokun_27: spriteFrame(493, 232, 76, 94),
    heheokun_28: spriteFrame(660, 230, 62, 96),
    heheokun_30: spriteFrame(100, 347, 76, 88),
    heheokun_31: spriteFrame(197, 348, 76, 87),
    heheokun_32: spriteFrame(293, 348, 74, 85),
    heheokun_33: spriteFrame(387, 349, 75, 84),
    heheokun_34: spriteFrame(493, 351, 75, 83),
    heheokun_35: spriteFrame(594, 351, 78, 84),
    heheokun_36: spriteFrame(690, 348, 79, 85),
    heheokun_37: spriteFrame(792, 349, 75, 84),
    heheokun_38: spriteFrame(891, 348, 73, 85),
    heheokun_39: spriteFrame(990, 348, 67, 85),
    heheokun_42: spriteFrame(417, 447, 89, 86),
    heheokun_43: spriteFrame(120, 455, 78, 78),
    heheokun_44: spriteFrame(216, 451, 77, 82),
    heheokun_45: spriteFrame(313, 454, 81, 79),
    heheokun_46: spriteFrame(517, 453, 90, 80),
    heheokun_47: spriteFrame(623, 456, 105, 77),
    heheokun_48: spriteFrame(906, 454, 104, 79),
    heheokun_52: spriteFrame(169, 546, 108, 98),
    heheokun_53: spriteFrame(285, 553, 101, 91),
    heheokun_57: spriteFrame(395, 556, 93, 88),
    heheokun_58: spriteFrame(83, 564, 78, 79),
    heheokun_60: spriteFrame(208, 650, 70, 86),
    heheokun_61: spriteFrame(296, 658, 74, 77),
    heheokun_62: spriteFrame(103, 663, 86, 73),
    heheokun_63: spriteFrame(397, 659, 76, 76),
    heheokun_64: spriteFrame(606, 658, 72, 77),
    heheokun_66: spriteFrame(495, 664, 87, 72),
    heheokun_67: spriteFrame(693, 682, 104, 55),
    heheokun_68: spriteFrame(817, 690, 108, 46),
    heheokun_69: spriteFrame(943, 702, 139, 36),
    heheokun_70: spriteFrame(6, 745, 181, 107),
    heheokun_71: spriteFrame(417, 748, 69, 104),
    heheokun_72: spriteFrame(218, 753, 75, 99),
    heheokun_73: spriteFrame(308, 757, 86, 95),
    heheokun_74: spriteFrame(513, 753, 64, 99),
    heheokun_75: spriteFrame(605, 752, 67, 100),
    heheokun_76: spriteFrame(778, 748, 78, 104),
    heheokun_77: spriteFrame(697, 753, 67, 99),
    heheokun_79: spriteFrame(100, 871, 35, 36),
    heheokun_80: spriteFrame(152, 871, 34, 36),
    heheokun_81: spriteFrame(204, 871, 35, 37),
    heheokun_82: spriteFrame(256, 871, 35, 37),
    heheokun_83: spriteFrame(306, 871, 35, 37),
    heheokun_84: spriteFrame(358, 871, 35, 37),
    heheokun_85: spriteFrame(410, 871, 34, 37),
    heheokun_86: spriteFrame(461, 871, 35, 37),
    heheokun_87: spriteFrame(515, 872, 35, 37),
    heheokun_88: spriteFrame(570, 873, 35, 36),
    heheokun_89: spriteFrame(624, 873, 34, 37),
    heheokun_110: spriteFrame(60, 962, 75, 21),
    heheokun_115: spriteFrame(392, 1016, 71, 78),
    heheokun_122: spriteFrame(702, 1063, 25, 22),
    heheokun_123: spriteFrame(816, 1063, 23, 22),
    heheokun_124: spriteFrame(925, 1063, 23, 22),
    heheokun_125: spriteFrame(917, 1098, 166, 84),
    heheokun_135: spriteFrame(7, 1166, 216, 24),
    heheokun_136: spriteFrame(750, 1182, 194, 117),
    heheokun_137: spriteFrame(651, 1187, 92, 106),
    heheokun_138: spriteFrame(396, 1194, 93, 105),
    heheokun_139: spriteFrame(5, 1201, 97, 90),
    heheokun_140: spriteFrame(109, 1206, 42, 64),
    heheokun_141: spriteFrame(255, 1202, 126, 93),
    heheokun_142: spriteFrame(502, 1199, 143, 100),
    heheokun_143: spriteFrame(133, 1207, 94, 85),
    heheokun_144: spriteFrame(203, 1216, 40, 83)
};

// --- アセット管理マネージャー ---
class AssetManager {
    constructor() {
        this.spriteSheet = new Image();
        this.spriteData = null;
        this.loaded = false;
        this.images = {};
        this.imageSources = {
            stage: 'stage.png',
            thug: 'tinpira.png',
            solicitor: 'gyanburukanyu.png',
            heckler: 'ketuatuaori.png',
            coinHunter: 'coingari.png',
            boss1: 'boss1.png',
            boss2: 'boss2.png',
            boss3: 'boss3.png',
            boss4: 'boss4.png',
            boss5: 'boss5.png'
        };
    }

    async load(onProgress, onLoad) {
        try {
            onProgress(8);
            const response = await fetch('sprites.json');
            this.spriteData = await response.json();
            this.spriteData.frames = {
                ...HEHEOKUN_FRAME_FALLBACKS,
                ...(this.spriteData.frames || {})
            };
        } catch (error) {
            console.error("主人公スプライトJSONのロードエラー:", error);
            this.spriteData = { frames: HEHEOKUN_FRAME_FALLBACKS };
        }

        const imageTasks = [
            this.loadImageElement('heheokun.png', (img) => {
                this.spriteSheet = img;
            }),
            ...Object.entries(this.imageSources).map(([key, src]) => {
                return this.loadImageElement(src, (img) => {
                    this.images[key] = img;
                });
            })
        ];

        let completed = 0;
        await Promise.all(imageTasks.map(task => task.then(() => {
            completed++;
            onProgress(8 + Math.floor((completed / imageTasks.length) * 92));
        })));

        this.loaded = true;
        onProgress(100);
        onLoad();
    }

    loadImageElement(src, onImage) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                onImage(img);
                resolve();
            };
            img.onerror = () => {
                console.error(`${src} のロードに失敗。フォールバックで続行。`);
                resolve();
            };
            img.src = src;
        });
    }

    getImage(name) {
        if (name === 'heheokun') return this.spriteSheet;
        return this.images[name];
    }

    getFrameData(name) {
        if (this.spriteData && this.spriteData.frames && this.spriteData.frames[name]) {
            return this.spriteData.frames[name];
        }
        if (HEHEOKUN_FRAME_FALLBACKS[name]) {
            return HEHEOKUN_FRAME_FALLBACKS[name];
        }
        // フォールバック用のダミー構造
        return {
            frame: { x: 0, y: 0, w: 32, h: 32 },
            spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
            sourceSize: { w: 32, h: 32 }
        };
    }
}

const assets = new AssetManager();

const fr = (x, y, w, h, pivotX = 0.5) => ({ x, y, w, h, pivotX });

const STAGES = [
    {
        name: '夜の商店街',
        rect: fr(24, 40, 1074, 273),
        bossType: 'boss1',
        bossName: '焼肉大将',
        waves: [
            ['thug', 'thug', 'coinHunter'],
            ['thug', 'solicitor', 'coinHunter', 'heckler']
        ]
    },
    {
        name: '裏路地血圧ロード',
        rect: fr(24, 351, 1074, 238),
        bossType: 'boss2',
        bossName: '煽り番長',
        waves: [
            ['heckler', 'thug', 'solicitor'],
            ['heckler', 'heckler', 'coinHunter', 'thug']
        ]
    },
    {
        name: '地下ゲーム場入口',
        rect: fr(24, 625, 1074, 236),
        bossType: 'boss3',
        bossName: '地下カジノ支配人',
        waves: [
            ['solicitor', 'solicitor', 'coinHunter'],
            ['solicitor', 'heckler', 'coinHunter', 'coinHunter']
        ]
    },
    {
        name: '高架下コイン抗争',
        rect: fr(24, 896, 1074, 252),
        bossType: 'boss4',
        bossName: 'コイン回収王',
        waves: [
            ['coinHunter', 'coinHunter', 'thug'],
            ['coinHunter', 'heckler', 'thug', 'solicitor', 'coinHunter']
        ]
    },
    {
        name: '賭博ビル最上階',
        rect: fr(24, 1184, 1074, 215),
        bossType: 'boss5',
        bossName: '賭博街の親玉',
        waves: [
            ['thug', 'heckler', 'coinHunter', 'solicitor'],
            ['coinHunter', 'solicitor', 'heckler', 'thug', 'coinHunter']
        ]
    }
];

const CHARACTER_SPRITES = {
    thug: {
        sheet: 'thug',
        displayName: 'チンピラ',
        scale: 0.62,
        portrait: fr(10, 16, 290, 190),
        frames: {
            idle: [fr(142, 262, 90, 143), fr(255, 262, 90, 143), fr(371, 258, 79, 147), fr(484, 253, 79, 151), fr(590, 254, 88, 150), fr(698, 255, 80, 148), fr(798, 254, 87, 150), fr(894, 255, 80, 149), fr(983, 255, 80, 149)],
            walk: [fr(132, 425, 88, 133), fr(240, 423, 88, 131), fr(360, 423, 85, 133), fr(478, 420, 90, 135), fr(595, 420, 89, 134), fr(707, 420, 88, 132), fr(825, 422, 95, 135), fr(940, 421, 87, 133)],
            punch: [fr(156, 574, 88, 138), fr(266, 597, 102, 115), fr(378, 580, 94, 131), fr(497, 586, 90, 125), fr(603, 584, 101, 126), fr(730, 571, 206, 140, 0.35), fr(956, 612, 121, 99, 0.35)],
            special: [fr(152, 740, 124, 98), fr(289, 740, 125, 97), fr(430, 741, 130, 97), fr(574, 742, 168, 96, 0.35), fr(729, 734, 241, 104, 0.35)],
            hurt: [fr(158, 866, 78, 111), fr(266, 868, 93, 111), fr(381, 870, 96, 108), fr(499, 871, 85, 106), fr(610, 869, 105, 109), fr(740, 880, 87, 97), fr(852, 907, 104, 70), fr(975, 912, 98, 64)],
            down: [fr(150, 1006, 86, 91), fr(267, 1026, 85, 65), fr(376, 1021, 102, 70), fr(501, 1038, 115, 51), fr(633, 1046, 114, 45), fr(768, 1049, 133, 43), fr(933, 1049, 143, 43)]
        }
    },
    solicitor: {
        sheet: 'solicitor',
        displayName: 'ギャンブル勧誘員',
        scale: 0.70,
        portrait: fr(18, 12, 280, 190),
        frames: {
            idle: [fr(137, 242, 69, 123), fr(230, 242, 73, 124), fr(335, 243, 72, 123), fr(447, 245, 75, 120), fr(557, 245, 78, 119), fr(683, 244, 71, 122), fr(789, 242, 71, 123), fr(887, 242, 70, 123), fr(988, 243, 66, 122)],
            walk: [fr(121, 395, 80, 111), fr(230, 397, 82, 109), fr(338, 397, 81, 109), fr(449, 395, 86, 111), fr(559, 393, 81, 113), fr(668, 393, 82, 111), fr(796, 396, 77, 109), fr(895, 398, 77, 107), fr(991, 395, 70, 110)],
            punch: [fr(134, 531, 84, 114), fr(229, 536, 89, 110), fr(335, 534, 85, 111), fr(433, 535, 95, 108), fr(539, 536, 102, 108), fr(639, 540, 91, 105), fr(739, 532, 160, 114, 0.35), fr(895, 525, 174, 121, 0.35)],
            special: [fr(157, 686, 156, 83), fr(341, 688, 159, 76), fr(529, 691, 168, 77, 0.35), fr(685, 687, 80, 82), fr(785, 675, 77, 99), fr(877, 684, 89, 86), fr(979, 677, 80, 92)],
            hurt: [fr(158, 811, 74, 107), fr(279, 807, 87, 109), fr(385, 809, 89, 106), fr(507, 809, 91, 106), fr(618, 810, 94, 105), fr(727, 818, 84, 97), fr(837, 808, 110, 108), fr(955, 841, 109, 77)],
            down: [fr(243, 1071, 118, 77), fr(372, 1076, 97, 73), fr(473, 1082, 140, 74), fr(712, 1065, 120, 91), fr(846, 1079, 104, 78), fr(959, 1080, 111, 74)]
        }
    },
    heckler: {
        sheet: 'heckler',
        displayName: '血圧煽り屋',
        scale: 0.78,
        portrait: fr(16, 10, 270, 190),
        frames: {
            idle: [fr(130, 220, 91, 97), fr(248, 220, 58, 95), fr(341, 220, 73, 94), fr(452, 220, 62, 94), fr(547, 220, 106, 94), fr(678, 220, 58, 94), fr(781, 220, 69, 95), fr(876, 220, 74, 95), fr(972, 220, 72, 95)],
            walk: [fr(121, 327, 93, 102), fr(239, 328, 77, 100), fr(348, 328, 73, 100), fr(454, 327, 69, 101), fr(562, 328, 65, 100), fr(663, 327, 76, 101), fr(778, 328, 70, 99), fr(889, 328, 64, 99), fr(989, 328, 69, 101)],
            punch: [fr(146, 453, 87, 129), fr(259, 446, 106, 137), fr(361, 444, 109, 138), fr(474, 444, 93, 138), fr(556, 445, 98, 138), fr(650, 446, 91, 135), fr(738, 443, 93, 139), fr(824, 434, 81, 147), fr(907, 440, 167, 142, 0.35)],
            special: [fr(164, 602, 121, 104), fr(288, 600, 131, 107), fr(421, 603, 128, 107), fr(556, 602, 118, 107), fr(682, 600, 139, 110, 0.35), fr(825, 603, 106, 107), fr(926, 606, 145, 101, 0.35)],
            hurt: [fr(155, 736, 99, 101), fr(278, 727, 96, 111), fr(422, 736, 86, 102), fr(540, 730, 103, 108), fr(658, 746, 85, 93), fr(754, 751, 88, 88), fr(852, 760, 93, 79), fr(957, 783, 110, 62)],
            down: [fr(148, 991, 91, 77), fr(244, 997, 152, 62), fr(414, 995, 81, 67), fr(673, 988, 77, 86), fr(757, 990, 82, 80), fr(847, 991, 82, 78), fr(984, 990, 83, 80)]
        }
    },
    coinHunter: {
        sheet: 'coinHunter',
        displayName: 'コイン狩り',
        scale: 0.72,
        portrait: fr(14, 12, 270, 190),
        frames: {
            idle: [fr(109, 220, 96, 109), fr(221, 220, 66, 109), fr(301, 220, 93, 109), fr(417, 220, 87, 110), fr(526, 220, 88, 109), fr(648, 220, 97, 107), fr(773, 220, 74, 107), fr(877, 220, 80, 108), fr(982, 220, 78, 108)],
            walk: [fr(124, 344, 84, 104), fr(223, 343, 85, 105), fr(323, 343, 88, 105), fr(431, 344, 82, 104), fr(523, 343, 85, 105), fr(626, 344, 81, 104), fr(723, 343, 82, 104), fr(820, 343, 84, 104), fr(919, 343, 85, 106), fr(1005, 343, 76, 106)],
            punch: [fr(125, 466, 92, 101), fr(225, 463, 83, 103), fr(335, 467, 114, 100), fr(455, 463, 133, 104, 0.4), fr(580, 464, 103, 103, 0.4), fr(691, 480, 300, 87, 0.25), fr(994, 467, 80, 101)],
            special: [fr(126, 603, 147, 86), fr(286, 605, 171, 84, 0.35), fr(474, 607, 171, 83, 0.35), fr(665, 609, 120, 84), fr(776, 615, 143, 71), fr(928, 605, 126, 88)],
            hurt: [fr(152, 729, 95, 110), fr(276, 732, 93, 106), fr(394, 735, 94, 103), fr(510, 734, 106, 105), fr(632, 736, 89, 106), fr(729, 741, 89, 103), fr(851, 752, 108, 90), fr(966, 771, 100, 73)],
            down: [fr(129, 876, 119, 76), fr(266, 879, 100, 72), fr(382, 883, 105, 68), fr(495, 894, 135, 59), fr(637, 905, 146, 54), fr(785, 910, 153, 51), fr(959, 922, 106, 35)]
        }
    },
    boss1: {
        sheet: 'boss1',
        displayName: '焼肉大将',
        scale: 0.72,
        portrait: fr(8, 12, 270, 190),
        frames: {
            idle: [fr(136, 220, 129, 127), fr(283, 220, 116, 127), fr(406, 220, 112, 127), fr(539, 220, 115, 126), fr(676, 220, 101, 128), fr(799, 220, 121, 127), fr(940, 220, 115, 127)],
            walk: [fr(112, 355, 111, 110), fr(229, 361, 98, 105), fr(338, 360, 99, 106), fr(446, 360, 104, 105), fr(562, 360, 93, 106), fr(665, 351, 94, 114), fr(770, 360, 92, 103), fr(872, 354, 93, 111), fr(968, 359, 91, 106)],
            punch: [fr(137, 472, 196, 97, 0.35), fr(326, 472, 148, 97, 0.38), fr(490, 473, 164, 96, 0.35), fr(653, 472, 112, 97), fr(759, 471, 317, 97, 0.25)],
            special: [fr(128, 678, 119, 91), fr(248, 679, 103, 90), fr(358, 678, 99, 91), fr(468, 682, 109, 87), fr(568, 682, 343, 87, 0.25), fr(915, 683, 160, 85, 0.35)],
            hurt: [fr(121, 983, 90, 92), fr(232, 988, 94, 87), fr(339, 984, 104, 91), fr(452, 983, 102, 93), fr(567, 984, 110, 91), fr(684, 988, 115, 88), fr(804, 993, 123, 83), fr(931, 988, 146, 89)],
            down: [fr(118, 1083, 108, 76), fr(234, 1082, 243, 78, 0.35), fr(484, 1080, 192, 77, 0.35), fr(635, 1104, 179, 54), fr(819, 1090, 149, 69), fr(971, 1093, 105, 60)]
        }
    },
    boss2: {
        sheet: 'boss2',
        displayName: '煽り番長',
        scale: 0.86,
        portrait: fr(8, 12, 270, 190),
        frames: {
            idle: [fr(115, 220, 76, 132), fr(214, 220, 76, 131), fr(316, 227, 66, 124), fr(393, 226, 80, 125), fr(494, 229, 93, 121), fr(595, 226, 90, 125), fr(693, 227, 86, 124), fr(787, 227, 89, 124), fr(883, 227, 90, 123), fr(987, 226, 85, 124)],
            walk: [fr(124, 357, 74, 90), fr(212, 357, 73, 90), fr(300, 358, 70, 89), fr(383, 358, 70, 92), fr(467, 359, 72, 88), fr(555, 357, 71, 90), fr(641, 356, 72, 91), fr(729, 357, 73, 90), fr(819, 357, 71, 90), fr(904, 357, 74, 89), fr(983, 357, 90, 90)],
            punch: [fr(148, 462, 94, 128), fr(256, 454, 118, 136), fr(372, 456, 133, 133), fr(509, 457, 126, 132), fr(641, 457, 124, 132), fr(773, 461, 111, 128), fr(893, 458, 183, 132, 0.35)],
            special: [fr(152, 603, 147, 90), fr(305, 605, 115, 88), fr(428, 607, 143, 86), fr(578, 598, 142, 93), fr(727, 602, 210, 93, 0.35), fr(946, 605, 126, 87)],
            hurt: [fr(145, 849, 87, 94), fr(249, 847, 89, 95), fr(358, 851, 90, 90), fr(462, 850, 88, 96), fr(575, 845, 83, 102), fr(673, 862, 95, 86), fr(777, 874, 135, 60), fr(921, 876, 152, 65)],
            down: [fr(83, 1121, 72, 86), fr(161, 1125, 73, 79), fr(233, 1126, 69, 78), fr(300, 1125, 70, 82), fr(363, 1125, 77, 81), fr(435, 1126, 74, 82), fr(505, 1127, 76, 76), fr(585, 1136, 58, 67)]
        }
    },
    boss3: {
        sheet: 'boss3',
        displayName: '地下カジノ支配人',
        scale: 0.86,
        portrait: fr(8, 8, 260, 190),
        frames: {
            idle: [fr(114, 220, 95, 90), fr(228, 220, 81, 90), fr(319, 220, 91, 90), fr(438, 220, 73, 90), fr(538, 220, 70, 88), fr(625, 220, 103, 90), fr(751, 220, 103, 90), fr(875, 220, 131, 90)],
            walk: [fr(106, 318, 86, 99), fr(194, 319, 85, 97), fr(279, 318, 87, 98), fr(369, 318, 89, 99), fr(467, 318, 92, 99), fr(580, 318, 93, 98), fr(688, 318, 81, 98), fr(784, 318, 78, 98), fr(870, 318, 69, 98), fr(942, 318, 95, 99)],
            punch: [fr(136, 421, 96, 107), fr(240, 423, 97, 104), fr(406, 419, 121, 107), fr(535, 425, 94, 101), fr(994, 468, 57, 60)],
            special: [fr(143, 533, 97, 106), fr(243, 535, 140, 104, 0.35), fr(484, 535, 188, 104, 0.3), fr(808, 533, 91, 96), fr(906, 535, 138, 103)],
            hurt: [fr(131, 805, 92, 101), fr(237, 806, 84, 101), fr(341, 808, 101, 98), fr(463, 808, 112, 99), fr(589, 802, 105, 105), fr(701, 809, 94, 99), fr(799, 814, 110, 93), fr(918, 849, 133, 60)],
            down: [fr(118, 1134, 96, 108), fr(217, 1148, 81, 94), fr(304, 1139, 61, 100), fr(365, 1135, 66, 103), fr(432, 1136, 125, 102), fr(557, 1139, 89, 103), fr(649, 1136, 80, 107), fr(731, 1137, 71, 106), fr(807, 1142, 59, 102), fr(880, 1163, 92, 66)]
        }
    },
    boss4: {
        sheet: 'boss4',
        displayName: 'コイン回収王',
        scale: 0.86,
        portrait: fr(8, 10, 270, 190),
        frames: {
            idle: [fr(142, 247, 105, 106), fr(254, 245, 109, 108), fr(385, 246, 123, 107), fr(514, 244, 97, 108), fr(620, 246, 115, 105), fr(740, 226, 113, 127), fr(861, 246, 107, 106), fr(971, 242, 100, 111)],
            walk: [fr(125, 372, 121, 93), fr(255, 373, 111, 91), fr(385, 372, 101, 91), fr(498, 373, 121, 91), fr(630, 374, 103, 90), fr(744, 373, 114, 90), fr(868, 369, 109, 93), fr(987, 371, 90, 93)],
            punch: [fr(149, 482, 130, 97), fr(280, 480, 597, 102, 0.2), fr(882, 477, 194, 102, 0.35)],
            special: [fr(150, 607, 185, 80), fr(348, 600, 168, 81), fr(507, 600, 178, 82), fr(681, 611, 179, 72, 0.35), fr(909, 605, 164, 78)],
            hurt: [fr(146, 894, 141, 96), fr(296, 888, 116, 102), fr(438, 894, 118, 96), fr(574, 890, 123, 104), fr(709, 890, 128, 103), fr(831, 899, 114, 87), fr(955, 902, 117, 89)],
            down: [fr(53, 1128, 184, 142), fr(121, 1136, 160, 134), fr(192, 1111, 258, 159, 0.35), fr(442, 1121, 114, 96), fr(550, 1128, 74, 85), fr(713, 1152, 144, 67)]
        }
    },
    boss5: {
        sheet: 'boss5',
        displayName: '賭博街の親玉',
        scale: 1.02,
        portrait: fr(8, 8, 270, 190),
        frames: {
            idle: [fr(103, 220, 115, 82), fr(229, 220, 124, 82), fr(346, 220, 111, 81), fr(464, 220, 110, 81), fr(572, 220, 100, 82), fr(672, 220, 101, 82), fr(784, 220, 96, 81), fr(868, 220, 119, 81), fr(990, 220, 89, 80)],
            walk: [fr(104, 319, 98, 82), fr(204, 320, 85, 80), fr(288, 320, 83, 81), fr(375, 319, 82, 82), fr(462, 321, 72, 79), fr(538, 321, 78, 80), fr(622, 321, 72, 79), fr(697, 321, 60, 79), fr(762, 321, 65, 79), fr(833, 321, 61, 79), fr(896, 321, 70, 79), fr(967, 320, 87, 80)],
            punch: [fr(91, 414, 77, 68), fr(177, 414, 67, 68), fr(255, 414, 68, 68), fr(330, 416, 65, 66), fr(424, 417, 78, 65), fr(511, 412, 70, 69), fr(593, 415, 79, 66), fr(673, 412, 166, 69, 0.35), fr(851, 480, 104, 69), fr(963, 479, 110, 70)],
            special: [fr(169, 669, 202, 113), fr(213, 646, 120, 138), fr(336, 644, 179, 150, 0.35), fr(516, 648, 204, 146, 0.35), fr(719, 649, 169, 144, 0.35), fr(893, 645, 185, 152, 0.35)],
            hurt: [fr(92, 804, 89, 81), fr(190, 803, 93, 83), fr(292, 801, 81, 86), fr(385, 801, 83, 86), fr(476, 805, 83, 89), fr(571, 805, 77, 82), fr(659, 801, 79, 88), fr(746, 809, 102, 78), fr(842, 842, 105, 46), fr(951, 853, 125, 39)],
            down: [fr(92, 1056, 57, 45), fr(160, 1119, 70, 59), fr(239, 1119, 79, 61), fr(324, 1115, 87, 65), fr(412, 1115, 90, 66), fr(505, 1115, 105, 67), fr(612, 1046, 100, 136), fr(715, 1048, 111, 137), fr(818, 1048, 79, 67), fr(901, 1050, 75, 64), fr(977, 1052, 92, 65)]
        }
    }
};

const ENEMY_STATS = {
    thug: { hp: 34, speed: 1.75, damage: 8, width: 38, height: 78, score: 120 },
    solicitor: { hp: 44, speed: 1.45, damage: 6, width: 36, height: 76, score: 180 },
    heckler: { hp: 38, speed: 1.65, damage: 7, width: 36, height: 78, score: 160 },
    coinHunter: { hp: 42, speed: 2.35, damage: 6, width: 34, height: 68, score: 220 },
    boss: { hp: 360, speed: 0.95, damage: 16, width: 84, height: 116, score: 4000 }
};

const BOSS_STAGE_STATS = {
    boss1: { hp: 320, speed: 0.85, damage: 16, score: 3500 },
    boss2: { hp: 360, speed: 1.0, damage: 14, score: 4200 },
    boss3: { hp: 420, speed: 0.9, damage: 18, score: 5200 },
    boss4: { hp: 460, speed: 1.15, damage: 16, score: 6200 },
    boss5: { hp: 620, speed: 0.9, damage: 20, score: 9999 }
};

const REVOLUTION_ATTACK_MULTIPLIER = 2;
const REVOLUTION_BUFF_DURATION = 900;
const REVOLUTION_HP_RECOVERY = 35;
const REVOLUTION_SYS_INCREASE = 25;
const REVOLUTION_DIA_INCREASE = 10;
const REVOLUTION_PUL_INCREASE = 18;

// --- 入力ハンドラークラス ---
class InputHandler {
    constructor() {
        this.keys = {};
        this.touchActive = false;
        
        this.padVector = { x: 0, y: 0 };
        this.buttons = {
            attack: false,
            coin: false,
            measure: false,
            dodge: false,
            revolution: false
        };

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    getKeyboardVector() {
        let x = 0;
        let y = 0;
        if (this.keys['a'] || this.keys['arrowleft']) x = -1;
        if (this.keys['d'] || this.keys['arrowright']) x = 1;
        if (this.keys['w'] || this.keys['arrowup']) y = -1;
        if (this.keys['s'] || this.keys['arrowdown']) y = 1;

        if (x !== 0 && y !== 0) {
            x *= 0.707;
            y *= 0.707;
        }
        return { x, y };
    }

    getMovementVector() {
        const kb = this.getKeyboardVector();
        if (kb.x !== 0 || kb.y !== 0) {
            return kb;
        }
        return this.padVector;
    }
}

const input = new InputHandler();

// --- パーティクル・特殊エフェクトクラス ---
class Particle {
    constructor(x, y, type, color = '#ff3b30', options = {}) {
        this.x = x;
        this.y = y;
        this.type = type; // 'aura', 'spark', 'shockwave', 'lightning', 'blood', 'cointrail'
        this.color = color;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.03;
        this.direction = options.direction || 1;
        this.angle = options.angle || 0;
        this.length = options.length || 34;
        this.width = options.width || 8;
        
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6 - (type === 'aura' ? 2.5 : 0);
        this.radius = Math.random() * 4 + 2;
        this.rotation = Math.random() * Math.PI * 2;

        if (type === 'shockwave') {
            this.radius = 12;
            this.vx = 0;
            this.vy = 0;
            this.decay = 0.025;
        } else if (type === 'lightning') {
            this.radius = 1;
            this.decay = 0.12;
            this.points = this.generateLightningPoints();
        } else if (type === 'blood') {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = -Math.random() * 5 - 2;
            this.decay = 0.02;
            this.radius = Math.random() * 3 + 1;
        } else if (type === 'dust') {
            this.vx = (Math.random() - 0.5) * 1.4 - this.direction * 0.45;
            this.vy = -Math.random() * 0.45;
            this.decay = 0.05;
            this.radius = Math.random() * 6 + 5;
        } else if (type === 'slash') {
            this.vx = 0;
            this.vy = 0;
            this.decay = 0.028;
            this.radius = 1;
        } else if (type === 'impact') {
            this.vx = 0;
            this.vy = 0;
            this.decay = 0.04;
            this.radius = Math.random() * 5 + 10;
        } else if (type === 'speedline') {
            this.vx = -this.direction * (Math.random() * 2 + 3);
            this.vy = (Math.random() - 0.5) * 0.5;
            this.decay = 0.09;
            this.length = options.length || 28;
        } else if (type === 'cointrail') {
            this.vx = -this.direction * (Math.random() * 2.2 + 1.6);
            this.vy = (Math.random() - 0.5) * 0.75;
            this.decay = options.decay || 0.035;
            this.radius = Math.random() * 3.8 + 2.6;
            this.length = options.length || 26;
        }
    }

    generateLightningPoints() {
        const pts = [{ x: 0, y: 0 }];
        let curX = 0;
        let curY = 0;
        const segments = 4;
        const length = 25;
        for (let i = 0; i < segments; i++) {
            curX += (Math.random() - 0.5) * 20;
            curY += (Math.random() * length);
            pts.push({ x: curX, y: curY });
        }
        return pts;
    }

    update() {
        if (this.type === 'blood') {
            this.vy += 0.25; // 重力
        } else if (this.type === 'dust') {
            this.radius += 0.35;
        }
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        if (this.type === 'shockwave') {
            this.radius += 8;
        }
    }

    draw(ctx, cameraX) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        if (this.type === 'shockwave') {
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x - cameraX, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'lightning') {
            // 黄色い電撃を描画 (heheokun_150 の代用としてのライン)
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(this.x - cameraX, this.y);
            this.points.forEach(pt => {
                ctx.lineTo(this.x + pt.x - cameraX, this.y + pt.y);
            });
            ctx.stroke();
        } else if (this.type === 'blood') {
            // 血しぶきスライス(heheokun_145)の代用
            ctx.fillStyle = '#ff2d55';
            ctx.beginPath();
            ctx.arc(this.x - cameraX, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'dust') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life * 0.45;
            ctx.beginPath();
            ctx.ellipse(this.x - cameraX, this.y + 2, this.radius * 1.35, this.radius * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'slash') {
            ctx.globalAlpha = Math.min(0.95, this.life * 1.6);
            ctx.lineCap = 'round';
            ctx.lineWidth = this.width;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 18;
            const sx = this.x - cameraX;
            const sy = this.y;
            const dir = this.direction;
            ctx.beginPath();
            ctx.moveTo(sx - dir * this.length * 0.42, sy + 17);
            ctx.quadraticCurveTo(
                sx + dir * this.length * 0.15,
                sy - 34,
                sx + dir * this.length * 0.72,
                sy - 10
            );
            ctx.stroke();
            ctx.lineWidth = Math.max(2, this.width * 0.35);
            ctx.strokeStyle = '#fff7c2';
            ctx.stroke();
            ctx.globalAlpha = this.life * 0.35;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(sx - dir * this.length * 0.35, sy + 12);
            ctx.quadraticCurveTo(sx + dir * this.length * 0.22, sy - 23, sx + dir * this.length * 0.62, sy - 5);
            ctx.quadraticCurveTo(sx + dir * this.length * 0.18, sy + 4, sx - dir * this.length * 0.35, sy + 12);
            ctx.fill();
        } else if (this.type === 'impact') {
            const sx = this.x - cameraX;
            const sy = this.y;
            ctx.globalAlpha = Math.min(1, this.life * 1.4);
            ctx.lineWidth = 2.5;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 16;
            for (let i = 0; i < 8; i++) {
                const a = (Math.PI * 2 / 8) * i + this.rotation;
                const inner = this.radius * 0.35;
                const outer = this.radius * (1.15 + (1 - this.life));
                ctx.beginPath();
                ctx.moveTo(sx + Math.cos(a) * inner, sy + Math.sin(a) * inner);
                ctx.lineTo(sx + Math.cos(a) * outer, sy + Math.sin(a) * outer);
                ctx.stroke();
            }
        } else if (this.type === 'cointrail') {
            const sx = this.x - cameraX;
            const sy = this.y;
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = this.life * 0.9;
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - this.direction * this.length, sy + Math.sin(this.rotation) * 3);
            ctx.stroke();
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = '#fff8c8';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - this.direction * this.length * 0.62, sy + Math.sin(this.rotation) * 2);
            ctx.stroke();
            ctx.fillStyle = '#fff8c8';
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(1, this.radius * this.life), 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'speedline') {
            ctx.globalAlpha = this.life * 0.8;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.x - cameraX, this.y);
            ctx.lineTo(this.x - cameraX + this.direction * this.length, this.y + Math.sin(this.rotation) * 3);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(this.x - cameraX, this.y, this.radius * (this.type === 'aura' ? this.life : 1), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// --- 必殺技巨大衝撃波エフェクトクラス (heheokun_136〜144の連番アニメーション) ---
class HugeExplosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.animTimer = 0;
        this.animFrame = 0;
        this.active = true;
        this.frames = [
            'heheokun_136', 'heheokun_137', 'heheokun_138', 'heheokun_139', 
            'heheokun_140', 'heheokun_141', 'heheokun_142', 'heheokun_143', 'heheokun_144'
        ];
    }

    update() {
        this.animTimer++;
        if (this.animTimer >= 4) {
            this.animTimer = 0;
            this.animFrame++;
            if (this.animFrame >= this.frames.length) {
                this.active = false;
            }
        }
    }

    draw(ctx, cameraX) {
        if (!this.active) return;
        const currentFrame = this.frames[this.animFrame];
        const frameData = assets.getFrameData(currentFrame);
        const f = frameData.frame;
        const sss = frameData.spriteSourceSize;
        const ss = frameData.sourceSize;

        ctx.save();
        ctx.translate(this.x - cameraX, this.y);
        ctx.shadowColor = '#ff3b30';
        ctx.shadowBlur = 15;

        // 足元中央基準
        const dx = sss.x - ss.w / 2;
        const dy = sss.y - ss.h;

        if (assets.loaded) {
            ctx.drawImage(
                assets.spriteSheet,
                f.x, f.y, f.w, f.h,
                dx, dy, f.w, f.h
            );
        } else {
            // フォールバック円形フェード
            ctx.fillStyle = 'rgba(255, 59, 48, 0.4)';
            ctx.beginPath();
            ctx.arc(0, -60, 80 * (1 - this.animFrame/10), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// --- プレイヤー（へへおくん）クラス ---
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.baseSpeed = 3.6;
        this.direction = 1;

        // ステータス
        this.hp = 100;
        this.maxHp = 100;
        this.coin = 20;
        this.maxCoin = 99;
        this.coinsSpent = 0;
        this.measuresDone = 0;
        
        // 血圧パラメータ
        this.sys = 120;
        this.dia = 80;
        this.pul = 72;
        this.bpState = 'NORMAL';
        this.maxSysReached = 120;

        // アクションとアニメーション状態
        this.state = 'idle';
        this.animTimer = 0;
        this.animFrame = 0;
        this.walkCycle = 0;
        this.walkBob = 0;
        this.walkDustTimer = 0;
        this.dashTimer = 0;
        this.dashVx = 0;
        this.dashVy = 0;
        this.attackFlashTimer = 0;
        this.attackFlashReach = 58;
        this.attackFlashColor = '#ffd700';
        this.attackImpactDone = false;
        this.revolutionBuffTimer = 0;
        
        // 各種クールダウン・入力バッファ
        this.actionCooldown = 0;
        this.measureTimer = 0;
        this.measureDuration = 90;
        this.invulnerableTimer = 0;

        // 3連コンボパンチ用の管理
        this.comboStage = 0; // 0:なし, 1:1段目, 2:2段目, 3:3段目
        this.comboInputBuffer = false;

        // 回避(ダッシュ)時の残像用スタック
        this.dashGhosts = [];

        // ピボット（足元中央）基準でブレなく動かすアニメーションマッピング
        this.frames = {
            idle: ['heheokun_18'],
            walk: ['heheokun_30', 'heheokun_31', 'heheokun_32', 'heheokun_33', 'heheokun_34', 'heheokun_35', 'heheokun_36', 'heheokun_37', 'heheokun_38', 'heheokun_39'],
            punch1: ['heheokun_43', 'heheokun_44', 'heheokun_45', 'heheokun_42'],
            punch2: ['heheokun_43', 'heheokun_45', 'heheokun_42', 'heheokun_44'],
            punch3: ['heheokun_44', 'heheokun_45', 'heheokun_42', 'heheokun_43'],
            coin: ['heheokun_45', 'heheokun_46', 'heheokun_47', 'heheokun_48'],
            charge: ['heheokun_52', 'heheokun_53'],
            special: ['heheokun_42', 'heheokun_43', 'heheokun_44', 'heheokun_45'],
            dodge: ['heheokun_42', 'heheokun_43', 'heheokun_44'],
            measure: ['heheokun_70', 'heheokun_71', 'heheokun_72', 'heheokun_73', 'heheokun_74', 'heheokun_75', 'heheokun_76', 'heheokun_77'],
            hurt: ['heheokun_60', 'heheokun_61', 'heheokun_62'],
            down: ['heheokun_63', 'heheokun_64', 'heheokun_66', 'heheokun_67', 'heheokun_68', 'heheokun_69'],
            wakeup: ['heheokun_57', 'heheokun_58']
        };

        this.dialogueText = "";
        this.dialogueTimer = 0;
    }

    say(text, duration = 120) {
        this.dialogueText = text;
        this.dialogueTimer = duration;
    }

    isRevolutionBuffActive() {
        return this.revolutionBuffTimer > 0;
    }

    applyAttackMultiplier(damage) {
        return Math.floor(damage * (this.isRevolutionBuffActive() ? REVOLUTION_ATTACK_MULTIPLIER : 1));
    }

    update(particles, projectiles, stageLength, hugeExplosions) {
        if (this.actionCooldown > 0) this.actionCooldown--;
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
        if (this.dialogueTimer > 0) this.dialogueTimer--;
        if (this.attackFlashTimer > 0) this.attackFlashTimer--;
        if (this.revolutionBuffTimer > 0) this.revolutionBuffTimer--;

        // 残像の更新
        this.dashGhosts.forEach(g => g.life -= 0.1);
        this.dashGhosts = this.dashGhosts.filter(g => g.life > 0);

        this.updateBloodPressureState();

        let speedMultiplier = 1.0;
        if (this.bpState === 'LOW') speedMultiplier = 0.7;
        if (this.bpState === 'HIGH') speedMultiplier = 1.15;
        if (this.bpState === 'DANGER' || this.bpState === 'MAX') speedMultiplier = 1.35;

        const moveVec = input.getMovementVector();

        // 状態制御
        if (this.state === 'idle' || this.state === 'walk') {
            const hasMoveInput = Math.abs(moveVec.x) > 0.05 || Math.abs(moveVec.y) > 0.05;
            const targetVx = moveVec.x * this.baseSpeed * speedMultiplier;
            const targetVy = moveVec.y * this.baseSpeed * speedMultiplier * 0.72;
            const accel = hasMoveInput ? 0.34 : 0.22;

            this.vx += (targetVx - this.vx) * accel;
            this.vy += (targetVy - this.vy) * accel;

            if (!hasMoveInput && Math.abs(this.vx) < 0.06) this.vx = 0;
            if (!hasMoveInput && Math.abs(this.vy) < 0.06) this.vy = 0;

            this.x += this.vx;
            this.y += this.vy;

            if (moveVec.x > 0.08 || this.vx > 0.35) this.direction = 1;
            if (moveVec.x < -0.08 || this.vx < -0.35) this.direction = -1;

            const moveSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.walkCycle += moveSpeed * 0.22;
            this.walkBob = moveSpeed > 0.2 ? Math.sin(this.walkCycle) * Math.min(2.4, moveSpeed * 0.55) : 0;

            if (moveSpeed > 0.2) {
                this.state = 'walk';
                this.walkDustTimer++;
                if (this.walkDustTimer >= 11) {
                    this.walkDustTimer = 0;
                    particles.push(new Particle(this.x - this.direction * 10, this.y - 2, 'dust', '#c7bda8', { direction: this.direction }));
                }
            } else {
                this.state = 'idle';
                this.walkDustTimer = 9;
            }

            // アクション判定
            if ((input.keys['j'] || input.buttons.attack) && this.actionCooldown <= 0) {
                input.buttons.attack = false;
                this.startPunch(particles);
            }
            else if ((input.keys['k'] || input.buttons.coin) && this.actionCooldown <= 0) {
                input.buttons.coin = false;
                this.throwCoin(projectiles, particles);
            }
            else if ((input.keys['i'] || input.buttons.dodge) && this.actionCooldown <= 0) {
                input.buttons.dodge = false;
                this.startDodge(particles);
            }
            else if ((input.keys[' '] || input.buttons.revolution) && this.actionCooldown <= 0) {
                input.buttons.revolution = false;
                this.triggerRevolution(projectiles, particles, hugeExplosions);
            }
            else if (input.keys['l'] || input.buttons.measure) {
                this.startMeasure();
            }
        }
        else if (this.state === 'measure') {
            this.vx = 0;
            this.vy = 0;
            
            const isPressing = input.keys['l'] || input.buttons.measure;
            if (!isPressing) {
                this.state = 'idle';
                this.measureTimer = 0;
            } else {
                this.measureTimer++;
                if (this.measureTimer % 24 === 0) {
                    sounds.playHeartbeat(0.3);
                    this.pul = Math.floor(66 + Math.random() * 8);
                }

                if (this.measureTimer >= this.measureDuration) {
                    this.sys = Math.floor(115 + Math.random() * 8);
                    this.dia = Math.floor(75 + Math.random() * 6);
                    this.pul = Math.floor(65 + Math.random() * 5);
                    this.state = 'idle';
                    this.measureTimer = 0;
                    input.buttons.measure = false;
                    this.measuresDone++;
                    sounds.playMeasureSuccess();
                    this.say("血圧正常値。よし、行ける。", 90);
                    for (let i = 0; i < 15; i++) {
                        particles.push(new Particle(this.x, this.y - 45, 'aura', '#4cd964'));
                    }
                }
            }
        }
        else if (this.state.startsWith('punch')) {
            // コンボ入力受付と先行入力
            if ((input.keys['j'] || input.buttons.attack) && this.animFrame >= 1) {
                input.buttons.attack = false;
                this.comboInputBuffer = true;
            }
            const lungeTable = {
                punch1: [0.25, 0.55, 0.85, 1.25],
                punch2: [0.35, 0.75, 1.1, 1.65],
                punch3: [0.45, 0.95, 1.55, 2.35]
            };
            const lunge = (lungeTable[this.state] || lungeTable.punch1)[this.animFrame] || 0.15;
            this.x += this.direction * lunge;
            this.vx = this.direction * lunge;
            this.vy = 0;
        }
        else if (this.state === 'coin') {
            const lunge = this.animFrame <= 1 ? 0.32 : 0.08;
            this.x += this.direction * lunge;
            this.vx = this.direction * lunge;
            this.vy = 0;
        }
        else if (this.state === 'special') {
            this.vx = 0;
            this.vy = 0;
        }
        else if (this.state === 'dodge') {
            this.x += this.dashVx;
            this.y += this.dashVy;
            this.dashVx *= 0.84;
            this.dashVy *= 0.84;
            this.dashTimer--;
            this.walkBob = Math.sin(this.dashTimer * 0.9) * 1.5;

            if (this.dashTimer % 2 === 0) {
                this.dashGhosts.push({ x: this.x, y: this.y, direction: this.direction, frameName: this.frames.dodge[Math.min(this.animFrame, this.frames.dodge.length - 1)], life: 0.8 });
                particles.push(new Particle(this.x - this.direction * 18, this.y - 28 + Math.random() * 18, 'speedline', '#7cc7ff', { direction: this.direction, length: 30 + Math.random() * 18 }));
            }

            if (this.dashTimer <= 0) {
                this.state = 'idle';
                this.animFrame = 0;
                this.vx = 0;
                this.vy = 0;
            }
        }
        else if (this.state === 'hurt') {
            this.x -= this.direction * 1.5;
            this.vx = 0;
            this.vy = 0;
        }
        else if (this.state === 'down') {
            this.vx = 0;
            this.vy = 0;
        }
        else if (this.state === 'wakeup') {
            this.vx = 0;
            this.vy = 0;
        }

        // 移動制限
        const minX = 20;
        const maxX = stageLength - 20;
        const minY = 210;
        const maxY = 330;
        
        if (this.x < minX) this.x = minX;
        if (this.x > maxX) this.x = maxX;
        if (this.y < minY) this.y = minY;
        if (this.y > maxY) this.y = maxY;

        // オーラエフェクト
        if (this.bpState === 'DANGER' || this.bpState === 'MAX' || this.bpState === 'LIMIT') {
            if (Math.random() < 0.35) {
                particles.push(new Particle(this.x + (Math.random() - 0.5) * 35, this.y - Math.random() * 70, 'aura', '#ff3b30'));
            }
        }

        if (this.isRevolutionBuffActive() && Math.random() < 0.45) {
            particles.push(new Particle(this.x + (Math.random() - 0.5) * 45, this.y - Math.random() * 78, 'aura', '#ff2d55'));
        }

        this.updateAnimation(particles);
        this.emitPunchImpactIfNeeded(particles);
    }

    updateBloodPressureState() {
        if (this.sys < 90) this.bpState = 'LOW';
        else if (this.sys <= 129) this.bpState = 'NORMAL';
        else if (this.sys <= 159) this.bpState = 'HIGH';
        else if (this.sys <= 189) this.bpState = 'DANGER';
        else if (this.sys <= 199) this.bpState = 'MAX';
        else this.bpState = 'LIMIT';

        if (this.sys > this.maxSysReached) {
            this.maxSysReached = this.sys;
        }
    }

    startPunch(particles) {
        this.state = 'punch1';
        this.comboStage = 1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.actionCooldown = 15;
        this.comboInputBuffer = false;
        this.attackImpactDone = false;

        this.sys += 2;
        this.dia += 1;
        this.pul += 1;
        sounds.playHit();
    }

    getPunchProfile() {
        if (this.state === 'punch2') {
            return { impactFrame: 3, reach: 58, height: 46, color: '#ffef8a' };
        }
        if (this.state === 'punch3') {
            return { impactFrame: 3, reach: 72, height: 48, color: '#ff9500' };
        }
        return { impactFrame: 3, reach: 48, height: 44, color: '#ffd700' };
    }

    emitPunchImpactIfNeeded(particles) {
        if (!this.state.startsWith('punch') || this.attackImpactDone) return;
        const punch = this.getPunchProfile();
        if (this.animFrame < punch.impactFrame) return;

        this.emitAttackWind(particles, punch.reach, punch.height, punch.color);
        this.attackImpactDone = true;
    }

    emitAttackWind(particles, reach, height, color) {
        this.attackFlashTimer = this.comboStage === 3 ? 16 : 13;
        this.attackFlashReach = reach;
        this.attackFlashColor = color;
        particles.push(new Particle(this.x + this.direction * reach, this.y - height, 'slash', color, {
            direction: this.direction,
            length: this.comboStage === 3 ? 92 : 72,
            width: this.comboStage === 3 ? 14 : 10
        }));
        particles.push(new Particle(this.x + this.direction * (reach * 0.55), this.y - 8, 'dust', '#d0c2aa', {
            direction: this.direction
        }));
    }

    throwCoin(projectiles, particles) {
        if (this.coin <= 0) {
            this.say("コインがない...", 60);
            return;
        }
        
        if (this.bpState === 'LIMIT') {
            this.dieByBloodPressure();
            return;
        }

        this.coin--;
        this.coinsSpent++;
        this.state = 'coin';
        this.comboStage = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.actionCooldown = 18;

        this.sys += 3;
        this.dia += 1;
        this.pul += 2;
        sounds.playCoinThrow();
        this.emitAttackWind(particles, 52, 52, '#ffd700');
        this.attackFlashTimer = 36;
        this.attackFlashReach = 58;
        const throwDirection = this.direction;

        // パンチと同じ腕を突き出す動きに合わせ、入力直後に安定してコイン射出
        const coinX = this.x + throwDirection * 30;
        const coinY = this.y - 55;

        let damage = 12;
        let speed = 5.2;
        let coinType = 'normal';
        let color = '#ffd700';

        if (this.bpState === 'HIGH') {
            coinType = 'pierce';
            damage = 18;
            speed = 6.8;
            color = '#ff9500';
            this.say("貫通コイン！", 45);
        } else if (this.bpState === 'DANGER' || this.bpState === 'MAX') {
            coinType = 'burst';
            damage = 25;
            speed = 8.4;
            color = '#ff3b30';
            this.say("爆裂コイン！", 45);
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(coinX, coinY, 'aura', '#ff3b30'));
            }
        }

        damage = this.applyAttackMultiplier(damage);

        particles.push(new Particle(coinX, coinY, 'impact', color));
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(coinX - throwDirection * i * 5, coinY + (Math.random() - 0.5) * 8, 'cointrail', color, {
                direction: throwDirection,
                length: 24 + i * 6,
                decay: 0.028
            }));
        }
        projectiles.push(new Projectile(coinX, coinY, throwDirection * speed, 0, damage, coinType, color, true));
    }

    startDodge(particles) {
        this.state = 'dodge';
        this.animFrame = 0;
        this.animTimer = 0;
        this.actionCooldown = 24;
        this.invulnerableTimer = 18;
        sounds.playDodge();

        // 残像追加
        this.dashGhosts.push({ x: this.x, y: this.y, direction: this.direction, frameName: this.frames.idle[0], life: 1.0 });

        const moveVec = input.getMovementVector();
        const dodgeSpeed = 12;
        if (moveVec.x !== 0 || moveVec.y !== 0) {
            this.dashVx = moveVec.x * dodgeSpeed;
            this.dashVy = moveVec.y * dodgeSpeed * 0.72;
            if (Math.abs(moveVec.x) > 0.08) this.direction = moveVec.x > 0 ? 1 : -1;
        } else {
            this.dashVx = this.direction * dodgeSpeed;
            this.dashVy = 0;
        }
        this.dashTimer = 9;

        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(this.x - this.direction * i * 8, this.y - 10 - Math.random() * 45, i % 2 === 0 ? 'speedline' : 'aura', '#007aff', {
                direction: this.direction,
                length: 28 + i * 3
            }));
        }
    }

    startMeasure() {
        this.state = 'measure';
        this.animFrame = 0;
        this.animTimer = 0;
        this.measureTimer = 0;
        sounds.playMeasureStart();
        this.say("血圧を測定する、動くな...", 90);
    }

    triggerRevolution(projectiles, particles, hugeExplosions) {
        if (this.sys < 160) {
            this.say("血圧が足りん... (160以上必要)", 60);
            return;
        }
        if (this.coin < 3) {
            this.say("コインが足りん... (3枚必要)", 60);
            return;
        }
        
        if (this.bpState === 'LIMIT') {
            this.dieByBloodPressure();
            return;
        }

        this.coin -= 3;
        this.coinsSpent += 3;
        this.state = 'special';
        this.animFrame = 0;
        this.animTimer = 0;
        this.actionCooldown = 90;
        this.invulnerableTimer = 70;

        this.revolutionBuffTimer = REVOLUTION_BUFF_DURATION;
        this.hp = Math.min(this.maxHp, this.hp + REVOLUTION_HP_RECOVERY);
        this.sys += REVOLUTION_SYS_INCREASE;
        this.dia += REVOLUTION_DIA_INCREASE;
        this.pul += REVOLUTION_PUL_INCREASE;
        this.updateBloodPressureState();

        sounds.playRevolution();
        this.say("血圧革命！15秒間、攻撃力2倍！HP回復！", 150);
        for (let i = 0; i < 16; i++) {
            particles.push(new Particle(this.x, this.y - 35, i % 2 === 0 ? 'aura' : 'spark', i % 2 === 0 ? '#ff2d55' : '#4cd964'));
        }

        // 画面中央にカットイン演出を設定するため、ゲームクラスでキャッチできるようにフラグを立てる
        this.revolutionCutsceneActive = true;
        this.revolutionCutsceneTimer = 80;

        // タメのあとに大爆発を発生させる
        setTimeout(() => {
            // 地面からの大オーラ爆発 (heheokun_136〜144) をプレイヤーの左右に配置
            hugeExplosions.push(new HugeExplosion(this.x, this.y));
            hugeExplosions.push(new HugeExplosion(this.x + 120, this.y));
            hugeExplosions.push(new HugeExplosion(this.x - 120, this.y));

            particles.push(new Particle(this.x, this.y - 40, 'shockwave', '#ff3b30'));

            // 衝撃波コインを全方位・貫通かつ超ダメージで飛ばす
            const waveDamage = this.applyAttackMultiplier(45);
            for (let angle = -0.3; angle <= 0.3; angle += 0.15) {
                const vx = Math.cos(angle) * this.direction * 12;
                const vy = Math.sin(angle) * 12;
                projectiles.push(new Projectile(this.x + this.direction * 30, this.y - 50, vx, vy, waveDamage, 'wave', '#ff2d55', true));
            }
        }, 600);
    }

    dieByBloodPressure() {
        this.state = 'down';
        this.animFrame = 0;
        this.animTimer = 0;
        this.hp = 0;
        this.sys = 220;
        this.say("血圧が... 限界突破...", 150);
        sounds.playHurt();
    }

    takeDamage(amount, sourceX, isHeavy = false) {
        if (this.state === 'down' || this.invulnerableTimer > 0) return;

        this.hp -= amount;
        this.sys += Math.floor(Math.random() * 6 + 4);
        this.dia += 2;
        this.pul += Math.floor(Math.random() * 5 + 3);
        this.updateBloodPressureState();

        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'down';
            this.animFrame = 0;
            this.animTimer = 0;
            sounds.playHurt();
            this.say("ここまでか...", 150);
        } else {
            if (isHeavy) {
                // 強攻撃なら地面に叩きつけられてから起き上がる！
                this.state = 'down';
                this.animFrame = 0;
                this.animTimer = 0;
                this.invulnerableTimer = 60;
                this.direction = this.x < sourceX ? 1 : -1;
                sounds.playHurt();
                this.say("ぐわあああ！", 60);
            } else {
                // 通常ノックバック
                this.state = 'hurt';
                this.animFrame = 0;
                this.animTimer = 0;
                this.invulnerableTimer = 35;
                this.direction = this.x < sourceX ? 1 : -1;
                sounds.playHurt();
                this.say("ぬうっ！", 45);
            }
        }
    }

    updateAnimation(particles = null) {
        const frames = this.frames[this.state];
        if (!frames) return;

        this.animTimer++;
        let frameSpeed = 6;
        if (this.state === 'idle') frameSpeed = 9;
        if (this.state === 'walk') frameSpeed = 5;
        if (this.state === 'coin') frameSpeed = 8;
        if (this.state === 'measure') frameSpeed = 9;
        if (this.state.startsWith('punch')) frameSpeed = 3;
        if (this.state === 'dodge') frameSpeed = 3;
        if (this.state === 'down') frameSpeed = 8;
        if (this.state === 'wakeup') frameSpeed = 8;

        if (this.animTimer >= frameSpeed) {
            this.animTimer = 0;
            this.animFrame++;

            if (this.animFrame >= frames.length) {
                if (this.state.startsWith('punch')) {
                    // コンボ接続チェック
                    if (this.comboInputBuffer && this.comboStage === 1) {
                        this.state = 'punch2';
                        this.comboStage = 2;
                        this.animFrame = 0;
                        this.comboInputBuffer = false;
                        this.attackImpactDone = false;
                        this.actionCooldown = 15;
                        sounds.playHit();
                    } else if (this.comboInputBuffer && this.comboStage === 2) {
                        this.state = 'punch3';
                        this.comboStage = 3;
                        this.animFrame = 0;
                        this.comboInputBuffer = false;
                        this.attackImpactDone = false;
                        this.actionCooldown = 20;
                        sounds.playStrongHit();
                    } else {
                        this.state = 'idle';
                        this.comboStage = 0;
                        this.animFrame = 0;
                    }
                } else if (this.state === 'special' || this.state === 'hurt' || this.state === 'coin') {
                    this.state = 'idle';
                    this.animFrame = 0;
                } else if (this.state === 'dodge') {
                    this.animFrame = frames.length - 1;
                } else if (this.state === 'down') {
                    if (this.hp > 0) {
                        // 地面に倒れ込んだあと、起き上がり(wakeup)ステートへ遷移
                        this.state = 'wakeup';
                        this.animFrame = 0;
                    } else {
                        // 力尽きた場合は倒れたまま
                        this.animFrame = frames.length - 1;
                    }
                } else if (this.state === 'wakeup') {
                    this.state = 'idle';
                    this.animFrame = 0;
                } else {
                    this.animFrame = 0;
                }
            }
        }
    }

    // 足元中央基準のナチュラルスプライト描画
    draw(ctx, cameraX) {
        // 残像描画
        this.dashGhosts.forEach(ghost => {
            ctx.save();
            ctx.globalAlpha = ghost.life * 0.35;
            ctx.translate(ghost.x - cameraX, ghost.y);
            if (ghost.direction === 1) ctx.scale(-1, 1);
            
            const gd = assets.getFrameData(ghost.frameName);
            const gf = gd.frame;
            ctx.filter = 'brightness(2.0) saturate(0.5)';
            ctx.drawImage(
                assets.spriteSheet,
                gf.x, gf.y, gf.w, gf.h,
                gd.spriteSourceSize.x - gd.sourceSize.w / 2, 
                gd.spriteSourceSize.y - gd.sourceSize.h, 
                gf.w, gf.h
            );
            ctx.restore();
        });

        const frames = this.frames[this.state];
        if (!frames) return;

        const currentFrameName = frames[this.animFrame % frames.length];
        const frameData = assets.getFrameData(currentFrameName);
        const f = frameData.frame;
        const sss = frameData.spriteSourceSize;
        const ss = frameData.sourceSize;

        // 足元の影を先に置くと、2.5D背景上でも接地感が出る。
        ctx.save();
        ctx.globalAlpha = 0.34;
        ctx.fillStyle = '#000';
        ctx.translate(this.x - cameraX, this.y + 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 24 + Math.abs(this.vx) * 1.8, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(this.x - cameraX, this.y + this.walkBob);
        
        if (this.direction === 1) {
            ctx.scale(-1, 1);
        }

        // 足元中央をピボット位置にした描画オフセット計算
        const dx = sss.x - ss.w / 2;
        const dy = sss.y - ss.h;

        // 高血圧時の赤い閃光
        if (this.bpState === 'DANGER' || this.bpState === 'MAX' || this.bpState === 'LIMIT') {
            ctx.shadowColor = '#ff3b30';
            ctx.shadowBlur = 10;
        }

        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        if (assets.loaded) {
            ctx.drawImage(
                assets.spriteSheet,
                f.x, f.y, f.w, f.h,
                dx, dy, f.w, f.h
            );
        } else {
            ctx.fillStyle = '#ff3b30';
            ctx.fillRect(-20, -80, 40, 80);
        }

        ctx.restore();

        if (this.attackFlashTimer > 0) {
            const alpha = Math.min(1, this.attackFlashTimer / 8);
            const sx = this.x - cameraX + this.direction * this.attackFlashReach;
            const sy = this.y - 48;
            const len = this.comboStage === 3 ? 92 : 72;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.lineCap = 'round';
            ctx.lineWidth = this.comboStage === 3 ? 12 : 9;
            ctx.strokeStyle = this.attackFlashColor;
            ctx.shadowColor = this.attackFlashColor;
            ctx.shadowBlur = 22;
            ctx.beginPath();
            ctx.moveTo(sx - this.direction * 38, sy + 20);
            ctx.quadraticCurveTo(sx + this.direction * 18, sy - 44, sx + this.direction * len, sy - 5);
            ctx.stroke();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#fff8c8';
            ctx.stroke();
            ctx.globalAlpha = alpha * 0.35;
            ctx.fillStyle = this.attackFlashColor;
            ctx.beginPath();
            ctx.moveTo(sx - this.direction * 30, sy + 13);
            ctx.quadraticCurveTo(sx + this.direction * 28, sy - 24, sx + this.direction * (len * 0.82), sy - 1);
            ctx.quadraticCurveTo(sx + this.direction * 15, sy + 8, sx - this.direction * 30, sy + 13);
            ctx.fill();
            ctx.restore();
        }

        // 吹き出し
        if (this.dialogueTimer > 0 && this.dialogueText) {
            ctx.save();
            ctx.font = '10px "DotGothic16", sans-serif';
            const textWidth = ctx.measureText(this.dialogueText).width;
            const bubbleX = Math.max(10, Math.min(640 - textWidth - 20, this.x - cameraX - textWidth / 2 - 10));
            const bubbleY = this.y - 120;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.5;
            
            ctx.beginPath();
            ctx.roundRect(bubbleX, bubbleY, textWidth + 20, 24, 6);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x - cameraX, bubbleY + 24);
            ctx.lineTo(this.x - cameraX - 5, bubbleY + 29);
            ctx.lineTo(this.x - cameraX + 5, bubbleY + 24);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.fillText(this.dialogueText, bubbleX + 10, bubbleY + 16);
            ctx.restore();
        }
    }
}

// --- 飛び道具（コイン・衝撃波）クラス ---
class Projectile {
    constructor(x, y, vx, vy, damage, type, color, isPlayerOwned) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.type = type; // 'normal', 'pierce', 'burst', 'wave'
        this.color = color;
        this.isPlayerOwned = isPlayerOwned;
        this.active = true;

        this.animTimer = 0;
        this.animFrame = 0;
        this.age = 0;
        
        // 通常コイン回転
        this.coinFrames = [
            'heheokun_79', 'heheokun_80', 'heheokun_81', 'heheokun_82', 
            'heheokun_83', 'heheokun_84', 'heheokun_85', 'heheokun_86', 
            'heheokun_87', 'heheokun_88', 'heheokun_89'
        ];
    }

    update(particles = null) {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        this.animTimer++;
        if (this.animTimer >= 3) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % this.coinFrames.length;
        }

        if (particles && this.isPlayerOwned && this.type !== 'wave' && Math.abs(this.vx) > 4) {
            const dir = Math.sign(this.vx) || 1;
            if (this.age % 2 === 0) {
                particles.push(new Particle(
                    this.x - dir * 14,
                    this.y + (Math.random() - 0.5) * 7,
                    'cointrail',
                    this.color,
                    {
                        direction: dir,
                        length: this.type === 'normal' ? 30 : 42,
                        decay: this.type === 'normal' ? 0.04 : 0.032
                    }
                ));
            }
            if (this.age % 4 === 0) {
                particles.push(new Particle(
                    this.x - dir * 5,
                    this.y + (Math.random() - 0.5) * 9,
                    'spark',
                    this.color
                ));
            }
        }

        if (this.x < -100 || this.x > 3500) {
            this.active = false;
        }
    }

    draw(ctx, cameraX) {
        ctx.save();
        ctx.translate(this.x - cameraX, this.y);
        if (Math.abs(this.vx) > 4 && this.type !== 'wave') {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.58;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.type === 'normal' ? 5 : 7;
            ctx.lineCap = 'round';
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 22;
            ctx.beginPath();
            ctx.moveTo(-Math.sign(this.vx) * 16, 0);
            ctx.lineTo(-Math.sign(this.vx) * 76, 0);
            ctx.stroke();
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = '#fff6b0';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-Math.sign(this.vx) * 10, 0);
            ctx.lineTo(-Math.sign(this.vx) * 44, 0);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'wave') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 38, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 18;
            ctx.fill();
        } else if (this.type === 'burst' || this.type === 'pierce') {
            // 残像付きコイン(heheokun_110)を使用
            const frameData = assets.getFrameData('heheokun_110');
            const f = frameData.frame;
            const sss = frameData.spriteSourceSize;
            const ss = frameData.sourceSize;

            if (this.vx < 0) ctx.scale(-1, 1); // 飛ぶ向きに反転

            if (assets.loaded) {
                ctx.save();
                ctx.scale(1.15, 1.15);
                ctx.drawImage(
                    assets.spriteSheet,
                    f.x, f.y, f.w, f.h,
                    sss.x - ss.w / 2, sss.y - ss.h / 2, f.w, f.h
                );
                ctx.restore();
            } else {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // 飛行中は固定フレームにしてブレを抑える
            const frameName = 'heheokun_79';
            const frameData = assets.getFrameData(frameName);
            const f = frameData.frame;
            const sss = frameData.spriteSourceSize;
            const ss = frameData.sourceSize;

            if (assets.loaded) {
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 16;
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                ctx.save();
                ctx.scale(1.3, 1.3);
                ctx.drawImage(
                    assets.spriteSheet,
                    f.x, f.y, f.w, f.h,
                    sss.x - ss.w / 2, sss.y - ss.h / 2, f.w, f.h
                );
                ctx.restore();
            } else {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

// --- 敵キャラクタークラス ---
class Enemy {
    constructor(x, y, type, variant = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.variant = variant;
        this.spriteKey = type === 'boss' ? (variant || 'boss1') : type;
        this.spriteDef = CHARACTER_SPRITES[this.spriteKey] || CHARACTER_SPRITES.thug;
        this.vx = 0;
        this.vy = 0;

        this.direction = -1;
        this.active = true;
        this.animTimer = 0;
        this.animFrame = 0;

        const baseStats = { ...ENEMY_STATS[type] };
        if (type === 'boss') {
            Object.assign(baseStats, BOSS_STAGE_STATS[this.spriteKey] || BOSS_STAGE_STATS.boss1);
            this.scale = 1.15;
        }

        this.hp = baseStats.hp;
        this.maxHp = baseStats.hp;
        this.speed = baseStats.speed;
        this.damage = baseStats.damage;
        this.width = baseStats.width;
        this.height = baseStats.height;
        this.scoreValue = baseStats.score;
        this.state = 'walk';
        this.actionTimer = 0;
        this.invulnerableTimer = 0;
        this.attackCooldown = 0;
        this.solicitCooldown = 0;
        this.bossAttackCooldown = 0;
        this.dashCooldown = 0;
        this.downTimer = 0;
        this.stolenCoins = 0;
        this.frames = this.spriteDef.frames;

        this.dialogueText = "";
        this.dialogueTimer = 0;
    }

    say(text, duration = 90) {
        this.dialogueText = text;
        this.dialogueTimer = duration;
    }

    update(player, particles, projectiles, hugeExplosions) {
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
        if (this.dialogueTimer > 0) this.dialogueTimer--;
        if (this.solicitCooldown > 0) this.solicitCooldown--;
        if (this.bossAttackCooldown > 0) this.bossAttackCooldown--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.dashCooldown > 0) this.dashCooldown--;

        if (this.state === 'down') {
            this.downTimer++;
            this.updateAnimation();
            if (this.downTimer >= 90) {
                this.active = false;
            }
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dx > 5) this.direction = 1;
        if (dx < -5) this.direction = -1;

        if (this.state === 'hurt') {
            this.x -= this.direction * 0.8;
            this.actionTimer--;
            if (this.actionTimer <= 0) {
                this.state = 'walk';
            }
            this.updateAnimation();
            return;
        }

        if (this.state === 'punch' || this.state === 'special') {
            this.vx = 0;
            this.vy = 0;
            this.updateAnimation();
            return;
        }

        if (this.type === 'thug') {
            this.chasePlayer(dx, dy, dist, 44);
            if (dist <= 48 && this.attackCooldown <= 0) {
                this.startMeleeAttack(player, particles, 46, 165, '#ffd700');
                this.attackCooldown = 70;
            }
        } else if (this.type === 'solicitor') {
            this.chasePlayer(dx, dy, dist, 88);
            if (dist <= 95 && this.solicitCooldown <= 0) {
                this.state = 'punch';
                this.animFrame = 0;
                this.animTimer = 0;
                this.solicitCooldown = 130;
                this.say("いい話あるぜ？", 75);
                setTimeout(() => {
                    if (!this.active || this.state === 'down') return;
                    player.sys += 9;
                    player.pul += 5;
                    player.updateBloodPressureState();
                    projectiles.push(new Projectile(this.x + this.direction * 28, this.y - 50, this.direction * 5.8, 0, this.damage, 'pierce', '#ff2dff', false));
                    for (let i = 0; i < 7; i++) {
                        particles.push(new Particle(this.x, this.y - 45, 'aura', '#a020f0'));
                    }
                }, 210);
            }
        } else if (this.type === 'heckler') {
            this.chasePlayer(dx, dy, dist, 120);
            if (dist <= 130 && this.attackCooldown <= 0) {
                this.state = 'special';
                this.animFrame = 0;
                this.animTimer = 0;
                this.attackCooldown = 115;
                this.say("血圧上げてこーぜ!!", 80);
                setTimeout(() => {
                    if (!this.active || this.state === 'down') return;
                    projectiles.push(new Projectile(this.x + this.direction * 35, this.y - 58, this.direction * 6.5, 0, this.damage, 'wave', '#ff2d55', false));
                    player.sys += 5;
                    player.updateBloodPressureState();
                    particles.push(new Particle(this.x + this.direction * 35, this.y - 40, 'shockwave', '#ff2d55'));
                }, 260);
            }
        } else if (this.type === 'coinHunter') {
            this.chasePlayer(dx, dy, dist, 58);
            if (dist <= 130 && this.dashCooldown <= 0 && Math.abs(dy) < 55) {
                this.state = 'special';
                this.animFrame = 0;
                this.animTimer = 0;
                this.dashCooldown = 125;
                this.attackCooldown = 60;
                this.x += this.direction * 62;
                this.say("落としたぜェ！", 55);
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x - this.direction * i * 8, this.y - 20, 'aura', '#ffd700'));
                }
                if (Math.abs(player.x - this.x) < 52 && Math.abs(player.y - this.y) < 45) {
                    const stolen = Math.min(3, player.coin);
                    player.coin -= stolen;
                    this.stolenCoins += stolen;
                    player.takeDamage(this.damage, this.x, false);
                    player.say(stolen > 0 ? "コインを奪われた！" : "懐を探られた！", 70);
                }
            } else if (dist <= 48 && this.attackCooldown <= 0) {
                this.startMeleeAttack(player, particles, 40, 140, '#ffd700');
                this.attackCooldown = 80;
            }
        } else if (this.type === 'boss') {
            this.chasePlayer(dx, dy, dist, 150);
            if (dist <= 165 && this.bossAttackCooldown <= 0) {
                this.startBossAttack(player, particles, projectiles, hugeExplosions);
            }
        }

        this.updateAnimation();
    }

    chasePlayer(dx, dy, dist, stopDistance) {
        if (dist > stopDistance) {
            const safeDist = Math.max(1, dist);
            this.vx = (dx / safeDist) * this.speed;
            this.vy = (dy / safeDist) * this.speed;
            this.x += this.vx;
            this.y += this.vy;
            this.state = 'walk';
        } else {
            this.vx = 0;
            this.vy = 0;
            this.state = 'idle';
        }
    }

    startMeleeAttack(player, particles, reach, delay, color) {
        this.state = 'punch';
        this.animFrame = 0;
        this.animTimer = 0;
        setTimeout(() => {
            if (!this.active || this.state !== 'punch') return;
            const hit = Math.abs(player.x - (this.x + this.direction * reach)) < 45 && Math.abs(player.y - this.y) < 50;
            if (hit) {
                player.takeDamage(this.damage, this.x, Math.random() < 0.18);
                particles.push(new Particle(player.x, player.y - 42, 'lightning', color));
            }
        }, delay);
    }

    startBossAttack(player, particles, projectiles, hugeExplosions) {
        this.bossAttackCooldown = this.spriteKey === 'boss5' ? 92 : 110;
        const roll = Math.random();

        if (roll < 0.45) {
            this.state = 'punch';
            this.animFrame = 0;
            this.animTimer = 0;
            this.say(this.spriteKey === 'boss1' ? "脂も血圧も上げてやる！" : "賭け金だ、受け取れ！", 70);
            setTimeout(() => {
                if (!this.active || this.state !== 'punch') return;
                const count = this.spriteKey === 'boss5' ? 5 : 3;
                for (let i = 0; i < count; i++) {
                    const spread = (i - (count - 1) / 2) * 0.9;
                    projectiles.push(new Projectile(this.x + this.direction * 46, this.y - 66 + spread * 8, this.direction * (6.4 + i * 0.35), spread, this.damage, 'normal', '#ffd700', false));
                }
            }, 220);
        } else {
            this.state = 'special';
            this.animFrame = 0;
            this.animTimer = 0;
            this.say(this.spriteKey === 'boss5' ? "ジャックポットだ！" : "血圧を跳ね上げろ！", 80);
            setTimeout(() => {
                if (!this.active || this.state !== 'special') return;
                const impactX = this.x + this.direction * 72;
                const impactY = this.y;
                hugeExplosions.push(new HugeExplosion(impactX, impactY));
                particles.push(new Particle(impactX, impactY - 22, 'shockwave', '#ff3b30'));
                if (Math.abs(player.x - impactX) < 120 && Math.abs(player.y - impactY) < 70) {
                    player.takeDamage(this.damage * 1.45, this.x, true);
                    player.sys += 7;
                    player.updateBloodPressureState();
                }
            }, 420);
        }
    }

    takeDamage(amount, sourceX) {
        if (this.state === 'down') return;

        this.hp -= amount;
        this.invulnerableTimer = 10;

        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'down';
            this.animFrame = 0;
            this.animTimer = 0;
            this.downTimer = 0;
            this.say("やられた...", 60);
        } else {
            this.state = 'hurt';
            this.actionTimer = 12;
            this.say("ぐふっ！", 30);
        }
    }

    updateAnimation() {
        const frames = this.frames[this.state];
        if (!frames) return;

        this.animTimer++;
        let frameSpeed = 6;
        if (this.state === 'idle') frameSpeed = 8;
        if (this.state === 'walk') frameSpeed = 6;
        if (this.state === 'punch') frameSpeed = 5;
        if (this.state === 'special') frameSpeed = 7;

        if (this.animTimer >= frameSpeed) {
            this.animTimer = 0;
            this.animFrame++;

            if (this.animFrame >= frames.length) {
                if (this.state === 'punch' || this.state === 'special' || this.state === 'hurt') {
                    this.state = 'idle';
                    this.animFrame = 0;
                } else if (this.state === 'down') {
                    this.animFrame = frames.length - 1;
                } else {
                    this.animFrame = 0;
                }
            }
        }
    }

    draw(ctx, cameraX) {
        const frames = this.frames[this.state] || this.frames.idle;
        if (!frames) return;

        const f = frames[this.animFrame % frames.length];
        const img = assets.getImage(this.spriteDef.sheet);
        const baseScale = this.spriteDef.scale * (this.scale || 1);
        const drawW = f.w * baseScale;
        const drawH = f.h * baseScale;
        const pivotX = f.pivotX ?? 0.5;

        ctx.save();
        ctx.translate(this.x - cameraX, this.y);
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }

        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 55) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        if (this.type === 'boss') {
            ctx.shadowColor = '#ff3b30';
            ctx.shadowBlur = 12;
        }

        if (img && assets.loaded) {
            ctx.drawImage(
                img,
                f.x, f.y, f.w, f.h,
                -drawW * pivotX, -drawH, drawW, drawH
            );
        } else {
            ctx.fillStyle = '#8e8e93';
            ctx.fillRect(-20, -70, 40, 70);
        }

        ctx.restore();

        // 吹き出し
        if (this.dialogueTimer > 0 && this.dialogueText) {
            ctx.save();
            ctx.font = '9px "DotGothic16", sans-serif';
            const textWidth = ctx.measureText(this.dialogueText).width;
            const bubbleX = Math.max(10, Math.min(640 - textWidth - 20, this.x - cameraX - textWidth / 2 - 10));
            const bubbleY = this.y - (this.height * (this.scale || 1)) - 36;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.strokeStyle = '#ff3b30';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.roundRect(bubbleX, bubbleY, textWidth + 20, 20, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.fillText(this.dialogueText, bubbleX + 10, bubbleY + 13);
            ctx.restore();
        }
    }
}

// --- アイテムクラス ---
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        
        this.spriteName = 'heheokun_122'; // 水
        if (type === 'bento') this.spriteName = 'heheokun_123';
        if (type === 'coffee') this.spriteName = 'heheokun_124';
        if (type === 'coin') {
            this.spriteName = 'heheokun_79';
            this.coinFrames = [
                'heheokun_79', 'heheokun_80', 'heheokun_81', 'heheokun_82',
                'heheokun_83', 'heheokun_84', 'heheokun_85', 'heheokun_86',
                'heheokun_87', 'heheokun_88', 'heheokun_89'
            ];
        }
    }

    draw(ctx, cameraX) {
        const frameName = this.type === 'coin'
            ? this.coinFrames[Math.floor(Date.now() / 90 + this.x) % this.coinFrames.length]
            : this.spriteName;
        const frameData = assets.getFrameData(frameName);
        const f = frameData.frame;
        const sss = frameData.spriteSourceSize;
        const ss = frameData.sourceSize;

        ctx.save();
        const bob = this.type === 'coin' ? Math.sin(Date.now() / 180 + this.x * 0.05) * 3 : 0;
        ctx.translate(this.x - cameraX, this.y + bob);
        if (this.type === 'coin') {
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.38;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        }

        if (assets.loaded) {
            ctx.drawImage(
                assets.spriteSheet,
                f.x, f.y, f.w, f.h,
                sss.x - ss.w / 2, sss.y - ss.h / 2, f.w, f.h
            );
        } else {
            ctx.fillStyle = this.type === 'coin' ? '#ffd700' : '#34aadc';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// --- メインゲームループ＆制御クラス ---
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.gameState = 'LOADING';
        this.score = 0;
        this.stage = 1;
        this.maxStage = STAGES.length;
        
        // 横スクロール：ステージ長は X=3200
        this.stageLength = 3200;
        this.cameraX = 0;
        this.targetCameraX = 0;
        
        this.enemiesDefeated = 0;
        this.coinsThrown = 0;
        this.measuresDone = 0;

        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.items = [];
        this.hugeExplosions = []; // 必殺技用

        // ボス戦開始会話カットインの管理
        this.bossCutsceneState = 'none'; // none, active, done
        this.bossCutsceneTimer = 0;

        // 横型UIに最適化した仮想パッドとボタンの座標設定
        this.controls = {
            pad: { x: 80, y: 230, r: 45 },
            btnAttack: { x: 475, y: 260, r: 24, label: '拳', key: 'j' },
            btnCoin: { x: 535, y: 260, r: 24, label: 'コイン', key: 'k' },
            btnMeasure: { x: 475, y: 200, r: 24, label: '測定', key: 'l' },
            btnDodge: { x: 535, y: 200, r: 24, label: '回避', key: 'i' },
            btnRev: { x: 600, y: 230, r: 26, label: '革命', key: ' ' }
        };

        // スクロール停止・敵出現イベント (X軸トリガー)
        this.events = [];

        // 看板の明滅アニメーション用タイマー
        this.neonFlickerTimer = 0;

        this.setupUI();
    }

    start() {
        assets.load(
            (progress) => {
                document.getElementById('loading-bar').style.width = progress + '%';
            },
            () => {
                setTimeout(() => {
                    document.getElementById('loading-screen').classList.add('hidden');
                    this.gameState = 'TITLE';
                }, 800);
            }
        );

        this.loop();
    }

    setupUI() {
        document.getElementById('title-screen').addEventListener('click', () => {
            if (this.gameState === 'TITLE') {
                sounds.init();

                // スマホ用フルスクリーン＆横向き強制
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().then(() => {
                        if (screen.orientation && screen.orientation.lock) {
                            screen.orientation.lock("landscape").catch(e => console.log(e));
                        }
                    }).catch(e => console.log(e));
                }

                this.initGame();
            }
        });

        document.getElementById('retry-btn').addEventListener('click', () => {
            this.initGame();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.advanceStage();
        });

        const handleStart = (clientX, clientY) => {
            if (this.gameState !== 'PLAYING' || this.bossCutsceneState === 'active') return;

            const rect = this.canvas.getBoundingClientRect();
            // Canvasの横解像度 640x360 にマッピング
            const clickX = (clientX - rect.left) / rect.width * 640;
            const clickY = (clientY - rect.top) / rect.height * 360;

            let buttonHit = false;
            if (this.checkDistance(clickX, clickY, this.controls.btnAttack) < this.controls.btnAttack.r) {
                input.buttons.attack = true; buttonHit = true;
            }
            else if (this.checkDistance(clickX, clickY, this.controls.btnCoin) < this.controls.btnCoin.r) {
                input.buttons.coin = true; buttonHit = true;
            }
            else if (this.checkDistance(clickX, clickY, this.controls.btnMeasure) < this.controls.btnMeasure.r) {
                input.buttons.measure = true; buttonHit = true;
            }
            else if (this.checkDistance(clickX, clickY, this.controls.btnDodge) < this.controls.btnDodge.r) {
                input.buttons.dodge = true; buttonHit = true;
            }
            else if (this.checkDistance(clickX, clickY, this.controls.btnRev) < this.controls.btnRev.r) {
                input.buttons.revolution = true; buttonHit = true;
            }
            
            if (!buttonHit) {
                // アクションボタン以外をタッチした場合は、スワイプ移動の起点とする
                input.touchActive = true;
                input.padOrigin = { x: clickX, y: clickY };
                this.updatePadVector(clickX, clickY);
            }
        };

        const handleMove = (clientX, clientY) => {
            if (!input.touchActive || this.gameState !== 'PLAYING') return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = (clientX - rect.left) / rect.width * 640;
            const clickY = (clientY - rect.top) / rect.height * 360;
            this.updatePadVector(clickX, clickY);
        };

        const handleEnd = () => {
            input.touchActive = false;
            input.padVector = { x: 0, y: 0 };
            input.buttons.measure = false;
        };

        this.canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleEnd);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            handleStart(t.clientX, t.clientY);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            handleMove(t.clientX, t.clientY);
        });
        this.canvas.addEventListener('touchend', handleEnd);
    }

    checkDistance(px, py, btn) {
        return Math.sqrt((px - btn.x) ** 2 + (py - btn.y) ** 2);
    }

    updatePadVector(clickX, clickY) {
        if (!input.padOrigin) return;
        const dx = clickX - input.padOrigin.x;
        const dy = clickY - input.padOrigin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            input.padVector = { x: 0, y: 0 };
        } else {
            const factor = Math.min(1.0, dist / this.controls.pad.r);
            input.padVector = {
                x: (dx / dist) * factor,
                y: (dy / dist) * factor
            };
        }
    }

    buildStageEvents() {
        const stageData = STAGES[this.stage - 1];
        this.events = [
            { triggerX: 820, wave: stageData.waves[0], done: false, spawned: false },
            { triggerX: 1720, wave: stageData.waves[1], done: false, spawned: false },
            { triggerX: 2560, isBoss: true, done: false, spawned: false }
        ];
    }

    advanceStage() {
        if (this.stage >= this.maxStage) {
            this.stage = 1;
            this.gameState = 'TITLE';
            document.getElementById('clear-screen').classList.add('hidden');
            document.getElementById('title-screen').classList.remove('hidden');
            return;
        }

        this.stage++;
        this.initGame();
    }

    initGame() {
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('clear-screen').classList.add('hidden');

        if (this.gameState !== 'CLEAR') {
            this.score = 0;
        }
        this.cameraX = 0;
        this.targetCameraX = 0;
        this.enemiesDefeated = 0;
        this.coinsThrown = 0;
        this.measuresDone = 0;
        this.bossCutsceneState = 'none';
        this.bossCutsceneTimer = 0;
        input.keys = {};
        input.buttons.attack = false;
        input.buttons.coin = false;
        input.buttons.measure = false;
        input.buttons.dodge = false;
        input.buttons.revolution = false;
        input.touchActive = false;
        input.padVector = { x: 0, y: 0 };
        this.buildStageEvents();

        // プレイヤー初期化 (ステージ左端 X=100 から開始)
        this.player = new Player(100, 260);
        
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.items = [];
        this.hugeExplosions = [];

        // アイテム配置 (横並び)
        this.items.push(new Item(460, 285, 'water'));
        this.items.push(new Item(1120, 255, 'bento'));
        this.items.push(new Item(1510, 285, 'coin'));
        this.items.push(new Item(2050, 292, this.stage >= 4 ? 'coin' : 'coffee'));
        this.items.push(new Item(2360, 278, 'water'));

        this.gameState = 'PLAYING';
        this.player.say(`STAGE ${this.stage}: ${STAGES[this.stage - 1].name}`, 120);
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.gameState !== 'PLAYING') return;

        // 必殺技「血圧革命」ロゴバナーのカットインタイマー更新
        if (this.player && this.player.revolutionCutsceneActive) {
            this.player.revolutionCutsceneTimer--;
            if (this.player.revolutionCutsceneTimer <= 0) {
                this.player.revolutionCutsceneActive = false;
            }
        }

        // ボス会話カットイン中のアップデート制限
        if (this.bossCutsceneState === 'active') {
            this.bossCutsceneTimer++;
            
            // 会話中のキャラクター動き制限
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.state = 'idle';

            if (this.bossCutsceneTimer === 1) {
                const boss = this.enemies.find(e => e.type === 'boss');
                if (boss) boss.say(`${STAGES[this.stage - 1].bossName}、参上だ！`, 150);
            }
            if (this.bossCutsceneTimer === 120) {
                this.player.say("「ただしギャンブルーテメーはだめだ」", 150);
            }
            if (this.bossCutsceneTimer >= 240) {
                this.bossCutsceneState = 'done';
                this.player.say("勝負だ！", 60);
            }
            
            this.particles.forEach(part => part.update());
            this.particles = this.particles.filter(part => part.life > 0);
            return;
        }

        // カメラ横スクロール (カメラ追従)
        if (this.player.x - this.targetCameraX > 280) {
            const currentEvent = this.events.find(ev => !ev.done);

            if (currentEvent) {
                const proposedCameraX = Math.min(this.stageLength - 640, this.player.x - 280);
                this.targetCameraX = Math.min(proposedCameraX, currentEvent.triggerX);

                if (!currentEvent.spawned && (this.targetCameraX >= currentEvent.triggerX || this.player.x >= currentEvent.triggerX + 280)) {
                    this.targetCameraX = currentEvent.triggerX;
                    currentEvent.spawned = true;
                    this.spawnEventEnemies(currentEvent);
                }

                if (currentEvent.spawned && this.enemies.length === 0) {
                    currentEvent.done = true;
                    this.player.say("よし、前進だ！", 90);
                }
            } else {
                this.targetCameraX = Math.min(this.stageLength - 640, this.player.x - 280);
            }
        }

        this.cameraX += (this.targetCameraX - this.cameraX) * 0.08;

        this.player.update(this.particles, this.projectiles, this.stageLength, this.hugeExplosions);

        if (this.player.hp <= 0 && this.player.state === 'down' && this.player.animFrame === this.player.frames.down.length - 1) {
            this.triggerGameOver();
        }

        // ステージクリア条件 (ステージ右端に到達し、ボス撃破)
        if (this.player.x >= this.stageLength - 100 && this.enemies.length === 0) {
            this.triggerStageClear();
        }

        this.enemies.forEach(enemy => enemy.update(this.player, this.particles, this.projectiles, this.hugeExplosions));
        
        const defeatedEnemies = this.enemies.filter(enemy => !enemy.active);
        this.enemies = this.enemies.filter(enemy => enemy.active);
        const defeatedThisFrame = defeatedEnemies.length;
        if (defeatedThisFrame > 0) {
            this.enemiesDefeated += defeatedThisFrame;
            defeatedEnemies.forEach(enemy => {
                this.score += enemy.scoreValue;
            });
            
            // アイテムドロップ
            if (Math.random() < 0.7) {
                const itemTypes = ['coin', 'water', 'bento', 'coffee'];
                const dropType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                const dropSource = defeatedEnemies[0] || this.player;
                this.items.push(new Item(dropSource.x + (Math.random() - 0.5) * 60, dropSource.y, dropType));
            }
        }

        this.projectiles.forEach(proj => proj.update(this.particles));
        this.projectiles = this.projectiles.filter(proj => proj.active);

        this.particles.forEach(part => part.update());
        this.particles = this.particles.filter(part => part.life > 0);

        this.hugeExplosions.forEach(he => he.update());
        this.hugeExplosions = this.hugeExplosions.filter(he => he.active);

        this.handleCollisions();
    }

    spawnEventEnemies(ev) {
        if (ev.isBoss) {
            // ボス出現
            const stageData = STAGES[this.stage - 1];
            const boss = new Enemy(this.cameraX + 540, 270, 'boss', stageData.bossType);
            this.enemies.push(boss);
            this.bossCutsceneState = 'active';
            this.bossCutsceneTimer = 0;
        } else {
            // 通常ウェーブ出現
            this.player.say("敵だ！囲まれたぞ！", 90);
            sounds.playHurt();
            ev.wave.forEach((enemyType, i) => {
                const spawnX = this.cameraX + (i % 2 === 0 ? 680 : -40);
                const spawnY = 220 + (i * 29) % 110;
                this.enemies.push(new Enemy(spawnX, spawnY, enemyType));
            });
        }
    }

    handleCollisions() {
        // 1. プレイヤー攻撃判定
        if (this.player.state.startsWith('punch')) {
            let reach = 48;
            let dmg = 14;
            let hitType = 'hit'; // 'hit' or 'strong'
            const impactFrame = 3;

            if (this.player.state === 'punch2') {
                dmg = 20;
                reach = 58;
            } else if (this.player.state === 'punch3') {
                dmg = 32;
                reach = 72;
                hitType = 'strong';
            }

            if (this.player.animFrame === impactFrame) {
                const attackX = this.player.x + this.player.direction * reach;
                const attackY = this.player.y - 45;

                this.enemies.forEach(enemy => {
                    if (enemy.state !== 'down' && enemy.invulnerableTimer <= 0) {
                        const hit = Math.abs(enemy.x - attackX) < enemy.width + 28 && Math.abs(enemy.y - enemy.height / 2 - attackY) < enemy.height * 0.58;
                        if (hit) {
                            let finalDmg = dmg;
                            if (this.player.bpState === 'HIGH') finalDmg = Math.floor(dmg * 1.3);
                            if (this.player.bpState === 'DANGER' || this.player.bpState === 'MAX') finalDmg = Math.floor(dmg * 1.8);
                            finalDmg = this.player.applyAttackMultiplier(finalDmg);
                            
                            enemy.takeDamage(finalDmg, this.player.x);
                            
                            if (hitType === 'strong') {
                                sounds.playStrongHit();
                                // 黄色い雷(heheokun_150)スパークの発生
                                this.particles.push(new Particle(enemy.x, enemy.y - enemy.height * 0.55, 'impact', '#ff9500'));
                                this.particles.push(new Particle(enemy.x - this.player.direction * 8, enemy.y - enemy.height * 0.55, 'slash', '#ff3b30', {
                                    direction: this.player.direction,
                                    length: 86,
                                    width: 13
                                }));
                                for (let i = 0; i < 5; i++) {
                                    this.particles.push(new Particle(enemy.x, enemy.y - 40, 'lightning', '#ffd700'));
                                }
                                for (let i = 0; i < 9; i++) {
                                    this.particles.push(new Particle(enemy.x, enemy.y - 34, 'blood', '#ff2d55'));
                                }
                            } else {
                                sounds.playHit();
                                this.particles.push(new Particle(enemy.x, enemy.y - enemy.height * 0.55, 'impact', '#ffd700'));
                                for (let i = 0; i < 6; i++) {
                                    this.particles.push(new Particle(enemy.x, enemy.y - 40, 'spark', '#ffd700'));
                                }
                                for (let i = 0; i < 3; i++) {
                                    this.particles.push(new Particle(enemy.x, enemy.y - 32, 'blood', '#ff2d55'));
                                }
                            }
                        }
                    }
                });
            }
        }

        // 2. 飛び道具判定
        this.projectiles.forEach(proj => {
            if (proj.isPlayerOwned) {
                this.enemies.forEach(enemy => {
                    if (enemy.state !== 'down' && enemy.invulnerableTimer <= 0) {
                        const hit = Math.abs(enemy.x - proj.x) < enemy.width / 2 + 18 && Math.abs(enemy.y - enemy.height / 2 - proj.y) < enemy.height * 0.55;
                        if (hit) {
                            enemy.takeDamage(proj.damage, proj.x);
                            sounds.playCoinHit();
                            this.particles.push(new Particle(proj.x, proj.y, 'impact', proj.color || '#ffd700'));
                            this.particles.push(new Particle(proj.x, proj.y, 'shockwave', proj.color || '#ffd700'));

                            if (proj.type === 'burst') {
                                // 爆裂ヒット時
                                for (let i = 0; i < 15; i++) {
                                    this.particles.push(new Particle(proj.x, proj.y, 'spark', '#ff3b30'));
                                }
                                // 周囲の敵にもスプラッシュダメージ
                                this.enemies.forEach(other => {
                                    if (other !== enemy && Math.abs(other.x - proj.x) < 80 && Math.abs(other.y - other.height/2 - proj.y) < 80) {
                                        other.takeDamage(proj.damage * 0.6, proj.x);
                                    }
                                });
                            }

                            if (proj.type !== 'pierce' && proj.type !== 'wave') {
                                proj.active = false;
                            }
                        }
                    }
                });
            } else {
                if (this.player.state !== 'down' && this.player.invulnerableTimer <= 0) {
                    const hit = Math.abs(this.player.x - proj.x) < 22 && Math.abs(this.player.y - 45 - proj.y) < 25;
                    if (hit) {
                        this.player.takeDamage(proj.damage, proj.x, Math.random() < 0.3);
                        proj.active = false;
                    }
                }
            }
        });

        // 3. アイテム回収
        this.items.forEach(item => {
            if (item.active) {
                const hit = Math.abs(this.player.x - item.x) < 25 && Math.abs(this.player.y - 20 - item.y) < 30;
                if (hit) {
                    item.active = false;
                    sounds.playCoinHit();

                    if (item.type === 'water') {
                        this.player.pul = Math.max(60, this.player.pul - 15);
                        this.player.say("冷たい水だ。脈拍が落ち着く。", 90);
                        for (let i = 0; i < 8; i++) {
                            this.particles.push(new Particle(this.player.x, this.player.y - 30, 'aura', '#007aff'));
                        }
                    }
                    else if (item.type === 'bento') {
                        this.player.sys = Math.max(100, this.player.sys - 30);
                        this.player.dia = Math.max(70, this.player.dia - 12);
                        this.player.updateBloodPressureState();
                        this.player.say("減塩弁当、うまい！血圧が下がる。", 120);
                        for (let i = 0; i < 10; i++) {
                            this.particles.push(new Particle(this.player.x, this.player.y - 30, 'aura', '#4cd964'));
                        }
                    }
                    else if (item.type === 'coffee') {
                        this.player.pul += 18;
                        this.player.sys += 6;
                        this.player.updateBloodPressureState();
                        this.player.say("カフェイン投入！やる気MAX！", 90);
                        for (let i = 0; i < 8; i++) {
                            this.particles.push(new Particle(this.player.x, this.player.y - 30, 'aura', '#ffd700'));
                        }
                    }
                    else if (item.type === 'coin') {
                        this.player.coin = Math.min(this.player.maxCoin, this.player.coin + 5);
                        this.player.say("謎のコインを拾ったぞ。", 90);
                    }
                }
            }
        });
        
        this.items = this.items.filter(item => item.active);
    }

    triggerGameOver() {
        this.gameState = 'GAMEOVER';
        document.getElementById('gameover-screen').classList.remove('hidden');
    }

    triggerStageClear() {
        this.gameState = 'CLEAR';
        const isGameComplete = this.stage >= this.maxStage;
        const clearScreen = document.getElementById('clear-screen');
        const clearTitle = clearScreen.querySelector('h2');
        clearScreen.classList.toggle('game-complete', isGameComplete);
        clearTitle.innerText = isGameComplete ? 'GAME COMPLETE' : 'STAGE CLEAR';
        
        document.getElementById('stat-enemies').innerText = this.enemiesDefeated + " 人";
        document.getElementById('stat-coins').innerText = this.player.coinsSpent + " 枚";
        document.getElementById('stat-max-sys').innerText = this.player.maxSysReached;
        document.getElementById('stat-measures').innerText = this.player.measuresDone + " 回";
        
        let rank = 'B';
        let rankClass = 'rank-b';
        if (this.player.maxSysReached <= 150) {
            rank = 'S';
            rankClass = 'rank-s';
        } else if (this.player.maxSysReached <= 180) {
            rank = 'A';
            rankClass = 'rank-a';
        } else if (this.player.maxSysReached >= 200) {
            rank = '危険 (C)';
            rankClass = 'rank-danger';
        }

        const rankElem = document.getElementById('stat-rank');
        rankElem.innerText = rank;
        rankElem.className = rankClass;
        document.getElementById('next-btn').innerText = isGameComplete ? 'タイトルへ戻る' : '次のステージへ';

        clearScreen.classList.remove('hidden');
    }

    draw() {
        this.ctx.clearRect(0, 0, 640, 360);

        if (this.gameState === 'LOADING') return;

        // 1. 背景の描画 (商店街・パララックス)
        this.drawBackground();

        // 2. キャラクターとオブジェクトの描画 (Zソート)
        const renderList = [];
        if (this.player) renderList.push(this.player);
        this.enemies.forEach(e => renderList.push(e));
        this.projectiles.forEach(p => renderList.push(p));
        this.items.forEach(i => renderList.push(i));
        this.hugeExplosions.forEach(he => renderList.push(he));

        renderList.sort((a, b) => a.y - b.y);

        renderList.forEach(entity => {
            entity.draw(this.ctx, this.cameraX);
        });

        // 3. パーティクル
        this.particles.forEach(part => part.draw(this.ctx, this.cameraX));

        // 4. 会話イベント中のカットイン表示
        if (this.bossCutsceneState === 'active') {
            this.drawBossCutscene();
        }

        // 5. 必殺技「血圧革命」ロゴバナーの描画 (heheokun_135)
        if (this.player && this.player.revolutionCutsceneActive) {
            this.drawRevolutionBanner();
        }

        // 6. 血圧測定ポップアップ (heheokun_115)
        if (this.player && this.player.state === 'measure') {
            this.drawMeasurePopup();
        }

        // 7. 画面端赤点滅警告
        if (this.player && this.player.sys >= 190 && this.gameState === 'PLAYING') {
            this.ctx.save();
            const alpha = 0.22 + Math.sin(Date.now() / 90) * 0.12;
            this.ctx.strokeStyle = `rgba(255, 59, 48, ${alpha})`;
            this.ctx.lineWidth = 12;
            this.ctx.strokeRect(0, 0, 640, 360);
            
            // 危険！のスプライト(heheokun_125)を中央上部に描画
            const warnFrame = assets.getFrameData('heheokun_125');
            const wf = warnFrame.frame;
            if (assets.loaded) {
                this.ctx.drawImage(
                    assets.spriteSheet,
                    wf.x, wf.y, wf.w, wf.h,
                    320 - wf.w, 75, wf.w * 2, wf.h * 2
                );
            }
            this.ctx.restore();
        }

        // 8. HUD描画
        this.drawHUD();

        // 9. コントローラー
        if (this.gameState === 'PLAYING') {
            this.drawControls();
        }
    }

    drawBackground() {
        this.ctx.save();
        const stageData = STAGES[this.stage - 1];
        const stageImg = assets.getImage('stage');

        if (stageImg && assets.loaded) {
            const rect = stageData.rect;
            const viewW = Math.min(rect.w, rect.h * (640 / 360));
            const maxPan = Math.max(0, rect.w - viewW);
            const progress = Math.min(1, Math.max(0, this.cameraX / (this.stageLength - 640)));
            const sourceX = rect.x + maxPan * progress;

            this.ctx.drawImage(stageImg, sourceX, rect.y, viewW, rect.h, 0, 0, 640, 360);
        } else {
            const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 360);
            skyGrad.addColorStop(0, '#04060b');
            skyGrad.addColorStop(0.55, '#0d111d');
            skyGrad.addColorStop(1, '#161726');
            this.ctx.fillStyle = skyGrad;
            this.ctx.fillRect(0, 0, 640, 360);
        }

        this.neonFlickerTimer++;

        // 可動レーンを少しだけ読むための薄い床シェード。
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        this.ctx.fillRect(0, 210, 640, 150);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 210);
        this.ctx.lineTo(640, 210);
        this.ctx.stroke();

        // 進行ゲート。画面右端へ向かう目的地の手触りを出す。
        const exitX = this.stageLength - 130 - this.cameraX;
        if (exitX > -80 && exitX < 720) {
            const pulse = 0.45 + Math.sin(Date.now() / 180) * 0.18;
            this.ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
            this.ctx.fillRect(exitX, 212, 4, 112);
            this.ctx.font = '10px "Press Start 2P", sans-serif';
            this.ctx.fillText('EXIT', exitX - 28, 200);
        }

        this.ctx.restore();
    }

    drawBossCutscene() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        this.ctx.fillRect(0, 110, 640, 140);
        const stageData = STAGES[this.stage - 1];
        const bossDef = CHARACTER_SPRITES[stageData.bossType];
        const bossImg = assets.getImage(bossDef.sheet);

        if (assets.loaded) {
            const playerFace = assets.getFrameData('heheokun_1');
            const pf = playerFace.frame;

            // 左側プレイヤー顔グラ
            this.ctx.save();
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(30, 120, 140, 120);
            this.ctx.drawImage(
                assets.spriteSheet,
                pf.x, pf.y, pf.w, pf.h,
                30, 120, 140, 120
            );
            this.ctx.restore();

            // 右側ボス顔グラ
            this.ctx.save();
            this.ctx.strokeStyle = '#ff3b30';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(470, 120, 140, 120);
            if (bossImg) {
                const bp = bossDef.portrait;
                this.ctx.drawImage(bossImg, bp.x, bp.y, bp.w, bp.h, 470, 120, 140, 120);
            }
            this.ctx.restore();
        }

        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = '10px "Press Start 2P", sans-serif';
        this.ctx.fillText("HEHEOKUN", 30, 252);
        this.ctx.fillStyle = '#ff3b30';
        this.ctx.font = '10px "DotGothic16", sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(stageData.bossName, 610, 252);
        this.ctx.textAlign = 'left';

        this.ctx.restore();
    }

    drawRevolutionBanner() {
        if (!assets.loaded) return;
        this.ctx.save();
        const bannerFrame = assets.getFrameData('heheokun_135');
        const bf = bannerFrame.frame;
        
        // 画面中央に拡大表示
        const w = bf.w * 1.5;
        const h = bf.h * 1.5;
        const x = 320 - w / 2;
        const y = 140;

        this.ctx.shadowColor = '#ff3b30';
        this.ctx.shadowBlur = 20;
        this.ctx.drawImage(
            assets.spriteSheet,
            bf.x, bf.y, bf.w, bf.h,
            x, y, w, h
        );
        this.ctx.restore();
    }

    drawMeasurePopup() {
        if (!assets.loaded) return;
        this.ctx.save();
        const panelFrame = assets.getFrameData('heheokun_115');
        const pf = panelFrame.frame;

        const w = pf.w * 1.2;
        const h = pf.h * 1.2;
        const x = 320 - w / 2;
        const y = 80;

        // パネル背景
        this.ctx.globalAlpha = 0.9;
        this.ctx.shadowColor = '#4cd964';
        this.ctx.shadowBlur = 15;
        this.ctx.drawImage(
            assets.spriteSheet,
            pf.x, pf.y, pf.w, pf.h,
            x, y, w, h
        );

        // 測定進行ゲージをパネルの直下に描画
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(x, y + h + 10, w, 8);
        this.ctx.fillStyle = '#4cd964';
        const progress = Math.min(1.0, this.player.measureTimer / this.player.measureDuration);
        this.ctx.fillRect(x, y + h + 10, w * progress, 8);

        this.ctx.restore();
    }

    drawHUD() {
        this.ctx.save();
        
        // HUD背景パネル
        this.ctx.fillStyle = 'rgba(8, 12, 18, 0.85)';
        this.ctx.fillRect(0, 0, 640, 50);
        this.ctx.strokeStyle = '#222935';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 50);
        this.ctx.lineTo(640, 50);
        this.ctx.stroke();

        if (!this.player) {
            this.ctx.restore();
            return;
        }

        this.ctx.fillStyle = '#e0e6ed';
        this.ctx.font = '9px "Press Start 2P", sans-serif';

        // 1. STAGE / SCORE
        this.ctx.fillText(`STAGE ${this.stage}`, 15, 20);
        const scoreStr = String(this.score).padStart(6, '0');
        this.ctx.fillText(`SCORE ${scoreStr}`, 15, 38);

        // 2. HP
        this.ctx.fillText("HP", 175, 20);
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(175, 26, 110, 10);
        let hpColor = '#4cd964';
        if (this.player.hp < 40) hpColor = '#ff9500';
        if (this.player.hp < 20) hpColor = '#ff3b30';
        this.ctx.fillStyle = hpColor;
        this.ctx.fillRect(175, 26, 110 * (this.player.hp / this.player.maxHp), 10);
        this.ctx.strokeStyle = '#3a3a3a';
        this.ctx.strokeRect(175, 26, 110, 10);

        // 3. COIN
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillText(`COIN x${this.player.coin}`, 310, 20);
        if (this.player.isRevolutionBuffActive()) {
            this.ctx.fillStyle = '#ff2d55';
            this.ctx.fillText(`ATK x2 ${Math.ceil(this.player.revolutionBuffTimer / 60)}s`, 310, 38);
        }

        // 4. 血圧表示
        this.ctx.fillStyle = '#e0e6ed';
        this.ctx.fillText(`SYS ${this.player.sys}`, 405, 15);
        this.ctx.fillText(`DIA  ${this.player.dia}`, 405, 30);
        this.ctx.fillText(`PUL  ${this.player.pul}`, 405, 45);

        // 血圧状態
        let stateColor = '#4cd964';
        if (this.player.bpState === 'LOW') stateColor = '#34aadc';
        if (this.player.bpState === 'HIGH') stateColor = '#ff9500';
        if (this.player.bpState === 'DANGER' || this.player.bpState === 'MAX') stateColor = '#ff3b30';
        if (this.player.bpState === 'LIMIT') stateColor = '#a020f0';

        this.ctx.fillStyle = stateColor;
        this.ctx.fillText(this.player.bpState, 495, 30);

        // 5. 心電図メーターUI
        const meterX = 590;
        const meterY = 25;
        const meterR = 18;
        
        this.ctx.strokeStyle = '#1e1e1e';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(meterX, meterY, meterR, Math.PI * 0.8, Math.PI * 2.2);
        this.ctx.stroke();

        const sysPercent = Math.min(1.0, Math.max(0.0, (this.player.sys - 80) / 120));
        this.ctx.strokeStyle = stateColor;
        this.ctx.beginPath();
        this.ctx.arc(meterX, meterY, meterR, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * sysPercent));
        this.ctx.stroke();

        // 中央心電図
        this.ctx.fillStyle = stateColor;
        this.ctx.beginPath();
        this.ctx.moveTo(meterX - 8, meterY);
        this.ctx.lineTo(meterX - 3, meterY);
        this.ctx.lineTo(meterX - 1, meterY - 6);
        this.ctx.lineTo(meterX + 1, meterY + 6);
        this.ctx.lineTo(meterX + 3, meterY - 2);
        this.ctx.lineTo(meterX + 4, meterY);
        this.ctx.lineTo(meterX + 8, meterY);
        this.ctx.strokeStyle = stateColor;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        const boss = this.enemies.find(enemy => enemy.type === 'boss' && enemy.state !== 'down');
        if (boss) {
            this.ctx.fillStyle = 'rgba(8, 12, 18, 0.72)';
            this.ctx.fillRect(160, 54, 320, 18);
            this.ctx.strokeStyle = '#ff3b30';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(160, 54, 320, 18);
            this.ctx.fillStyle = '#ff3b30';
            this.ctx.fillRect(164, 58, 312 * (boss.hp / boss.maxHp), 10);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px "DotGothic16", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(boss.spriteDef.displayName, 320, 67);
            this.ctx.textAlign = 'left';
        }

        this.ctx.restore();
    }

    drawControls() {
        this.ctx.save();
        
        const drawBtn = (btn, activeColor, textColor = '#fff') => {
            const isPressed = input.keys[btn.key] || (btn.label === '測定' ? input.buttons.measure : false);
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.55;
            this.ctx.fillStyle = isPressed ? activeColor : 'rgba(25, 35, 55, 0.7)';
            this.ctx.strokeStyle = activeColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(btn.x, btn.y, btn.r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.globalAlpha = 0.9;
            this.ctx.font = 'bold 9px "DotGothic16", sans-serif';
            this.ctx.fillStyle = textColor;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(btn.label, btn.x, btn.y);
            this.ctx.restore();
        };

        // 仮想パッド（非表示のまま機能させる）
        /*
        const pad = this.controls.pad;
        this.ctx.fillStyle = 'rgba(35, 45, 65, 0.25)';
        this.ctx.strokeStyle = 'rgba(55, 70, 95, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(pad.x, pad.y, pad.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        const stickX = pad.x + input.padVector.x * (pad.r - 10);
        const stickY = pad.y + input.padVector.y * (pad.r - 10);
        this.ctx.fillStyle = input.touchActive ? 'rgba(255, 59, 48, 0.65)' : 'rgba(70, 85, 115, 0.65)';
        this.ctx.beginPath();
        this.ctx.arc(stickX, stickY, 13, 0, Math.PI * 2);
        this.ctx.fill();
        */

        // ボタン類
        drawBtn(this.controls.btnAttack, '#ffd700');
        drawBtn(this.controls.btnCoin, '#ff9500');
        drawBtn(this.controls.btnMeasure, '#4cd964');
        drawBtn(this.controls.btnDodge, '#007aff');
        drawBtn(this.controls.btnRev, '#ff3b30');

        this.ctx.restore();
    }
}

// 起動
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});
