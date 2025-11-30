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

// =================================================================
// [스타일] 애니메이션 정의 (모던 럭셔리 컨셉으로 수정)
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUpFadeOut { 0% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; transform: translateY(-10px); } 100% { opacity: 0; transform: translateY(-20px); } }
    
    /* 골드 샤인 효과 */
    @keyframes shine { 
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    .shine-effect {
        /* 골드 배경 */
        background: #FFB300; /* Deep Gold */
        background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shine 3s infinite;
        color: #004D40; /* Deep Emerald */
    }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    .animate-toast { animation: slideUpFadeOut 3s forwards; }
    
    /* 선택 박스 스타일: 에메랄드 그린 강조 */
    .selection-box { transition: all 0.2s ease-in-out; border-radius: 1.25rem; } /* rounded-2xl */
    .selection-selected {
      border: 3px solid #004D40 !important; /* Deep Emerald 강조 */
      background-color: #E0F2F1 !important; /* Teal-50 */
      box-shadow: 0 8px 15px rgba(0, 77, 64, 0.15); /* 깊이감 있는 에메랄드 그림자 */
    }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }

    /* 모던 럭셔리 스크롤바 */
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #009688; border-radius: 10px; border: 2px solid #F5F5F5; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #F5F5F5; }
  `}</style>
);

// =================================================================
// [데이터] (유지)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 아파트', multiplier: 1.0 },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];

const MATERIALS = [
  { 
    id: 'poly', label: '폴리아스파틱', priceMod: 1.0, 
    description: '탄성과 광택이 우수하며 가성비가 좋습니다.',
    badge: 'Standard', badgeColor: 'bg-gray-100 text-gray-700 border border-gray-200'
  },
  { 
    id: 'kerapoxy', label: '에폭시(무광/무펄)', priceMod: 1.8, 
    description: '내구성이 뛰어나고 매트한 질감. A/S 5년 보장.',
    badge: 'Premium', badgeColor: 'bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/50'
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
  { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소' }, 
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: LayoutGrid, unit: '개소', desc: 'Poly 10만 / Epoxy 25만' }, 
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: 'Poly 15만 / Epoxy 25만' },
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
// [컴포넌트] (디자인 변경 적용)
// =================================================================

const PackageToast = ({ isVisible, onClose, label }) => {
    // ... (내부 로직 유지)
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12">
            {/* 에메랄드 그린 배경, 골드 악센트 */}
            <div className="bg-[#004D40] text-white p-3 rounded-xl shadow-2xl border border-[#004D40]/80 flex items-center justify-between animate-toast">
                <div className="flex items-center gap-2">
                    <Gift size={18} className='text-[#FFB300] flex-shrink-0' /> 
                    <div className="text-sm font-bold truncate">
                        {label || '패키지 할인'} 적용되었습니다! 
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-xs font-extrabold bg-[#FFB300] text-[#004D40] px-2.5 py-1 rounded-full hover:bg-amber-500 transition active:scale-95 flex-shrink-0 shadow-md"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-down border border-gray-100">
        <div className="bg-[#004D40] p-4 text-white flex justify-between items-center">
          <h3 className="font-extrabold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-[#FFB300]" /> 재료별 상세 스펙</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition active:scale-95"><X size={20} /></button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left font-extrabold text-gray-700">구분</th>
                <th className="px-3 py-3 text-center font-extrabold text-gray-700">폴리아스파틱</th>
                <th className="px-3 py-3 text-center font-extrabold text-[#004D40]">에폭시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-3 font-semibold text-gray-900">내구성</td>
                <td className="px-3 py-3 text-center text-gray-600">우수</td>
                <td className="px-3 py-3 text-center font-bold text-[#004D40]">최상 (5년 보장)</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-3 font-semibold text-gray-900">A/S 기간</td>
                <td className="px-3 py-3 text-center font-bold text-teal-600">2년</td>
                <td className="px-3 py-3 text-center font-bold text-[#004D40]">5년</td>
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
          <button onClick={onClose} className="w-full py-3 bg-[#004D40] text-white rounded-xl font-bold hover:bg-teal-900 transition active:scale-95 shadow-lg">확인</button>
        </div>
      </div>
    </div>
);

const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200">
            <button
                className="flex justify-between items-center w-full py-3 text-left font-extrabold text-gray-800 hover:text-[#004D40] transition duration-150"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <ChevronDown size={18} className={`text-[#004D40] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-3 text-sm text-gray-600 animate-slide-down bg-gray-100/70 p-4 rounded-xl -mt-1 mb-2 border-l-4 border-[#FFB300] shadow-inner">
                    {answer}
                </div>
            )}
        </div>
    );
};


