import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
  CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon
} from 'lucide-react';

const delay = ms => new Promise(res => setTimeout(res, ms));

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
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 150000, icon: LayoutGrid, unit: '개소', desc: '원하는 개수만큼 선택' },
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

// ⭐️ [신규 데이터] 혼합 패키지 데이터 정의 (사용자 제공 데이터를 표준화) ⭐️
const MIXED_PACKAGES = [
  { id: 'P_MIX_01', price: 750000, label: '혼합패키지 01 (욕실2E/현관1P/샤워1P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['shower_booth', 1]] },
  { id: 'P_MIX_02', price: 750000, label: '혼합패키지 02 (욕실2E/현관1P/욕조1P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['bathtub_wall', 1]] },
  { id: 'P_MIX_03', price: 800000, label: '혼합패키지 03 (욕실2E/현관1P/안방벽1P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['master_bath_wall', 1]] },
  { id: 'P_MIX_04', price: 800000, label: '혼합패키지 04 (욕실2E/현관1P/공용벽1P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['common_bath_wall', 1]] },
  { id: 'P_MIX_05', price: 1050000, label: '혼합패키지 05 (욕실2E/현관1P/양쪽벽2P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['master_bath_wall', 1], ['common_bath_wall', 1]] },
  { id: 'P_MIX_06', price: 830000, label: '혼합패키지 06 (욕실2E/현관1P/샤워1P/베세2P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['shower_booth', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_07', price: 830000, label: '혼합패키지 07 (욕실2E/현관1P/욕조1P/베세2P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['bathtub_wall', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_08', price: 950000, label: '혼합패키지 08 (욕실2E/현관1P/샤워욕조2P/베세2P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['bathtub_wall', 1], ['shower_booth', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_09', price: 1200000, label: '혼합패키지 09 (욕실2E/현관1P/양쪽벽2P/베세2P)', E_areas: [['bathroom_floor', 2]], P_areas: [['entrance', 1], ['master_bath_wall', 1], ['common_bath_wall', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_10', price: 900000, label: '혼합패키지 10 (욕실2E/샤워1E/현관1P/베세2P)', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_11', price: 900000, label: '혼합패키지 11 (욕실2E/욕조1E/현관1P/베세2P)', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_12', price: 1550000, label: '혼합패키지 12 (욕실2E/양쪽벽2E/현관1P/주방1P/베세2P)', E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]], P_areas: [['entrance', 1], ['kitchen_wall', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_13', price: 1100000, label: '혼합패키지 13 (욕실2E/샤워1E/주방1E/현관1P/베세2P)', E_areas: [['bathroom_floor', 2], ['shower_booth', 1], ['kitchen_wall', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
  { id: 'P_MIX_14', price: 1100000, label: '혼합패키지 14 (욕실2E/욕조1E/주방1E/현관1P/베세2P)', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1], ['kitchen_wall', 1]], P_areas: [['entrance', 1], ['balcony_laundry', 2]] },
];

// -----------------------------------------------------------------
// [컴포넌트] PackageToast, Accordion, MaterialDetailModal (유지)
// -----------------------------------------------------------------

const PackageToast = ({ isVisible, onClose, label }) => {
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
                        {label} 적용되었습니다!
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
// ... (Accordion and MaterialDetailModal components are omitted for brevity, assumed to be here)
// ...

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


export default function GroutEstimatorApp() {
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
  const [quantities, setQuantities] = useState(
    [...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  // ⭐️ [신규 상태] 각 영역별 자재 선택 (기본값은 poly)
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

  // ⭐️ [신규 핸들러] 영역별 소재 변경 핸들러
  const handleAreaMaterialChange = useCallback((id, mat) => {
    setAreaMaterials(prev => ({ ...prev, [id]: mat }));
  }, []);

  // ⭐️ [신규 함수] 사용자의 선택을 표준화된 맵으로 변환 (패키지 매칭용)
  const getSelectionSummary = useCallback((q, areaMats) => {
    const summary = {};
    for (const id in q) {
      const qty = q[id];
      if (qty > 0) {
        const mat = areaMats[id];
        if (!summary[mat]) {
          summary[mat] = {};
        }
        // 각 자재별, 영역별 수량을 저장
        summary[mat][id] = qty;
      }
    }
    return summary;
  }, []);
  
  // ⭐️ [신규 함수] 혼합 패키지 매칭 로직
  const findMatchingPackage = useCallback((selectionSummary) => {
    // 1. 선택된 자재 종류 확인 (Poly, Epoxy 외 다른 자재가 선택되면 패키지 대상 제외)
    const selectedMaterials = Object.keys(selectionSummary);
    const validMaterials = ['poly', 'kerapoxy'];
    if (selectedMaterials.some(m => !validMaterials.includes(m))) {
      return null;
    }

    const polySelections = selectionSummary['poly'] || {};
    const epoxySelections = selectionSummary['kerapoxy'] || {};

    // 2. 모든 MIXED_PACKAGES 순회하며 매칭 확인
    for (const pkg of MIXED_PACKAGES) {
      let isMatch = true;

      // 3. 패키지 요구사항과 사용자의 선택을 비교 (Poly 요구사항)
      for (const [id, requiredQty] of pkg.P_areas) {
        if (polySelections[id] !== requiredQty) {
          isMatch = false;
          break;
        }
      }
      if (!isMatch) continue;

      // 4. 패키지 요구사항과 사용자의 선택을 비교 (Epoxy 요구사항)
      for (const [id, requiredQty] of pkg.E_areas) {
        if (epoxySelections[id] !== requiredQty) {
          isMatch = false;
          break;
        }
      }
      if (!isMatch) continue;

      // 5. 남는 선택 항목이 없는지 확인 (선택 항목의 총 개수가 패키지에 포함된 항목의 총 개수와 일치해야 함)
      const totalSelectedCount = Object.values(polySelections).reduce((sum, v) => sum + v, 0) + 
                                  Object.values(epoxySelections).reduce((sum, v) => sum + v, 0);
      
      const totalPackageCount = pkg.P_areas.reduce((sum, [, qty]) => sum + qty, 0) +
                                pkg.E_areas.reduce((sum, [, qty]) => sum + qty, 0);

      // 6. 항목 ID 목록도 정확히 일치하는지 추가 검증 (선택 항목 외에 다른 항목이 0개로 남아있는지 확인)
      const selectedAreaIds = new Set([...Object.keys(polySelections), ...Object.keys(epoxySelections)]);
      const packageAreaIds = new Set([...pkg.P_areas.map(([id]) => id), ...pkg.E_areas.map(([id]) => id)]);
      
      const isIdSetMatch = selectedAreaIds.size === packageAreaIds.size && 
                           [...selectedAreaIds].every(id => packageAreaIds.has(id));

      if (totalSelectedCount === totalPackageCount && isIdSetMatch) {
        return pkg; // 완벽하게 일치하는 패키지 발견
      }
    }

    return null; // 매칭되는 패키지 없음
  }, []);
  
  const calculation = useMemo(() => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
    
    // ⭐️ 혼합 패키지 매칭 시도 ⭐️
    const selectionSummary = getSelectionSummary(quantities, areaMaterials);
    const matchedPackage = findMatchingPackage(selectionSummary);

    let q = { ...quantities };
    let total = 0;
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false;
    let totalAreaCount = Object.values(quantities).reduce((sum, count) => sum + count, 0);

    // --- 패키지 로직 재정의 ---
    if (matchedPackage) {
        // ⭐️ 혼합 패키지 적용 ⭐️
        total = matchedPackage.price;
        labelText = matchedPackage.label;
        isPackageActive = true;
        
        // 혼합 패키지 적용 시, 모든 항목은 패키지 가격에 포함되므로, q를 0으로 초기화
        ALL_AREAS.forEach(area => { q[area.id] = 0; });
        
        // 혼합 패키지에서는 현관 무료 서비스 개념 대신 고정 가격이 적용됨.
        // 기존 단일 소재 패키지 로직은 건너뜀.
    
    } else {
        // --- 2. 기존 단일 소재 패키지 로직 (후순위) ---

        const selectedMaterial = MATERIALS.find(m => m.id === material); // 전역 소재 사용
        const qBathFloor = q['bathroom_floor'] || 0;
        const qShower = q['shower_booth'] || 0;
        const qBathtub = q['bathtub_wall'] || 0;
        const qMasterWall = q['master_bath_wall'] || 0;
        const qCommonWall = q['common_bath_wall'] || 0;
        const qEntrance = q['entrance'] || 0;
        const qBathWallOne = (qMasterWall >= 1 || qCommonWall >= 1);
        const qBathWallTotal = qMasterWall + qCommonWall;
        let packageDiscount = 0; // 기존 단일 패키지 할인을 계산

        // ... (기존 패키지 로직 삽입 - q 수량 차감 및 total 계산)
        if (selectedMaterial.id === 'poly' && qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
            total += 300000; q['bathroom_floor'] -= 2; isPackageActive = true; isFreeEntrance = true; labelText = '패키지 할인 적용'; packageDiscount = (150000 * 2) + 50000 - 300000;
        } else if (selectedMaterial.id === 'kerapoxy' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
            let isMaster = qMasterWall >= 1; total += 750000; q['bathroom_floor'] -= 1; if (isMaster) q['master_bath_wall'] -= 1; else q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '패키지 할인 적용'; packageDiscount = (150000 * selectedMaterial.priceMod) + (300000 * selectedMaterial.priceMod) - 750000;
        } else if (selectedMaterial.id === 'poly' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
            let isMaster = qMasterWall >= 1; total += 500000; q['bathroom_floor'] -= 1; if (isMaster) q['master_bath_wall'] -= 1; else q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '패키지 할인 적용'; packageDiscount = (150000 * selectedMaterial.priceMod) + (300000 * selectedMaterial.priceMod) - 500000; if(packageDiscount < 0) packageDiscount = 0; 
        } else if (selectedMaterial.id === 'kerapoxy') {
            let originalPackagePrice = 0; let finalPackagePrice = 0;
            if (qBathFloor >= 2 && qBathWallTotal >= 2) { finalPackagePrice = 1300000; originalPackagePrice = (150000 * 2 * selectedMaterial.priceMod) + (300000 * 2 * selectedMaterial.priceMod); total += finalPackagePrice; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '패키지 할인 적용'; 
            } else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { finalPackagePrice = 950000; originalPackagePrice = (150000 * 2 * selectedMaterial.priceMod) + (150000 * 2 * selectedMaterial.priceMod); total += finalPackagePrice; q['bathroom_floor'] -= 2; q['shower_booth'] -= 1; q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '패키지 할인 적용'; 
            } else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { finalPackagePrice = 750000; originalPackagePrice = (150000 * 2 * selectedMaterial.priceMod) + (150000 * selectedMaterial.priceMod); total += finalPackagePrice; q['bathroom_floor'] -= 2; if (qShower >= 1) q['shower_booth'] -= 1; else q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '패키지 할인 적용'; 
            } else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '패키지 할인 적용'; 
            } else if (qBathFloor === 1) { finalPackagePrice = 350000; originalPackagePrice = 150000 * selectedMaterial.priceMod; total += finalPackagePrice; q['bathroom_floor'] -= 1; labelText = '패키지 할인 적용'; 
            } if (originalPackagePrice > 0) packageDiscount = originalPackagePrice - finalPackagePrice; if(packageDiscount < 0) packageDiscount = 0; 
        } else { 
            let originalPackagePrice = 0; let finalPackagePrice = 0;
            if (qBathFloor >= 2 && qBathWallTotal >= 2) { finalPackagePrice = 700000; originalPackagePrice = (150000 * 2) + (300000 * 2); total += finalPackagePrice; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; labelText = '패키지 할인 적용'; 
            } else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { finalPackagePrice = 380000; originalPackagePrice = (150000 * 2) + 150000; total += finalPackagePrice; q['bathroom_floor'] -= 2; if (qShower >= 1) q['shower_booth'] -= 1; else q['bathtub_wall'] -= 1; isPackageActive = true; labelText = '패키지 할인 적용'; 
            } else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '패키지 할인 적용'; 
            } else if (qBathFloor === 1) { finalPackagePrice = 200000; originalPackagePrice = 150000; total += finalPackagePrice; q['bathroom_floor'] -= 1; labelText = '패키지 할인 적용'; 
            } if (originalPackagePrice > 0) packageDiscount = originalPackagePrice - finalPackagePrice; if(packageDiscount < 0) packageDiscount = 0; 
        }
        
        if(packageDiscount > 0) {
            itemizedPrices.push({ id: 'package_discount', label: labelText, quantity: 1, unit: '건', originalPrice: packageDiscount, calculatedPrice: 0, discount: packageDiscount, isPackageItem: true, isDiscount: true, });
        }
        // --- 2. 기존 단일 소재 패키지 로직 끝 ---
    }


    // --- 3. 잔여 항목 개별 계산 (항목별 소재 가격 적용) ---
    ALL_AREAS.forEach(area => {
        const initialCount = quantities[area.id] || 0;
        
        if (initialCount === 0) return;

        const count = q[area.id] || 0; // 잔여 수량
        const originalBasePrice = area.basePrice;

        const areaMatId = areaMaterials[area.id];
        const selectedAreaMaterial = MATERIALS.find(m => m.id === areaMatId);
        
        let currentMod = selectedAreaMaterial ? selectedAreaMaterial.priceMod : 1.0;
        
        if (area.id === 'living_room' && selectedAreaMaterial.id === 'kerapoxy') currentMod = 2.0;

        let itemOriginalTotal = originalBasePrice * initialCount * currentMod * selectedHousing.multiplier;
        
        // *************************************************************************
        // * 혼합 패키지가 적용된 경우 (matchedPackage), 잔여 수량 (count)이 0이므로  *
        // * 이 루프는 실행되지 않습니다. 따라서 패키지에 포함된 항목은 아래에 추가만 합니다. *
        // *************************************************************************

        if (!matchedPackage) {
             // 단일 패키지 및 개별 선택 로직 적용
            let remainingOriginalPrice = originalBasePrice * count * currentMod * selectedHousing.multiplier;
            let remainingCalculatedPrice = remainingOriginalPrice;
            let remainingDiscount = 0;
            let finalCalculatedPrice = 0;
            let finalDiscount = 0;
            let isFreeServiceItem = false;
            let packageCount = initialCount - count;
            
            // 기존 개별 계산 로직 (유지)
            if (area.id === 'entrance' && initialCount >= 1 && isFreeEntrance) {
                  finalCalculatedPrice = 0; finalDiscount = originalBasePrice * initialCount * currentMod * selectedHousing.multiplier; isFreeServiceItem = true; total += finalCalculatedPrice;
            } else if (packageCount > 0 && ['bathroom_floor', 'master_bath_wall', 'common_bath_wall', 'shower_booth', 'bathtub_wall'].includes(area.id)) {
                 if (count === 0) { finalCalculatedPrice = 0; finalDiscount = itemOriginalTotal - 0; } else { if (area.id === 'living_room' && isPackageActive) { let fixedDiscount = (areaMatId === 'poly' ? 50000 : 150000) * count; remainingCalculatedPrice = Math.max(0, remainingCalculatedPrice - fixedDiscount); remainingDiscount = fixedDiscount; } finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000; finalDiscount = Math.floor(remainingDiscount / 1000) * 1000; total += finalCalculatedPrice; }
            } else {
                if (area.id === 'living_room' && isPackageActive) { let fixedDiscount = (areaMatId === 'poly' ? 50000 : 150000) * initialCount; remainingCalculatedPrice = Math.max(0, itemOriginalTotal - fixedDiscount); remainingDiscount = fixedDiscount; } 
                else if (area.id === 'balcony_laundry' && isPackageActive) { if (areaMatId === 'poly') { let fixedPrice = 100000 * initialCount; remainingDiscount = itemOriginalTotal - fixedPrice; remainingCalculatedPrice = fixedPrice; } }
                else if (area.id === 'silicon_bathtub' && isPackageActive) { let fixedPrice = 50000 * initialCount; remainingDiscount = itemOriginalTotal - fixedPrice; remainingCalculatedPrice = fixedPrice; }
                else if (area.id === 'silicon_living_baseboard' && isPackageActive) { let fixedPrice = 350000 * initialCount; remainingDiscount = itemOriginalTotal - fixedPrice; remainingCalculatedPrice = fixedPrice; }
                finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000; finalDiscount = Math.floor(remainingDiscount / 1000) * 1000; total += finalCalculatedPrice;
            }

             // 개별 항목 가격 정보 추가
             itemizedPrices.push({
                id: area.id, label: area.label, quantity: initialCount, unit: area.unit, originalPrice: Math.floor(itemOriginalTotal / 1000) * 1000, calculatedPrice: finalCalculatedPrice, discount: finalDiscount, isFreeService: isFreeServiceItem, isPackageItem: packageCount > 0 && !isFreeServiceItem, isDiscount: false, materialLabel: selectedAreaMaterial ? selectedAreaMaterial.label.split('(')[0].trim() : 'N/A'
             });

        } else {
             // ⭐️ 혼합 패키지 적용 시 (matchedPackage)에는 모든 항목을 0원 (패키지 포함)으로 추가 ⭐️
             itemizedPrices.push({
                id: area.id, label: area.label, quantity: initialCount, unit: area.unit, originalPrice: Math.floor(itemOriginalTotal / 1000) * 1000, calculatedPrice: 0, discount: itemOriginalTotal, isFreeService: false, isPackageItem: true, isDiscount: false, materialLabel: selectedAreaMaterial ? selectedAreaMaterial.label.split('(')[0].trim() : 'N/A'
             });
        }
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

    let estimatedHours = 0;
    if (totalAreaCount > 0) { estimatedHours = 4; estimatedHours += Math.floor(quantities['bathroom_floor'] * 1); estimatedHours += Math.floor((quantities['master_bath_wall'] + quantities['common_bath_wall']) * 1.5); estimatedHours += (quantities['living_room'] > 0 ? 2 : 0); estimatedHours = Math.max(4, Math.min(estimatedHours, 8)); }


    return { 
      price: finalPrice, 
      originalCalculatedPrice, 
      label: matchedPackage ? matchedPackage.label : labelText, // ⭐️ 매칭된 패키지 라벨 우선 적용 ⭐️
      isPackageActive: !!matchedPackage || isPackageActive, // 혼합 패키지 또는 기존 패키지 중 하나라도 적용되면 true
      isFreeEntrance,
      discountAmount,
      minimumFeeApplied, 
      itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount),
    };

  }, [quantities, selectedReviews, MIN_FEE, housingType, areaMaterials, getSelectionSummary, findMatchingPackage]);


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
  const copyToClipboard = async () => { /* ... */ };
  const handleImageSave = async () => { /* ... */ };


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const selectedMaterialData = MATERIALS.find(m => m.id === material);
  const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
  const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
  
  const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
  const currentEmbedUrl = getEmbedUrl(currentVideo.id);


  // ⭐️ 컴포넌트: 개별 소재 선택 버튼
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
      {isQuantitySelected && <p className='text-[10px] text-gray-500 mt-1'>*해당 영역에 **{MATERIALS.find(m => m.id === currentMat)?.label.split('(')[0].trim()}** 적용</p>}
    </div>
  );


  return (
    <div className={`min-h-screen bg-gray-50 t  ext-gray-800 font-sans pb-40`}>
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
          </h2>
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

        {/* ⭐️ --- 2. 시공 재료 선택 (전역 소재 선택은 유지) --- ⭐️ */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Hammer className="h-5 w-5 text-indigo-600" /> 2. 줄눈소재 기본 설정 (패키지 기준)
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

        {/* ⭐️ --- 3. 원하는 시공범위를 선택해주세요 (소재 선택 버튼 추가) --- ⭐️ */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-450">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Calculator className="h-5 w-5 text-indigo-600" /> 3. 시공범위 선택
          </h2 >
          <div className="space-y-3">
            {SERVICE_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;
              const currentMat = areaMaterials[area.id];

              return (
                <div key={area.id} className={`flex flex-col p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                            <div>
                                <div className="font-semibold text-gray-800">{area.label}</div>
                                <div className="text-xs text-gray-500">기본 {area.basePrice.toLocaleString()}원~{area.desc && <span className="block text-indigo-600">{area.desc}</span>}</div>
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
                                    // 수량이 0에서 1이 될 때, 전역 소재를 초기값으로 설정 (선택이 없었을 경우)
                                    if (quantities[area.id] === 0 && areaMaterials[area.id] === 'poly') {
                                        handleAreaMaterialChange(area.id, material);
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
        </section>

        {/* --- 4. 실리콘 교체할 곳 선택 (소재 선택 버튼 추가) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-600">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Eraser className="h-5 w-5 text-indigo-600" /> 4. 추가 시공 (실리콘/리폼)
          </h2 >
          <div className="space-y-3">
            {SILICON_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;
              const currentMat = areaMaterials[area.id];

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
                            <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>-</button> 
                            <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                            <button onClick={() => handleQuantityChange(area.id, 1)} className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90">+</button> 
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
                    
                    {/* ⭐️ 최소 출장비 버튼/뱃지 추가 ⭐️ */}
                    {calculation.minimumFeeApplied && (
                        <div className="bg-red-500 text-white p-2 rounded-lg font-extrabold text-xs text-center shadow-lg flex items-center justify-center gap-1">
                            <Clock size={16} /> 최소 출장비 {MIN_FEE.toLocaleString()}원 적용
                        </div>
                    )}

                    {/* 1. 금액 및 정보 영역 */}
                    <div className='flex items-center justify-between w-full text-white'> 
                        
                        {/* 좌측: 금액 정보 (총 예상 견적 문구 화이트 강조) */}
                        <div className='flex items-center gap-2'>
                            <span className='text-sm font-semibold text-white'>총 예상 견적</span>
                            <div className="flex flex-col items-end gap-0.5">
                                
                                {/* 1. 최소 출장비 적용 시, 원래 가격 스트라이크 아웃 */}
                                {calculation.minimumFeeApplied && (
                                    <span className="text-xs text-gray-400 line-through font-normal">
                                        {calculation.originalCalculatedPrice.toLocaleString()}원
                                    </span>
                                )}
                                
                                {/* 2. 최종 적용 가격 */}
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-extrabold text-white">{calculation.price.toLocaleString()}</span>
                                    <span className="text-base font-normal text-white">원</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* 우측: 패키지 라벨만 표시 (노란색으로 변경) */}
                        <div className='flex flex-col items-end'>
                            {/* A. 패키지 적용 라벨 (패키지 적용 시 노란색 텍스트로 표시) */}
                            {calculation.label && (
                                <div className="text-xs font-bold text-amber-300 mb-0.5 whitespace-nowrap">
                                    <Crown size={12} className='inline mr-1 text-amber-300'/> {calculation.label}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. 견적서 보기 버튼 (색상 복구 및 유지) */}
                    <button 
                        onClick={() => {
                            setShowModal(true);
                            setShowToast(false); 
                        }} 
                        // hasSelections가 true일 때만 렌더링되므로, disabled는 항상 false (활성화)
                        className={`w-full py-3 rounded-xl font-extrabold text-lg transition-all 
                            bg-indigo-700 text-white hover:bg-indigo-800 active:bg-indigo-900 shadow-md
                        `}
                    >
                        견적서 상세보기
                    </button>
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
              <div ref={quoteRef} id="quote-content" className="border-4 border-indigo-700 rounded-lg p-5 space-y-3 mx-auto" style={{ width: '320px' }}>
                
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
                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex-shrink-0 pr-2">기본 재료</span> 
                      <span className="font-bold text-indigo-600 text-right flex-shrink-0">
                        {selectedMaterialData.label} ({material === 'poly' ? (polyOption === 'pearl' ? '펄' : '무펄') : (epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크')})
                      </span>
                    </div>
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
                                <Crown size={12} className='text-indigo-400'/> {calculation.label} 적용
                            </p>
                            <ul className='list-disc list-inside text-[11px] ml-1 space-y-0.5 text-left'>
                                {calculation.label.includes('혼합패키지') ? (
                                    <>
                                        <li>에폭시 시공 영역: {calculation.itemizedPrices.filter(i => i.materialLabel === '에폭시' && !i.isDiscount).map(i => i.label).join(', ')}</li>
                                        <li>폴리아스파틱 시공 영역: {calculation.itemizedPrices.filter(i => i.materialLabel === '폴리아스파틱' && !i.isDiscount).map(i => i.label).join(', ')}</li>
                                    </>
                                ) : (
                                    <>
                                        {calculation.isFreeEntrance && <li>현관 바닥 서비스 (폴리아스파틱)</li>}
                                        <li>변기테두리, 바닥테두리</li>
                                        <li>욕실 젠다이/세면대 실리콘</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* 개별 항목 루프 (할인 항목 표시 방식 수정 완료) */}
                    {calculation.itemizedPrices
                        .filter(item => !item.isDiscount) 
                        .map(item => {
                        
                        const isDiscounted = item.discount > 0;
                        const finalPriceText = item.calculatedPrice.toLocaleString();
                        
                        return (
                            <div key={item.id} className="flex flex-col text-gray-800 pl-2 pr-1 pt-1 border-b border-gray-100 last:border-b-0">
                                
                                {/* 항목 이름 및 수량 */}
                                <div className="flex justify-between items-center">
                                    <span className={`w-3/5 font-semibold text-gray-700 text-sm`}>
                                        <span className="text-gray-400 mr-1">-</span>
                                        {item.label} 
                                        {item.quantity > 0 && <span className="text-gray-400 text-xs font-normal"> x {item.quantity}</span>}
                                        {/* ⭐️ 영역별 소재 라벨 추가 ⭐️ */}
                                        <span className='text-indigo-500 text-[10px] ml-1 font-extrabold'>({item.materialLabel})</span>
                                    </span>
                                    
                                    {/* 최종 적용 가격 */}
                                    <span className={`text-right w-2/5 font-bold text-sm text-indigo-600`}> 
                                        {item.calculatedPrice > 0 ? `${finalPriceText}원` : (item.isPackageItem ? '패키지 포함' : (item.isFreeService ? '무료' : '0원'))}
                                    </span>
                                </div>
                                
                                {/* 할인이 발생한 경우에만 할인액 표시 */}
                                {isDiscounted && item.discount > 0 && (
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

                    {/* 할인 항목 루프 (패키지 할인, 리뷰 할인 등) */}
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
                    
                    <div className="flex justify-end items-end"> 
                        <div className="text-right">
                            <span className="text-3xl font-extrabold text-indigo-700">{calculation.price.toLocaleString()}원</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>

                {/* 안내 사항 영역 (문구 제거) */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className='w-full py-1.5 px-2 text-center bg-gray-100 text-indigo-600 rounded-md font-bold text-[11px] shadow-sm flex items-center justify-center'>
                        참고 | 바닥 30x30cm, 벽면 30x60cm 크기 기준
                    </div>
                    
                    {/* 전문가와 상담 시 최종 금액이 확정됩니다. 문구 제거 */}
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
                            
                            // 배경색 네이비로 고정
                            const fixedBgClasses = "bg-indigo-700 text-white hover:bg-indigo-800"; 
                            
                            // 테두리 클래스: 적용 시 노란색, 미적용 시 짙은 네이비 (배경과 동일하게)
                            const borderClasses = isApplied
                                ? "border-amber-400" 
                                : "border-indigo-700"; 
                                
                            const iconColorClass = 'text-white'; // 아이콘 흰색 고정

                            // 애니메이션 클래스 제거

                            const labelText = isApplied 
                                ? `할인 적용 취소하기 (총액 +${discountAmount}원)` 
                                : `숨고 리뷰 약속하고 ${discountAmount}원 할인받기!`;

                            return (
                                <button
                                    onClick={() => toggleReview(evt.id)}
                                    // shine-effect 클래스를 제거했습니다.
                                    className={`${baseClasses} ${fixedBgClasses} ${borderClasses}`}
                                >
                                    <Icon size={18} fill="currentColor" className={iconColorClass}/>
                                    <span>{labelText}</span>
                                </button>
                            );
                        })()}
                    </div>
                )}
                
                {/* 기존의 "상담 시 현장사진이 있으면 큰 도움이 됩니다.." 문구 삭제됨 */}
                
                <div className='grid grid-cols-2 gap-3'>
                    {/* 버튼 내부 정렬 수정 */}
                    <button onClick={handleImageSave} className="flex items-center justify-center gap-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition text-sm active:scale-95 shadow-md"> 
                        <ImageIcon size={16} /> <span>견적서 저장</span>
                    </button>
                    {/* 버튼 내부 정렬 수정 */}
                    <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-1 bg-indigo-700 text-white py-3 rounded-lg font-bold hover:bg-indigo-800 transition shadow-md text-sm active:scale-95 col-span-1"> 
                        <Phone size={16} /> <span>상담원 연결</span>
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