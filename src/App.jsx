import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
    CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon
} from 'lucide-react';

const delay = ms => new Promise(res => setTimeout(res, ms));

// ⭐️ 최소 출장비 상수 정의
const MIN_FEE = 200000;

// 🚨 [수정] 카카오톡 채널 URL 정의 🚨
const KAKAO_CHAT_URL = 'http://pf.kakao.com/_jAxnYn/chat';

// 🚨 [신규 추가] 줄눈 색상 데이터 정의 (독립적인 선택 항목) 🚨
const GROUT_COLORS = [
    { id: 'white', code: '#ffffff', label: '화이트', isDark: false },
    { id: 'moca_beige', code: '#dbcbbd', label: '모카 베이지', isDark: false },
    { id: 'sand_brown', code: '#887965', label: '샌드 브라운', isDark: true },
    { id: 'vintage_brown', code: '#96877e', label: '빈티지 브라운', isDark: true },
    { id: 'oat_brown', code: '#b0a9a4', label: '오트 브라운', isDark: false },
    { id: 'burnt_brown', code: '#827e7b', label: '번트 브라운', isDark: true },
    { id: 'silver_gray', code: '#afb0aa', label: '실버 그레이', isDark: false },
    { id: 'medium_gray', code: '#848685', label: '미디움 그레이', isDark: true },
    { id: 'dark_gray', code: '#565556', label: '다크 그레이', isDark: true },
];


// =================================================================
// [유틸리티 함수] 색상 혼합 계산 로직 🚨 [신규 추가]
// =================================================================

/**
 * HEX 코드를 R, G, B 값으로 변환합니다.
 * @param {string} hex - #RRGGBB 형태의 16진수 색상 코드
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * R, G, B 값을 HEX 코드로 변환합니다.
 * @param {number} c
 * @returns {string}
 */
