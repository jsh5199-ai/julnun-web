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
const KAKAO_CHAT_URL = 'http://pf.kakao.com/_jAxnYn/chat'; // <-- 요청하신 URL 반영 완료

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
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shine 5s infinite;
    }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    .animate-toast { animation: slideUpFadeOut 3s forwards; }
    
    .selection-box { transition: all 0.2s ease-in-out; }
    .selection-selected {
      border: 3px solid #374151; /* Gray-700 대신 Darker Indigo 느낌의 색상 */
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
  // 거실: Poly 55만, Epoxy 110만
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: 'Poly 55만 / Epoxy 110만 (복도,주방 포함)' },
];

const SERVICE_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS]; // 현관 포함됨

const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '단독 8만 / 패키지시 5万' },
  { id: 'silicon_sink', label: '세면대+젠다이 교체', basePrice: 30000, icon: Eraser, unit: '개소', desc: '오염된 실리콘 제거 후 재시공' },
  { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35万' },
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
    { 
        id: 'P_MIX_NEW_A', 
        price: 1150000, 
        label: '혼합벽면A (바닥/안방벽E, 공용벽P) 115만', 
        E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1]], 
        P_areas: [['common_bath_wall', 1]] 
    },
    { 
        id: 'P_MIX_NEW_B', 
        price: 1150000, 
        label: '혼합벽면B (바닥/공용벽E, 안방벽P) 115만', 
        E_areas: [['bathroom_floor', 2], ['common_bath_wall', 1]], 
        P_areas: [['master_bath_wall', 1]] 
    },
];

const NEW_USER_PACKAGES = [
    // 에폭시 혼합 패키지 (70만) - 현관 제외 (기존 유지)
    { 
        id: 'USER_E_700K_MASTER', 
        price: 700000, 
        label: '에폭시 벽면 패키지 (70만)', 
        E_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], 
        P_areas: [],
        isFlexible: true, 
        flexibleGroup: ['master_bath_wall', 'common_bath_wall']
    },
    { 
        id: 'USER_E_700K_COMMON', 
        price: 700000, 
        label: '에폭시 벽면 패키지 (70만)', 
        E_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], 
        P_areas: [],
        isFlexible: true,
        flexibleGroup: ['master_bath_wall', 'common_bath_wall']
    },
    // 폴리 혼합 패키지 (50만) - 현관 제외 (기존 유지)
    { 
        id: 'USER_P_500K_MASTER', 
        price: 500000, 
        label: '폴리 벽면 패키지 (50만)', 
        E_areas: [], 
        P_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]],
        isFlexible: true,
        flexibleGroup: ['master_bath_wall', 'common_bath_wall']
    },
    { 
        id: 'USER_P_500K_COMMON', 
        price: 500000, 
        label: '폴리 벽면 패키지 (50만)', 
        E_areas: [], 
        P_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]],
        isFlexible: true,
        flexibleGroup: ['master_bath_wall', 'common_bath_wall']
    },
    // 🚨 [신규 추가 1] 욕실 바닥 2곳 에폭시 55만 고정
    { 
        id: 'USER_E_550K_FLOOR_2', 
        price: 550000, 
        label: '에폭시 바닥 2곳 (55만)', 
        E_areas: [['bathroom_floor', 2]], 
        P_areas: [],
        isFlexible: false,
    },
    // 🚨 [신규 추가 2] 욕실 바닥 2곳 + 샤워부스 벽 3면 에폭시 80만 고정
    { 
        id: 'USER_E_800K_FLOOR2_SHOWER1', 
        price: 800000, 
        label: '에폭시 바닥 2곳 + 샤워벽 1곳 (80만)', 
        E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], 
        P_areas: [],
        isFlexible: false,
    },
    // 🚨 [신규 추가 3] 욕실 바닥 1곳 + 샤워부스 벽 3면 에폭시 55만 고정
    { 
        id: 'USER_E_550K_FLOOR1_SHOWER1', 
        price: 550000, 
        label: '에폭시 바닥 1곳 + 샤워벽 1곳 (55만)', 
        E_areas: [['bathroom_floor', 1], ['shower_booth', 1]], 
        P_areas: [],
        isFlexible: false,
    },
    // 🚨 [기존 유지] 욕실 바닥 1곳 에폭시 35만 고정 패키지 
    { 
        id: 'USER_E_350K_BATH', 
        price: 350000, 
        label: '에폭시 바닥 1곳 (35만)', 
        E_areas: [['bathroom_floor', 1]], 
        P_areas: [],
        isFlexible: false,
    },
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
// [컴포넌트] (유지)
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


