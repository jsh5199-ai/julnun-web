import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
    CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon
} from 'lucide-react';

const delay = ms => new Promise(res => setTimeout(res, ms));

// =================================================================
// ⭐️ 상수 정의 및 기본 이미지 경로
// =================================================================
const MIN_FEE = 200000;
const KAKAO_CHAT_URL = 'http://pf.kakao.com/_jAxnYn/chat';
const DEFAULT_TILE_IMAGE_URL = '/default_tile.jpg';

const GROUT_COLORS = [
    { id: 'white', code: '#ffffff', label: '화이트', isDark: false },
    { id: 'light_beige', code: '#e2dfda', label: '103번', isDark: false },
    { id: 'light_gray', code: '#ccccca', label: '110번', isDark: false },
    { id: 'silver_gray', code: '#afb0aa', label: '111번', isDark: false },
    { id: 'medium_gray', code: '#848685', label: '112번', isDark: true },
    { id: 'dark_gray', code: '#797671', label: '113번', isDark: true },
    { id: 'black', code: '#49494b', label: '114번', isDark: true },
    { id: 'charcoal', code: '#565556', label: '119번', isDark: true },
    { id: 'shine_silver', code: '#c2c2c2', label: '127번', isDark: false },
    { id: 'moca_beige', code: '#dbcbbd', label: '131번', isDark: false },
    { id: 'sand_brown', code: '#887965', label: '133번', isDark: true },
    { id: 'dark_brown', code: '#85786f', label: '134번', isDark: true },
    { id: 'vintage_brown', code: '#96877e', label: '141번', isDark: true },
    { id: 'oat_brown', code: '#b0a9a4', label: '180번', isDark: false },
    { id: 'burnt_brown', code: '#8b8784', label: '187번', isDark: true },
];

const BRIGHT_MODIFIER_COLOR = GROUT_COLORS.find(c => c.id === 'white');
const DARK_MODIFIER_COLOR = GROUT_COLORS.find(c => c.id === 'charcoal');

// =================================================================
// ⭐️ [유지] HEX/RGB 변환 헬퍼 함수
// =================================================================

// HEX 코드를 RGB 객체로 변환
const hexToRgb = (hex) => {
    if (!hex || hex.length !== 7) return { r: 0, g: 0, b: 0 };
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
};

// RGB 객체를 HEX 코드로 변환
const rgbToHex = (r, g, b) => {
    r = Math.round(Math.max(0, Math.min(255, r))).toString(16);
    g = Math.round(Math.max(0, Math.min(255, g))).toString(16);
    b = Math.round(Math.max(0, Math.min(255, b))).toString(16);
    return `#${r.length === 1 ? '0' + r : r}${g.length === 1 ? '0' + g : g}${b.length === 1 ? '0' + b : b}`;
};

// =================================================================
// [스타일] 애니메이션 정의
// =================================================================
const GlobalStyles = () => (
    <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUpFadeOut { 0% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; transform: translateY(-10px); } 100% { opacity: 0; transform: translateY(-20px); } }
        @keyframes professionalPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(100, 116, 139, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(100, 116, 139, 0); }
        }
        /* 리뷰 버튼 애니메이션 복구 */
        @keyframes shine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .shine-effect {
            background: #facc15;
            background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
            background-size: 200% 100%;
            animation: shine 3s infinite;
            color: #1e3a8a;
        }

        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        .animate-toast { animation: slideUpFadeOut 3s forwards; }

        .selection-box { transition: all 0.2s ease-in-out; }
        .selection-selected {
            border: 3px solid transparent;
            background-color: #f3f4f6;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    `}</style>
);