export default function GroutEstimatorApp() {
    // [STATE] (유지)
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

  // [EFFECTS & HANDLERS] (유지)
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

      // 🚨 2. 욕실 바닥 2곳 선택 시 현관 자동 선택 로직 추가 🚨
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
        
        // 1.1. OR 조건 (isFlexible) 처리 (USER_P_500K, USER_E_700K)
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
        
        // 1.2. 일반 패키지 Quantities Match (욕실 항목만 비교)
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

        // 2. 선택된 욕실 항목 ID 목록이 패키지 ID 목록과 '완벽히 일치'하는지 확인 (추가 선택 방지)
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
    
    const isAutoPackageEntrance = false; 

    let q = { ...quantities };
    let total = 0;
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false; 
    let totalAreaCount = Object.values(quantities).filter(v => v > 0).length; 
    
    let packageAreas = []; 
    
    if (matchedPackage) {
      total = matchedPackage.price;
      isPackageActive = true;
      labelText = '패키지 할인 적용 중'; 
      
      packageAreas = getPackageAreaIds(matchedPackage);
      packageAreas.forEach(id => { 
        q[id] = 0; 
      });
      
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

  // --- 기타 핸들러 (유지) ---
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


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const selectedMaterialData = MATERIALS.find(m => m.id === material);
  const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
  const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    
  const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
  const currentEmbedUrl = getEmbedUrl(currentVideo.id);


  // ⭐️ [수정] 컴포넌트: 개별 소재 선택 버튼 
  const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => {
    
    if (areaId === 'entrance') {
        return (
            <div className='mt-2 pt-2 border-t border-gray-100'>
                <div className="text-xs font-bold text-green-700 bg-green-100 p-1.5 rounded-lg text-center border border-green-200">
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
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all 
                  ${isQuantitySelected
                    ? (currentMat === mat.id 
                      ? 'bg-[#004D40] text-[#FFB300] shadow-md active:scale-[0.98] border-2 border-[#FFB300]' 
                      : 'bg-white text-gray-700 border-2 border-teal-300 hover:bg-teal-50 active:scale-[0.98]')
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                  }`}
              >
                {mat.id === 'poly' ? 'Poly (Standard)' : 'Epoxy (Premium)'}
              </button>
            ))}
          </div>
        </div>
    );
  };
    
  // ⭐️ [수정] 시공 범위 리스트 렌더링 함수 ⭐️
  const renderAreaList = (areas) => (
    <div className="space-y-4">
        {areas.map((area) => {
            const Icon = area.icon;
            const isSelected = quantities[area.id] > 0;
            const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];

            const isEntranceAutoSelected = area.id === 'entrance' && quantities['bathroom_floor'] >= 2 && !calculation.matchedPackage && quantities['entrance'] === 1;
            const extraEntranceInfo = isEntranceAutoSelected ? <span className="block text-[#FFB300] font-bold text-xs mt-0.5">바닥 2곳 선택 시 현관 무료 서비스!</span> : null;

            return (
                <div key={area.id} className={`flex flex-col p-4 rounded-2xl border-2 transition duration-200 ${isSelected ? 'selection-selected shadow-xl' : 'bg-white border-gray-200 hover:border-teal-300 shadow-md'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl shadow-lg ${isSelected ? 'bg-[#004D40] text-[#FFB300]' : 'bg-teal-100 text-[#004D40]'}`}><Icon size={20} /></div> 
                            <div>
                                <div className="font-extrabold text-lg text-gray-800">{area.label}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {area.id === 'entrance' && (
                                        <span className="block text-green-600 font-bold mt-0.5">폴리아스파틱 소재 고정</span>
                                    )}
                                    {extraEntranceInfo}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-lg border border-gray-200">
                            <button 
                                onClick={() => handleQuantityChange(area.id, -1)} 
                                disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition active:scale-90 text-xl font-bold 
                                    ${(quantities[area.id] > 0 && !(isEntranceAutoSelected && area.id === 'entrance')) ? 'text-[#004D40] hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            >-</button> 
                            <span className={`w-5 text-center text-base font-extrabold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                            <button 
                                onClick={() => {
                                    handleQuantityChange(area.id, 1);
                                    if (quantities[area.id] === 0) {
                                        handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material);
                                    }
                                }} 
                                disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xl transition active:scale-90
                                    ${isEntranceAutoSelected && area.id === 'entrance' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-[#004D40] hover:bg-gray-100'}
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
    <div className={`min-h-screen bg-gray-50 font-sans pb-40`}>
      <GlobalStyles />

      {/* ⭐️ [헤더] 에메랄드 그린 디자인 ⭐️ */}
      <header className="bg-[#004D40] text-white sticky top-0 z-20 shadow-2xl">
        <div className="p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center"> 
            <h1 className="text-2xl font-extrabold text-[#FFB300] tracking-wider">줄눈의미학</h1>
          </div>
          <div className='flex gap-2'> 
            <button 
              onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} 
              className="text-xs bg-[#FFB300] text-[#004D40] px-3 py-1.5 rounded-full font-extrabold hover:bg-amber-500 transition active:scale-95 shadow-md flex items-center"
            >
              <Phone size={14} className="inline mr-1" /> 상담
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs bg-[#004D40]/80 px-3 py-1.5 rounded-full text-white hover:bg-teal-900 transition active:scale-95 shadow-md flex items-center border border-white/20"
            >
              <RefreshCw size={14} className="inline mr-1" /> 초기화
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">

        {/* ⭐️ [동영상 섹션] ⭐️ */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 animate-fade-in overflow-hidden">
          <h2 className="text-xl font-extrabold flex items-center gap-2 p-4 text-[#004D40] border-b border-gray-100 bg-teal-50/50">
            <Zap className="h-6 w-6 text-red-600" /> 시공 현장 영상
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
            <div className="flex p-3 gap-3 bg-gray-100 border-t border-gray-200">
                {YOUTUBE_VIDEOS.map((video) => (
                    <button
                        key={video.id}
                        onClick={() => setActiveVideoId(video.id)}
                        className={`flex-1 py-2 text-sm font-extrabold rounded-xl transition-all duration-300 shadow-md active:scale-[0.99] ${
                            activeVideoId === video.id 
                                ? 'bg-[#004D40] text-[#FFB300] border-2 border-[#FFB300]' 
                                : 'bg-white text-[#004D40] border-2 border-teal-200 hover:bg-teal-50'
                        }`}
                    >
                        {video.label}
                    </button>
                ))}
            </div>
          </div>
        </section>
        
        {/* --- 1. 현장 유형 섹션 --- */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-[#004D40] border-b pb-3">
            <Home className="h-6 w-6 text-[#004D40]" /> 1. 현장 유형을 선택하세요
          </h2 >
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 selection-box active:scale-[0.98] ${
                  housingType === type.id 
                    ? 'selection-selected font-extrabold text-gray-900 shadow-xl' 
                    : 'border-gray-300 bg-white text-gray-600 hover:border-teal-400'
                }`}
              >
                <div className="text-lg font-bold">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ⭐️ --- 2. 시공 재료 선택 (기본값 역할만 함) --- ⭐️ */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-[#004D40] border-b pb-3">
            <Hammer className="h-6 w-6 text-[#004D40]" /> 2. 줄눈소재 안내
          </h2 >
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <div onClick={() => setMaterial(item.id)} className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 selection-box active:scale-[0.99] ${item.id === material ? 'border-[#004D40] bg-teal-50 shadow-lg' : 'border-gray-300 bg-white hover:border-teal-400'}`}>
                  <div className="flex items-center justify-between">
                    <div className='flex items-center gap-3'>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 transition ${item.id === material ? 'border-[#004D40]' : 'border-gray-400'}`}>
                        {item.id === material && <CheckCircle2 size={14} className="text-[#004D40]" />}
                      </div>
                      <span className="text-lg font-extrabold text-gray-800">{item.label}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 pl-9">{item.description}</p>
                </div>
                
                {item.id === 'poly' && item.id === material && (
                  <div className="mt-3 ml-4 pl-4 border-l-4 border-teal-300 space-y-2 animate-slide-down bg-gray-50/70 p-4 rounded-xl shadow-inner">
                    <div className="text-sm font-bold text-[#004D40] flex items-center gap-1"><Palette size={14} /> 옵션 선택 (펄 유무)</div>
                    <div className="flex gap-3">
                      <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all shadow-sm ${polyOption === 'pearl' ? 'bg-[#004D40] text-[#FFB300] border-[#FFB300] font-extrabold' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>펄</button>
                      <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all shadow-sm ${polyOption === 'no_pearl' ? 'bg-[#004D40] text-[#FFB300] border-[#FFB300] font-extrabold' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>무펄</button>
                    </div>
                  </div>
                )}
                {item.id === 'kerapoxy' && item.id === material && (
                  <div className="mt-3 ml-4 pl-4 border-l-4 border-[#FFB300] space-y-2 animate-slide-down bg-teal-50/70 p-4 rounded-xl shadow-inner"> 
                    <div className="text-sm font-bold text-[#004D40] flex items-center gap-1"><Crown size={14} /> 옵션 선택 (브랜드)</div> 
                    <div className="flex gap-3">
                      <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all shadow-sm ${epoxyOption === 'kerapoxy' ? 'bg-[#004D40] text-[#FFB300] border-[#FFB300] font-extrabold' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>케라폭시</button> 
                      <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all shadow-sm ${epoxyOption === 'starlike' ? 'bg-[#004D40] text-[#FFB300] border-[#FFB300] font-extrabold' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>스타라이크</button> 
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* --- 재료 상세 비교 버튼 영역 --- */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
              <button 
                  onClick={() => setShowMaterialModal(true)} 
                  className="w-full py-3.5 bg-teal-50 text-[#004D40] rounded-xl font-extrabold text-sm hover:bg-teal-100 transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99] border-2 border-teal-100"
              >
                  <Info size={18} className='text-teal-500'/> 소재별 양생기간 및 A/S 확인
              </button>
          </div>
        </section>

        {/* ⭐️ --- 3. 원하는 시공범위를 선택해주세요 (카테고리 분리 적용) --- ⭐️ */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-[#004D40] border-b pb-3">
            <Calculator className="h-6 w-6 text-[#004D40]" /> 3. 시공범위 선택
          </h2 >
          
          {/* A. 욕실 범위 */}
          <h3 className="text-lg font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700">
            <Bath size={20} className="text-teal-600" /> A. 욕실 범위
          </h3>
          {renderAreaList(BATHROOM_AREAS)}

          <div className="border-t border-gray-200 mt-6 pt-6"></div>
          
          {/* B. 기타 범위 (현관/주방/베란다) */}
          <h3 className="text-lg font-extrabold flex items-center gap-2 mb-3 mt-4 text-gray-700">
            <LayoutGrid size={20} className="text-teal-600" /> B. 기타 범위
          </h3>
          {renderAreaList(OTHER_AREAS)}

        </section>

        {/* --- 4. 실리콘 교체할 곳 선택 (잔여 가격 제거됨) --- */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-[#004D40] border-b pb-3">
            <Eraser className="h-6 w-6 text-[#004D40]" /> 4. 실리콘 시공 (리폼)
          </h2 >
          <p className='text-sm text-gray-500 mb-4 bg-teal-50 p-3 rounded-xl border border-teal-200 font-bold'>줄눈 시공과 함께 진행 시 **할인 가격**이 적용됩니다. (3곳 이상 선택 시)</p>
          <div className="space-y-4">
            {SILICON_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;

              return (
                <div key={area.id} className={`flex flex-col p-4 rounded-2xl border-2 transition duration-200 ${isSelected ? 'selection-selected shadow-xl' : 'bg-white border-gray-200 hover:border-teal-300 shadow-md'}`}> 
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl shadow-lg ${isSelected ? 'bg-[#004D40] text-[#FFB300]' : 'bg-gray-200 text-[#004D40]'}`}><Icon size={20} /></div> 
                            <div>
                                <div className="font-extrabold text-lg text-gray-800">{area.label}</div>
                                <div className="text-xs text-gray-500 mt-1">{area.desc && <span className="block text-teal-600 font-bold">{area.desc}</span>}</div> 
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-lg border border-gray-200">
                            <button 
                                onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition active:scale-90 text-xl font-bold ${quantities[area.id] > 0 ? 'text-[#004D40] hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            >-</button> 
                            <span className={`w-5 text-center text-base font-extrabold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                            <button 
                                onClick={() => {
                                    handleQuantityChange(area.id, 1);
                                }} 
                                className="w-8 h-8 flex items-center justify-center text-[#004D40] hover:bg-gray-100 rounded-full font-bold text-xl transition active:scale-90"
                            >+</button> 
                        </div>
                    </div>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* --- 자주 묻는 질문 (FAQ) --- */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
            <h2 className="text-xl font-extrabold text-gray-800 mb-2 flex items-center gap-2 border-b pb-3">
                <HelpCircle className="h-6 w-6 text-[#004D40]"/> 자주 묻는 질문 (FAQ)
            </h2 >
            <div className="space-y-1">
                {FAQ_ITEMS.map((item, index) => (
                    <Accordion key={index} question={item.question} answer={item.answer} />
                ))}
            </div>
        </section>

        
        {/* 숨고 후기 바로가기 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
            className="w-full py-4 rounded-xl bg-[#004D40] text-[#FFB300] font-extrabold text-lg hover:bg-teal-900 transition shadow-2xl flex items-center justify-center gap-2 active:scale-95 border-2 border-[#FFB300]"
          >
            <Star size={24} fill="currentColor" className="text-[#FFB300]" /> 
            고객 만족도 확인 (숨고 평점 5.0+)
          </button>
        </div>
      </main>

      {/* 하단 고정바 */}
      <>
        {/* PackageToast */}
        <PackageToast isVisible={showToast} onClose={handleCloseToast} label={calculation.label} />

        {/* ⭐️ [하단 견적 바] 에메랄드 그린/골드 디자인 ⭐️ */}
        {hasSelections && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#004D40] shadow-2xl safe-area-bottom z-20 animate-slide-down">
                <div className="max-w-md mx-auto p-4 flex flex-col gap-2"> 
                    
                    {/* 1. 금액 및 정보 영역 */}
                    <div className='flex items-center justify-between w-full text-white'> 
                        
                        {/* 좌측: 금액 정보 */}
                        <div className='flex flex-col items-start gap-1'> 
                            <span className='text-sm font-semibold text-white/90'>총 예상 견적</span>
                            <div className="flex items-end gap-1">
                                {/* 2. 최종 적용 가격 */}
                                <span className="text-4xl font-extrabold text-[#FFB300] drop-shadow-lg">{calculation.price.toLocaleString()}</span>
                                <span className="text-xl font-extrabold text-[#FFB300]">원</span>
                            </div>
                        </div>
                        
                        {/* 우측: 패키지/최소비용 라벨 */}
                        <div className='flex flex-col items-end justify-end h-full pt-1'> 
                            
                            {/* A. 최소 출장비 적용 안내 (Clock 아이콘) */}
                            {calculation.minimumFeeApplied && (
                                <div className="flex items-center justify-end gap-1 text-xs font-bold text-red-400 mb-0.5 whitespace-nowrap">
                                    <Clock size={12} className='inline mr-0.5 text-red-400'/> 최소 출장비 적용
                                </div>
                            )}
                            
                            {/* B. 원래 금액 스트라이크 아웃 */}
                            {calculation.minimumFeeApplied && (
                                <span className="text-sm text-gray-400 line-through font-normal whitespace-nowrap">
                                    {calculation.originalCalculatedPrice.toLocaleString()}원
                                </span>
                            )}

                            {/* C. 패키지 적용 라벨 */}
                            {calculation.label && (
                                <div className="text-sm font-bold text-teal-300 whitespace-nowrap">
                                    <Crown size={14} className='inline mr-1 text-teal-300'/> {calculation.label}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. 견적서 확인 및 카카오톡 문의 버튼 (한 줄 배치) */}
                    <div className='grid grid-cols-2 gap-3 mt-3'>
                        {/* 견적서 확인 버튼 */}
                        <button 
                            onClick={() => {
                                setShowModal(true);
                                setShowToast(false); 
                            }} 
                            className={`w-full py-3.5 rounded-xl font-extrabold text-base transition-all 
                                bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-xl border border-white/20
                            `}
                        >
                            <Calculator size={16} className='inline mr-2'/> 견적서 확인
                        </button>
                        
                        {/* 카카오톡 예약 문의 버튼 (골드 강조) */}
                        <a 
                            href={KAKAO_CHAT_URL} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`w-full py-3.5 rounded-xl font-extrabold text-base transition-all 
                                bg-[#FFB300] text-[#004D40] hover:bg-amber-500 active:bg-amber-600 shadow-xl flex items-center justify-center
                            `}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chat-fill mr-2" viewBox="0 0 16 16">
                                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7 3.582 7 8 7zm4.25-5.5a1 1 0 0 0-1-1h-6.5a1 1 0 0 0 0 2h6.5a1 1 0 0 0 1-1z"/>
                            </svg>
                            카톡 예약 문의
                        </a>
                    </div>
                </div>
            </div>
        )}
      </>

      {/* 견적서 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-down border border-gray-100">
            <div className="bg-[#004D40] p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-xl flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-[#FFB300]" /> 줄눈의미학</h3> 
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition active:scale-95">
                <X size={24} />
              </button>
            </div>
            
            {/* ★★★ 캡처 전용 견적서 양식 ★★★ */}
            <div className="p-5 text-gray-800 bg-white overflow-y-auto max-h-[70vh] custom-scrollbar"> 
              <div ref={quoteRef} id="quote-content" className="rounded-xl p-5 space-y-4 mx-auto border-2 border-gray-100" style={{ width: '320px' }}>
                
                {/* 헤더 및 로고 영역 */}
                <div className="flex flex-col items-center border-b border-gray-300 pb-3 mb-3">
                    <h1 className='text-2xl font-extrabold text-[#004D40] text-center'>PREMIUM ESTIMATE</h1>
                    <p className='text-sm font-semibold text-gray-600'>줄눈의미학 예상 견적서</p>
                </div>

                {/* 시공 및 할인 내역 */}
                <div className="space-y-3 text-sm border-b border-gray-200 pb-3">
                    
                    {/* ⭐️ 최소 출장비 적용 문구 추가 ⭐️ */}
                    {calculation.minimumFeeApplied && (
                        <div className="bg-red-50/70 p-2.5 rounded-lg border-l-4 border-red-500 text-xs font-semibold text-gray-700">
                            <p className='flex items-center gap-1 text-red-800 font-extrabold'>
                                <Zap size={14} className='text-red-400'/> 최소 출장비 {MIN_FEE.toLocaleString()}원 적용
                            </p>
                            <p className='text-[11px] ml-1.5 mt-0.5'>선택 항목 합계가 미만이므로 최소 출장비가 적용되었습니다.</p>
                        </div>
                    )}
                    
                    {/* 패키지 포함 서비스 내역 */}
                    {calculation.isPackageActive && (
                        <div className="bg-teal-50/70 p-2.5 rounded-lg border-l-4 border-[#004D40] text-xs font-semibold text-gray-700">
                            <p className='flex items-center gap-1 text-[#004D40] font-extrabold mb-1'>
                                <Crown size={14} className='text-[#FFB300]'/> {calculation.label} 
                            </p>
                            <ul className='list-disc list-inside text-[11px] ml-1 space-y-0.5 text-left'>
                                <li>패키지 포함 영역이 할인 적용되었습니다.</li>
                                {calculation.isFreeEntrance && <li>현관 바닥 서비스 (폴리아스파틱)</li>}
                            </ul>
                        </div>
                    )}

                    {/* ⭐️ 항목별 테이블 시작 ⭐️ */}
                    <div className="mt-4">
                        <div className="grid grid-cols-10 font-extrabold text-sm text-gray-500 border-b-2 border-gray-300 pb-1">
                            <span className="col-span-5 pl-1">시공 내역</span>
                            <span className="col-span-3 text-center">소재</span>
                            <span className="col-span-2 text-right pr-1">수량</span>
                        </div>

                        {/* 항목별 리스트 */}
                        {calculation.itemizedPrices
                            .filter(item => !item.isDiscount) 
                            .map(item => {
                            return (
                                <div key={item.id} className="grid grid-cols-10 items-center text-gray-800 py-2 border-b border-gray-100 last:border-b-0">
                                    
                                    {/* 1. 시공 내역 (항목명 + 할인 정보) */}
                                    <div className="col-span-5 flex flex-col pl-1 break-words">
                                        <span className="font-semibold text-gray-700 text-sm">{item.label}</span>
                                        {(item.discount > 0 && item.calculatedPrice > 0) && (
                                                <span className='text-xs text-teal-500 font-bold'>
                                                    (-{(item.originalPrice - item.calculatedPrice).toLocaleString()}원 할인)
                                                </span>
                                        )}
                                    </div>
                                    
                                    {/* 2. 소재 */}
                                    <span className="col-span-3 text-center font-extrabold text-xs text-teal-600">
                                        {item.materialLabel}
                                    </span>

                                    {/* 3. 수량 */}
                                    <span className="col-span-2 text-right text-base font-extrabold text-gray-800 pr-1">
                                        {item.quantity}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* ⭐️ 항목별 테이블 끝 ⭐️ */}

                    {/* 할인 항목 루프 (리뷰 할인 등) */}
                    <div className='pt-2 border-t border-gray-100'>
                        {calculation.itemizedPrices
                            .filter(item => item.isDiscount) 
                            .map(item => (
                                <div key={item.id} className="flex justify-between items-center text-red-500 font-extrabold pl-2 pr-1 py-1 border-b border-gray-100 last:border-b-0 text-sm">
                                    <span className={`flex items-center`}>
                                        <Gift size={14} className='inline mr-1 text-red-400'/> {item.label}
                                    </span>
                                    <span className={`text-right text-lg`}>
                                        -{item.originalPrice.toLocaleString()}원
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

                
                {/* 총 합계 영역 */}
                <div className="pt-4 text-center border-t border-gray-300"> 
                    
                    <div className="flex justify-between items-end"> 
                        <span className='text-lg font-extrabold text-gray-800'>최종 견적 금액</span>
                        <div className="text-right">
                            <span className="text-4xl font-extrabold text-[#004D40]">{calculation.price.toLocaleString()}원</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>

                {/* 안내 사항 영역 */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className='w-full py-2 px-2 text-center bg-gray-100 text-[#004D40] rounded-lg font-bold text-xs shadow-sm flex items-center justify-center border border-gray-200'>
                        <TrendingUp size={14} className='inline mr-1'/> 바닥 30x30cm, 벽면 30x60cm 크기 기준
                    </div>
                    <div className='w-full py-2 px-2 text-center bg-gray-100 text-[#004D40] rounded-lg font-bold text-xs shadow-sm flex items-center justify-center border border-gray-200'>
                        <TrendingUp size={14} className='inline mr-1'/> 재시공(셀프포함)은 별도문의
                    </div>
                    <div className='w-full py-2 px-2 text-center bg-gray-100 text-[#004D40] rounded-lg font-bold text-xs shadow-sm flex items-center justify-center border border-gray-200'>
                        <TrendingUp size={14} className='inline mr-1'/> 조각타일 및 대리석은 시공불가
                    </div>
                </div>
              </div>
            </div>
            
            {/* ⭐️ [견적서 모달 하단 컨트롤 영역] ⭐️ */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                {/* 1. 숨고 리뷰 이벤트 버튼 (골드/에메랄드 디자인) */}
                {soomgoReviewEvent && (
                    <div className='mb-3'>
                        {(() => {
                            const evt = soomgoReviewEvent;
                            const isApplied = isSoomgoReviewApplied;
                            const discountAmount = evt.discount.toLocaleString();
                            const Icon = isApplied ? CheckCircle2 : Sparkles;

                            const baseClasses = "w-full py-3 rounded-xl transition font-extrabold text-base active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 relative overflow-hidden border-2";
                            
                            const activeClasses = "bg-[#004D40] text-[#FFB300] border-[#FFB300] hover:bg-teal-900";
                            const inactiveClasses = "bg-[#FFB300] text-[#004D40] border-[#004D40] hover:bg-amber-500";

                            const finalClasses = isApplied
                                ? activeClasses
                                : `${inactiveClasses} shine-effect`; 

                            const iconColorClass = isApplied ? 'text-[#FFB300]' : 'text-[#004D40]'; 

                            const labelText = isApplied 
                                ? `✅ 할인 적용됨! (취소 시 +${discountAmount}원)` 
                                : `🔥 숨고 리뷰 약속하고 ${discountAmount}원 할인받기!`;

                            return (
                                <button
                                    onClick={() => toggleReview(evt.id)}
                                    className={`${baseClasses} ${finalClasses}`}
                                >
                                    <Icon size={20} fill="currentColor" className={iconColorClass}/>
                                    <span>{labelText}</span>
                                </button>
                            );
                        })()}
                    </div>
                )}
                
                <div className='grid grid-cols-3 gap-3'> 
                    
                    <button onClick={handleImageSave} className="flex items-center justify-center gap-1 bg-[#004D40]/90 text-white py-3 rounded-lg font-bold hover:bg-teal-900 transition text-sm active:scale-95 shadow-md"> 
                        <ImageIcon size={18} /> <span>저장</span>
                    </button>
                    
                    <button onClick={() => window.open(KAKAO_CHAT_URL, '_blank')} className="flex items-center justify-center gap-1 bg-[#FFB300] text-[#004D40] py-3 rounded-lg font-bold hover:bg-amber-500 transition shadow-md text-sm active:scale-95"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-chat-fill" viewBox="0 0 16 16">
                            <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7 3.582 7 8 7zm4.25-5.5a1 1 0 0 0-1-1h-6.5a1 1 0 0 0 0 2h6.5a1 1 0 0 0 1-1z"/>
                        </svg> 
                        <span>카톡</span>
                    </button>
                    
                    <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-1 bg-[#004D40] text-white py-3 rounded-lg font-bold hover:bg-teal-900 transition shadow-md text-sm active:scale-95"> 
                        <Phone size={18} /> <span>전화</span>
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