export default function GroutEstimatorApp() {
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
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


  // ⭐️ [유지] 수량 변경 핸들러
  const handleQuantityChange = useCallback((id, delta) => {
    setQuantities(prev => {
      const currentQty = prev[id] || 0;
      let newQty = Math.max(0, currentQty + delta);
      
      const newQuantities = { ...prev, [id]: newQty };

      // === 1. 더 넓은 영역 선택 시 작은 영역 제외 로직 ===
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

      // 2. 욕실 바닥 2곳 선택 시 현관 자동 선택 로직은 calculation에서 처리함.

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


  // 🚀 [최종] calculation 로직: 특수 영역 가격을 명시적으로 계산하도록 수정 
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
    let totalAreaCount = Object.values(quantities).reduce((sum, count) => sum + count, 0);
    
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
    if (quantities['bathroom_floor'] >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
        isFreeEntrance = true;
        isPackageActive = true;
        labelText = '패키지 할인 적용 중';
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
              const fixedPriceTotal = 50000 * initialCount; 
              if (count > 0) { 
                  const nonPackageOriginalPrice = 80000 * count; 
                  const fixedPriceForRemaining = 50000 * count; 
                  
                  remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                  remainingCalculatedPrice = fixedPriceForRemaining;
                  
                  if (initialCount === count) itemOriginalTotal = 80000 * initialCount;
              }
          } else if (area.id === 'silicon_living_baseboard' && initialCount >= 1 && totalAreaCount >= 3) {
              const fixedPriceTotal = 350000 * initialCount; 
              if (count > 0) {
                  const nonPackageOriginalPrice = 400000 * count; 
                  
                  remainingDiscount = nonPackageOriginalPrice - fixedPriceTotal;
                  remainingCalculatedPrice = fixedPriceTotal;
                  
                  if (initialCount === count) itemOriginalTotal = 400000 * initialCount;
              }
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
    
    return { 
      price: finalPrice, 
      originalCalculatedPrice, 
      priceBeforeAllDiscount, // 패키지 및 모든 할인이 적용되지 않은 순수 정가
      label: labelText, 
      isPackageActive: isPackageActive,
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

  // --- 기타 핸들러 (견적서 저장 기능 보강) ---
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
            const filename = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;

            // 1. IE/Edge (레거시) 지원 확인
            if (window.navigator.msSaveOrOpenBlob) {
                canvas.toBlob((blob) => {
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                });
            } 
            // 2. 일반 브라우저 (Chrome, Safari, Firefox)
            else {
                const link = document.createElement('a');
                link.href = image;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            alert('견적서 이미지가 저장되었습니다! 다운로드 폴더를 확인해주세요.');
        } catch (error) {
            console.error('Error saving image:', error);
            // 🚨 다운로드 실패 시 수동 저장을 안내하는 최종적인 방법
            if (quoteRef.current) {
                 const canvas = await html2canvas(quoteRef.current, { scale: 3, backgroundColor: '#ffffff' });
                 const imgData = canvas.toDataURL('image/png');
                 const newWindow = window.open('about:blank', '_blank');
                 newWindow.document.write('<img src="' + imgData + '" alt="견적서 이미지" style="width:100%; height:auto;">');
                 newWindow.document.write('<h3 style="text-align:center; color:red;">[다운로드 실패] 이미지를 길게 눌러 저장해주세요.</h3>');
            }
            alert('이미지 자동 저장 중 오류가 발생했습니다. 새 창이 열리면 이미지를 길게(터치) 눌러 수동으로 저장해주세요.');
        }
      }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const selectedMaterialData = MATERIALS.find(m => m.id === material);
  const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
  const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    
  const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
  const currentEmbedUrl = getEmbedUrl(currentVideo.id);


  // ⭐️ [유지] 컴포넌트: 개별 소재 선택 버튼 (현관 제외)
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
                // 수량이 0일 때는 비활성화된 것처럼 보이도록 조정
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all 
                  ${isQuantitySelected
                    ? (currentMat === mat.id 
                      ? 'bg-indigo-700 text-white shadow-inner active:scale-95' 
                      : 'bg-white text-gray-700 border border-indigo-300 hover:bg-indigo-50 active:scale-95')
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                  }`}
              >
                {mat.label.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>
    );
  };
    
  // ⭐️ [유지] 시공 범위 리스트 렌더링 함수 ⭐️
  const renderAreaList = (areas) => (
    <div className="space-y-3">
        {areas.map((area) => {
            const Icon = area.icon;
            const isSelected = quantities[area.id] > 0;
            // ⭐️ 현관은 강제 poly이므로 소재는 항상 'poly'로 표시 ⭐️
            const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];

            return (
                <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                            <div>
                                <div className="font-semibold text-gray-800">{area.label}</div>
                                <div className="text-xs text-gray-500">
                                    기본 {area.basePrice.toLocaleString()}원~
                                    {area.desc && <span className="block text-indigo-600">{area.desc}</span>}
                                    {area.id === 'entrance' && (
                                        <span className="block text-green-600 font-bold mt-0.5">폴리아스파틱 소재 고정</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md border border-gray-200">
                            <button 
                                onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
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
                                className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90"
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
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans pb-40`}>
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
          <div className="relative">
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
                                : 'bg-white text-indigo-700 border-2 border-indigo-700 hover:bg-indigo-50'
                        }`}
                    >
                        {video.label}
                    </button>
                ))}
            </div>
          </div>
        </section>
        
        {/* --- 1. 현장 유형 섹션 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-150">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Home className="h-5 w-5 text-indigo-600" /> 1. 현장 유형을 선택하세요
          </h2 >
          <div className="grid grid-cols-2 gap-3">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 selection-box active:scale-[0.99] ${
                  housingType === type.id 
                    ? 'border-indigo-700 bg-gray-100 font-bold text-gray-900' 
                    : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400'
                }`}
              >
                <div className="text-base font-semibold">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ⭐️ --- 2. 시공 재료 선택 (기본값 역할만 함) --- ⭐️ */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Hammer className="h-5 w-5 text-indigo-600" /> 2. 줄눈소재 안내
          </h2 >
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <div onClick={() => setMaterial(item.id)} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 selection-box active:scale-[0.99] ${item.id === material ? 'border-indigo-700 bg-gray-100 shadow-md' : 'border-gray-300 bg-white hover:border-indigo-400'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className='flex items-center gap-3'>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition ${item.id === material ? 'border-indigo-600' : 'border-gray-400'}`}>
                          {item.id === material && <CheckCircle2 size={12} className="text-indigo-600" />}
                        </div>
                        <span className="font-bold text-gray-800">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-7">{item.description}</p>
                  </div>
                </div>
                {/* 나머지 옵션 부분 유지 */}
                {item.id === 'poly' && item.id === material && (
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-300 space-y-2 animate-slide-down bg-gray-50/50 p-3 rounded-md">
                    <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Palette size={12} /> 옵션 선택 (펄 유무)</div>
                    <div className="flex gap-2">
                      <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'pearl' ? 'bg-indigo-700 text-white border-indigo-700 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>펄</button>
                      <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'no_pearl' ? 'bg-indigo-700 text-white border-indigo-700 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>무펄</button>
                    </div>
                  </div>
                )}
                {item.id === 'kerapoxy' && item.id === material && (
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-indigo-500 space-y-2 animate-slide-down bg-indigo-50/50 p-3 rounded-md"> 
                    <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Crown size={12} /> 옵션 선택 (브랜드)</div> 
                    <div className="flex gap-2">
                      <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'kerapoxy' ? 'bg-indigo-700 text-white border-indigo-700 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>케라폭시</button> 
                      <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'starlike' ? 'bg-indigo-700 text-white border-indigo-700 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>스타라이크</button> 
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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

        {/* ⭐️ --- 3. 원하는 시공범위를 선택해주세요 (카테고리 분리 적용) --- ⭐️ */}
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
            <LayoutGrid size={16} className="text-indigo-500" /> B. 기타 범위 (현관 포함)
          </h3>
          {renderAreaList(OTHER_AREAS)}

        </section>

        {/* --- 4. 실리콘 교체할 곳 선택 (유지) --- */}
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
                                <div className="text-xs text-gray-500">{area.basePrice.toLocaleString()}원{area.desc && <span className="block text-indigo-600">{area.desc}</span>}</div> 
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md border border-gray-200">
                            <button 
                                onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            >-</button> 
                            <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                            <button 
                                onClick={() => {
                                    handleQuantityChange(area.id, 1);
                                }} 
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
                        
                        {/* 🚨 [수정] 우측: 패키지/최소비용 라벨 (새로운 우측 빈 공간) 🚨 */}
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

      {/* 견적서 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
            <div className="bg-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /> 줄눈의미학</h3> 
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition active:scale-95">
                <X size={20} />
              </button>
            </div>
            
            {/* ★★★ 캡처 전용 견적서 양식 ★★★ */}
            <div className="p-5 text-gray-800 bg-white overflow-y-auto max-h-[70vh]"> 
              <div ref={quoteRef} id="quote-content" className="rounded-lg p-5 space-y-3 mx-auto" style={{ width: '320px' }}>
                
                {/* 헤더 및 로고 영역 (영어 문구 제거) */}
                <div className="flex flex-col items-center border-b border-gray-300 pb-3 mb-3">
                    <h1 className='text-xl font-extrabold text-indigo-800 text-center'>줄눈의미학 예상 견적서</h1>
                </div>

                {/* 기본 정보 테이블 */}
                <div className="space-y-2 border-b border-gray-200 pb-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex-shrink-0">현장 유형</span>
                      <span className='text-right font-medium flex-shrink-0'>{HOUSING_TYPES.find(h => h.id === housingType).label}</span>
                    </div>
                    {/* 🚨 [삭제 완료] '기본 재료' 항목 제거 됨 🚨 */}
                </div>

                {/* 시공 및 할인 내역 */}
                <div className="space-y-2 text-sm border-b border-gray-200 pb-3">

                    {/* ⭐️ 최소 출장비 적용 문구 추가 ⭐️ */}
                    {calculation.minimumFeeApplied && (
                        <div className="bg-red-50/70 p-2 rounded-md border-l-4 border-red-500 text-xs font-semibold text-gray-700">
                            <p className='flex items-center gap-1 text-red-800 font-extrabold'>
                                <Zap size={12} className='text-red-400'/> 최소 출장비 {MIN_FEE.toLocaleString()}원 적용
                            </p>
                            <p className='text-[11px] ml-1'>선택하신 항목의 합계가 {MIN_FEE.toLocaleString()}원 미만이므로 최소 출장비가 적용되었습니다.</p>
                        </div>
                    )}
                    
                    {/* 패키지 포함 서비스 내역 */}
                    {calculation.isPackageActive && (
                        <div className="bg-indigo-50/70 p-2 rounded-md border-l-4 border-indigo-500 text-xs font-semibold text-gray-700">
                            <p className='flex items-center gap-1 text-indigo-800 font-extrabold mb-1'>
                                <Crown size={12} className='text-indigo-400'/> {calculation.label} 
                            </p>
                            <ul className='list-disc list-inside text-[11px] ml-1 space-y-0.5 text-left'>
                                <li>패키지 포함 영역이 할인 적용되었습니다.</li>
                                {calculation.isFreeEntrance && <li>현관 바닥 서비스 (폴리아스파틱)</li>}
                            </ul>
                        </div>
                    )}

                    {/* 개별 항목 루프 (할인 항목 표시 방식 수정 완료) */}
                    {calculation.itemizedPrices
                        .filter(item => !item.isDiscount) 
                        .map(item => {
                        
                        const isDiscounted = item.discount > 0 && !item.isPackageItem;
                        const finalPriceText = item.calculatedPrice.toLocaleString();
                        
                        return (
                            <div key={item.id} className="flex flex-col text-gray-800 pl-2 pr-1 pt-1 border-b border-gray-100 last:border-b-0">
                                
                                {/* 🚨 [수정] 항목 이름과 수량 라인 */}
                                <div className="flex justify-between items-center w-full">
                                    <span className={`w-7/12 font-semibold text-gray-700 text-sm break-words`}>
                                        <span className="text-gray-400 mr-1">-</span>
                                        {item.label} 
                                        {item.quantity > 0 && <span className="text-gray-400 text-xs font-normal"> x {item.quantity}</span>}
                                    </span>
                                    {/* 최종 적용 가격 */}
                                    <span className={`text-right w-5/12 font-bold text-sm ${item.calculatedPrice > 0 ? 'text-indigo-600' : 'text-gray-500'}`}> 
                                        {item.calculatedPrice > 0 ? `${finalPriceText}원` : (item.isFreeService ? '🎁 서비스 포함' : '👑 패키지 포함')}
                                    </span>
                                </div>
                                
                                {/* 🚨 [수정] 소재 라벨을 다음 줄에 배치 */}
                                <div className='flex justify-start items-center w-full'>
                                     <span className='text-indigo-500 text-[10px] ml-3 font-extrabold break-all'>({item.materialLabel})</span>
                                </div>
                                
                                {/* 할인이 발생한 경우에만 할인액 표시 */}
                                {(isDiscounted || item.isFreeService) && item.discount > 0 && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-0.5 pb-1 pl-3">
                                        <span className='font-normal'>
                                            {item.isFreeService ? '🎁 서비스 할인 적용' : '✨ 항목 할인 적용'}
                                        </span>
                                        <span className="font-semibold text-indigo-600">
                                            -{(item.originalPrice - item.calculatedPrice).toLocaleString()}원
                                        </span>
                                    </div>
                                )}
                                
                            </div>
                        );
                    })}

                    {/* 할인 항목 루프 (리뷰 할인 등) */}
                    {calculation.itemizedPrices
                        .filter(item => item.isDiscount) 
                        .map(item => (
                            <div key={item.id} className="flex justify-between items-center text-indigo-600 font-semibold pl-2 pr-1 py-1 border-b border-gray-100 last:border-b-0">
                                <span className={`w-3/5 flex items-center`}>
                                    <Gift size={12} className='inline mr-1'/> {item.label} 
                                </span>
                                <span className={`text-right w-2/5`}>
                                    -{item.originalPrice.toLocaleString()}원
                                </span>
                            </div>
                        ))}
                </div>
                
                {/* 총 합계 영역 (유지) */}
                <div className="pt-3 text-center"> 
                    
                    <div className="flex justify-between items-end"> 
                        <span className='text-base font-semibold text-gray-800'>최종 결제 금액</span>
                        <div className="text-right">
                            <span className="text-3xl font-extrabold text-indigo-700">{calculation.price.toLocaleString()}원</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>

                {/* 안내 사항 영역 (문구만 남김) */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className='w-full py-1.5 px-2 text-center bg-gray-100 text-indigo-600 rounded-md font-bold text-[11px] shadow-sm flex items-center justify-center'>
                        참고 | 바닥 30x30cm, 벽면 30x60cm 크기 기준
                    </div>
                </div>
              </div>
            </div>
            
            {/* ⭐️ [견적서 모달 하단 컨트롤 영역] ⭐️ */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                {/* 1. 숨고 리뷰 이벤트 버튼 (색상 및 테두리 수정) */}
                {soomgoReviewEvent && (
                    <div className='mb-3'>
                        {(() => {
                            const evt = soomgoReviewEvent;
                            const isApplied = isSoomgoReviewApplied;
                            const discountAmount = evt.discount.toLocaleString();
                            const Icon = isApplied ? CheckCircle2 : Sparkles;

                            const baseClasses = "w-full py-3 rounded-xl transition font-extrabold text-sm active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 relative overflow-hidden border-2";
                            const fixedBgClasses = "bg-indigo-700 text-white hover:bg-indigo-800"; 
                            const borderClasses = isApplied
                                ? "border-amber-400" 
                                : "border-indigo-700"; 
                                
                            const iconColorClass = 'text-white'; 

                            const labelText = isApplied 
                                ? `할인 적용 취소하기 (총액 +${discountAmount}원)` 
                                : `숨고 리뷰 약속하고 ${discountAmount}원 할인받기!`;

                            return (
                                <button
                                    onClick={() => toggleReview(evt.id)}
                                    className={`${baseClasses} ${fixedBgClasses} ${borderClasses}`}
                                >
                                    <Icon size={18} fill="currentColor" className={iconColorClass}/>
                                    <span>{labelText}</span>
                                </button>
                            );
                        })()}
                    </div>
                )}
                
                <div className='grid grid-cols-3 gap-3'> 
                    
                    <button onClick={handleImageSave} className="flex items-center justify-center gap-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition text-sm active:scale-95 shadow-md"> 
                        <ImageIcon size={16} /> <span>견적서 저장</span>
                    </button>
                    
                    <button onClick={() => window.open(KAKAO_CHAT_URL, '_blank')} className="flex items-center justify-center gap-1 bg-yellow-400 text-gray-800 py-3 rounded-lg font-bold hover:bg-yellow-500 transition shadow-md text-sm active:scale-95"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-fill" viewBox="0 0 16 16">
                          <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7 3.582 7 8 7zm4.25-5.5a1 1 0 0 0-1-1h-6.5a1 1 0 0 0 0 2h6.5a1 1 0 0 0 1-1z"/>
                        </svg> 
                        <span>카톡 문의</span>
                    </button>
                    
                    <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-1 bg-indigo-700 text-white py-3 rounded-lg font-bold hover:bg-indigo-800 transition shadow-md text-sm active:scale-95"> 
                        <Phone size={16} /> <span>전화 상담</span>
                    </button>
                </div>
            </div>
            {/* ⭐️ [견적서 모달 하단 컨트롤 영역 끝] ⭐️ */}
          </div>
        </div>
      )}
      
      {/* 재료 상세 비교 모달 표시 */}
      {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
    </div>
  );
}