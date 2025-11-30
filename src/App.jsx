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


// =================================================================
// [스타일] 애니메이션 정의 (유지)
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
  // 베란다/세탁실: Poly 10만, Epoxy 25万
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: LayoutGrid, unit: '개소', desc: 'Poly 10만 / Epoxy 25만' }, 
  // 주방 벽면: Poly 15만, Epoxy 25만
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: 'Poly 15만 / Epoxy 25만' },
  // 거실: Poly 55만, Epoxy 110万
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: 'Poly 55만 / Epoxy 110만 (복도,주방 포함)' },
];

const SERVICE_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS]; // 현관 포함됨

const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '단독 8만 / 패키지시 5만' },
  { id: 'silicon_sink', label: '세면대+젠다이 교체', basePrice: 30000, icon: Eraser, unit: '개소', desc: '오염된 실리콘 제거 후 재시공' },
  { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35만' },
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

// ⭐️ 혼합 패키지 데이터 정의 ⭐️
const OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION = ['entrance', 'balcony_laundry', 'kitchen_wall', 'living_room', 'silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'];


// ⭐️ 패키지 정의 시, 기타 범위를 포함하지 않도록 변경
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
    // 에폭시 혼합 패키지 (70만) - 현관 제외 (기존 유지)
    { id: 'USER_E_700K_MASTER', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_E_700K_COMMON', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    // 폴리 혼합 패키지 (50만) - 현관 제외 (기존 유지)
    { id: 'USER_P_500K_MASTER', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_P_500K_COMMON', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    // 🚨 [신규 추가 1] 욕실 바닥 2곳 에폭시 55만 고정
    { id: 'USER_E_550K_FLOOR_2', price: 550000, label: '에폭시 바닥 2곳 (55만)', E_areas: [['bathroom_floor', 2]], P_areas: [], isFlexible: false, },
    // 🚨 [신규 추가 2] 욕실 바닥 2곳 + 샤워부스 벽 3면 에폭시 80만 고정
    { id: 'USER_E_800K_FLOOR2_SHOWER1', price: 800000, label: '에폭시 바닥 2곳 + 샤워벽 1곳 (80만)', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    // 🚨 [신규 추가 3] 욕실 바닥 1곳 + 샤워부스 벽 3면 에폭시 55만 고정
    { id: 'USER_E_550K_FLOOR1_SHOWER1', price: 550000, label: '에폭시 바닥 1곳 + 샤워벽 1곳 (55만)', E_areas: [['bathroom_floor', 1], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    // 🚨 [기존 유지] 욕실 바닥 1곳 에폭시 35만 고정 패키지 
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
// [컴포넌트] (수정)
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

// ⭐️ [확장된 컴포넌트] 색상 선택 팔레트 및 시뮬레이션 렌더링 ⭐️
const ColorPalette = ({ selectedColorId, onSelect, onTileImageUpload, tileImageURL }) => {
    // 🚨 오류 수정: selectedColorData를 찾지 못하면 GROUT_COLORS[0]을 기본값으로 설정
    const selectedColorData = GROUT_COLORS.find(c => c.id === selectedColorId) || GROUT_COLORS[0];

    // 타일 본체 색상은 기본적으로 흰색으로 고정 (이미지 없을 경우)
    const TILE_COLOR = '#ffffff'; 
    
    // 💡 수정: 줄눈선 너비를 40으로 크게 늘려 확실하게 보이도록 강제
    const GROUT_LINE_WIDTH = 40; 
    const lineHalf = GROUT_LINE_WIDTH / 2;

    const groutPattern = selectedColorData.code;
    const tilePattern = TILE_COLOR;
    
    // 💡 [최종 수정] 그라데이션 정의 유지
    
    // 1. 가로줄 (to bottom) - 순수 단색 적용
    const horizontalGradient = `linear-gradient(to bottom, 
                                        transparent 0%, 
                                        transparent calc(50% - ${lineHalf}px), 
                                        ${groutPattern} calc(50% - ${lineHalf}px), 
                                        ${groutPattern} calc(50% + ${lineHalf}px), 
                                        transparent calc(50% + ${lineHalf}px), 
                                        transparent 100%)`;

    // 2. 세로줄 (to right) - 순수 단색 적용
    const verticalGradient = `linear-gradient(to right, 
                                        transparent 0%, 
                                        transparent calc(50% - ${lineHalf}px), 
                                        ${groutPattern} calc(50% - ${lineHalf}px), 
                                        ${groutPattern} calc(50% + ${lineHalf}px), 
                                        transparent calc(50% + ${lineHalf}px), 
                                        transparent 100%)`;

    // 💡 [수정됨] 타일 배경 URL 결정: 사용자 이미지가 없으면 기본 타일 이미지 URL을 사용하도록 강제
    const effectiveTileImageURL = (tileImageURL && tileImageURL !== DEFAULT_TILE_IMAGE_URL)
        ? tileImageURL
        : DEFAULT_TILE_IMAGE_URL;

    // 시뮬레이션 배경 스타일
    const simulationBackgroundStyle = {
        // 항상 유효한 URL을 배경 이미지로 사용
        backgroundImage: `url(${effectiveTileImageURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    return (
        <div className='mt-5 pt-3 border-t border-gray-100 animate-fade-in'>
            <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 text-gray-800">
                <Palette className="h-4 w-4 text-indigo-600" /> 2-1. 줄눈 색상 미리보기 및 선택
            </h3>
            
            {/* 🚨🚨 줄눈 시뮬레이션 영역 - 레이어 z-index 및 혼합 모드 강제 적용 🚨🚨 */}
            <div className={`transition-all duration-300`}> 
                
                {/* ⭐️ 시뮬레이션 컨테이너: 기본 흰색 배경 설정 ⭐️ */}
                <div 
                    className="w-full aspect-video mx-auto overflow-hidden relative bg-white" // 배경색 흰색 고정
                >
                    
                    {/* 1단계: 타일 베이스 (z-index 1) */}
                    <div className="absolute inset-0" style={{ ...simulationBackgroundStyle, zIndex: 1 }}></div>
                    
                    {/* 2단계: 줄눈 선 시뮬레이션 레이어 (z-index 30) - 최상단에 확실히 표시 */}
                    <div 
                        className="absolute inset-0 transition-colors duration-300"
                        style={{
                            zIndex: 30, // 💡 수정: z-index를 30으로 높여 최상단 배치
                            opacity: 1, 
                            backgroundColor: 'transparent', 
                            backgroundImage: `${horizontalGradient}, ${verticalGradient}`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center center',
                            backgroundRepeat: 'no-repeat',
                            backgroundBlendMode: 'normal'
                        }}
                    >
                    </div>
                    
                    {/* 3단계: 워터마크 레이어 (z-index 40) - 줄눈선 위에 표시 */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center opacity-30" 
                        style={{
                            zIndex: 40, // 💡 수정: 워터마크를 줄눈선보다 더 위에 배치
                            backgroundImage: 'url(/logo.png)', // public 폴더의 로고 사용
                            backgroundSize: '30%', // 로고 크기 조정
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    >
                    </div>
                </div>
            </div>
            {/* 🚨🚨 줄눈 시뮬레이션 영역 끝 🚨🚨 */}

            {/* ⭐️ [수정] 선택 색상 이름 표시 (유지) ⭐️ */}
            <div className={`p-3 rounded-lg shadow-md mb-3 border border-gray-200`} style={{ backgroundColor: groutPattern }}>
                <p className={`text-sm font-bold ${selectedColorData.isDark ? 'text-white' : 'text-gray-900'} flex items-center justify-between`}>
                    <span className='truncate'>현재 선택 색상: {selectedColorData.label}</span>
                    <CheckCircle2 size={16} className={`ml-2 flex-shrink-0 ${selectedColorData.isDark ? 'text-amber-400' : 'text-indigo-700'}`}/>
                </p>
            </div>
            
            {/* ⭐️ [신규 추가] 타일 이미지 업로드 버튼 (유지) ⭐️ */}
            <div className='mb-4'>
                <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} style={{ display: 'none' }} />
                <label htmlFor="tileFileInput" className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                    <ImageIcon size={16} /> 내 타일 사진 첨부하여 미리보기
                </label>
            </div>

            {/* 2. 색상 선택 버튼 그리드 (유지) */}
            <div className='grid grid-cols-5 sm:grid-cols-5 gap-3'>
                {GROUT_COLORS.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => onSelect(color.id)}
                        className={`aspect-square rounded-lg transition-all duration-200 shadow-md flex items-center justify-center p-1 relative hover:scale-[1.02] active:scale-[0.98] ${
                            selectedColorId === color.id
                                ? 'ring-4 ring-offset-2 ring-indigo-500' // 선택 시 링 효과
                                : 'hover:shadow-lg'
                        }`}
                        style={{ backgroundColor: color.code }}
                        title={color.label}
                    >
                        {selectedColorId === color.id && (
                            <CheckCircle2 size={24} className={`absolute ${color.isDark ? 'text-amber-400' : 'text-indigo-700'} drop-shadow-md`} />
                        )}
                        <span className={`absolute bottom-0 text-[8px] font-bold py-[1px] px-1 rounded-t-sm ${color.isDark ? 'bg-white/80 text-gray-900' : 'bg-gray-900/80 text-white'}`}>{color.label}</span>
                    </button>
                ))}
            </div>
            <p className='text-xs text-gray-500 mt-3 text-center'>
                * 화면 해상도에 따라 실제 색상과 차이가 있을 수 있습니다.
            </p>
        </div>
    );
};


// ⭐️ [수정] GroutEstimatorApp -> App 으로 함수 이름 변경 ⭐️
export default function App() {
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
  // 🚨 [수정] 초기값을 public 폴더에 있는 이미지로 설정 🚨
  const [selectedGroutColor, setSelectedGroutColor] = useState(GROUT_COLORS[0].id); // 기본값: 화이트
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

  // ⭐️ [유지] 현관은 강제로 폴리 아스파틱으로 설정되도록 조정 ⭐️
  useEffect(() => {
    // 현관이 선택된 경우, 소재를 'poly'로 강제합니다.
    if (quantities['entrance'] > 0 && areaMaterials['entrance'] !== 'poly') {
        setAreaMaterials(prev => ({ ...prev, 'entrance': 'poly' }));
    }
  }, [quantities, areaMaterials]);


  // ⭐️ [유지] 수량 변경 핸들러 (현관 자동 선택 로직 포함)
  const handleQuantityChange = useCallback((id, delta) => {
    setQuantities(prev => {
      const currentQty = prev[id] || 0;
      let newQty = Math.max(0, currentQty + delta);
      
      const newQuantities = { ...prev, [id]: newQty };

      // === 1. 더 넓은 영역 선택 시 작은 영역 제외 로직 (유지) ===
      if (newQty > 0) {
        // 안방욕실 벽 전체 선택 시 -> 샤워부스 벽 3면 제외
        if (id === 'master_bath_wall' && (newQuantities['shower_booth'] || 0) > 0) {
          newQuantities['shower_booth'] = 0;
        }
        // 공용욕실 벽 전체 선택 시 -> 욕조 벽 3면 제외
        if (id === 'common_bath_wall' && (newQuantities['bathtub_wall'] || 0) > 0) {
          newQuantities['bathtub_wall'] = 0;
        }
        
        // 샤워부스 벽 3면 선택 시 -> 안방욕실 벽 전체 제외
        if (id === 'shower_booth' && (newQuantities['master_bath_wall'] || 0) > 0) {
          newQuantities['master_bath_wall'] = 0;
        }
        // 욕조 벽 3면 선택 시 -> 공용욕실 벽 전체 제외
        if (id === 'bathtub_wall' && (newQuantities['common_bath_wall'] || 0) > 0) {
          newQuantities['common_bath_wall'] = 0;
        }
      }

      // 🚨 2. 욕실 바닥 2곳 선택 시 현관 자동 선택 로직 추가 🚨
      const isBathroomFloorUpdated = id === 'bathroom_floor';
      let bathroomFloorCount = isBathroomFloorUpdated ? newQuantities['bathroom_floor'] : prev['bathroom_floor'];
      
      // bathroom_floor가 2개 이상 선택된 경우 AND 현관이 현재 0일 때 -> 현관을 1로 자동 설정
      if (bathroomFloorCount >= 2 && newQuantities['entrance'] === 0) {
        newQuantities['entrance'] = 1;
      } 
      // bathroom_floor가 2개 미만으로 줄어든 경우 AND 현관이 1로 자동 설정되어 있었을 때 -> 현관을 0으로 해제
      else if (bathroomFloorCount < 2 && prev['bathroom_floor'] >= 2 && prev['entrance'] === 1 && newQuantities['entrance'] === 1) {
          // 간편화를 위해, 현재 로직에서는 현관을 직접 +1 했을 때와의 구분을 생략하고 해제 로직만 적용합니다.
          if (newQuantities['entrance'] === 1) {
            newQuantities['entrance'] = 0;
          }
      }
      
      return newQuantities;
    });
  }, []);
    
  // ⭐️ [유지] 영역별 소재 변경 핸들러 (현관 강제 poly) ⭐️
  const handleAreaMaterialChange = useCallback((id, mat) => {
    if (id === 'entrance') {
        // 현관은 강제로 poly로 고정
        setAreaMaterials(prev => ({ ...prev, [id]: 'poly' }));
    } else {
        setAreaMaterials(prev => ({ ...prev, [id]: mat }));
    }
  }, []);
    
  // ⭐️ [유지] 리뷰 토글 핸들러
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

  // ⭐️ [유지] 사용자의 선택을 표준화된 맵으로 변환 (패키지 매칭용)
  const getSelectionSummary = useCallback((q, areaMats) => {
    const summary = {};
    for (const id in q) {
      const qty = q[id];
      if (qty > 0) {
        // 현관은 강제로 poly로 취급
        const mat = (id === 'entrance') ? 'poly' : areaMats[id];
        const matKey = (mat === 'poly') ? 'poly' : 'kerapoxy';

        if (!summary[matKey]) {
          summary[matKey] = {};
        }
        summary[matKey][id] = qty;
      }
    }
    // 현관은 항상 poly에 있어야 함
    if (q['entrance'] > 0) {
        if (!summary['poly']) summary['poly'] = {};
        summary['poly']['entrance'] = q['entrance'];
        if(summary['kerapoxy'] && summary['kerapoxy']['entrance']) {
            delete summary['kerapoxy']['entrance']; 
        }
    }
    
    return summary;
  }, [areaMaterials]);
    
  // ⭐️ [유지] 혼합 패키지 매칭 로직 (기타 범위 항목을 무시하고 욕실만으로 매칭) ⭐️
  const findMatchingPackage = useCallback((selectionSummary, quantities) => {
    
    // 🚨 기타 범위 및 실리콘 항목을 임시 선택 목록에서 제외 🚨
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
    
    // 선택된 욕실 항목이 없으면 패키지 매칭 시도 안 함
    if (totalSelectedCount === 0) return null;

    const sortedPackages = MIXED_PACKAGES; 
    
    for (const pkg of sortedPackages) {
        let tempPolySelections = { ...filteredPolySelections };
        let tempEpoxySelections = { ...filteredEpoxySelections };
        let appliedAutoEntrance = false;
        
        // 1.1. OR 조건 (isFlexible) 처리 (USER_P_500K, USER_E_700K)
        if (pkg.isFlexible) {
              const requiredPolyAreas = pkg.P_areas.map(([id]) => id).filter(id => id !== 'entrance');
              const requiredEpoxyAreas = pkg.E_areas.map(([id]) => id);
              
              let baseMatch = true;
              
              // Poly 항목 체크 (FlexibleGroup 제외)
              for (const id of requiredPolyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                  const requiredQty = pkg.P_areas.find(([pkId]) => pkId === id)[1];
                  if ((tempPolySelections[id] || 0) !== requiredQty) {
                      baseMatch = false;
                      break;
                  }
              }
              if (!baseMatch) continue;

              // Epoxy 항목 체크 (FlexibleGroup 제외)
              for (const id of requiredEpoxyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                  const requiredQty = pkg.E_areas.find(([pkId]) => pkId === id)[1];
                  if ((tempEpoxySelections[id] || 0) !== requiredQty) {
                      baseMatch = false;
                      break;
                  }
              }
              if (!baseMatch) continue;


              // ⭐️ OR 조건 항목 매칭 및 소재 일치/충돌 방지 ⭐️
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
                  // 2. 항목 ID 목록의 '완벽한 일치' 확인 (추가 선택 방지)
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
        
        // 1.2. 일반 패키지 Quantities Match (욕실 항목만 비교)
        let isMatch = true;
        
        // Poly Quantities Match
        for (const [id, requiredQty] of pkg.P_areas) {
          if ((tempPolySelections[id] || 0) !== requiredQty) { 
            isMatch = false;
            break;
          }
        }
        if (!isMatch) continue;

        // Epoxy Quantities Match
        for (const [id, requiredQty] of pkg.E_areas) {
          if ((tempEpoxySelections[id] || 0) !== requiredQty) { 
            isMatch = false;
            break;
          }
        }
        if (!isMatch) continue;

        // 2. 선택된 욕실 항목 ID 목록이 패키지 ID 목록과 '완벽히 일치'하는지 확인 (추가 선택 방지)
        const selectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
        const packageAreaIds = new Set(getPackageAreaIds(pkg));
        
        const isIdSetMatch = selectedAreaIds.size === packageAreaIds.size && 
                             [...selectedAreaIds].every(id => packageAreaIds.has(id));

        if (isIdSetMatch) {
          return { ...pkg, autoEntrance: appliedAutoEntrance }; 
        }
    }

    return null; // 매칭되는 패키지 없음
  }, [quantities, areaMaterials]);


  // 🚀 [최종] calculation 로직: 견적 계산 (색상 선택은 가격에 영향 없음) 
  const calculation = useMemo(() => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
    let itemizedPrices = []; 
    
    // ⭐️ 1. 혼합 패키지 매칭 시도 및 현관 서비스 자동 감지 ⭐️
    const selectionSummary = getSelectionSummary(quantities, areaMaterials);
    const matchedPackageResult = findMatchingPackage(selectionSummary, quantities);
    const matchedPackage = matchedPackageResult ? matchedPackageResult : null;
    
    const isAutoPackageEntrance = false; 

    // q는 계산 시 패키지에 포함되어 제외될 항목을 표시하는 임시 수량 맵
    let q = { ...quantities };
    let total = 0;
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false; // 현관 무료 서비스 플래그 (욕실 2곳 선택 시)
    let totalAreaCount = Object.values(quantities).filter(v => v > 0).length; // 선택된 항목의 개수 (수량 > 0)
    
    // 🚨 [오류 수정] packageAreas를 스코프 최상단에 선언 (ReferenceError 방지)
    let packageAreas = []; 
    
    // ⭐️ 2. 패키지 적용 ⭐️
    if (matchedPackage) {
      total = matchedPackage.price;
      isPackageActive = true;
      labelText = '패키지 할인 적용 중'; 
      
      // ⭐️ 패키지에 포함된 항목만 q에서 제외 ⭐️
      packageAreas = getPackageAreaIds(matchedPackage); // 👈 여기서 값 할당
      packageAreas.forEach(id => { 
        q[id] = 0; 
      });
      
      // 현관이 선택된 경우 (패키지에 현관 포함 여부와 관계 없이) 서비스로 처리
      if (quantities['entrance'] >= 1) { 
          isFreeEntrance = true;
          q['entrance'] = 0;
      }
    } 
    
    // ⭐️ 3. 현관 무료 서비스 적용 플래그 설정 (패키지에 포함되지 않은 경우) ⭐️
    // 개별 선택 시 욕실 2곳 선택하면 현관 무료로 처리 (현관 수량이 1이상일 때)
    // 참고: handleQuantityChange에서 이미 현관이 1로 자동 설정되었으므로, 여기서 계산 로직만 처리하면 됨.
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

      // count: 패키지/서비스에 포함되지 않은 잔여 항목 수량
      const count = q[area.id] || 0; 
      
      const areaMatId = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
      const isEpoxy = areaMatId === 'kerapoxy';
      
      let finalUnitBasePrice = area.basePrice; // 환경 배율 적용 전의 최종 단가
      
      // 🚨 [수정] 소재에 따른 최종 단가 설정 🚨
      if (area.id === 'balcony_laundry') {
          finalUnitBasePrice = isEpoxy ? 250000 : 100000; // Poly 10만 / Epoxy 25만
      } else if (area.id === 'kitchen_wall') {
          finalUnitBasePrice = isEpoxy ? 250000 : 150000; // Poly 15만 / Epoxy 25만
      } else if (area.id === 'living_room') {
          finalUnitBasePrice = isEpoxy ? 1100000 : 550000; // Poly 55만 / Epoxy 110만
      } else if (area.id === 'entrance') {
          finalUnitBasePrice = 50000; // 현관은 Poly 5만 고정
      } else if (BATHROOM_AREAS.some(a => a.id === area.id)) {
          // 욕실 영역 (바닥, 벽면 등): 기본 단가에 소재별 계수 적용 (Poly 1.0, Epoxy 1.8)
          finalUnitBasePrice = area.basePrice * (isEpoxy ? 1.8 : 1.0);
      } 
      // 실리콘 시공 영역은 area.basePrice 그대로 사용 (아래 실리콘 할인 로직에서 처리)
      
      // 환경 배율 적용 후 잔여 항목에 대한 단가를 정수화
      const calculatedPricePerUnit = Math.floor(finalUnitBasePrice * selectedHousing.multiplier);
      
      // 항목의 원래 총 가격 (initialCount 기준)
      let itemOriginalTotal = calculatedPricePerUnit * initialCount;
      
      let finalCalculatedPrice = 0;
      let finalDiscount = 0;
      let isFreeServiceItem = false;
      // 패키지/서비스로 처리된 수량 (견적서에 표시용)
      let packageCount = initialCount - count; 

      // A. 패키지 적용 항목 (가격 0원)
      if (packageCount > 0 && matchedPackage && count === 0) {
              finalCalculatedPrice = 0;
              finalDiscount = itemOriginalTotal; // 원가를 할인으로 처리
              // 현관이거나 패키지 포함 항목은 서비스로 간주
              isFreeServiceItem = area.id === 'entrance' || packageAreas.includes(area.id); 
      } 
      // B. 현관 무료 서비스 적용 항목 (가격 0원) - 패키지 매칭이 안됐는데 현관 서비스 조건을 만족한 경우
      else if (area.id === 'entrance' && isFreeEntrance && !matchedPackage && count === 0) {
              finalCalculatedPrice = 0;
              finalDiscount = itemOriginalTotal; // 원가를 할인으로 처리
              isFreeServiceItem = true;
      }
      // C. 개별 선택 항목 (패키지/서비스에 포함되지 않은 잔여 수량에 대한 계산 및 실리콘 할인 적용)
      else {
          // 남은 수량(count)에 대해서만 계산
          let remainingOriginalTotal = calculatedPricePerUnit * count;
          let remainingCalculatedPrice = remainingOriginalTotal;
          let remainingDiscount = 0;
          
          // 🚨 실리콘/리폼 패키지 할인 적용 🚨 
          if (area.id === 'silicon_bathtub' && initialCount >= 1 && totalAreaCount >= 3) {
              // totalAreaCount >= 3 조건을 만족하는 경우, 개별 단가 대신 패키지 단가를 적용 (5만원)
              const nonPackageOriginalPrice = 80000 * count; 
              const fixedPriceForRemaining = 50000 * count; 
              
              if (count > 0) {
                  remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                  remainingCalculatedPrice = fixedPriceForRemaining;
              }
              if (initialCount === count) itemOriginalTotal = 80000 * initialCount;

          } else if (area.id === 'silicon_living_baseboard' && initialCount >= 1 && totalAreaCount >= 3) {
              // totalAreaCount >= 3 조건을 만족하는 경우, 개별 단가 대신 패키지 단가를 적용 (35만원)
              const nonPackageOriginalPrice = 400000 * count; 
              const fixedPriceForRemaining = 350000 * count; 
              
              if (count > 0) {
                  remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                  remainingCalculatedPrice = fixedPriceForRemaining;
              }
              if (initialCount === count) itemOriginalTotal = 400000 * initialCount;

          }
          
          // 최종 가격을 total에 합산
          finalCalculatedPrice = remainingCalculatedPrice; 
          finalDiscount = remainingDiscount; 
          total += finalCalculatedPrice;
      }
      
      // 가격을 천 단위로 내림 (견적서 표기용)
      finalCalculatedPrice = Math.floor(finalCalculatedPrice / 1000) * 1000;
      itemOriginalTotal = Math.floor(itemOriginalTotal / 1000) * 1000;
      finalDiscount = Math.floor(finalDiscount / 1000) * 1000;


      // 개별 항목 가격 정보 추가
      itemizedPrices.push({
          id: area.id, 
          label: area.label, 
          quantity: initialCount, 
          unit: area.unit, 
          originalPrice: itemOriginalTotal, 
          calculatedPrice: finalCalculatedPrice, 
          discount: finalDiscount, 
          isFreeService: isFreeServiceItem, 
          // 패키지 또는 서비스 적용 시 true
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
    // 1. 패키지/서비스로 0원 처리된 항목의 원가 합계 (항목별 할인 효과)
    const totalItemDiscount = itemizedPrices
        .filter(item => !item.isDiscount)
        .reduce((sum, item) => sum + (item.originalPrice - item.calculatedPrice), 0);
        
    // 2. 총 할인액: 항목별 할인 효과 + 리뷰 할인액
    const totalFinalDiscount = totalItemDiscount + discountAmount;
    
    // 최종 가격도 천원 단위로 내림
    let originalCalculatedPrice = Math.max(0, Math.floor(total / 1000) * 1000); 
    
    let finalPrice = originalCalculatedPrice; 
    let minimumFeeApplied = false;

    if (finalPrice > 0 && finalPrice < MIN_FEE) {
        finalPrice = MIN_FEE;
        minimumFeeApplied = true;
    }

    // 🚨 [새로 계산] 패키지 적용 전 총 정가 (최소출장비, 리뷰할인 미적용 순수 합계)
    const priceBeforeAllDiscount = itemizedPrices.reduce((sum, item) => sum + (item.isDiscount ? 0 : item.originalPrice), 0) + discountAmount;
    
    // 현관 서비스가 적용되었을 경우, labelText 업데이트
    if (isFreeEntrance && !matchedPackage) {
        labelText = '현관 서비스 적용 중';
    } else if (matchedPackage) {
        labelText = '패키지 할인 적용 중';
    }

    return { 
      price: finalPrice, 
      originalCalculatedPrice, 
      priceBeforeAllDiscount, // 패키지 및 모든 할인이 적용되지 않은 순수 정가
      label: labelText, 
      isPackageActive: isPackageActive || isFreeEntrance, // 패키지나 현관 서비스가 적용된 경우
      isFreeEntrance: isFreeEntrance,
      discountAmount: totalFinalDiscount, // 총 할인액
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

  // 🚨 [유지] 타일 이미지 업로드 핸들러 🚨
  const handleTileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // FileReader를 사용하여 파일 URL 생성
      const reader = new FileReader();
      reader.onload = () => {
        setTileImageURL(reader.result);
        alert('✅ 타일 이미지가 성공적으로 업로드되었습니다!');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 기타 핸들러 (수정된 로직 적용) ---
  const handleImageSave = async () => {
      if (quoteRef.current) {
        try {
            // html2canvas 옵션 설정 (높은 해상도를 위해 scale 사용)
            const canvas = await html2canvas(quoteRef.current, {
                scale: 3, // 캡처 해상도 3배 증가
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            const image = canvas.toDataURL('image/png');
            
            // 🚨 [강제 다운로드 로직 복구 및 개선] 🚨
            const link = document.createElement('a');
            link.href = image;
            link.download = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 다운로드 시작 알림
            alert('✅ 견적서 다운로드가 시작되었습니다!\n\n**파일이 다운로드 폴더에 저장되었는지 확인해주세요.**');
        } catch (error) {
            console.error('Error saving image:', error);
            // 캡처 오류 시 안내 문구를 더 명확히 표시
            alert('이미지 저장 중 오류가 발생했습니다. 브라우저 설정을 확인해주세요.');
        }
      }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const selectedMaterialData = MATERIALS.find(m => m.id === material);
  const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
  const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    
  const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
  const currentEmbedUrl = getEmbedUrl(currentVideo.id);


  // ⭐️ [유지] 컴포넌트: 개별 소재 선택 버튼 (배경색 강조 유지)
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
                // ⭐️ [유지] 배경색 강조 ⭐️
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all active:scale-95 shadow-sm 
                  ${currentMat === mat.id 
                    ? 'bg-indigo-700 text-white shadow-lg' // 선택 시 배경색 강조
                    : 'bg-indigo-100 text-gray-700 hover:bg-indigo-200' // 비선택 시 배경색 및 호버 효과
                  }`}
              >
                {mat.label.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>
    );
  };
    
  // ⭐️ [유지] 시공 범위 리스트 렌더링 함수 (수량 증감 버튼 배경 호버 강조 유지) ⭐️
  const renderAreaList = (areas) => (
    <div className="space-y-3">
        {areas.map((area) => {
            const Icon = area.icon;
            const isSelected = quantities[area.id] > 0;
            // ⭐️ 현관은 강제로 poly이므로 소재는 항상 'poly'로 표시 ⭐️
            const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];

            // 🚨 [오류 해결] isEntranceAutoSelected를 여기서 정의 🚨
            const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && quantities['bathroom_floor'] >= 2 && !calculation.isPackageActive;
            
            const extraEntranceInfo = isEntranceAutoSelected 
                ? <span className="block text-amber-600 font-bold mt-0.5">욕실 바닥 2곳 선택 시 자동 선택!</span> 
                : null;

            return (
                <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                            <div>
                                <div className="font-semibold text-gray-800">{area.label}</div>
                                <div className="text-xs text-gray-500">{area.desc && <span className="block text-indigo-600">{area.desc}</span>}</div> 
                            </div>
                        </div>
                        {/* ⭐️ [유지] 수량 증감 버튼: border border-gray-200 제거 ⭐️ */}
                        <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md">
                            <button 
                                onClick={() => handleQuantityChange(area.id, -1)} 
                                disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                // ⭐️ [유지] hover:bg-gray-100 추가하여 클릭 효과 강조 ⭐️
                                className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold 
                                    ${(quantities[area.id] > 0 && !(isEntranceAutoSelected && area.id === 'entrance')) ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            >-</button> 
                            <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                            <button 
                                onClick={() => {
                                    handleQuantityChange(area.id, 1);
                                    if (quantities[area.id] === 0) {
                                        // 현관이 아닌 경우에만 기본 소재를 따라가게 함
                                        handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material);
                                    }
                                }} 
                                // 현관이 자동 선택 상태인 경우 + 버튼 비활성화 (수동 조작 방지)
                                disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                // ⭐️ [유지] hover:bg-gray-100 추가하여 클릭 효과 강조 ⭐️
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

      {/* ⭐️ [유지] 헤더 ⭐️ */}
      <header className="bg-indigo-900 text-white sticky top-0 z-20 shadow-xl">
        <div className="p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center"> 
            <h1 className="text-xl font-extrabold text-gray-50 tracking-wide">줄눈의미학</h1>
          </div>
          <div className='flex gap-2'> 
            <button 
              onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} 
              className="text-xs bg-amber-400 text-indigo-900 px-3 py-1 rounded-full font-extrabold hover:bg-amber-300 transition active:scale-95 shadow-md flex items-center"
            >
              <Phone size={12} className="inline mr-1" /> 상담원 연결
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs bg-indigo-800 px-3 py-1 rounded-full text-white hover:bg-indigo-700 transition active:scale-95 shadow-md flex items-center"
            >
              <RefreshCw size={12} className="inline mr-1" /> 초기화
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">

        {/* ⭐️ [유지] 동영상 섹션 ⭐️ */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in">
          <h2 className="text-lg font-extrabold flex items-center gap-2 p-4 text-gray-800 border-b border-gray-100">
            <Zap className="h-5 w-5 text-red-600" /> 시공 현장 영상
          </h2 >
          <div></div> className="relative"
            <div className="aspect-video w-full">
              <iframe
                key={currentVideo.id} 
                width="100%"
                height="100%"
                src={currentEmbedUrl}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>
            <div className="flex p-3 gap-3 bg-gray-50 border-t border-gray-100">
                {YOUTUBE_VIDEOS.map((video) => (
                    <button
                        key={video.id}
                        onClick={() => setActiveVideoId(video.id)}
                        className={`flex-1 py-2 text-sm font-extrabold rounded-lg transition-all duration-300 shadow-md active:scale-[0.99] ${
                            activeVideoId === video.id 
                                ? 'bg-indigo-700 text-white' 
                                : 'bg-white text-indigo-700 hover:bg-indigo-50' 
                        }`}
                    >
                        {video.label}
                    </button>
                ))}
            </div>
        </section>
        
        {/* --- 1. 현장 유형 섹션 (배경색 강조로 변경) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-150">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Home className="h-5 w-5 text-indigo-600" /> 1. 현장 유형을 선택하세요
          </h2 >
          <div className="grid grid-cols-2 gap-3">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                // 🚨🚨🚨 수정된 부분: 문법 오류 수정 (`?` -> `:`) 🚨🚨🚨
                className={`p-4 rounded-lg text-center transition-all duration-200 selection-box active:scale-[0.99] shadow-md ${
                  housingType === type.id 
                    ? 'bg-indigo-700 text-white font-bold shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-indigo-50'
                }`}
              >
                <div className="text-base font-semibold">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ⭐️ --- 2. 줄눈소재 안내 (소재/옵션 선택 및 색상 팔레트 포함) --- ⭐️ */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Hammer className="h-5 w-5 text-indigo-600" /> 2. 줄눈소재 안내
          </h2 >
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} className="animate-fade-in">
                {/* 🚨 [수정] 배경색 강조로 변경 🚨 */}
                <div onClick={() => setMaterial(item.id)} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 selection-box active:scale-[0.99] shadow-md ${item.id === material ? 'bg-indigo-700 text-white shadow-lg' : 'bg-white hover:bg-indigo-50'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className='flex items-center gap-3'>
                        {/* 선택 아이콘 border 색상 변경 */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition ${item.id === material ? 'border-white' : 'border-gray-400'}`}>
                          {item.id === material && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        {/* 텍스트 색상 변경 */}
                        <span className={`font-bold ${item.id === material ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                      </div>
                      {/* 배지 색상 변경 */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.id === material ? 'bg-amber-400 text-indigo-900' : item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    {/* 설명 텍스트 색상 변경 */}
                    <p className={`text-xs mt-1 pl-7 ${item.id === material ? 'text-indigo-200' : 'text-gray-500'}`}>{item.description}</p>
                  </div>
                </div>
                {/* 나머지 옵션 부분 유지 */}
                {item.id === 'poly' && item.id === material && (
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-300 space-y-2 animate-slide-down bg-gray-50/50 p-3 rounded-md">
                    <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Palette size={12} /> 옵션 선택 (펄 유무)</div>
                    <div className="flex gap-2">
                      <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${polyOption === 'pearl' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>펄</button>
                      <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${polyOption === 'no_pearl' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>무펄</button>
                    </div>
                  </div>
                )}
                {item.id === 'kerapoxy' && item.id === material && (
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-500 space-y-2 animate-slide-down bg-indigo-50/50 p-3 rounded-md"> 
                    <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Crown size={12} /> 옵션 선택 (브랜드)</div> 
                    <div className="flex gap-2">
                      <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${epoxyOption === 'kerapoxy' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>케라폭시</button> 
                      <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-md transition-all shadow-sm ${epoxyOption === 'starlike' ? 'bg-indigo-700 text-white font-bold shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>스타라이크</button> 
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* ⭐️ [반영 완료] 색상 선택 팔레트 (줄눈선 복구 및 워터마크 추가) ⭐️ */}
          <ColorPalette selectedColorId={selectedGroutColor} onSelect={setSelectedGroutColor} onTileImageUpload={handleTileImageUpload} tileImageURL={tileImageURL} />

          {/* --- 재료 상세 비교 버튼 영역 (유지) --- */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex justify-center">
              <button 
                  onClick={() => setShowMaterialModal(true)} 
                  className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-lg font-extrabold text-sm hover:bg-indigo-100 transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                  <Info size={16} className='text-indigo-500' fill='currentColor'/> 소재 양생기간 확인하기
              </button>
          </div>
        </section>

        {/* --- 3. 시공범위 선택 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-450">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Calculator className="h-5 w-5 text-indigo-600" /> 3. 시공범위 선택
          </h2 >
          
          {/* A. 욕실 범위 */}
          <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700">
            <Bath size={16} className="text-indigo-500" /> A. 욕실 범위
          </h3>
          {renderAreaList(BATHROOM_AREAS)}

          <div className="border-t border-gray-100 mt-4 pt-4"></div>
          
          {/* B. 기타 범위 (현관/주방/베란다) */}
          <h3 className="text-base font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700">
            <LayoutGrid size={16} className="text-indigo-500" /> B. 기타 범위
          </h3>
          {renderAreaList(OTHER_AREAS)}

        </section>

        {/* --- 4. 실리콘 시공 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-600">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Eraser className="h-5 w-5 text-indigo-600" /> 4. 실리콘 시공
          </h2 >
          <div className="space-y-3">
            {SILICON_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;

              return (
                <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}> 
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                            <div>
                                <div className="font-semibold text-gray-800">{area.label}</div>
                                <div className="text-xs text-gray-500">{area.desc && <span className="block text-indigo-600">{area.desc}</span>}</div> 
                            </div>
                        </div>
                        {/* ⭐️ [유지] 수량 증감 버튼: border border-gray-200 제거 ⭐️ */}
                        <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md">
                            <button 
                                onClick={() => handleQuantityChange(area.id, -1)} 
                                // 이 부분은 SILICON_AREAS이므로 현관 자동 선택 로직과 무관합니다.
                                className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            >-</button> 
                            <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                            <button 
                                onClick={() => {
                                    handleQuantityChange(area.id, 1);
                                }} 
                                // 이 부분은 SILICON_AREAS이므로 현관 자동 선택 로직과 무관합니다.
                                className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90"
                            >+</button> 
                        </div>
                    </div>
                </div>
              );
            })}
            </div>
        </section>
        
        {/* --- 자주 묻는 질문 (FAQ) (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-750">
            <h2 className="text-lg font-extrabold text-gray-800 mb-2 flex items-center gap-2 border-b pb-2">
                <HelpCircle className="h-5 w-5 text-indigo-600"/> 자주 묻는 질문
            </h2 >
            <div className="space-y-1">
                {FAQ_ITEMS.map((item, index) => (
                    <Accordion key={index} question={item.question} answer={item.answer} />
                ))}
            </div>
        </section>

        
        {/* 숨고 후기 바로가기 (유지) */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
            className="w-full py-3 rounded-lg bg-indigo-700 text-white font-bold text-base hover:bg-indigo-800 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <Star size={20} fill="currentColor" className="text-white" /> 
            고객 만족도 확인 (숨고 평점 5.0+)
          </button>
        </div>
      </main>

      {/* 하단 고정바 */}
      <>
        {/* PackageToast 위치 수정 완료 */}
        <PackageToast isVisible={showToast} onClose={handleCloseToast} label={calculation.label} />

        {/* ⭐️ [유지] hasSelections가 true일 때만 하단 견적 바 렌더링 ⭐️ */}
        {hasSelections && (
            <div className="fixed bottom-0 left-0 right-0 bg-indigo-900 shadow-2xl safe-area-bottom z-20 animate-slide-down">
                <div className="max-w-md mx-auto p-4 flex flex-col gap-2"> 
                    
                    {/* 1. 금액 및 정보 영역 */}
                    <div className='flex items-center justify-between w-full text-white'> 
                        
                        {/* 좌측: 금액 정보 (총 예상 견적 문구 화이트 강조) */}
                        <div className='flex flex-col items-start gap-1'> 
                            <span className='text-sm font-semibold text-white'>총 예상 견적</span>
                            <div className="flex items-end gap-1">
                                {/* 2. 최종 적용 가격 */}
                                <span className="text-3xl font-extrabold text-white">{calculation.price.toLocaleString()}</span>
                                <span className="text-base font-normal text-white">원</span>
                            </div>
                        </div>
                        
                        {/* 🚨 [유지] 우측: 패키지/최소비용 라벨 🚨 */}
                        <div className='flex flex-col items-end justify-end h-full pt-1'> 
                            
                            {/* A. 최소 출장비 적용 안내 (Clock 아이콘) */}
                            {calculation.minimumFeeApplied && (
                                <div className="flex items-center justify-end gap-1 text-xs font-bold text-red-300 mb-0.5 whitespace-nowrap">
                                    <Clock size={12} className='inline mr-0.5 text-red-300'/> 최소 출장비 적용
                                </div>
                            )}
                            
                            {/* B. 원래 금액 스트라이크 아웃 */}
                            {calculation.minimumFeeApplied && (
                                <span className="text-xs text-gray-400 line-through font-normal whitespace-nowrap">
                                    {calculation.originalCalculatedPrice.toLocaleString()}원
                                </span>
                            )}

                            {/* C. 패키지 적용 라벨 */}
                            {calculation.label && (
                                <div className="text-xs font-bold text-amber-300 whitespace-nowrap">
                                    <Crown size={12} className='inline mr-1 text-amber-300'/> {calculation.label}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. 견적서 확인 및 카카오톡 문의 버튼 (한 줄 배치) */}
                    <div className='grid grid-cols-2 gap-3'>
                        {/* 견적서 확인 버튼 */}
                        <button 
                            onClick={() => {
                                setShowModal(true);
                                setShowToast(false); 
                            }} 
                            className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all 
                                bg-indigo-700 text-white hover:bg-indigo-800 active:bg-indigo-900 shadow-md
                            `}
                        >
                            견적서 확인
                        </button>
                        
                        {/* 카카오톡 예약 문의 버튼 */}
                        <a 
                            href={KAKAO_CHAT_URL} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all 
                                bg-yellow-400 text-gray-800 hover:bg-yellow-500 active:bg-yellow-600 shadow-md flex items-center justify-center
                            `}
                            // onClick 핸들러 대신 href를 사용하여 앱 환경에서 안정적으로 카카오톡 앱을 호출하도록 유도
                        >
                            카톡 예약 문의
                        </a>
                    </div>
                </div>
            </div>
        )}
      </>

      {/* 재료 상세 비교 모달 표시 */}
      {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
    </div>
  );
}