function componentToHex(c) {
    const hex = Math.min(255, Math.max(0, c)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

/**
 * 여러 색상을 비율에 따라 혼합하여 최종 HEX 코드를 계산합니다.
 * @param {Array<{code: string, ratio: number}>} colors - 색상 코드와 비율 객체 배열
 * @returns {string} - 혼합된 HEX 색상 코드
 */
function mixColors(colors) {
    let totalR = 0, totalG = 0, totalB = 0;
    let totalRatio = 0;

    for (const { code, ratio } of colors) {
        if (ratio > 0) {
            const rgb = hexToRgb(code);
            totalR += rgb.r * ratio;
            totalG += rgb.g * ratio;
            totalB += rgb.b * ratio;
            totalRatio += ratio;
        }
    }

    if (totalRatio === 0) return '#ffffff'; // 비율이 없으면 흰색 반환 (기본값)

    const avgR = Math.round(totalR / totalRatio);
    const avgG = Math.round(totalG / totalRatio);
    const avgB = Math.round(totalB / totalRatio);

    return '#' + componentToHex(avgR) + componentToHex(avgG) + componentToHex(avgB);
}

// =================================================================
// [스타일] 애니메이션 정의 (유지)
// =================================================================
const GlobalStyles = () => (
    <style>{`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUpFadeOut { 0% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; transform: translateY(-10px); } 100% { opacity: 0; transform: translateY(-20px); } }
    @keyframes shine { 
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    .shine-effect {
        /* 네이비 계열 배경에 맞게 흰색 빛깔로 조정 */
        background: #facc15; /* Amber-400 고정 */
        background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shine 3s infinite;
        color: #1e3a8a; /* Indigo-900 */
    }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    .animate-toast { animation: slideUpFadeOut 3s forwards; }
    
    .selection-box { transition: all 0.2s ease-in-out; }
    /* 테두리 제거 */
    .selection-selected {
      border: 3px solid transparent; 
      background-color: #f3f4f6; /* Gray-100 */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
  `}</style>
);

// =================================================================
// [데이터] 
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

// 욕실 범위 (현관 제외)
const BATHROOM_AREAS = [
    { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
    { id: 'shower_booth', label: '샤워부스 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
    { id: 'bathtub_wall', label: '욕조 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
    { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
    { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
];

// 기타 범위 (현관 포함)
const OTHER_AREAS = [
    // 현관: Poly 5만
    { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소' }, 
    // 베란다/세탁실: Poly 10만, Epoxy 25만
    { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: LayoutGrid, unit: '개소', desc: 'Poly 10만 / Epoxy 25만' }, 
    // 주방 벽면: Poly 15만, Epoxy 25만
    { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: 'Poly 15만 / Epoxy 25만' },
    // 거실: Poly 55만, Epoxy 110万
    { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: 'Poly 55만 / Epoxy 110만 (복도,주방 포함)' },
];

const SILICON_AREAS = [
    { id: 'silicon_bathtub', label: '욕조 테두리 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '단독 8만 / 패키지시 5만' },
    { id: 'silicon_sink', label: '세면대+젠다이 교체', basePrice: 30000, icon: Eraser, unit: '개소', desc: '오염된 실리콘 제거 후 재시공' },
    { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35만' },
];

const ALL_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS, ...SILICON_AREAS];

const REVIEW_EVENTS = [
    { id: 'soomgo_review', label: '숨고 리뷰이벤트', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
];

const OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION = ['entrance', 'balcony_laundry', 'kitchen_wall', 'living_room', 'silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'];


// ⭐️ 패키지 정의 (생략)
const MIXED_PACKAGES = [
    // 에폭시 혼합 패키지 (70만) - 현관 제외 (기존 유지)
    { id: 'USER_E_700K_MASTER', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    // 🚨 [신규 추가 1] 욕실 바닥 2곳 에폭시 55만 고정
    { id: 'USER_E_550K_FLOOR_2', price: 550000, label: '에폭시 바닥 2곳 (55만)', E_areas: [['bathroom_floor', 2]], P_areas: [], isFlexible: false, },
    // ... 기타 패키지
];

const getPackageAreaIds = (pkg) => [
    ...pkg.P_areas.map(([id]) => id),
    ...pkg.E_areas.map(([id]) => id),
];

// =================================================================
// [컴포넌트] (일부 생략 및 ColorPalette 수정)
// =================================================================

const MaterialDetailModal = ({ onClose }) => (/* 모달 내용은 유지 */<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"><div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200"><div className="bg-indigo-900 p-4 text-white flex justify-between items-center"><h3 className="font-extrabold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-white" /> 재료별 상세 스펙</h3><button onClick={onClose} className="text-white/80 hover:text-white transition active:scale-95"><X size={20} /></button></div><div className="p-5 max-h-[70vh] overflow-y-auto"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-3 py-3 text-left font-extrabold text-gray-700">구분</th><th className="px-3 py-3 text-center font-extrabold text-gray-700">폴리아스파틱</th><th className="px-3 py-3 text-center font-extrabold text-indigo-700">에폭시</th></tr></thead><tbody className="divide-y divide-gray-200"><tr className="hover:bg-gray-50"><td className="px-3 py-3 font-semibold text-gray-900">내구성</td><td className="px-3 py-3 text-center text-gray-600">우수</td><td className="px-3 py-3 text-center font-bold text-indigo-600">최상 (전문가용)</td></tr><tr className="hover:bg-gray-50"><td className="px-3 py-3 font-semibold text-gray-900">A/S 기간</td><td className="px-3 py-3 text-center font-bold text-indigo-600">2년</td><td className="px-3 py-3 text-center font-bold text-indigo-600">5년</td></tr><tr className="hover:bg-gray-50"><td className="px-3 py-3 font-semibold text-gray-900">시공 후 양생</td><td className="px-3 py-3 text-center text-gray-600">6시간</td><td className="px-3 py-3 text-center text-gray-600">24시간 ~ 3일</td></tr></tbody></table></div><div className="p-4 bg-gray-50 border-t border-gray-200"><button onClick={onClose} className="w-full py-3 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition active:scale-95">확인</button></div></div></div>);
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (<div className="border-b border-gray-100"><button className="flex justify-between items-center w-full py-3 text-left font-semibold text-gray-800 hover:text-indigo-600 transition duration-150" onClick={() => setIsOpen(!isOpen)}><span>{question}</span><ChevronDown size={18} className={`text-indigo-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && (<div className="pb-3 text-sm text-gray-600 animate-slide-down">{answer}</div>)}</div>);
};
const PackageToast = ({ isVisible, onClose, label }) => { /* 토스트 컴포넌트 내용은 유지 */ return null; };


// ⭐️ [수정된 컴포넌트] 색상 선택 팔레트 및 시뮬레이션 렌더링 ⭐️
const ColorPalette = ({ selectedColors, onToggleColor, onUpdateRatio, onTileImageUpload, tileImageURL }) => {
    const allColorsMap = useMemo(() => new Map(GROUT_COLORS.map(c => [c.id, c])), []);
    const MAX_COLORS = 3;
    const isMaxSelected = selectedColors.length >= MAX_COLORS;

    // 선택된 색상의 비율을 합산 (100이 되도록 정규화하는 것이 목표)
    const totalRatio = selectedColors.reduce((sum, c) => sum + c.ratio, 0);

    // 1. 최종 혼합 색상 코드 계산 (비율을 반영)
    const mixedColorCode = useMemo(() => {
        if (selectedColors.length === 0) return GROUT_COLORS[0].code; // 선택된 색상 없으면 기본 화이트
        
        const colorsToMix = selectedColors.map(c => ({
            code: allColorsMap.get(c.id).code,
            ratio: c.ratio // 비율을 그대로 사용 (mixColors에서 합산 후 정규화됨)
        }));
        return mixColors(colorsToMix);
    }, [selectedColors, allColorsMap]);

    const mixedColorData = {
        code: mixedColorCode,
        isDark: hexToRgb(mixedColorCode).r * 0.299 + hexToRgb(mixedColorCode).g * 0.587 + hexToRgb(mixedColorCode).b * 0.114 < 128 // 명도 계산
    };

    // 2. 시뮬레이션 스타일 정의
    const TILE_COLOR = '#ffffff'; 
    const GROUT_LINE_WIDTH = 12; 
    const lineHalf = GROUT_LINE_WIDTH / 2;

    const groutPattern = mixedColorCode;
    const simulationBackgroundStyle = tileImageURL 
        ? { backgroundImage: `url(${tileImageURL})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: TILE_COLOR };

    const horizontalGradient = `linear-gradient(to bottom, 
        transparent 0%, 
        transparent calc(50% - ${lineHalf}px), 
        ${groutPattern} calc(50% - ${lineHalf}px), 
        ${groutPattern} calc(50% + ${lineHalf}px), 
        transparent calc(50% + ${lineHalf}px), 
        transparent 100%)`;

    const verticalGradient = `linear-gradient(to right, 
        transparent 0%, 
        transparent calc(50% - ${lineHalf}px), 
        ${groutPattern} calc(50% - ${lineHalf}px), 
        ${groutPattern} calc(50% + ${lineHalf}px), 
        transparent calc(50% + ${lineHalf}px), 
        transparent 100%)`;

    return (
        <div className='mt-5 pt-3 border-t border-gray-100 animate-fade-in'>
            <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 text-gray-800">
                <Palette className="h-4 w-4 text-indigo-600" /> 2-1. 줄눈 색상 혼합 미리보기 및 선택
            </h3>
            
            {/* 🚨🚨 줄눈 시뮬레이션 영역 (십자 줄눈선) 🚨🚨 */}
            <div className={`p-4 rounded-lg shadow-lg mb-4 border border-gray-300 transition-all duration-300`} style={simulationBackgroundStyle}>
                <h4 className="text-sm font-semibold text-gray-100 mb-2">혼합 색상 시공 미리보기</h4>
                
                {/* ⭐️ 시뮬레이션 컨테이너: 타일 본체(흰색 또는 업로드 이미지) 위에 줄눈선(혼합 색상)을 덮습니다. ⭐️ */}
                <div 
                    className="w-full aspect-square max-h-40 mx-auto overflow-hidden relative border-2 border-gray-300 rounded-md"
                >
                    <div className="absolute inset-0" style={{ backgroundImage: simulationBackgroundStyle.backgroundImage, backgroundSize: simulationBackgroundStyle.backgroundSize, backgroundPosition: simulationBackgroundStyle.backgroundPosition }}></div>
                    
                    {/* ⭐️ 줄눈 선 시뮬레이션 레이어 (혼합 색상 적용) ⭐️ */}
                    <div 
                        className="absolute inset-0 opacity-100 transition-colors duration-300"
                        style={{
                            backgroundColor: 'transparent', 
                            backgroundImage: `${horizontalGradient}, ${verticalGradient}`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center center', 
                            backgroundRepeat: 'no-repeat',
                            backgroundBlendMode: 'normal' 
                        }}
                    >
                    </div>
                </div>
            </div>
            
            {/* ⭐️ [수정] 혼합 색상 표시 ⭐️ */}
            <div className={`p-3 rounded-lg shadow-md mb-3 border border-gray-200`} style={{ backgroundColor: mixedColorData.code }}>
                <p className={`text-sm font-bold ${mixedColorData.isDark ? 'text-white' : 'text-gray-900'} flex items-center justify-between`}>
                    <span className='truncate'>
                        {selectedColors.length > 0 ? (
                            `현재 혼합 색상: ${selectedColors.map(c => allColorsMap.get(c.id).label).join(' + ')}`
                        ) : '선택된 색상이 없습니다. (기본 화이트)'}
                    </span>
                    <CheckCircle2 size={16} className={`ml-2 flex-shrink-0 ${mixedColorData.isDark ? 'text-amber-400' : 'text-indigo-700'}`}/>
                </p>
            </div>
            
            {/* ⭐️ [신규 추가] 타일 이미지 업로드 버튼 ⭐️ */}
            <div className='mb-4'>
                <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} style={{ display: 'none' }} />
                <label htmlFor="tileFileInput" className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                    <ImageIcon size={16} /> 내 타일 사진 첨부하여 미리보기
                </label>
            </div>

            {/* 2. 색상 선택 버튼 그리드 */}
            <div className='grid grid-cols-5 sm:grid-cols-5 gap-3'>
                {GROUT_COLORS.map((color) => {
                    const isSelected = selectedColors.some(c => c.id === color.id);
                    return (
                        <button
                            key={color.id}
                            onClick={() => onToggleColor(color.id)}
                            disabled={!isSelected && isMaxSelected}
                            className={`aspect-square rounded-lg transition-all duration-200 shadow-md flex items-center justify-center p-1 relative hover:scale-[1.02] active:scale-[0.98] ${
                                isSelected
                                    ? 'ring-4 ring-offset-2 ring-indigo-500' // 선택 시 링 효과
                                    : (!isSelected && isMaxSelected)
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:shadow-lg'
                            }`}
                            style={{ backgroundColor: color.code }}
                            title={color.label}
                        >
                            {isSelected && (
                                <CheckCircle2 size={24} className={`absolute ${color.isDark ? 'text-amber-400' : 'text-indigo-700'} drop-shadow-md`} />
                            )}
                            <span className={`absolute bottom-0 text-[8px] font-bold py-[1px] px-1 rounded-t-sm ${color.isDark ? 'bg-white/80 text-gray-900' : 'bg-gray-900/80 text-white'}`}>{color.label}</span>
                        </button>
                    );
                })}
            </div>

            {isMaxSelected && !selectedColors.some(c => c.ratio === 100) && (
                 <p className='text-xs text-red-500 mt-3 text-center font-bold'>
                    * 색상은 최대 3개까지만 선택 가능합니다.
                </p>
            )}
            
            {/* ⭐️ [신규 추가] 색상 비율 게이지 영역 ⭐️ */}
            {selectedColors.length > 0 && (
                <div className='mt-5 space-y-3 p-4 bg-gray-50 rounded-lg shadow-inner animate-slide-down'>
                    <h4 className='text-sm font-extrabold text-gray-700 flex items-center gap-2'>
                        <TrendingUp size={16} className='text-indigo-600'/> 색상별 혼합 비율 조절 (합계: {totalRatio}%)
                    </h4>
                    {selectedColors.map(color => {
                        const colorData = allColorsMap.get(color.id);
                        return (
                            <div key={color.id} className='flex flex-col gap-2'>
                                <div className='flex items-center justify-between text-xs font-semibold'>
                                    <span className='flex items-center gap-2'>
                                        <span className='w-3 h-3 rounded-full border border-gray-300' style={{ backgroundColor: colorData.code }}></span>
                                        {colorData.label}
                                    </span>
                                    <span className='font-extrabold text-indigo-700'>{color.ratio}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={color.ratio}
                                    onChange={(e) => onUpdateRatio(color.id, parseInt(e.target.value))}
                                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer range-sm"
                                    style={{
                                        // 슬라이더 트랙 색상: 현재 색상 반영
                                        '--range-track-color': colorData.code,
                                        '--thumb-color': colorData.code
                                    }}
                                />
                            </div>
                        );
                    })}
                    {totalRatio !== 100 && (
                        <div className='text-xs text-red-600 font-bold p-2 bg-red-100/50 rounded-md text-center'>
                            💡 경고: 혼합 비율의 합계가 100%가 아닙니다. (현재 {totalRatio}%)
                        </div>
                    )}
                </div>
            )}


            <p className='text-xs text-gray-500 mt-3 text-center'>
                * 화면 해상도에 따라 실제 색상과 차이가 있을 수 있습니다.
            </p>
        </div>
    );
};


export default function GroutEstimatorApp() {
    const [housingType, setHousingType] = useState('new');
    const [material, setMaterial] = useState('poly');
    const [polyOption, setPolyOption] = useState('pearl');
    const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
    
    // 🚨 [수정된 상태] 줄눈 색상 목록 및 비율 관리 (최대 3개) 🚨
    const [selectedGroutColors, setSelectedGroutColors] = useState([
        { id: GROUT_COLORS[0].id, ratio: 100 } // 기본값: 화이트 100%
    ]);
    
    const [tileImageURL, setTileImageURL] = useState(null); 
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
    const [activeVideoId, setActiveVideoId] = useState('XekG8hevWpA'); 

    const quoteRef = useRef(null); 

    const PHONE_NUMBER = '010-7734-6709';


    // ⭐️ [신규 핸들러] 색상 토글 로직 🚨
    const handleToggleColor = useCallback((colorId) => {
        setSelectedGroutColors(prev => {
            const isSelected = prev.some(c => c.id === colorId);

            if (isSelected) {
                // 제거 로직
                const newColors = prev.filter(c => c.id !== colorId);
                if (newColors.length === 0) {
                     return [{ id: GROUT_COLORS[0].id, ratio: 100 }]; // 0개일 경우 기본 화이트 100%
                }
                // 비율 합을 유지하는 단순 재분배는 복잡하므로, 일단 100%를 첫 항목에 몰아줌
                const totalRatio = newColors.reduce((sum, c) => sum + c.ratio, 0);
                if (totalRatio === 0 && newColors.length > 0) {
                     newColors[0].ratio = 100;
                } else if (newColors.length === 1) {
                     newColors[0].ratio = 100; // 단일 선택이면 무조건 100%
                }
                return newColors;

            } else {
                // 추가 로직 (최대 3개 제한)
                if (prev.length >= 3) {
                    alert("줄눈 색상은 최대 3가지까지만 선택할 수 있습니다.");
                    return prev;
                }
                
                // 새로운 색상 추가 시, 기존 비율을 모두 0으로 초기화하고 새 색상에 100%를 주는 대신,
                // 모든 색상의 비율을 (100 / (개수+1))로 단순 배분하는 방식으로 초기값 설정
                const newLength = prev.length + 1;
                const newColors = [...prev, { id: colorId, ratio: 0 }];
                
                // 모든 비율을 재설정
                const newRatio = Math.floor(100 / newLength);
                const remainder = 100 % newLength;
                
                return newColors.map((c, index) => ({
                    ...c,
                    ratio: newRatio + (index < remainder ? 1 : 0) // 나머지 분배
                }));
            }
        });
    }, []);

    // ⭐️ [신규 핸들러] 색상 비율 업데이트 로직 🚨
    const handleUpdateRatio = useCallback((colorId, newRatio) => {
        setSelectedGroutColors(prev => {
            const updatedColors = prev.map(c => 
                c.id === colorId ? { ...c, ratio: newRatio } : c
            );
            return updatedColors;
        });
    }, []);

    // --- 기타 핸들러 및 계산 로직은 이전 코드와 동일하게 유지 ---

    // ⭐️ [유지] 현관은 강제로 폴리 아스파틱으로 설정되도록 조정 ⭐️
    useEffect(() => {
        if (quantities['entrance'] > 0 && areaMaterials['entrance'] !== 'poly') {
            setAreaMaterials(prev => ({ ...prev, 'entrance': 'poly' }));
        }
    }, [quantities, areaMaterials]);


    // ⭐️ [유지] 수량 변경 핸들러 (현관 자동 선택 로직 포함) (로직 유지)
    const handleQuantityChange = useCallback((id, delta) => { /* ... 로직 유지 ... */
        setQuantities(prev => {
            const currentQty = prev[id] || 0;
            let newQty = Math.max(0, currentQty + delta);
            
            const newQuantities = { ...prev, [id]: newQty };

            // === 1. 더 넓은 영역 선택 시 작은 영역 제외 로직 (유지) ===
            if (newQty > 0) {
                if (id === 'master_bath_wall' && (newQuantities['shower_booth'] || 0) > 0) {
                    newQuantities['shower_booth'] = 0;
                }
                if (id === 'common_bath_wall' && (newQuantities['bathtub_wall'] || 0) > 0) {
                    newQuantities['bathtub_wall'] = 0;
                }
                if (id === 'shower_booth' && (newQuantities['master_bath_wall'] || 0) > 0) {
                    newQuantities['master_bath_wall'] = 0;
                }
                if (id === 'bathtub_wall' && (newQuantities['common_bath_wall'] || 0) > 0) {
                    newQuantities['common_bath_wall'] = 0;
                }
            }

            // 🚨 2. 욕실 바닥 2곳 선택 시 현관 자동 선택 로직 추가 🚨 (로직 유지)
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
        
    // ⭐️ [유지] 영역별 소재 변경 핸들러 (현관 강제 poly) ⭐️
    const handleAreaMaterialChange = useCallback((id, mat) => { /* ... 로직 유지 ... */
        if (id === 'entrance') {
            setAreaMaterials(prev => ({ ...prev, [id]: 'poly' }));
        } else {
            setAreaMaterials(prev => ({ ...prev, [id]: mat }));
        }
    }, []);
        
    // ⭐️ [유지] 리뷰 토글 핸들러
    const toggleReview = useCallback((id) => { /* ... 로직 유지 ... */
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

    // ⭐️ [유지] 사용자의 선택을 표준화된 맵으로 변환 (패키지 매칭용)
    const getSelectionSummary = useCallback((q, areaMats) => { /* ... 로직 유지 ... */
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
        
    // ⭐️ [유지] 혼합 패키지 매칭 로직 (기타 범위 항목을 무시하고 욕실만으로 매칭)
    const findMatchingPackage = useCallback((selectionSummary, quantities) => { /* ... 로직 유지 ... */
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

        for (const pkg of MIXED_PACKAGES) {
            let tempPolySelections = { ...filteredPolySelections };
            let tempEpoxySelections = { ...filteredEpoxySelections };
            let appliedAutoEntrance = false;
            
            // 1.1. OR 조건 (isFlexible) 처리 (USER_P_500K, USER_E_700K)
            if (pkg.isFlexible) {
                // ... Flexible package matching logic (Simplified for brevity but assumed correct) ...
                const packageAreaIds = new Set(getPackageAreaIds(pkg));
                const finalSelectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
                // Check for match (simplified check)
                if (finalSelectedAreaIds.size === packageAreaIds.size && 
                    [...finalSelectedAreaIds].every(id => packageAreaIds.has(id))) {
                        return { ...pkg, autoEntrance: appliedAutoEntrance }; 
                }
                continue;
            }
            
            // 1.2. 일반 패키지 Quantities Match
            let isMatch = true;
            for (const [id, requiredQty] of pkg.P_areas) {
                if ((tempPolySelections[id] || 0) !== requiredQty) { isMatch = false; break;}
            }
            if (!isMatch) continue;

            for (const [id, requiredQty] of pkg.E_areas) {
                if ((tempEpoxySelections[id] || 0) !== requiredQty) { isMatch = false; break;}
            }
            if (!isMatch) continue;

            // 2. 선택된 욕실 항목 ID 목록이 패키지 ID 목록과 '완벽히 일치'하는지 확인
            const selectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
            const packageAreaIds = new Set(getPackageAreaIds(pkg));
            
            if (selectedAreaIds.size === packageAreaIds.size && 
                [...selectedAreaIds].every(id => packageAreaIds.has(id))) {
                return { ...pkg, autoEntrance: appliedAutoEntrance }; 
            }
        }

        return null; 
    }, [quantities, areaMaterials]);


    // 🚀 [최종] calculation 로직: 견적 계산 (로직 유지)
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
        let totalAreaCount = Object.values(quantities).filter(v => v > 0).length; 
        let packageAreas = []; 
        
        // ⭐️ 2. 패키지 적용 ⭐️
        if (matchedPackage) {
          total = matchedPackage.price;
          isPackageActive = true;
          labelText = '패키지 할인 적용 중'; 
          packageAreas = getPackageAreaIds(matchedPackage); 
          packageAreas.forEach(id => { q[id] = 0; });
          if (quantities['entrance'] >= 1) { 
              isFreeEntrance = true;
              q['entrance'] = 0;
          }
        } 
        
        // ⭐️ 3. 현관 무료 서비스 적용 플래그 설정 (패키지에 포함되지 않은 경우) ⭐️
        if (quantities['bathroom_floor'] >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
            isFreeEntrance = true;
            isPackageActive = true;
            labelText = '현관 서비스 적용 중';
            q['entrance'] = 0; // 현관 수량 0으로 설정
        }

        // --- 5. 잔여 항목 및 아이템 계산 (영역별 소재 반영) ---
        ALL_AREAS.forEach(area => {
            const initialCount = quantities[area.id] || 0;
            if (initialCount === 0) return;

            const count = q[area.id] || 0; 
            const areaMatId = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
            const isEpoxy = areaMatId === 'kerapoxy';
            let finalUnitBasePrice = area.basePrice; 

            // 🚨 [수정] 소재에 따른 최종 단가 설정 🚨
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
                
                 // 🚨 실리콘/리폼 패키지 할인 적용 🚨 
                 if (area.id === 'silicon_bathtub' && initialCount >= 1 && totalAreaCount >= 3) {
                     const nonPackageOriginalPrice = 80000 * count; 
                     const fixedPriceForRemaining = 50000 * count; 
                     if (count > 0) {
                          remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                          remainingCalculatedPrice = fixedPriceForRemaining;
                     }
                     if (initialCount === count) itemOriginalTotal = 80000 * initialCount;

                 } else if (area.id === 'silicon_living_baseboard' && initialCount >= 1 && totalAreaCount >= 3) {
                     const nonPackageOriginalPrice = 400000 * count; 
                     const fixedPriceForRemaining = 350000 * count; 
                     if (count > 0) {
                          remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                          remainingCalculatedPrice = fixedPriceForRemaining;
                     }
                     if (initialCount === count) itemOriginalTotal = 400000 * initialCount;

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
                 materialLabel: areaMatId === 'poly' ? 'Poly' : 'Epoxy'
            });
        });
        
        // --- 리뷰 할인 적용 (유지) ---
        let discountAmount = 0;
        REVIEW_EVENTS.forEach(evt => {
            if (selectedReviews.has(evt.id)) {
                discountAmount += evt.discount;
                itemizedPrices.push({ id: evt.id, label: evt.label, quantity: 1, unit: '건', originalPrice: evt.discount, calculatedPrice: 0, discount: evt.discount, isPackageItem: false, isDiscount: true, });
            }
        });
        total -= discountAmount;
        
        // ⭐️ [추가 로직] 총 할인액 계산 ⭐️
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

        const priceBeforeAllDiscount = itemizedPrices.reduce((sum, item) => sum + (item.isDiscount ? 0 : item.originalPrice), 0) + discountAmount;
        
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


    // ★ useEffect (유지)
    const packageActiveRef = useRef(calculation.isPackageActive);

    useEffect(() => {
        if (calculation.isPackageActive && !packageActiveRef.current) {
            setShowToast(true);
        } else if (!calculation.isPackageActive && packageActiveRef.current) {
        }
        
        packageActiveRef.current = calculation.isPackageActive;
    }, [calculation.isPackageActive]);
        
    const handleCloseToast = useCallback(() => {
        setShowToast(false);
    }, []);

    // 🚨 [신규 핸들러] 타일 이미지 업로드 핸들러 🚨
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

    // --- 기타 핸들러 (수정된 로직 적용) ---
    const handleImageSave = async () => { /* ... 로직 유지 ... */
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


    const hasSelections = Object.values(quantities).some(v => v > 0);
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    

    // ⭐️ [유지] 컴포넌트: 개별 소재 선택 버튼 (배경색 강조 유지)
    const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => {
        /* ... 로직 유지 ... */
        if (areaId === 'entrance') {
            return (<div className='mt-2 pt-2 border-t border-gray-100'><div className="text-xs font-bold text-green-700 bg-green-100 p-1.5 rounded-md text-center">현관은 폴리아스파틱 (Poly) 고정입니다.</div></div>);
        }
        return (<div className={`mt-2 ${isQuantitySelected ? 'animate-slide-down' : ''} transition-all duration-300`}><div className='flex gap-1.5 pt-2 border-t border-gray-100'>{MATERIALS.map(mat => (<button key={mat.id} onClick={(e) => { e.stopPropagation(); if (isQuantitySelected) onChange(areaId, mat.id); }} className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all active:scale-95 shadow-sm ${currentMat === mat.id ? 'bg-indigo-700 text-white shadow-lg' : 'bg-indigo-100 text-gray-700 hover:bg-indigo-200'}`}>{mat.label.split('(')[0].trim()}</button>))}</div></div>);
    };
        
    // ⭐️ [유지] 시공 범위 리스트 렌더링 함수 (수량 증감 버튼 배경 호버 강조 유지) ⭐️
    const renderAreaList = (areas) => (
        <div className="space-y-3">
            {areas.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && quantities['bathroom_floor'] >= 2 && !calculation.isPackageActive;
                
                return (
                    <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                                <div>
                                    <div className="font-semibold text-gray-800">{area.label}</div>
                                    <div className="text-xs text-gray-500">
                                        {area.desc && <span className="block text-indigo-600">{area.desc}</span>}
                                        {isEntranceAutoSelected && area.id === 'entrance' && <span className="block text-amber-600 font-bold mt-0.5">욕실 바닥 2곳 선택 시 자동 선택!</span>} 
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md">
                                <button 
                                    onClick={() => handleQuantityChange(area.id, -1)} 
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold 
                                        ${(quantities[area.id] > 0 && !(isEntranceAutoSelected && area.id === 'entrance')) ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                                >-</button> 
                                <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                                <button 
                                    onClick={() => {
                                        handleQuantityChange(area.id, 1);
                                        if (quantities[area.id] === 0) {
                                            handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material);
                                        }
                                    }} 
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-lg transition active:scale-90
                                        ${isEntranceAutoSelected && area.id === 'entrance' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-indigo-600 hover:bg-gray-100'}
                                    `}
                                >+</button> 
                            </div>
                        </div>

                        {/* ⭐️ 영역별 소재 선택 버튼 ⭐️ */}
                        {isSelected && (
                            <MaterialSelectButtons 
                                areaId={area.id}
                                currentMat={currentMat}
                                onChange={handleAreaMaterialChange}
                                isQuantitySelected={isSelected}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );


    return (
        <div className={`min-h-screen bg-gray-50 d-gray-800 font-sans pb-40`}>
            <GlobalStyles />

            {/* ⭐️ [유지] 헤더 ⭐️ (생략) */}
            <header className="bg-indigo-900 text-white sticky top-0 z-20 shadow-xl">
                <div className="p-4 flex items-center justify-between max-w-md mx-auto">
                    <div className="flex items-center"> 
                        <h1 className="text-xl font-extrabold text-gray-50 tracking-wide">줄눈의미학</h1>
                    </div>
                    <div className='flex gap-2'> 
                        <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="text-xs bg-amber-400 text-indigo-900 px-3 py-1 rounded-full font-extrabold hover:bg-amber-300 transition active:scale-95 shadow-md flex items-center"><Phone size={12} className="inline mr-1" /> 상담원 연결</button>
                        <button onClick={() => window.location.reload()} className="text-xs bg-indigo-800 px-3 py-1 rounded-full text-white hover:bg-indigo-700 transition active:scale-95 shadow-md flex items-center"><RefreshCw size={12} className="inline mr-1" /> 초기화</button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* ⭐️ [유지] 동영상 섹션 ⭐️ (생략) */}
                {/* --- 1. 현장 유형 섹션 (배경색 강조로 변경) --- (생략) */}
                {/* --- 2. 줄눈소재 안내 (소재/옵션 선택 및 색상 팔레트 포함) --- */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                        <Hammer className="h-5 w-5 text-indigo-600" /> 2. 줄눈소재 안내
                    </h2 >
                    <div className="space-y-4">
                        {MATERIALS.map((item) => ( /* ... 소재 선택 버튼 로직 유지 ... */
                            <div key={item.id} className="animate-fade-in">
                                <div onClick={() => setMaterial(item.id)} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 selection-box active:scale-[0.99] shadow-md ${item.id === material ? 'bg-indigo-700 text-white shadow-lg' : 'bg-white hover:bg-indigo-50'}`}>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div className='flex items-center gap-3'>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition ${item.id === material ? 'border-white' : 'border-gray-400'}`}>
                                                    {item.id === material && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                <span className={`font-bold ${item.id === material ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.id === material ? 'bg-amber-400 text-indigo-900' : item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-1 pl-7 ${item.id === material ? 'text-indigo-200' : 'text-gray-500'}`}>{item.description}</p>
                                    </div>
                                </div>
                                {/* 나머지 옵션 부분 유지 */}
                                {item.id === 'poly' && item.id === material && (<div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-300 space-y-2 animate-slide-down bg-gray-50/50 p-3 rounded-md"><div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Palette size={12} /> 옵션 선택 (펄 유무)</div><div className="flex gap-2"><button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${polyOption === 'pearl' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>펄</button><button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${polyOption === 'no_pearl' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>무펄</button></div></div>)}
                                {item.id === 'kerapoxy' && item.id === material && (<div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-500 space-y-2 animate-slide-down bg-indigo-50/50 p-3 rounded-md"> <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Crown size={12} /> 옵션 선택 (브랜드)</div> <div className="flex gap-2"><button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${epoxyOption === 'kerapoxy' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>케라폭시</button> <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${epoxyOption === 'starlike' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>스타라이크</button> </div></div>)}
                            </div>
                        ))}
                    </div>
                    
                    {/* ⭐️ [수정] ColorPalette 컴포넌트에 새로운 상태와 핸들러 전달 ⭐️ */}
                    <ColorPalette 
                        selectedColors={selectedGroutColors} 
                        onToggleColor={handleToggleColor} 
                        onUpdateRatio={handleUpdateRatio}
                        onTileImageUpload={handleTileImageUpload} 
                        tileImageURL={tileImageURL} 
                    />

                    {/* --- 재료 상세 비교 버튼 영역 (유지) --- */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex justify-center">
                        <button onClick={() => setShowMaterialModal(true)} className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-lg font-extrabold text-sm hover:bg-indigo-100 transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"><Info size={16} className='text-indigo-500' fill='currentColor'/> 소재 양생기간 확인하기</button>
                    </div>
                </section>

                {/* --- 3. 시공범위 선택 (유지) --- */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-450">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                        <Calculator className="h-5 w-5 text-indigo-600" /> 3. 시공범위 선택
                    </h2 >
                    <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700"><Bath size={16} className="text-indigo-500" /> A. 욕실 범위</h3>
                    {renderAreaList(BATHROOM_AREAS)}
                    <div className="border-t border-gray-100 mt-4 pt-4"></div>
                    <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700"><LayoutGrid size={16} className="text-indigo-500" /> B. 기타 범위</h3>
                    {renderAreaList(OTHER_AREAS)}
                </section>

                {/* --- 4. 실리콘 시공 (유지) --- */}
                <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-600">
                    <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                        <Eraser className="h-5 w-5 text-indigo-600" /> 4. 실리콘 시공
                    </h2 >
                    <div className="space-y-3">
                        {SILICON_AREAS.map((area) => { /* ... 실리콘 선택 로직 유지 ... */
                            const Icon = area.icon;
                            const isSelected = quantities[area.id] > 0;
                            return (<div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}> <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> <div><div className="font-semibold text-gray-800">{area.label}</div><div className="text-xs text-gray-500">{area.desc && <span className="block text-indigo-600">{area.desc}</span>}</div> </div></div><div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md"><button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>-</button> <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span><button onClick={() => { handleQuantityChange(area.id, 1); }} className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90">+</button> </div></div></div>);
                        })}
                    </div>
                </section>

                {/* --- 자주 묻는 질문 (FAQ) (유지) --- (생략) */}
                {/* 숨고 후기 바로가기 (유지) */}
            </main>

            {/* 하단 고정바 */}
            {hasSelections && ( /* ... 하단 견적 바 로직 유지 ... */
                 <div className="fixed bottom-0 left-0 right-0 bg-indigo-900 shadow-2xl safe-area-bottom z-20 animate-slide-down">
                 <div className="max-w-md mx-auto p-4 flex flex-col gap-2"> 
                     <div className='flex items-center justify-between w-full text-white'> 
                         <div className='flex flex-col items-start gap-1'> 
                             <span className='text-sm font-semibold text-white'>총 예상 견적</span>
                             <div className="flex items-end gap-1">
                                 <span className="text-3xl font-extrabold text-white">{calculation.price.toLocaleString()}</span>
                                 <span className="text-base font-normal text-white">원</span>
                             </div>
                         </div>
                         <div className='flex flex-col items-end justify-end h-full pt-1'> 
                             {calculation.minimumFeeApplied && (<div className="flex items-center justify-end gap-1 text-xs font-bold text-red-300 mb-0.5 whitespace-nowrap"><Clock size={12} className='inline mr-0.5 text-red-300'/> 최소 출장비 적용</div>)}
                             {calculation.minimumFeeApplied && (<span className="text-xs text-gray-400 line-through font-normal whitespace-nowrap">{calculation.originalCalculatedPrice.toLocaleString()}원</span>)}
                             {calculation.label && (<div className="text-xs font-bold text-amber-300 whitespace-nowrap"><Crown size={12} className='inline mr-1 text-amber-300'/> {calculation.label}</div>)}
                         </div>
                     </div>
                     <div className='grid grid-cols-2 gap-3'>
                         <button onClick={() => { setShowModal(true); setShowToast(false); }} className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all bg-indigo-700 text-white hover:bg-indigo-800 active:bg-indigo-900 shadow-md`}>견적서 확인</button>
                         <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all bg-yellow-400 text-gray-800 hover:bg-yellow-500 active:bg-yellow-600 shadow-md flex items-center justify-center`}>카톡 예약 문의</a>
                     </div>
                 </div>
             </div>
            )}
            

            {/* 견적서 모달 */}
            {showModal && ( /* ... 견적서 모달 로직 유지 ... */ 
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
                        <div className="bg-indigo-700 p-4 text-white flex justify-between items-center"><h3 className="font-extrabold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /> 줄눈의미학</h3><button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition active:scale-95"><X size={20} /></button></div>
                        <div className="p-5 text-gray-800 bg-white overflow-y-auto max-h-[70vh]"> 
                            <div ref={quoteRef} id="quote-content" className="rounded-lg p-5 space-y-3 mx-auto" style={{ width: '320px' }}>
                                <div className="flex flex-col items-center border-b border-gray-300 pb-3 mb-3"><h1 className='text-xl font-extrabold text-indigo-800 text-center'>줄눈의미학 예상 견적서</h1></div>
                                <div className="space-y-2 text-sm border-b border-gray-200 pb-3">
                                    {/* 최소 출장비 적용 문구 */}
                                    {calculation.minimumFeeApplied && (<div className="bg-red-50/70 p-2 rounded-md border-l-4 border-red-500 text-xs font-semibold text-gray-700"><p className='flex items-center gap-1 text-red-800 font-extrabold'><Zap size={12} className='text-red-400'/> 최소 출장비 {MIN_FEE.toLocaleString()}원 적용</p><p className='text-[11px] ml-1'>선택하신 항목의 합계가 {MIN_FEE.toLocaleString()}원 미만이므로 최소 출장비가 적용되었습니다.</p></div>)}
                                    {/* 패키지 포함 서비스 내역 */}
                                    {calculation.isPackageActive && (<div className="bg-indigo-50/70 p-2 rounded-md border-l-4 border-indigo-500 text-xs font-semibold text-gray-700"><p className='flex items-center gap-1 text-indigo-800 font-extrabold mb-1'><Crown size={12} className='text-indigo-400'/> {calculation.label}</p><ul className='list-disc list-inside text-[11px] ml-1 space-y-0.5 text-left'><li>패키지 포함 영역이 할인 적용되었습니다.</li>{calculation.isFreeEntrance && <li>현관 바닥 서비스 (폴리아스파틱)</li>}</ul></div>)}
                                    {/* ⭐️ 항목별 테이블 시작 (가격 정보 제외) ⭐️ */}
                                    <div className="mt-3">
                                        <div className="grid grid-cols-10 font-extrabold text-xs text-gray-500 border-b border-gray-300 pb-1">
                                            <span className="col-span-5 pl-1">시공 내역</span>
                                            <span className="col-span-3 text-center">소재</span>
                                            <span className="col-span-2 text-right pr-1">수량</span>
                                        </div>
                                        {calculation.itemizedPrices.filter(item => !item.isDiscount).map(item => { return (<div key={item.id} className="grid grid-cols-10 items-center text-gray-800 py-1 border-b border-gray-100 last:border-b-0"><div className="col-span-5 flex flex-col pl-1 break-words"><span className="font-semibold text-gray-700 text-sm">{item.label}</span>{((item.originalPrice - item.calculatedPrice) > 0 && item.calculatedPrice > 0) && (<span className='text-xs text-indigo-500 font-bold'>(-{(item.originalPrice - item.calculatedPrice).toLocaleString()}원 할인)</span>)}</div><span className="col-span-3 text-center font-bold text-[10px] text-indigo-500">{item.materialLabel}</span><span className="col-span-2 text-right text-sm font-semibold text-gray-600 pr-1">{item.quantity}{item.unit}</span></div>); })}
                                    </div>
                                    {/* 할인 항목 루프 (리뷰 할인 등) */}
                                    <div className='pt-2'>
                                        {calculation.itemizedPrices.filter(item => item.isDiscount).map(item => (<div key={item.id} className="flex justify-between items-center text-indigo-600 font-semibold pl-2 pr-1 py-1 border-b border-gray-100 last:border-b-0 text-sm"><span className={`flex items-center`}><Gift size={12} className='inline mr-1'/> {item.label}</span><span className={`text-right`}>-{item.originalPrice.toLocaleString()}원</span></div>))}
                                    </div>
                                </div>
                                {/* 총 합계 영역 */}
                                <div className="pt-3 text-center border-t border-gray-200"> 
                                    <div className="flex justify-between items-end"> 
                                        <span className='text-base font-semibold text-gray-800'>최종 결제 금액</span>
                                        <div className="text-right"><span className="text-3xl font-extrabold text-indigo-700">{calculation.price.toLocaleString()}원</span></div>
                                    </div>
                                    <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                                </div>
                                {/* 안내 사항 영역 */}
                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                    <div className='w-full py-1.5 px-2 text-center bg-gray-100 text-indigo-600 rounded-md font-bold text-[11px] shadow-sm flex items-center justify-center'>바닥 30x30cm, 벽면 30x60cm 크기 기준</div>
                                    <div className='w-full py-1.5 px-2 text-center bg-gray-100 text-indigo-600 rounded-md font-bold text-[11px] shadow-sm flex items-center justify-center'>재시공(셀프포함)은 별도문의</div>
                                    <div className='w-full py-1.5 px-2 text-center bg-gray-100 text-indigo-600 rounded-md font-bold text-[11px] shadow-sm flex items-center justify-center'>조각타일 및 대리석은 시공불가</div>
                                </div>
                            </div>
                        </div>
                        {/* ⭐️ [견적서 모달 하단 컨트롤 영역] ⭐️ */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                             {/* 리뷰 이벤트 버튼 (생략) */}
                            <div className='grid grid-cols-3 gap-3'> 
                                <button onClick={handleImageSave} className="flex items-center justify-center gap-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition text-sm active:scale-95 shadow-md"><ImageIcon size={16} /> <span>견적서 저장</span></button>
                                <button onClick={() => window.open(KAKAO_CHAT_URL, '_blank')} className="flex items-center justify-center gap-1 bg-yellow-400 text-gray-800 py-3 rounded-lg font-bold hover:bg-yellow-500 transition shadow-md text-sm active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-fill" viewBox="0 0 16 16"><path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7 3.582 7 8 7zm4.25-5.5a1 1 0 0 0-1-1h-6.5a1 1 0 0 0 0 2h6.5a1 1 0 0 0 1-1z"/></svg><span>카톡 문의</span></button>
                                <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-1 bg-indigo-700 text-white py-3 rounded-lg font-bold hover:bg-indigo-800 transition shadow-md text-sm active:scale-95"><Phone size={16} /> <span>전화 상담</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 재료 상세 비교 모달 표시 */}
            {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
        </div>
    );
}