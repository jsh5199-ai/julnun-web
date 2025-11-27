import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
  CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon
} from 'lucide-react';

const delay = ms => new Promise(res => setTimeout(res, res, ms));

// ⭐️ 최소 출장비 상수 정의
const MIN_FEE = 200000;

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

const SERVICE_AREAS = [
  { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소' },
  { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
  { id: 'shower_booth', label: '샤워부스 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
  { id: 'bathtub_wall', label: '욕조 벽 3면', basePrice: 150000, icon: Bath, unit: '구역' },
  { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
  { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 80000, icon: LayoutGrid, unit: '개소', desc: '원하는 개수만큼 선택' }, 
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역' },
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '복도,주방 포함' },
];

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

// 🎥 YouTube 영상 목록 및 URL 생성 함수 (유지)
const YOUTUBE_VIDEOS = [
    { id: 'XekG8hevWpA', title: '에폭시 시공영상 (벽면/바닥)', label: '에폭시 시공영상' }, 
    { id: 'M6Aq_VVaG0s', title: '밑작업 영상 (라인 그라인딩)', label: '밑작업 영상' }, 
];

const getEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&rel=0`;

// ⭐️ 혼합 패키지 데이터 정의 (유지) ⭐️
const MIXED_PACKAGES = [
  { id: 'P_MIX_01', price: 750000, label: '혼합패키지 01', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['shower_booth', 1]] },
  { id: 'P_MIX_02', price: 750000, label: '혼합패키지 02', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['bathtub_wall', 1]] },
  { id: 'P_MIX_03', price: 800000, label: '혼합패키지 03', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['master_bath_wall', 1]] },
  { id: 'P_MIX_04', price: 800000, label: '혼합패키지 04', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['common_bath_wall', 1]] },
  { id: 'P_MIX_05', price: 1050000, label: '혼합패키지 05', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['master_bath_wall', 1], ['common_bath_wall', 1]] },
  { id: 'P_MIX_06', price: 830000, label: '혼합패키지 06', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['shower_booth', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_07', price: 830000, label: '혼합패키지 07', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['bathtub_wall', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_08', price: 950000, label: '혼합패키지 08', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['bathtub_wall', 1], ['shower_booth', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_09', price: 1200000, label: '혼합패키지 09', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['master_bath_wall', 1], ['common_bath_wall', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_10', price: 900000, label: '혼합패키지 10', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_11', price: 900000, label: '혼합패키지 11', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_12', price: 1550000, label: '혼합패키지 12', E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]], P_areas: [['entrance', 1], ['kitchen_wall', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_13', price: 1100000, label: '혼합패키지 13', E_areas: [['bathroom_floor', 2], ['shower_booth', 1], ['kitchen_wall', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_14', price: 1100000, label: '혼합패키지 14', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1], ['kitchen_wall', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
];
// -----------------------------------------------------------------

// =================================================================
// [컴포넌트] (유지)
// =================================================================

const PackageToast = ({ isVisible, onClose, label }) => {
    const toastLabel = label || '패키지 할인'; // 안전한 기본값 설정
    
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

      // === 2. 욕실 바닥 2곳 선택 시 현관 (entrance) 자동 선택 로직 ===
      if (id === 'bathroom_floor') {
        const otherBathQty = newQuantities['bathroom_floor'] || 0;
        
        // 2개 이상 선택 시 현관을 1개로 자동 설정
        if (otherBathQty >= 2 && (newQuantities['entrance'] || 0) === 0) {
          newQuantities['entrance'] = 1;
          setAreaMaterials(prevMat => ({ ...prevMat, 'entrance': 'poly' }));
        } 
      }
      
      return newQuantities;
    });
  }, []);
  
  // ⭐️ [유지] 영역별 소재 변경 핸들러
  const handleAreaMaterialChange = useCallback((id, mat) => {
    setAreaMaterials(prev => ({ ...prev, [id]: mat }));
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
        const mat = areaMats[id];
        // 에폭시는 'kerapoxy' ID만 사용
        const matKey = MATERIALS.find(m => m.id === mat)?.id === 'kerapoxy' ? 'kerapoxy' : 'poly';

        if (!summary[matKey]) {
          summary[matKey] = {};
        }
        summary[matKey][id] = qty;
      }
    }
    return summary;
  }, []);
  
  // ⭐️ [유지] 혼합 패키지 매칭 로직 - 현관 자동 인식 기능 포함
  const findMatchingPackage = useCallback((selectionSummary, quantities) => {
    let polySelections = { ...(selectionSummary['poly'] || {}) };
    const epoxySelections = selectionSummary['kerapoxy'] || {};
    
    const totalSelectedCount = Object.values(polySelections).reduce((sum, v) => sum + v, 0) + 
                               Object.values(epoxySelections).reduce((sum, v) => sum + v, 0);
    if (totalSelectedCount === 0) return null;

    for (const pkg of MIXED_PACKAGES) {
      let tempPolySelections = { ...polySelections };
      let tempEpoxySelections = { ...epoxySelections };
      let appliedAutoEntrance = false;

      // 1.1. 현관 자동 포함 조건 확인 및 적용 (Poly 1개소만 요구할 경우)
      const requiredEntrance = pkg.P_areas.find(([id]) => id === 'entrance');
      const isEntranceSelected = quantities['entrance'] > 0;
      
      if (requiredEntrance && requiredEntrance[1] === 1 && !isEntranceSelected) {
          
          let otherPolyMatch = true;
          for (const [id, requiredQty] of pkg.P_areas) {
              if (id !== 'entrance' && (tempPolySelections[id] || 0) !== requiredQty) { 
                  otherPolyMatch = false;
                  break;
              }
          }
          
          let epoxyMatch = true;
          for (const [id, requiredQty] of pkg.E_areas) {
              if ((tempEpoxySelections[id] || 0) !== requiredQty) { 
                  epoxyMatch = false;
                  break;
              }
          }
          
          const currentTotalSelectedCount = Object.keys(polySelections).filter(id => id !== 'entrance' && polySelections[id] > 0).length + Object.keys(epoxySelections).filter(id => epoxySelections[id] > 0).length;
          const packageTotalRequiredCount = pkg.P_areas.filter(([id]) => id !== 'entrance').length + pkg.E_areas.length;

          // 현관을 제외한 나머지 항목의 종류와 갯수가 패키지 요구사항과 정확히 일치할 때
          if (otherPolyMatch && epoxyMatch && currentTotalSelectedCount === packageTotalRequiredCount) {
              tempPolySelections['entrance'] = 1; // 현관 자동 포함
              appliedAutoEntrance = true;
          }
      }
      
      let isMatch = true;
      
      // 1.2. Poly Quantities Match (임시 선택 사용)
      for (const [id, requiredQty] of pkg.P_areas) {
        if ((tempPolySelections[id] || 0) !== requiredQty) { 
            isMatch = false;
            break;
        }
      }
      if (!isMatch) continue;

      // 1.3. Epoxy Quantities Match (임시 선택 사용)
      for (const [id, requiredQty] of pkg.E_areas) {
        if ((tempEpoxySelections[id] || 0) !== requiredQty) { 
            isMatch = false;
            break;
        }
      }
      if (!isMatch) continue;

      // 2. 선택된 항목 ID 목록이 패키지 ID 목록과 '완벽히 일치'하는지 확인 (추가 선택 방지)
      const selectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
      const packageAreaIds = new Set([...pkg.P_areas.map(([id]) => id), ...pkg.E_areas.map(([id]) => id)]);
      
      const isIdSetMatch = selectedAreaIds.size === packageAreaIds.size && 
                           [...selectedAreaIds].every(id => packageAreaIds.has(id));

      if (isIdSetMatch) {
        return { ...pkg, autoEntrance: appliedAutoEntrance }; 
      }
    }

    return null; // 매칭되는 패키지 없음
  }, [quantities]);
  
  // 🚀 [수정] calculation 로직: 특정 5종 패키지 오버라이드 로직 추가
  const calculation = useMemo(() => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
    let itemizedPrices = []; 
    
    // ⭐️ 1. 혼합 패키지 매칭 시도 및 자동 현관 인식 ⭐️
    const selectionSummary = getSelectionSummary(quantities, areaMaterials);
    const matchedPackageResult = findMatchingPackage(selectionSummary, quantities);
    const matchedPackage = matchedPackageResult ? matchedPackageResult : null;
    const isAutoPackageEntrance = matchedPackageResult && matchedPackageResult.autoEntrance;

    let q = { ...quantities };
    let total = 0;
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false; // 현관 무료 서비스 플래그 (욕실 2곳 또는 자동 패키지 포함)
    let totalAreaCount = Object.values(quantities).reduce((sum, count) => sum + count, 0);
    
    // ⭐️ 2. 욕실 2곳 선택 시 현관 무료 서비스 적용 플래그 설정 ⭐️
    const qBathFloor = quantities['bathroom_floor'] || 0;
    const qEntrance = quantities['entrance'] || 0;
    const qMasterWall = quantities['master_bath_wall'] || 0;
    const qCommonWall = quantities['common_bath_wall'] || 0;
    const qShower = quantities['shower_booth'] || 0;
    const qBathtub = quantities['bathtub_wall'] || 0;
    
    // 욕실 2곳 선택 시 현관 무료 서비스 조건 (혼합 패키지에 묶이지 않은 경우에만)
    if (qBathFloor >= 2 && qEntrance >= 1 && !matchedPackage) {
        isFreeEntrance = true;
    }
    
    // 자동 패키지 현관이 발동되면, 현관은 당연히 무료 서비스
    if (isAutoPackageEntrance) {
        isFreeEntrance = true;
    }

    // ⭐️ 3. 특정 5개 항목 패키지 가격 오버라이드 ⭐️ 
    let customPackagePrice = 0;
    let customPackageLabel = '';
    let customPackageAreas = []; // 이 패키지에 포함된 항목 ID 목록

    // 3-A. 5종 세트 A (벽 전체) 오버라이드 조건
    const isCustomPackageMatchA = qBathFloor === 2 && qMasterWall === 1 && qCommonWall === 1 && qEntrance === 1;

    if (isCustomPackageMatchA && !matchedPackage) {
        customPackageAreas = ['bathroom_floor', 'master_bath_wall', 'common_bath_wall', 'entrance'];
        const allAreasSelected = customPackageAreas.every(id => quantities[id] > 0);
        
        if (allAreasSelected) {
            
            // 모든 항목의 소재가 동일한지 확인
            const mats = customPackageAreas.map(id => areaMaterials[id]);
            const allSame = mats.every(m => m === mats[0]);
            
            if (allSame) {
                const materialId = mats[0];
                
                // ⭐️ 수정 요청 반영: 현관/욕실바닥/안방벽/공용벽 전체 패키지 ⭐️
                if (materialId === 'kerapoxy') {
                    customPackagePrice = 1350000; // 135만원으로 수정
                    customPackageLabel = '프리미엄 5종 세트 A (에폭시)';
                } else if (materialId === 'poly') {
                    customPackagePrice = 1300000; // 130만원으로 수정
                    customPackageLabel = '일반 5종 세트 A (폴리)';
                }
            }
        }
    }
    
    // 3-B. 5종 세트 B (샤워부스/욕조 벽) 오버라이드 조건
    const isCustomPackageMatchB = qBathFloor === 2 && qShower === 1 && qBathtub === 1 && qEntrance === 1;

    if (isCustomPackageMatchB && !matchedPackage && customPackagePrice === 0) { // A 패키지와 중복 방지
        customPackageAreas = ['bathroom_floor', 'shower_booth', 'bathtub_wall', 'entrance'];
        const allAreasSelected = customPackageAreas.every(id => quantities[id] > 0);
        
        if (allAreasSelected) {
            const mats = customPackageAreas.map(id => areaMaterials[id]);
            const allSame = mats.every(m => m === mats[0]);
            
            if (allSame) {
                const materialId = mats[0];
                
                if (materialId === 'kerapoxy') {
                    customPackagePrice = 950000; // 95만원
                    customPackageLabel = '프리미엄 5종 세트 B (에폭시)';
                } else if (materialId === 'poly') {
                    customPackagePrice = 550000; // 55만원
                    customPackageLabel = '일반 5종 세트 B (폴리)';
                }
            }
        }
    }


    // --- 패키지 로직 적용 ---
    if (customPackagePrice > 0) {
        total = customPackagePrice;
        isPackageActive = true;
        
        // 커스텀 패키지에 포함된 항목은 개별 계산에서 제외
        customPackageAreas.forEach(id => { q[id] = 0; });
    } else if (matchedPackage) {
        // ⭐️ 혼합 패키지 적용 ⭐️ (유지)
        total = matchedPackage.price;
        isPackageActive = true;
        
        // 패키지 항목은 개별 계산에서 제외 (q를 0으로 설정)
        ALL_AREAS.forEach(area => { q[area.id] = 0; });
        
    } else {
      // 매칭되는 패키지가 없는 경우 개별 계산으로 진행
    }
    
    // ⭐️ 3. 현관 무료 서비스가 적용될 경우 잔여 수량 (q)에서 현관을 제외 ⭐️
    if (isFreeEntrance && customPackagePrice === 0 && !matchedPackage) { // 커스텀/혼합 패키지에 포함되지 않은 경우에만 독립적인 현관 무료 로직 실행
        // q는 최종 계산에 사용되는 잔여 수량
        q['entrance'] = 0; 
        isPackageActive = isPackageActive || true; // 서비스가 적용되면 패키지 활성화로 간주
    }
    
    // ⭐️ 4. 하단 바 문구 고정 ⭐️
    if (isPackageActive && !labelText) {
        labelText = '패키지 할인 적용 중';
    }


    // --- 5. 잔여 항목 및 아이템 계산 (영역별 소재 반영) ---
    ALL_AREAS.forEach(area => {
        // 자동 패키지 현관이 발동된 경우, quantities를 임시로 조정하여 itemizedPrices에 포함
        const isEntranceAutoIncluded = area.id === 'entrance' && isAutoPackageEntrance && !quantities['entrance'];
        const initialCount = isEntranceAutoIncluded ? 1 : (quantities[area.id] || 0);
        
        if (initialCount === 0) return;

        // 패키지 적용으로 인해 차감된 수량 (matchedPackage 또는 FreeEntrance 시 0)
        const count = q[area.id] || 0; 
        const originalBasePrice = area.basePrice;

        const areaMatId = areaMaterials[area.id];
        const selectedAreaMaterial = MATERIALS.find(m => m.id === areaMatId);
        
        let currentMod = selectedAreaMaterial ? selectedAreaMaterial.priceMod : 1.0;
        
        // 거실 바닥 에폭시 특수 계수 처리 (영역별 소재 반영) - 유지
        if (area.id === 'living_room' && selectedAreaMaterial && selectedAreaMaterial.id === 'kerapoxy') currentMod = 2.0;

        // ⭐️ 베란다/세탁실 에폭시 특수 계수 처리: 300,000원 / 80,000원 = 3.75 ⭐️
        if (area.id === 'balcony_laundry' && selectedAreaMaterial && selectedAreaMaterial.id === 'kerapoxy') {
             currentMod = 3.75; 
        } 
        
        // 항목의 원래 총 가격 (패키지 적용 전)
        let itemOriginalTotal = originalBasePrice * initialCount * currentMod * selectedHousing.multiplier;
        
        let finalCalculatedPrice = 0;
        let finalDiscount = 0;
        let isFreeServiceItem = false;
        let packageCount = initialCount - count; // 패키지/서비스로 처리된 수량

        // A. 패키지 적용 항목 (가격 0원)
        if (matchedPackage || customPackagePrice > 0) {
             finalCalculatedPrice = 0;
             finalDiscount = Math.floor(itemOriginalTotal / 1000) * 1000;
             packageCount = initialCount;
        } 
        // B. 현관 무료 서비스 적용 항목 (가격 0원)
        else if (area.id === 'entrance' && isFreeEntrance) {
             finalCalculatedPrice = 0;
             finalDiscount = Math.floor(itemOriginalTotal / 1000) * 1000;
             isFreeServiceItem = true;
             packageCount = initialCount;
        }
        // C. 개별 선택 항목 (일반 계산 및 실리콘 패키지 할인 적용)
        else {
            let remainingCalculatedPrice = itemOriginalTotal;
            let remainingDiscount = 0;
            
            // 실리콘/리폼 패키지 할인 
            if (area.id === 'silicon_bathtub' && initialCount >= 1 && totalAreaCount >= 3) {
                let fixedPrice = 50000 * initialCount; 
                remainingDiscount = itemOriginalTotal - fixedPrice; 
                remainingCalculatedPrice = fixedPrice; 
            } else if (area.id === 'silicon_living_baseboard' && initialCount >= 1 && totalAreaCount >= 3) {
                let fixedPrice = 350000 * initialCount; 
                remainingDiscount = itemOriginalTotal - fixedPrice; 
                remainingCalculatedPrice = fixedPrice; 
            }

            finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000; 
            finalDiscount = Math.floor(remainingDiscount / 1000) * 1000; 
            total += finalCalculatedPrice;
        }

        // 개별 항목 가격 정보 추가
        itemizedPrices.push({
           id: area.id, 
           label: area.label, 
           quantity: initialCount, 
           unit: area.unit, 
           originalPrice: Math.floor(itemOriginalTotal / 1000) * 1000, 
           calculatedPrice: finalCalculatedPrice, 
           discount: finalDiscount, 
           isFreeService: isFreeServiceItem, 
           // 패키지 또는 서비스 적용 시 true
           isPackageItem: packageCount > 0, 
           isDiscount: false, 
           materialLabel: selectedAreaMaterial ? selectedAreaMaterial.label.split('(')[0].trim() : 'N/A'
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
    
    let originalCalculatedPrice = Math.max(0, Math.floor(total / 1000) * 1000);
    
    let finalPrice = originalCalculatedPrice; 
    let minimumFeeApplied = false;

    if (finalPrice > 0 && finalPrice < MIN_FEE) {
        finalPrice = MIN_FEE;
        minimumFeeApplied = true;
    }


    return { 
      price: finalPrice, 
      originalCalculatedPrice, 
      label: labelText, 
      isPackageActive: isPackageActive,
      isFreeEntrance: isFreeEntrance,
      discountAmount,
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
  const generateQuoteText = () => `[줄눈의미학 예상 견적서]\n\n총 예상 금액: ${calculation.price.toLocaleString()}원`;
  
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
            
            // 다운로드 링크 생성 및 클릭
            const link = document.createElement('a');
            link.href = image;
            link.download = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('견적서 이미지가 저장되었습니다!');
        } catch (error) {
            console.error('Error saving image:', error);
            alert('이미지 저장 중 오류가 발생했습니다.');
        }
    }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const selectedMaterialData = MATERIALS.find(m => m.id === material);
  const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
  const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
  
  const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
  const currentEmbedUrl = getEmbedUrl(currentVideo.id);


  // ⭐️ [유지] 컴포넌트: 개별 소재 선택 버튼
  const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => (
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
        <section className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-fade-in">
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
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </section>

        {/* --- 2. 시공 영역 선택 섹션 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-200">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <LayoutGrid className="h-5 w-5 text-indigo-600" /> 2. 시공 영역 및 수량을 선택하세요
            <span className='ml-auto text-sm font-normal text-indigo-600 cursor-pointer' onClick={() => setShowMaterialModal(true)}>(소재 비교)</span>
          </h2 >
          <div className="space-y-4">
            {SERVICE_AREAS.map((area) => {
              const qty = quantities[area.id] || 0;
              const isSelected = qty > 0;
              const isSpecialArea = ['master_bath_wall', 'common_bath_wall', 'shower_booth', 'bathtub_wall'].includes(area.id);
              
              const currentMat = areaMaterials[area.id];
              const isPoly = currentMat === 'poly';

              return (
                <div 
                  key={area.id} 
                  className={`p-4 border-2 rounded-xl transition-all duration-200 selection-box ${
                    isSelected ? 'selection-selected border-indigo-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleQuantityChange(area.id, isSelected ? 0 : 1)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <area.icon size={20} className={isSelected ? 'text-indigo-700' : 'text-gray-400'} />
                      <div className="font-bold text-gray-800 flex flex-col">
                          {area.label}
                          {area.desc && <span className='text-xs font-medium text-gray-500 mt-0.5'>{area.desc}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* 수량 버튼 */}
                      {area.id === 'balcony_laundry' ? (
                          <div className={`flex items-center border rounded-full transition-all ${isSelected ? 'border-indigo-700' : 'border-gray-300'}`}>
                            <button 
                              onClick={(e) => {e.stopPropagation(); handleQuantityChange(area.id, -1);}}
                              className="px-3 py-1 text-lg font-bold text-indigo-700 hover:bg-indigo-50 rounded-l-full transition active:scale-95"
                            >
                              -
                            </button>
                            <span className="px-3 text-lg font-extrabold w-10 text-center">{qty}</span>
                            <button 
                              onClick={(e) => {e.stopPropagation(); handleQuantityChange(area.id, 1);}}
                              className="px-3 py-1 text-lg font-bold text-indigo-700 hover:bg-indigo-50 rounded-r-full transition active:scale-95"
                            >
                              +
                            </button>
                          </div>
                      ) : (
                        <button
                          onClick={(e) => {e.stopPropagation(); handleQuantityChange(area.id, isSelected ? -1 : 1);}}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm ${
                            isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                        >
                          {isSelected ? <CheckCircle2 size={16} /> : '+'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* 소재 선택 버튼 */}
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
        </section>
        
        {/* --- 3. 추가 서비스 (실리콘/리폼) 섹션 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-250">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> 3. 실리콘/리폼 추가 서비스
          </h2 >
          <div className="space-y-4">
            {SILICON_AREAS.map((area) => {
              const qty = quantities[area.id] || 0;
              const isSelected = qty > 0;
              
              return (
                <div 
                  key={area.id} 
                  className={`p-4 border-2 rounded-xl transition-all duration-200 selection-box ${
                    isSelected ? 'selection-selected border-amber-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleQuantityChange(area.id, isSelected ? 0 : 1)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <area.icon size={20} className={isSelected ? 'text-amber-600' : 'text-gray-400'} />
                      <div className="font-bold text-gray-800 flex flex-col">
                          {area.label}
                          {area.desc && <span className='text-xs font-medium text-gray-500 mt-0.5'>{area.desc}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {e.stopPropagation(); handleQuantityChange(area.id, isSelected ? -1 : 1);}}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm ${
                          isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 size={16} /> : '+'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* --- 4. 이벤트 할인 섹션 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Gift className="h-5 w-5 text-red-500" /> 4. 할인 이벤트를 선택하세요
          </h2 >
          <div className="space-y-4">
            {soomgoReviewEvent && (
              <div
                className={`p-4 border-2 rounded-xl transition-all duration-200 selection-box cursor-pointer flex items-center justify-between ${
                  isSoomgoReviewApplied ? 'selection-selected border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleReview(soomgoReviewEvent.id)}
              >
                <div className="flex items-center gap-3">
                    <Star size={20} className={isSoomgoReviewApplied ? 'text-red-500' : 'text-gray-400'} />
                    <div className="font-bold text-gray-800 flex flex-col">
                        {soomgoReviewEvent.label}
                        <span className='text-xs font-medium text-gray-500 mt-0.5'>({soomgoReviewEvent.desc})</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className='text-sm font-extrabold text-red-500'>-{soomgoReviewEvent.discount.toLocaleString()}원</span>
                    <button
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm ${
                            isSoomgoReviewApplied ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                        }`}
                    >
                        {isSoomgoReviewApplied ? <CheckCircle2 size={16} /> : '+'}
                    </button>
                </div>
              </div>
            )}
            
            <a 
                href={SOOMGO_REVIEW_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className='w-full py-3 px-4 text-center rounded-lg font-extrabold text-white bg-indigo-700 hover:bg-indigo-800 transition active:scale-95 mt-4 shine-effect block'
            >
                숨고 리뷰 이벤트 자세히 보기 (클릭)
            </a>
          </div>
        </section>

        {/* --- 5. 최종 견적서 섹션 (유지) --- */}
        {hasSelections && (
          <section className="bg-white p-5 rounded-xl shadow-lg border-4 border-indigo-200 animate-fade-in delay-350" ref={quoteRef}>
            <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-3">
              <Calculator className="h-6 w-6 text-indigo-700" /> 5. 최종 예상 견적서
            </h2 >
            
            <div className="space-y-3">
                {/* 패키지 적용 문구 */}
                {calculation.isPackageActive && (
                    <div className='flex items-center bg-indigo-50 p-3 rounded-lg border-2 border-indigo-300 text-indigo-800 font-extrabold'>
                        <Crown size={20} className='mr-2 flex-shrink-0' />
                        <span className='text-sm'>{calculation.label || '특별 할인 패키지가 적용되었습니다.'}</span>
                    </div>
                )}
                
                {/* 견적 내역 */}
                <ul className='space-y-2 pt-2'>
                    {calculation.itemizedPrices.map((item, index) => (
                        <li key={index} className={`flex justify-between items-center text-sm ${item.isDiscount ? 'text-red-500 font-bold' : item.isPackageItem ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            <div className='flex items-center gap-2 font-semibold'>
                                {item.isDiscount ? <Gift size={16} className='text-red-500' /> : <Hammer size={16} className={item.isPackageItem ? 'text-gray-300' : 'text-indigo-600'} />}
                                <span>
                                    {item.label} 
                                    {item.quantity > 0 && ` (${item.quantity}${item.unit})`}
                                    {!item.isDiscount && item.quantity > 0 && 
                                      <span className={`ml-1 text-xs font-medium py-0.5 px-1 rounded ${item.isPackageItem ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {item.materialLabel}
                                      </span>
                                    }
                                </span>
                            </div>
                            <div className='text-right flex flex-col items-end'>
                                <span className={`font-extrabold ${item.isDiscount ? 'text-red-500' : 'text-gray-800'}`}>
                                    {item.isPackageItem || item.isFreeService
                                        ? '0원 (포함)'
                                        : item.calculatedPrice.toLocaleString() + '원'
                                    }
                                </span>
                                {item.discount > 0 && item.isPackageItem === false && (
                                    <span className='text-xs text-green-600 font-semibold mt-0.5'>
                                        {item.discount.toLocaleString()}원 할인
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="mt-5 pt-4 border-t-2 border-dashed border-gray-200 space-y-3">
                <div className='flex justify-between items-center text-lg font-bold'>
                    <span className='text-gray-600 flex items-center gap-1'><TrendingUp size={20} className='text-gray-400' />항목별 합계</span>
                    <span className='text-gray-800'>{calculation.originalCalculatedPrice.toLocaleString()}원</span>
                </div>
                
                {calculation.minimumFeeApplied && (
                    <div className='flex justify-between items-center text-sm text-red-600 font-semibold'>
                        <span className='flex items-center gap-1'><Info size={16} className='text-red-400' />최소 출장비 적용</span>
                        <span>{MIN_FEE.toLocaleString()}원</span>
                    </div>
                )}

                <div className='flex justify-between items-center text-xl font-extrabold bg-indigo-700 text-white p-3 rounded-lg shadow-md'>
                    <span className='flex items-center gap-2'><Clock size={22} />최종 예상 금액</span>
                    <span className='text-2xl'>{calculation.price.toLocaleString()}원</span>
                </div>
            </div>
          </section>
        )}
        
        {/* --- 6. FAQ (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-400">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <HelpCircle className="h-5 w-5 text-indigo-600" /> 6. 자주 묻는 질문 (FAQ)
          </h2 >
          <div className="space-y-1">
            {FAQ_ITEMS.map((item, index) => (
              <Accordion key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

      </main>

      {/* ⭐️ [유지] 고정 하단 바 ⭐️ */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 safe-area-bottom">
        <div className="max-w-md mx-auto p-3 flex flex-col gap-2">
            {hasSelections && (
                <button
                    onClick={handleImageSave}
                    className="w-full py-3 bg-gray-700 text-white rounded-lg font-extrabold hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                >
                    <ImageIcon size={18} /> 견적서 이미지 저장
                </button>
            )}
            <div className={`flex items-center ${hasSelections ? 'justify-between' : 'justify-center'}`}>
                {hasSelections && (
                    <div className='text-left'>
                        <p className='text-xs font-semibold text-gray-500'>{calculation.label || '예상 총 금액'}</p>
                        <p className='text-2xl font-extrabold text-indigo-700'>
                            {calculation.price.toLocaleString()}원
                        </p>
                    </div>
                )}
                <button 
                    onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} 
                    className={`text-lg font-extrabold px-6 py-3 rounded-xl transition-all active:scale-[0.98] shadow-xl ${
                        hasSelections 
                          ? 'bg-amber-400 text-indigo-900 hover:bg-amber-300 w-1/2' 
                          : 'bg-indigo-700 text-white hover:bg-indigo-800 w-full'
                    } flex items-center justify-center`}
                >
                    <Phone size={18} className="inline mr-2" /> 
                    {hasSelections ? '상담/예약' : '시공 문의하기'}
                </button>
            </div>
        </div>
      </footer>
      
      {/* 토스트 및 모달 */}
      <PackageToast isVisible={showToast} onClose={handleCloseToast} label={calculation.label} />
      {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
    </div>
  );
}