// =================================================================
// [데이터] (기존 데이터 유지)
// =================================================================
const HOUSING_TYPES = [
    { id: 'new', label: '신축 아파트', multiplier: 1.0 },
    { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];

const MATERIALS = [
    {
        id: 'poly', label: '폴리아스파틱', priceMod: 1.0,
        description: '탄성과 광택이 우수하며 가성비가 좋습니다.',
        badge: '일반', badgeColor: 'bg-gray-200 text-gray-700'
    },
    {
        id: 'kerapoxy', label: '에폭시(무광/무펄)', priceMod: 1.8,
        description: '내구성이 뛰어나고 매트한 질감.',
        badge: '프리미엄', badgeColor: 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/30'
    },
];

const BATHROOM_AREAS = [
    { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
    { id: 'shower_booth', label: '샤워부스 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
    { id: 'bathtub_wall', label: '욕조 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
    { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
    { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
];

const OTHER_AREAS = [
    { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소', desc: '' },
    { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: LayoutGrid, unit: '개소', desc: '' },
    { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: '' },
    { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '' },
];

const SERVICE_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS];

const SILICON_AREAS = [
    { id: 'silicon_bathtub', label: '욕조 테두리 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '' },
    {
        id: 'silicon_sink',
        label: '세면대+젠다이 교체',
        basePrice: 30000,
        icon: Eraser,
        unit: '개소',
        desc: ''
    },
    { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '' },
];

const ALL_AREAS = [...SERVICE_AREAS, ...SILICON_AREAS];

const REVIEW_EVENTS = [
    { id: 'soomgo_review', label: '숨고 리뷰이벤트', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
];

const FAQ_ITEMS = [
    { question: "Q1. 시공 시간은 얼마나 걸리나요?", answer: "시공범위에 따라 다르지만, 평균적으로 4~6시간 정도 소요되고 있으며 범위/소재에 따라 최대 2일 시공이 걸리는 경우도 있습니다." },
    { question: "Q2. 줄눈 시공 후 바로 사용 가능한가요?", answer: "줄눈시공 후 폴리아스파틱은 6시간, 케라폭시는 2~3일, 스타라이크는 24시간 정도 양생기간이 필요합니다. 그 시간 동안은 물 사용을 자제해주시는 것이 가장 좋습니다." },
    { question: "Q3. 왜 줄눈 시공을 해야 하나요?", answer: "줄눈은 곰팡이와 물때가 끼는 것을 방지하고, 타일 틈새 오염을 막아 청소가 쉬워지며, 인테리어 효과까지 얻을 수 있는 필수 시공입니다." },
    { question: "Q4. A/S 기간 및 조건은 어떻게 되나요?", answer: "시공 후 폴리아스파틱은 2년, 에폭시는 5년의 A/S를 제공합니다. 단, 고객 부주의나 타일 문제로 인한 하자는 소액의 출장비가 발생할 수 있습니다." },
    { question: "Q5. 구축 아파트도 시공이 가능한가요?", answer: "네, 가능합니다. 기존 줄눈을 제거하는 그라인딩 작업이 추가로 필요하며, 현재 견적은 신축/구축 동일하게 적용됩니다." },
];

const YOUTUBE_VIDEOS = [
    { id: 'XekG8hevWpA', title: '에폭시 시공영상 (벽면/바닥)', label: '에폭시 시공영상' },
    { id: 'M6Aq_VVaG0s', title: '밑작업 영상 (라인 그라인딩)', label: '밑작업 영상' },
];

const getEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&rel=0`;

const OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION = ['entrance', 'balcony_laundry', 'kitchen_wall', 'living_room', 'silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'];

const ORIGINAL_MIXED_PACKAGES = [
    { id: 'P_MIX_01', price: 750000, label: '혼합패키지 01', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_02', price: 750000, label: '혼합패키지 02', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_03_OLD', price: 800000, label: '혼합패키지 03 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1]] },
    { id: 'P_MIX_04_OLD', price: 800000, label: '혼합패키지 04 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['common_bath_wall', 1]] },
    { id: 'P_MIX_05_OLD', price: 1050000, label: '혼합패키지 05 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1], ['common_bath_wall', 1]] },
    { id: 'P_MIX_06', price: 830000, label: '혼합패키지 06', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_07', price: 830000, label: '혼합패키지 07', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_08', price: 950000, label: '혼합패키지 08', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1], ['shower_booth', 1]] },
    { id: 'P_MIX_09', price: 1200000, label: '혼합패키지 09', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1], ['common_bath_wall', 1]] },
    { id: 'P_MIX_10', price: 900000, label: '혼합패키지 10', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [] },
    { id: 'P_MIX_11', price: 900000, label: '혼합패키지 11', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [] },
    { id: 'P_MIX_13', price: 1100000, label: '혼합패키지 13', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [] },
    { id: 'P_MIX_14', price: 1100000, label: '혼합패키지 14', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [] },
];

const CUSTOM_MIXED_PACKAGES = [
    { id: 'P_MIX_NEW_A', price: 1150000, label: '혼합벽면A (바닥/안방벽E, 공용벽P) 115만', E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1]], P_areas: [['common_bath_wall', 1]] },
    { id: 'P_MIX_NEW_B', price: 1150000, label: '혼합벽면B (바닥/공용벽E, 안방벽P) 115만', E_areas: [['bathroom_floor', 2], ['common_bath_wall', 1]], P_areas: [['master_bath_wall', 1]] },
];

const NEW_USER_PACKAGES = [
    { id: 'USER_E_700K_MASTER', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_E_700K_COMMON', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_P_500K_MASTER', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_P_500K_COMMON', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_E_550K_FLOOR_2', price: 550000, label: '에폭시 바닥 2곳 (55만)', E_areas: [['bathroom_floor', 2]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_800K_FLOOR2_SHOWER1', price: 800000, label: '에폭시 바닥 2곳 + 샤워벽 1곳 (80만)', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_550K_FLOOR1_SHOWER1', price: 550000, label: '에폭시 바닥 1곳 + 샤워벽 1곳 (55만)', E_areas: [['bathroom_floor', 1], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_350K_BATH', price: 350000, label: '에폭시 바닥 1곳 (35만)', E_areas: [['bathroom_floor', 1]], P_areas: [], isFlexible: false, },
];

const HARDCODED_PACKAGES = [
    { id: 'POLY_550K', price: 550000, label: '폴리 5종 패키지 (55만)', P_areas: [['bathroom_floor', 2], ['shower_booth', 1], ['bathtub_wall', 1]], E_areas: [] },
    { id: 'POLY_700K_WALLS', price: 700000, label: '폴리 벽 전체 5종 패키지 (70만)', P_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]], E_areas: [] },
    { id: 'EPOXY_1300K_WALLS', price: 1300000, label: '에폭시 벽 전체 5종 패키지 (130만)', P_areas: [], E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]] },
];


const MIXED_PACKAGES = [
    ...NEW_USER_PACKAGES,
    ...CUSTOM_MIXED_PACKAGES,
    ...ORIGINAL_MIXED_PACKAGES,
    ...HARDCODED_PACKAGES,
];


const getPackageAreaIds = (pkg) => [
    ...pkg.P_areas.map(([id]) => id),
    ...pkg.E_areas.map(([id]) => id),
];

// =================================================================
// [컴포넌트]
// =================================================================

const PackageToast = ({ isVisible, onClose, label }) => {
    const toastLabel = label || '패키지 할인';

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12">
            <div className="bg-indigo-800 text-white p-3 rounded-xl shadow-2xl border border-indigo-700 flex items-center justify-between animate-toast">
                <div className="flex items-center gap-2">
                    <Gift size={18} className='text-white flex-shrink-0' />
                    <div className="text-sm font-bold truncate">
                        {label || '패키지 할인'} 적용되었습니다!
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-xs font-extrabold bg-amber-400 text-indigo-900 px-2 py-1 rounded-full hover:bg-amber-300 transition active:scale-95 flex-shrink-0"
                >
                    확인하기
                </button>
            </div>
        </div>
    );
};

const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
                <h3 className="font-extrabold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-white" /> 재료별 상세 스펙</h3>
                <button onClick={onClose} className="text-white/80 hover:text-white transition active:scale-95"><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left font-extrabold text-gray-700">구분</th>
                            <th className="px-3 py-3 text-center font-extrabold text-gray-700">폴리아스파틱</th>
                            <th className="px-3 py-3 text-center font-extrabold text-indigo-700">에폭시</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-semibold text-gray-900">내구성</td>
                            <td className="px-3 py-3 text-center text-gray-600">우수</td>
                            <td className="px-3 py-3 text-center font-bold text-indigo-600">최상 (전문가용)</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-semibold text-gray-900">A/S 기간</td>
                            <td className="px-3 py-3 text-center font-bold text-indigo-600">2년</td>
                            <td className="px-3 py-3 text-center font-bold text-indigo-600">5년</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-semibold text-gray-900">시공 후 양생</td>
                            <td className="px-3 py-3 text-center text-gray-600">6시간</td>
                            <td className="px-3 py-3 text-center text-gray-600">24시간 ~ 3일</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button onClick={onClose} className="w-full py-3 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition active:scale-95">확인</button>
            </div>
        </div>
    </div>
);

const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100">
            <button
                className="flex justify-between items-center w-full py-3 text-left font-semibold text-gray-800 hover:text-indigo-600 transition duration-150"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <ChevronDown size={18} className={`text-indigo-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-3 text-sm text-gray-600 animate-slide-down">
                    {answer}
                </div>
            )}
        </div>
    );
};


// ⭐️ [업데이트] ColorPalette 컴포넌트 ⭐️
const ColorPalette = React.memo(({ selectedGroutColor, handleColorSelect, finalSelectedColorData, onTileImageUpload, tileImageURL, brightnessLevel, setBrightnessLevel }) => {
    const GROUT_LINE_WIDTH = 12;

    const effectiveTileImageURL = (tileImageURL && tileImageURL !== DEFAULT_TILE_IMAGE_URL)
        ? tileImageURL
        : DEFAULT_TILE_IMAGE_URL;

    // 현재 선택된 기본 색상 데이터
    const baseColorData = GROUT_COLORS.find(c => c.id === selectedGroutColor) || GROUT_COLORS[0];

    // 밝기 레벨 텍스트 계산
    const displayLevel = Math.abs(brightnessLevel - 50) * 2; // 0 (50) -> 0, 100 (100) -> 100
    const displayTone = brightnessLevel > 50 ? '밝게 톤업' : brightnessLevel < 50 ? '어둡게 톤다운' : '원본 색상';
    const displaySign = brightnessLevel === 50 ? '' : brightnessLevel > 50 ? '+' : '-';
    
    // 슬라이더 색상 커스텀 스타일 (밝기 레벨에 따라 게이지 색상 변경)
    const getSliderBackground = () => {
        // 50%를 기준으로 양쪽으로 그라데이션이 퍼지도록 설정
        const currentPercentage = brightnessLevel / 100 * 100; // 0~100
        const fillToCenter = brightnessLevel < 50 ? 50 : currentPercentage;
        const fillFromCenter = brightnessLevel > 50 ? 50 : 100 - currentPercentage;

        // 중앙(50%)을 0% 기준으로 변환
        const valueFromCenter = Math.abs(brightnessLevel - 50) * 2;
        
        let color1, color2;
        if (brightnessLevel > 50) { // 밝게
            color1 = baseColorData.code;
            color2 = BRIGHT_MODIFIER_COLOR.code;
        } else if (brightnessLevel < 50) { // 어둡게
            color1 = DARK_MODIFIER_COLOR.code;
            color2 = baseColorData.code;
        } else { // 원본 (중앙)
            color1 = baseColorData.code;
            color2 = baseColorData.code;
        }
        
        // 게이지 배경 스타일을 CSS 변수를 사용하여 계산
        return {
             '--range-progress': `${valueFromCenter}%`,
             '--range-base-color': baseColorData.code,
             '--range-modifier-color': brightnessLevel > 50 ? BRIGHT_MODIFIER_COLOR.code : DARK_MODIFIER_COLOR.code,
             '--range-level': brightnessLevel
        };
    };

    return (
        <div className='mt-5 pt-3 border-t border-gray-100 animate-fade-in'>
            <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 text-gray-800">
                <Palette className="h-4 w-4 text-indigo-600" /> 2-1. 줄눈 색상 선택 및 밝기 조절
            </h3>

            {/* 시뮬레이션 컨테이너 */}
            <div className={`transition-all duration-300`}>
                <div
                    className="w-full aspect-video mx-auto overflow-hidden relative bg-white"
                >
                    {/* 1. 타일 배경 (이미지) */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url(${effectiveTileImageURL})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: 1
                        }}
                    ></div>

                    {/* 2. 워터마크 레이어 (z-index 5) */}
                    <div
                        className="absolute inset-0 flex items-center justify-center opacity-30"
                        style={{
                            zIndex: 5,
                            backgroundImage: 'url(/logo.png)',
                            backgroundSize: '30%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    >
                    </div>

                    {/* ⭐️ 3. 줄눈 십자가 (밝기 조절 색상 적용) - z-index 10 (최상단) ⭐️ */}

                    {/* 세로 줄 */}
                    <div
                        className="absolute top-0 bottom-0 left-1/2"
                        style={{
                            width: `${GROUT_LINE_WIDTH}px`,
                            backgroundColor: finalSelectedColorData.code,
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}
                    ></div>

                    {/* 가로 줄 */}
                    <div
                        className="absolute left-0 right-0 top-1/2"
                        style={{
                            height: `${GROUT_LINE_WIDTH}px`,
                            backgroundColor: finalSelectedColorData.code,
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                        }}
                    ></div>
                </div>
            </div>

            {/* 최종 색상 이름 표시 */}
            <div className={`p-3 rounded-lg shadow-md mb-3 border border-gray-200`} style={{ backgroundColor: finalSelectedColorData.code }}>
                <p className={`text-sm font-bold ${finalSelectedColorData.isDark ? 'text-white' : 'text-gray-900'} flex items-center justify-between`}>
                    <span className='truncate'>선택 색상: {baseColorData.label} </span>
                    <span className='text-xs font-normal ml-2'>밝기 레벨: {displaySign}{displayLevel}%</span>
                    <CheckCircle2 size={16} className={`ml-2 flex-shrink-0 ${finalSelectedColorData.isDark ? 'text-amber-400' : 'text-indigo-700'}`}/>
                </p>
            </div>

            {/* ⭐️ [복원] 단일 색상 선택 버튼 그리드 ⭐️ */}
            <div className='grid grid-cols-5 sm:grid-cols-5 gap-3'>
                {GROUT_COLORS.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => handleColorSelect(color.id)} // 새로운 핸들러 사용
                        className={`aspect-square rounded-lg transition-all duration-200 shadow-md flex items-center justify-center p-1 relative hover:scale-[1.02] active:scale-[0.98] ${
                            selectedGroutColor === color.id
                                ? 'ring-4 ring-offset-2 ring-indigo-500' // 선택 시 링 효과
                                : 'hover:shadow-lg'
                        }`}
                        style={{ backgroundColor: color.code }}
                        title={color.label}
                    >
                        {selectedGroutColor === color.id && (
                            <CheckCircle2 size={24} className={`absolute ${color.isDark ? 'text-amber-400' : 'text-indigo-700'} drop-shadow-md`} />
                        )}
                        <span className={`absolute bottom-0 text-[8px] font-bold py-[1px] px-1 rounded-t-sm ${color.isDark ? 'bg-white/80 text-gray-900' : 'bg-gray-900/80 text-white'}`}>{color.label}</span>
                    </button>
                ))}
            </div>


            {/* ⭐️ [업데이트] 밝기 조절 게이지 (슬라이더) - step=10 유지 ⭐️ */}
            <style>{`
                /* 커스텀 슬라이더 스타일링 */
                .brightness-slider::-webkit-slider-runnable-track {
                    background: linear-gradient(to right, 
                        ${DARK_MODIFIER_COLOR.code},
                        ${baseColorData.code} 50%,
                        ${BRIGHT_MODIFIER_COLOR.code}
                    );
                    border-radius: 4px;
                    height: 8px;
                }
                .brightness-slider::-moz-range-track {
                    background: linear-gradient(to right, 
                        ${DARK_MODIFIER_COLOR.code},
                        ${baseColorData.code} 50%,
                        ${BRIGHT_MODIFIER_COLOR.code}
                    );
                    border-radius: 4px;
                    height: 8px;
                }
                .brightness-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: ${finalSelectedColorData.code};
                    border: 3px solid ${finalSelectedColorData.isDark ? BRIGHT_MODIFIER_COLOR.code : DARK_MODIFIER_COLOR.code};
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -6px; /* 트랙 중앙에 오도록 조정 */
                    box-shadow: 0 0 5px rgba(0,0,0,0.3);
                }
            `}</style>
            <div className='mt-5 pt-3 border-t border-gray-100'>
                <h4 className="text-sm font-extrabold flex items-center gap-2 mb-3 text-gray-700">
                    <TrendingUp className="h-4 w-4 text-indigo-600" /> 밝기 조절 (톤 변경)
                </h4>
                <div className='flex items-center justify-between gap-3'>
                    <span className='text-sm font-bold text-gray-600 w-12 text-left'>어둡게</span>
                    
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="10" 
                        value={brightnessLevel}
                        onChange={(e) => setBrightnessLevel(parseInt(e.target.value, 10))}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer brightness-slider"
                    />

                    <span className='text-sm font-bold text-gray-600 w-12 text-right'>밝게</span>
                </div>
                <p className='text-xs text-gray-500 mt-2 text-center'>
                    * 현재 밝기 레벨: <span className='font-bold text-indigo-600'>{displaySign}{displayLevel}%</span> ({displayTone}) 적용 중
                </p>
            </div>

            {/* 타일 이미지 업로드 버튼 */}
            <div className='mb-4 mt-5'>
                <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} style={{ display: 'none' }} />
                <label htmlFor="tileFileInput" className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                    <ImageIcon size={16} /> 내 타일 사진 첨부하여 미리보기
                </label>
            </div>

            {/* ⭐️ [신규] 줄눈 색상 선택 팁 문구 ⭐️ */}
            <p className='text-xs text-indigo-600 mt-4 text-center font-semibold'>
                팁: 색상은 타일톤보다 한톤 어둡게 시공할 경우 관리가 쉽고, 청소주기가 길어집니다.
            </p>
            
            <p className='text-xs text-gray-500 mt-3 text-center'>
                * 화면 해상도에 따라 실제 색상과 차이가 있을 수 있습니다.
            </p>
        </div>
    );
});


// ⭐️ [App Main] ⭐️
export default function App() {
    const [housingType, setHousingType] = useState('new');
    const [material, setMaterial] = useState('poly');
    const [polyOption, setPolyOption] = useState('pearl');
    const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
    
    // ⭐️ [복원] 단일 색상 선택 상태
    const [selectedGroutColor, setSelectedGroutColor] = useState(GROUT_COLORS[0].id);
    // ⭐️ [업데이트] 밝기 레벨 상태 (50: 원본, 0: 119번 100%, 100: 화이트 100%)
    const [brightnessLevel, setBrightnessLevel] = useState(50);
    const [tileImageURL, setTileImageURL] = useState(DEFAULT_TILE_IMAGE_URL);
    
    const [quantities, setQuantities] = useState(
        [...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
    );
    const [areaMaterials, setAreaMaterials] = useState(
        [...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 'poly' }), {})
    );

    const [selectedReviews, setSelectedReviews] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(YOUTUBE_VIDEOS[0].id);

    const quoteRef = useRef(null);

    const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';
    const PHONE_NUMBER = '010-7734-6709';

    // ⭐️ [신규 핸들러] 색상 선택 시 밝기 레벨을 50 (0% 톤 조절)로 초기화
    const handleColorSelect = useCallback((colorId) => {
        setSelectedGroutColor(colorId);
        setBrightnessLevel(50); 
    }, []);


    useEffect(() => {
        if (quantities['entrance'] > 0 && areaMaterials['entrance'] !== 'poly') {
            setAreaMaterials(prev => ({ ...prev, 'entrance': 'poly' }));
        }
    }, [quantities, areaMaterials]);

    const handleQuantityChange = useCallback((id, delta) => {
        setQuantities(prev => {
            const currentQty = prev[id] || 0;
            let newQty = Math.max(0, currentQty + delta);
            const newQuantities = { ...prev, [id]: newQty };

            if (newQty > 0) {
                if (id === 'master_bath_wall' && (newQuantities['shower_booth'] || 0) > 0) newQuantities['shower_booth'] = 0;
                if (id === 'common_bath_wall' && (newQuantities['bathtub_wall'] || 0) > 0) newQuantities['bathtub_wall'] = 0;
                if (id === 'shower_booth' && (newQuantities['master_bath_wall'] || 0) > 0) newQuantities['master_bath_wall'] = 0;
                if (id === 'bathtub_wall' && (newQuantities['common_bath_wall'] || 0) > 0) newQuantities['common_bath_wall'] = 0;
            }

            const isBathroomFloorUpdated = id === 'bathroom_floor';
            let bathroomFloorCount = isBathroomFloorUpdated ? newQuantities['bathroom_floor'] : prev['bathroom_floor'];

            if (bathroomFloorCount >= 2 && newQuantities['entrance'] === 0) {
                newQuantities['entrance'] = 1;
            }
            else if (bathroomFloorCount < 2 && prev['bathroom_floor'] >= 2 && prev['entrance'] === 1 && newQuantities['entrance'] === 1) {
                if (newQuantities['entrance'] === 1) {
                    newQuantities['entrance'] = 0;
                }
            }
            return newQuantities;
        });
    }, []);

    const handleAreaMaterialChange = useCallback((id, mat) => {
        if (id === 'entrance') {
            setAreaMaterials(prev => ({ ...prev, [id]: 'poly' }));
        } else {
            setAreaMaterials(prev => ({ ...prev, [id]: mat }));
        }
    }, []);

    const toggleReview = useCallback((id) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const getSelectionSummary = useCallback((q, areaMats) => {
        const summary = {};
        for (const id in q) {
            const qty = q[id];
            if (qty > 0) {
                const mat = (id === 'entrance') ? 'poly' : areaMats[id];
                const matKey = (mat === 'poly') ? 'poly' : 'kerapoxy';
                if (!summary[matKey]) {
                    summary[matKey] = {};
                }
                summary[matKey][id] = qty;
            }
        }
        if (q['entrance'] > 0) {
            if (!summary['poly']) summary['poly'] = {};
            summary['poly']['entrance'] = q['entrance'];
            if(summary['kerapoxy'] && summary['kerapoxy']['entrance']) {
                delete summary['kerapoxy']['entrance'];
            }
        }
        return summary;
    }, [areaMaterials]);

    const findMatchingPackage = useCallback((selectionSummary, quantities) => {
        const filterSelections = (selections) => {
            const filtered = {};
            for (const id in selections) {
                if (!OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION.includes(id)) {
                    filtered[id] = selections[id];
                }
            }
            return filtered;
        };

        const filteredPolySelections = filterSelections(selectionSummary['poly'] || {});
        const filteredEpoxySelections = filterSelections(selectionSummary['kerapoxy'] || {});

        const totalSelectedCount = Object.values(filteredPolySelections).reduce((sum, v) => sum + v, 0) +
                                   Object.values(filteredEpoxySelections).reduce((sum, v) => sum + v, 0);

        if (totalSelectedCount === 0) return null;
        const sortedPackages = MIXED_PACKAGES;

        for (const pkg of sortedPackages) {
            let tempPolySelections = { ...filteredPolySelections };
            let tempEpoxySelections = { ...filteredEpoxySelections };
            let appliedAutoEntrance = false;

            if (pkg.isFlexible) {
                    const requiredPolyAreas = pkg.P_areas.map(([id]) => id).filter(id => id !== 'entrance');
                    const requiredEpoxyAreas = pkg.E_areas.map(([id]) => id);
                    let baseMatch = true;
                    for (const id of requiredPolyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                        const requiredQty = pkg.P_areas.find(([pkId]) => pkId === id)[1];
                        if ((tempPolySelections[id] || 0) !== requiredQty) {
                            baseMatch = false;
                            break;
                        }
                    }
                    if (!baseMatch) continue;

                    for (const id of requiredEpoxyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                        const requiredQty = pkg.E_areas.find(([pkId]) => pkId === id)[1];
                        if ((tempEpoxySelections[id] || 0) !== requiredQty) {
                            baseMatch = false;
                            break;
                        }
                    }
                    if (!baseMatch) continue;

                    const flexibleSelectedPolyCount = pkg.flexibleGroup.filter(id => tempPolySelections[id] > 0).length;
                    const flexibleSelectedEpoxyCount = pkg.flexibleGroup.filter(id => tempEpoxySelections[id] > 0).length;
                    const isPolyFlexiblePackage = pkg.id.startsWith('USER_P_');
                    const isEpoxyFlexiblePackage = pkg.id.startsWith('USER_E_');
                    let flexibleMatch = false;

                    if (isPolyFlexiblePackage) {
                        flexibleMatch = flexibleSelectedPolyCount === 1 && flexibleSelectedEpoxyCount === 0;
                        if (flexibleMatch) {
                            const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempPolySelections[id] > 0);
                            if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                            if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                        }
                    } else if (isEpoxyFlexiblePackage) {
                        flexibleMatch = flexibleSelectedEpoxyCount === 1 && flexibleSelectedPolyCount === 0;
                        if (flexibleMatch) {
                            const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempEpoxySelections[id] > 0);
                            if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                            if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                        }
                    }

                    if (baseMatch && flexibleMatch) {
                        const packageAreaIds = new Set(getPackageAreaIds(pkg));
                        const finalSelectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
                        const isIdSetMatch = finalSelectedAreaIds.size === packageAreaIds.size &&
                                             [...finalSelectedAreaIds].every(id => packageAreaIds.has(id));

                        if (isIdSetMatch) {
                            return { ...pkg, autoEntrance: appliedAutoEntrance };
                        }
                    }
                    continue;
            }

            let isMatch = true;
            for (const [id, requiredQty] of pkg.P_areas) {
                if ((tempPolySelections[id] || 0) !== requiredQty) {
                    isMatch = false;
                    break;
                }
            }
            if (!isMatch) continue;

            for (const [id, requiredQty] of pkg.E_areas) {
                if ((tempEpoxySelections[id] || 0) !== requiredQty) {
                    isMatch = false;
                    break;
                }
            }
            if (!isMatch) continue;

            const selectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
            const packageAreaIds = new Set(getPackageAreaIds(pkg));
            const isIdSetMatch = selectedAreaIds.size === packageAreaIds.size &&
                                 [...selectedAreaIds].every(id => packageAreaIds.has(id));

            if (isIdSetMatch) {
                return { ...pkg, autoEntrance: appliedAutoEntrance };
            }
        }
        return null;
    }, [quantities, areaMaterials]);


    const calculation = useMemo(() => {
        const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
        let itemizedPrices = [];

        const selectionSummary = getSelectionSummary(quantities, areaMaterials);
        const matchedPackageResult = findMatchingPackage(selectionSummary, quantities);
        const matchedPackage = matchedPackageResult ? matchedPackageResult : null;

        let q = { ...quantities };
        let total = 0;
        let labelText = null;
        let isPackageActive = false;
        let isFreeEntrance = false;
        let totalAreaCount = Object.values(quantities).some(v => v > 0) ? Object.keys(quantities).filter(k => quantities[k] > 0).length : 0;

        let packageAreas = [];

        if (matchedPackage) {
            total = matchedPackage.price;
            isPackageActive = true;
            labelText = '패키지 할인 적용 중';
            packageAreas = getPackageAreaIds(matchedPackage);
            packageAreas.forEach(id => { q[id] = 0; });
            if (quantities['entrance'] >= 1) {
                isFreeEntrance = true;
                q['entrance'] = 0;
            }
        }

        if (quantities['bathroom_floor'] >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
            isFreeEntrance = true;
            isPackageActive = true;
            labelText = '현관 서비스 적용 중';
            q['entrance'] = 0;
        }

        ALL_AREAS.forEach(area => {
            const initialCount = quantities[area.id] || 0;
            if (initialCount === 0) return;
            const count = q[area.id] || 0;
            const areaMatId = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
            const isEpoxy = areaMatId === 'kerapoxy';
            let finalUnitBasePrice = area.basePrice;

            // 🚨 [유지] 가격 계산 로직
            if (area.id === 'balcony_laundry') {
                finalUnitBasePrice = isEpoxy ? 250000 : 100000;
            } else if (area.id === 'kitchen_wall') {
                finalUnitBasePrice = isEpoxy ? 250000 : 150000;
            } else if (area.id === 'living_room') {
                finalUnitBasePrice = isEpoxy ? 1100000 : 550000;
            } else if (area.id === 'entrance') {
                finalUnitBasePrice = 50000;
            } else if (BATHROOM_AREAS.some(a => a.id === area.id)) {
                finalUnitBasePrice = area.basePrice * (isEpoxy ? 1.8 : 1.0);
            }

            const calculatedPricePerUnit = Math.floor(finalUnitBasePrice * selectedHousing.multiplier);
            let itemOriginalTotal = calculatedPricePerUnit * initialCount;
            let finalCalculatedPrice = 0;
            let finalDiscount = 0;
            let isFreeServiceItem = false;
            let packageCount = initialCount - count;

            if (packageCount > 0 && matchedPackage && count === 0) {
                        finalCalculatedPrice = 0;
                        finalDiscount = itemOriginalTotal;
                        isFreeServiceItem = area.id === 'entrance' || packageAreas.includes(area.id);
            }
            else if (area.id === 'entrance' && isFreeEntrance && !matchedPackage && count === 0) {
                        finalCalculatedPrice = 0;
                        finalDiscount = itemOriginalTotal;
                        isFreeServiceItem = true;
            }
            else {
                let remainingOriginalTotal = calculatedPricePerUnit * count;
                let remainingCalculatedPrice = remainingOriginalTotal;
                let remainingDiscount = 0;

                // 실리콘 항목 할인 로직 (총 시공 영역 3개 이상일 때)
                if (area.id === 'silicon_bathtub' && totalAreaCount >= 3) {
                    const nonPackageOriginalPrice = 80000 * count;
                    const fixedPriceForRemaining = 50000 * count;
                    if (count > 0) {
                        remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                        remainingCalculatedPrice = fixedPriceForRemaining;
                    }
                    if (initialCount === count) itemOriginalTotal = 80000 * initialCount;
                } else if (area.id === 'silicon_living_baseboard' && totalAreaCount >= 3) {
                    const nonPackageOriginalPrice = 400000 * count;
                    const fixedPriceForRemaining = 350000 * count;
                    if (count > 0) {
                        remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                        remainingCalculatedPrice = fixedPriceForRemaining;
                    }
                    if (initialCount === count) itemOriginalTotal = 400000 * initialCount;
                } else if (area.id === 'silicon_sink') { // 세면대+젠다이 교체는 단가 30,000원으로 고정
                    remainingCalculatedPrice = 30000 * count;
                }
                finalCalculatedPrice = remainingCalculatedPrice;
                finalDiscount = remainingDiscount;
                total += finalCalculatedPrice;
            }

            finalCalculatedPrice = Math.floor(finalCalculatedPrice / 1000) * 1000;
            itemOriginalTotal = Math.floor(itemOriginalTotal / 1000) * 1000;
            finalDiscount = Math.floor(finalDiscount / 1000) * 1000;

            itemizedPrices.push({
                id: area.id,
                label: area.label,
                quantity: initialCount,
                unit: area.unit,
                originalPrice: itemOriginalTotal,
                calculatedPrice: finalCalculatedPrice,
                discount: finalDiscount,
                isFreeService: isFreeServiceItem,
                isPackageItem: packageCount > 0 || (area.id === 'silicon_bathtub' && totalAreaCount >= 3) || (area.id === 'silicon_living_baseboard' && totalAreaCount >= 3),
                isDiscount: false,
                materialLabel: ['silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'].includes(area.id) ? 'Silicon' : (areaMatId === 'poly' ? 'Poly' : 'Epoxy')
            });
        });

        let discountAmount = 0;
        REVIEW_EVENTS.forEach(evt => {
            if (selectedReviews.has(evt.id)) {
                discountAmount += evt.discount;
                itemizedPrices.push({ id: evt.id, label: evt.label, quantity: 1, unit: '건', originalPrice: evt.discount, calculatedPrice: 0, discount: evt.discount, isPackageItem: false, isDiscount: true, });
            }
        });
        total -= discountAmount;

        const totalItemDiscount = itemizedPrices
            .filter(item => !item.isDiscount)
            .reduce((sum, item) => sum + (item.originalPrice - item.calculatedPrice), 0);
        const totalFinalDiscount = totalItemDiscount + discountAmount;

        let originalCalculatedPrice = Math.max(0, Math.floor(total / 1000) * 1000);
        let finalPrice = originalCalculatedPrice;
        let minimumFeeApplied = false;

        if (finalPrice > 0 && finalPrice < MIN_FEE) {
            finalPrice = MIN_FEE;
            minimumFeeApplied = true;
        }

        const priceBeforeAllDiscount = itemizedPrices.reduce((sum, item) => sum + (item.isDiscount ? 0 : item.originalPrice), 0);

        if (isFreeEntrance && !matchedPackage) {
            labelText = '현관 서비스 적용 중';
        } else if (matchedPackage) {
            labelText = '패키지 할인 적용 중';
        }

        return {
            price: finalPrice,
            originalCalculatedPrice,
            priceBeforeAllDiscount,
            label: labelText,
            isPackageActive: isPackageActive || isFreeEntrance,
            isFreeEntrance: isFreeEntrance,
            discountAmount: totalFinalDiscount,
            minimumFeeApplied,
            itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount),
        };

    }, [quantities, selectedReviews, housingType, areaMaterials, getSelectionSummary, findMatchingPackage]);


    const packageActiveRef = useRef(calculation.isPackageActive);
    useEffect(() => {
        if (calculation.isPackageActive && !packageActiveRef.current) {
            setShowToast(true);
        }
        packageActiveRef.current = calculation.isPackageActive;
    }, [calculation.isPackageActive]);

    const handleCloseToast = useCallback(() => {
        setShowToast(false);
    }, []);

    const handleTileImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTileImageURL(reader.result);
                alert('✅ 타일 이미지가 성공적으로 업로드되었습니다!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageSave = async () => {
        if (quoteRef.current) {
            try {
                const canvas = await html2canvas(quoteRef.current, {
                    scale: 3,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert('✅ 견적서 다운로드가 시작되었습니다!\n\n**파일이 다운로드 폴더에 저장되었는지 확인해주세요.**');
            } catch (error) {
                console.error('Error saving image:', error);
                alert('이미지 저장 중 오류가 발생했습니다. 브라우저 설정을 확인해주세요.');
            }
        }
    };


    const selectedMaterialData = MATERIALS.find(m => m.id === material);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    const hasSelections = Object.values(quantities).some(v => v > 0);

    const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
    const currentEmbedUrl = getEmbedUrl(currentVideo.id);

    // ⭐️ [신규] 밝기 조절에 따른 최종 색상 계산 로직 ⭐️
    const calculateBrightnessAdjustedColor = useCallback((baseColorId, level) => {
        const baseColor = GROUT_COLORS.find(c => c.id === baseColorId) || GROUT_COLORS[0];
        const baseRgb = hexToRgb(baseColor.code);

        // 50: 원본 색상
        if (level === 50) return baseColor.code;

        let modifierColor;
        let baseRatio, modifierRatio;

        if (level > 50) { // 밝게 (화이트로 톤업)
            modifierColor = BRIGHT_MODIFIER_COLOR;
            // 50% (원본) 에서 100% (화이트)까지 0% ~ 100% 비율 사용
            modifierRatio = (level - 50) * 2; // 레벨 100일 때 100%
            baseRatio = 100 - modifierRatio;
        } else { // 어둡게 (119번/차콜로 톤다운)
            modifierColor = DARK_MODIFIER_COLOR;
            // 50% (원본) 에서 0% (119번)까지 0% ~ 100% 비율 사용
            modifierRatio = (50 - level) * 2; // 레벨 0일 때 100%
            baseRatio = 100 - modifierRatio;
        }

        const modifierRgb = hexToRgb(modifierColor.code);

        const finalR = (baseRgb.r * baseRatio + modifierRgb.r * modifierRatio) / 100;
        const finalG = (baseRgb.g * baseRatio + modifierRgb.g * modifierRatio) / 100;
        const finalB = (baseRgb.b * baseRatio + modifierRgb.b * modifierRatio) / 100;

        return rgbToHex(finalR, finalG, finalB);
    }, []);

    const finalBlendedColorCode = useMemo(() => calculateBrightnessAdjustedColor(selectedGroutColor, brightnessLevel), [selectedGroutColor, brightnessLevel, calculateBrightnessAdjustedColor]);

    const finalSelectedColorData = useMemo(() => {
        const code = finalBlendedColorCode;
        if (!code) return GROUT_COLORS[0];
        const { r, g, b } = hexToRgb(code);
        const brightness = (r * 0.2126 + g * 0.7152 + b * 0.0722);
        return {
            id: 'adjusted',
            code: code,
            label: '밝기조절',
            isDark: brightness < 128
        };
    }, [finalBlendedColorCode]);


    const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => {
        if (areaId === 'entrance') {
            return (
                <div className='mt-2 pt-2 border-t border-gray-100'>
                    <div className="text-xs font-bold text-green-700 bg-green-100 p-1.5 rounded-md text-center">
                        현관은 폴리아스파틱 (Poly) 고정입니다.
                    </div>
                </div>
            );
        }
        if (['silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'].includes(areaId)) {
            return (
                <div className='mt-2 pt-2 border-t border-gray-100'>
                    <div className="text-xs font-bold text-green-700 bg-green-100 p-1.5 rounded-md text-center">
                        실리콘 시공은 별도 소재입니다.
                    </div>
                </div>
            );
        }
        return (
            <div className={`mt-2 ${isQuantitySelected ? 'animate-slide-down' : ''} transition-all duration-300`}>
                <div className='flex gap-1.5 pt-2 border-t border-gray-100'>
                    {MATERIALS.map(mat => (
                        <button
                        key={mat.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isQuantitySelected) onChange(areaId, mat.id);
                        }}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all active:scale-95 shadow-sm
                            ${currentMat === mat.id
                            ? 'bg-indigo-700 text-white shadow-lg'
                            : 'bg-indigo-100 text-gray-700 hover:bg-indigo-200'
                            }`}
                        >
                        {mat.label.split('(')[0].trim()}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderAreaList = (areas) => (
        <div className="space-y-3">
            {areas.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && quantities['bathroom_floor'] >= 2 && !calculation.isPackageActive;

                const description = area.desc || area.basePrice ? (
                    (area.desc && area.desc.trim() !== '') ? (
                        <div className="text-xs text-gray-500"><span className="block text-indigo-600">{area.desc}</span></div>
                    ) : null
                ) : null;

                return (
                    <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div>
                                <div>
                                    <div className="font-semibold text-gray-800">{area.label}</div>
                                    {description}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* 수량 조절 버튼 */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleQuantityChange(area.id, -1); }}
                                    className={`w-8 h-8 rounded-full font-bold transition active:scale-90 ${isSelected ? 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                    disabled={quantities[area.id] === 0}
                                >
                                    -
                                </button>
                                <span className={`w-8 text-center font-extrabold text-lg ${isSelected ? 'text-indigo-800' : 'text-gray-500'}`}>
                                    {quantities[area.id]}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleQuantityChange(area.id, 1); }}
                                    className={`w-8 h-8 rounded-full font-bold transition active:scale-90 bg-indigo-500 text-white hover:bg-indigo-600`}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        
                        {isSelected && (
                            <MaterialSelectButtons 
                                areaId={area.id} 
                                currentMat={currentMat} 
                                onChange={handleAreaMaterialChange} 
                                isQuantitySelected={isSelected}
                            />
                        )}
                        {area.id === 'entrance' && isEntranceAutoSelected && (
                             <p className='text-xs text-green-700 bg-green-100 p-1.5 rounded-md text-center mt-2 font-bold'>
                                 * 욕실 바닥 2곳 선택으로 현관은 서비스 시공으로 적용됩니다.
                             </p>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="max-w-xl mx-auto bg-white min-h-screen shadow-2xl safe-area-bottom">
            <GlobalStyles />
            {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
            {showToast && <PackageToast isVisible={showToast} onClose={handleCloseToast} label={calculation.label} />}

            {/* 헤더 */}
            <header className="sticky top-0 bg-indigo-800 p-4 text-white shadow-xl z-20">
                <h1 className="text-xl font-extrabold flex items-center justify-center gap-2">
                    <Hammer className="h-6 w-6 text-amber-400" /> 줄눈의 미학: AI 견적 시뮬레이터
                </h1>
                <p className="text-sm text-center mt-1 text-indigo-300">합리적인 시공 가격을 확인해보세요.</p>
            </header>

            <main className="p-4 sm:p-6">
                
                {/* 1. 시공 환경 선택 */}
                <section className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800">
                        <Home className="h-5 w-5 text-indigo-600" /> 1. 시공 환경 선택
                    </h2>
                    <div className="space-y-3">
                        {/* 거주 형태 선택 */}
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-2">거주 형태</p>
                            <div className="grid grid-cols-2 gap-3">
                                {HOUSING_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setHousingType(type.id)}
                                        className={`p-3 rounded-lg font-semibold text-sm selection-box ${housingType === type.id ? 'bg-indigo-600 text-white shadow-lg selection-selected !border-indigo-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 시공 재료 선택 (현재는 미사용) */}
                        {/* <div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-bold text-gray-700">줄눈 시공 재료</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {MATERIALS.map(mat => (
                                    <button
                                        key={mat.id}
                                        onClick={() => setMaterial(mat.id)}
                                        className={`p-3 rounded-lg font-semibold text-sm selection-box relative ${material === mat.id ? 'bg-indigo-600 text-white shadow-lg selection-selected !border-indigo-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <span className={`absolute top-1 right-1 text-xs px-2 py-0.5 rounded-full font-bold ${mat.badgeColor}`}>{mat.badge}</span>
                                        {mat.label.split('(')[0].trim()}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{selectedMaterialData.description}</p>
                            <button onClick={() => setShowMaterialModal(true)} className="text-xs text-indigo-600 font-semibold mt-1 flex items-center hover:text-indigo-700 transition">
                                <Info size={14} className="mr-1" /> 재료별 상세 스펙 보기
                            </button>
                        </div> */}
                    </div>
                </section>

                {/* 2. 시공 범위 및 색상 선택 */}
                <section className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800">
                        <LayoutGrid className="h-5 w-5 text-indigo-600" /> 2. 시공 범위 및 색상 선택
                    </h2>
                    
                    {/* 2-1. 줄눈 색상 선택 및 밝기 조절 */}
                    <ColorPalette
                        selectedGroutColor={selectedGroutColor}
                        handleColorSelect={handleColorSelect}
                        finalSelectedColorData={finalSelectedColorData}
                        onTileImageUpload={handleTileImageUpload}
                        tileImageURL={tileImageURL}
                        brightnessLevel={brightnessLevel}
                        setBrightnessLevel={setBrightnessLevel}
                    />


                    <h3 className="text-base font-extrabold flex items-center gap-2 mt-8 mb-4 pt-4 border-t border-gray-100 text-gray-800">
                        <Bath className="h-4 w-4 text-indigo-600" /> 2-2. 욕실 및 기타 시공 범위 선택
                    </h3>

                    {/* 욕실 시공 범위 */}
                    <h4 className="text-sm font-bold text-gray-700 mt-5 mb-3">욕실 (바닥 / 벽면 / 부스)</h4>
                    {renderAreaList(BATHROOM_AREAS)}

                    {/* 기타 시공 범위 */}
                    <h4 className="text-sm font-bold text-gray-700 mt-5 mb-3">현관, 베란다, 주방 등</h4>
                    {renderAreaList(OTHER_AREAS)}

                    {/* 실리콘 시공 범위 */}
                    <h4 className="text-sm font-bold text-gray-700 mt-5 mb-3">실리콘 오염 방지 및 교체</h4>
                    {renderAreaList(SILICON_AREAS)}
                </section>
                
                {/* 3. 할인 및 이벤트 적용 */}
                <section className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800">
                        <Gift className="h-5 w-5 text-indigo-600" /> 3. 할인 및 이벤트
                    </h2>
                    <div className="space-y-3">
                        <div className={`p-3 rounded-lg border flex items-center justify-between transition duration-150 ${isSoomgoReviewApplied ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSoomgoReviewApplied ? 'bg-amber-500 text-white' : 'bg-gray-200 text-amber-600'}`}><Star size={18} /></div>
                                <div>
                                    <div className="font-semibold text-gray-800">{soomgoReviewEvent.label}</div>
                                    <p className="text-xs text-gray-500">{soomgoReviewEvent.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleReview(soomgoReviewEvent.id)}
                                className={`py-1 px-3 rounded-full text-xs font-bold transition active:scale-95 shadow-sm 
                                    ${isSoomgoReviewApplied ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                            >
                                {isSoomgoReviewApplied ? '적용 취소' : `적용 (-${(soomgoReviewEvent.discount / 10000).toLocaleString()}만원)`}
                            </button>
                        </div>
                        <a 
                            href={SOOMGO_REVIEW_URL} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="shine-effect block w-full text-center py-2.5 rounded-lg font-extrabold text-sm transition shadow-lg mt-3"
                        >
                            <Crown size={14} className="inline mr-1 -mt-0.5" /> 실제 후기 보러가기 (총 100건 이상)
                        </a>
                    </div>
                </section>


                {/* 4. 최종 견적서 */}
                <section ref={quoteRef} className="mb-8 p-4 bg-indigo-900 rounded-xl shadow-2xl animate-fade-in text-white border-2 border-indigo-700">
                    <h2 className="text-xl font-extrabold flex items-center gap-2 mb-5 text-amber-400">
                        <Calculator className="h-5 w-5 text-amber-400" /> 4. 최종 견적서
                    </h2>

                    <div className="bg-indigo-800 p-4 rounded-lg shadow-inner">
                        <p className="text-sm font-bold text-indigo-300 mb-2">총 시공 금액</p>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-black text-white leading-none">
                                {calculation.price.toLocaleString()}
                            </span>
                            <span className="text-2xl font-bold text-white ml-1">원</span>
                        </div>
                        
                        {calculation.discountAmount > 0 && (
                            <div className="mt-3 pt-3 border-t border-indigo-700 flex justify-between items-center text-sm">
                                <span className="font-semibold text-indigo-300">총 할인 금액</span>
                                <span className="font-extrabold text-green-400">- {calculation.discountAmount.toLocaleString()} 원</span>
                            </div>
                        )}
                        
                        {hasSelections && (
                            <div className="mt-1 flex justify-between items-center text-xs">
                                <span className="font-semibold text-indigo-300">할인 전 금액</span>
                                <span className={`font-medium ${calculation.discountAmount > 0 ? 'line-through text-indigo-400' : 'text-indigo-300'}`}>
                                    {calculation.priceBeforeAllDiscount.toLocaleString()} 원
                                </span>
                            </div>
                        )}

                        {calculation.minimumFeeApplied && (
                            <p className="text-xs text-amber-400 mt-2 font-semibold flex items-center gap-1">
                                <Info size={14} /> 최소 시공 금액 ({MIN_FEE.toLocaleString()}원) 적용
                            </p>
                        )}

                        {calculation.isPackageActive && (
                            <p className="text-xs text-amber-400 mt-2 font-semibold flex items-center gap-1">
                                <CheckCircle2 size={14} /> {calculation.label}
                            </p>
                        )}
                    </div>

                    {/* 항목별 상세 내역 */}
                    <div className="mt-5 space-y-3">
                        <h3 className="text-sm font-extrabold text-indigo-300 border-b border-indigo-700 pb-1">항목별 상세 내역</h3>
                        {calculation.itemizedPrices.length === 0 ? (
                            <p className="text-sm text-indigo-400">선택된 시공 항목이 없습니다.</p>
                        ) : (
                            <ul className="text-sm space-y-2">
                                {calculation.itemizedPrices.map((item, index) => (
                                    <li key={index} className="flex justify-between items-start pb-1 border-b border-indigo-900/50">
                                        <div className="flex-1 pr-2">
                                            <span className={`font-semibold ${item.isDiscount ? 'text-amber-300' : item.isPackageItem ? 'text-indigo-200' : 'text-white'}`}>
                                                {item.label}
                                            </span>
                                            {item.quantity > 0 && (
                                                <span className="text-xs font-normal text-indigo-400 ml-1">
                                                    ({item.materialLabel}, {item.quantity}{item.unit})
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {item.calculatedPrice === 0 ? (
                                                <span className={`font-bold ${item.isDiscount ? 'text-amber-300' : 'text-green-400'}`}>
                                                    {item.isDiscount ? '할인 적용' : '서비스 적용'}
                                                </span>
                                            ) : (
                                                <span className="font-extrabold text-white">
                                                    {item.calculatedPrice.toLocaleString()} 원
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
                
                {/* 견적서 다운로드 및 문의하기 */}
                <div className="mb-8 flex gap-3">
                    <button 
                        onClick={handleImageSave} 
                        className="flex-1 py-3 bg-amber-400 text-indigo-900 rounded-xl font-extrabold shadow-lg hover:bg-amber-300 transition active:scale-95 flex items-center justify-center gap-2"
                        disabled={!hasSelections}
                    >
                        <ImageIcon size={18} /> 견적서 이미지로 저장
                    </button>
                    <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-green-500 text-white rounded-xl font-extrabold shadow-lg hover:bg-green-600 transition active:scale-95 flex items-center justify-center gap-2">
                        <Phone size={18} /> 시공 문의 (카카오톡)
                    </a>
                </div>

                {/* FAQ 및 정보 */}
                <section className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800">
                        <HelpCircle className="h-5 w-5 text-indigo-600" /> 5. 시공 FAQ
                    </h2>
                    <div className="divide-y divide-gray-100">
                        {FAQ_ITEMS.map((item, index) => (
                            <Accordion key={index} question={item.question} answer={item.answer} />
                        ))}
                    </div>
                </section>
                
                {/* 시공 영상 */}
                <section className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800">
                        <Zap className="h-5 w-5 text-indigo-600" /> 6. 시공 영상 자료
                    </h2>
                    <div className='flex gap-2 mb-3'>
                        {YOUTUBE_VIDEOS.map(video => (
                            <button
                                key={video.id}
                                onClick={() => setActiveVideoId(video.id)}
                                className={`flex-1 text-xs font-bold py-2 rounded-lg transition active:scale-95 ${activeVideoId === video.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {video.label}
                            </button>
                        ))}
                    </div>
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md">
                        <iframe
                            className="w-full h-full"
                            src={currentEmbedUrl}
                            title={currentVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <p className='text-xs text-gray-500 mt-3 text-center'>
                        * 영상은 시공 과정 이해를 돕기 위한 참고 자료입니다.
                    </p>
                </section>

            </main>

            {/* 푸터 */}
            <footer className="p-4 bg-gray-100 text-center text-xs text-gray-500 border-t border-gray-200 safe-area-bottom">
                <p>ⓒ 2024 줄눈의 미학. All rights reserved.</p>
                <p>시공 문의: <a href={`tel:${PHONE_NUMBER}`} className="font-semibold text-indigo-600">{PHONE_NUMBER}</a></p>
                <p className='mt-2'>본 견적 시뮬레이터는 예상 금액을 제공하며, 최종 시공 금액은 현장 실측 후 확정됩니다.</p>
            </footer>
        </div>
    );
}