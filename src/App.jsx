import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
  CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Trophy, Clock, Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';

const delay = ms => new Promise(res => setTimeout(ms, res));

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
    @keyframes shine { 
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    .shine-effect {
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
        background-size: 200% 100%;
        animation: shine 5s infinite;
    }
    
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    .animate-toast { animation: slideUpFadeOut 3s forwards; }
    
    .selection-box { transition: all 0.2s ease-in-out; }
    .selection-selected {
      border: 3px solid #374151;
      background-color: #f3f4f6;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    .step-indicator { transition: all 0.3s ease; }
    /* 소재 선택 버튼 활성화 시 스타일 */
    .material-selected { background-color: #374151; color: white; border-color: #374151; }
    .material-unselected { background-color: #e5e7eb; color: #4b5563; border-color: #d1d5db; }
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
  { id: 'poly', label: '폴리아스파틱', priceMod: 1.0, description: '탄성과 광택이 우수하며 가성비가 좋습니다.', badge: '일반', badgeColor: 'bg-gray-200 text-gray-700' },
  { id: 'kerapoxy', label: '에폭시(무광/무펄)', priceMod: 1.8, description: '내구성이 뛰어나고 매트한 질감.', badge: '프리미엄', badgeColor: 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/30' },
];

// 욕실 범위: polyPrice, epoxyPrice 포함
const BATHROOM_AREAS = [
  { id: 'bathroom_floor', label: '욕실 바닥', polyPrice: 150000, epoxyPrice: 350000, icon: Bath, unit: '개소' },
  { id: 'shower_booth', label: '샤워부스 벽 3면', polyPrice: 150000, epoxyPrice: 250000, icon: Bath, unit: '구역' },
  { id: 'bathtub_wall', label: '욕조 벽 3면', polyPrice: 150000, epoxyPrice: 250000, icon: Bath, unit: '구역' },
  { id: 'master_bath_wall', label: '안방욕실 벽 전체', polyPrice: 300000, epoxyPrice: 500000, icon: Bath, unit: '구역' },
  { id: 'common_bath_wall', label: '공용욕실 벽 전체', polyPrice: 300000, epoxyPrice: 500000, icon: Bath, unit: '구역' },
];

// 기타 범위 (현관, 베란다, 주방, 거실)
const OTHER_AREAS = [
  { id: 'entrance', label: '현관', polyPrice: 50000, epoxyPrice: 50000, icon: DoorOpen, unit: '개소' },
  { id: 'balcony_laundry', label: '베란다/세탁실', polyPrice: 150000, epoxyPrice: 270000, icon: LayoutGrid, unit: '개소', desc: '원하는 개수만큼 선택' }, // 15만 * 1.8
  { id: 'kitchen_wall', label: '주방 벽면', polyPrice: 150000, epoxyPrice: 270000, icon: Utensils, unit: '구역' }, // 15만 * 1.8
  { id: 'living_room', label: '거실 바닥', polyPrice: 550000, epoxyPrice: 1100000, icon: Sofa, unit: '구역', desc: '복도,주방 포함' }, // 55만 * 2.0
];

// 실리콘 시공 영역
const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리 교체', polyPrice: 80000, epoxyPrice: 80000, icon: Eraser, unit: '개소', desc: '단독 8만 / 패키지시 5만' },
  { id: 'silicon_sink', label: '세면대+젠다이 교체', polyPrice: 30000, epoxyPrice: 30000, icon: Eraser, unit: '개소', desc: '오염된 실리콘 제거 후 재시공' },
  { id: 'silicon_living_baseboard', label: '거실/주방 걸레받이 실리콘', polyPrice: 400000, epoxyPrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35만' },
];

// 모든 항목 통합
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

// =================================================================
// [컴포넌트] PackageToast 및 Modal (유지)
// =================================================================
const PackageToast = React.memo(({ isVisible, onClose }) => {
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
                        패키지 할인이 적용되었습니다!
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
});

const Accordion = React.memo(({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="border-b border-gray-100">
        <button
          className="flex justify-between items-center w-full py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm md:text-base pr-4">{question}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180 text-indigo-600' : 'text-gray-400'}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 py-3 animate-slide-down' : 'max-h-0 opacity-0'}`}>
          <p className="text-sm text-gray-600 pl-4 pr-2 bg-indigo-50/50 p-3 rounded-md border-l-4 border-indigo-500">{answer}</p>
        </div>
      </div>
    );
});

const MaterialDetailModal = React.memo(({ onClose }) => (
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
));

// =================================================================
// [메인 컴포넌트] GroutEstimatorApp
// =================================================================

export default function GroutEstimatorApp() {
  const TOTAL_STEPS = 5; 
  const [currentStep, setCurrentStep] = useState(1);
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
  const [quantities, setQuantities] = useState(
    ALL_AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  const [areaMaterials, setAreaMaterials] = useState(
    ALL_AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 'poly' }), {})
  );
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false); 
  const [showToast, setShowToast] = useState(false); 

  const quoteRef = useRef(null); 
  const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';
  const PHONE_NUMBER = '010-7734-6709';

  // --- Step 네비게이션 함수 (유지) ---
  const handleNext = () => setCurrentStep(prev => Math.min(TOTAL_STEPS, prev + 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(1, prev - 1));

  // --- 항목별 소재 선택 핸들러 (유지) ---
  const handleAreaMaterialChange = useCallback((areaId, newMaterial) => {
    setAreaMaterials(prev => ({ ...prev, [areaId]: newMaterial }));
  }, []);

  // --- Quantity 변경 로직 (유지) ---
  const handleQuantityChange = useCallback((id, delta) => {
    setQuantities(prev => {
      const nextValue = Math.max(0, prev[id] + delta);
      const nextState = { ...prev, [id]: nextValue };
      
      if ((id === 'master_bath_wall' || id === 'common_bath_wall') && delta > 0) {
        nextState['shower_booth'] = 0;
        nextState['bathtub_wall'] = 0;
      }
      if ((id === 'shower_booth' || id === 'bathtub_wall') && delta > 0) {
        nextState['master_bath_wall'] = 0;
        nextState['common_bath_wall'] = 0;
      }
      return nextState;
    });
  }, []);


  const toggleReview = useCallback((id) => {
    setSelectedReviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  
  // --- 견적 계산 로직 (★ 패키지 로직 수정 완료) ---
  const calculation = useMemo(() => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);

    let q = { ...quantities };
    let m = { ...areaMaterials };

    let total = 0;
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false;

    // 가격을 가져오는 헬퍼 함수
    const getAreaDetail = (areaId) => ALL_AREAS.find(a => a.id === areaId);
    const getBasePrice = (areaId, matId) => {
        const area = getAreaDetail(areaId);
        // 실리콘 항목은 polyPrice/epoxyPrice가 동일한 고정가로 설정되어 있습니다.
        if (!area) return 0;
        return matId === 'poly' ? area.polyPrice : area.epoxyPrice;
    };
    
    // 패키지 조건 확인용 변수
    const qBathFloor = q['bathroom_floor'] || 0;
    const qShower = q['shower_booth'] || 0;
    const qBathtub = q['bathtub_wall'] || 0;
    const qMasterWall = q['master_bath_wall'] || 0;
    const qCommonWall = q['common_bath_wall'] || 0;
    const qEntrance = q['entrance'] || 0;
    const qBathWallOne = (qMasterWall >= 1 || qCommonWall >= 1);
    const qBathWallTotal = qMasterWall + qCommonWall;
    
    // 선택된 소재 일치 여부 확인
    const isAreaPoly = (areaId) => m[areaId] === 'poly';
    const isAreaKerapoxy = (areaId) => m[areaId] === 'kerapoxy';

    let packageDiscount = 0;
    const itemizedPrices = [];

    // --- 1. 패키지 로직 실행 ---

    let appliedPackagePrice = 0;
    let appliedPackageOriginalPrice = 0;

    // A. 에폭시 75만원 (욕실바닥1 + 벽전체1)
    if (qBathFloor === 1 && qBathWallTotal === 1 && isAreaKerapoxy('bathroom_floor') && isAreaKerapoxy(qMasterWall > 0 ? 'master_bath_wall' : 'common_bath_wall')) {
        appliedPackagePrice = 750000;
        appliedPackageOriginalPrice = getBasePrice('bathroom_floor', 'kerapoxy') + (qMasterWall > 0 ? getBasePrice('master_bath_wall', 'kerapoxy') : getBasePrice('common_bath_wall', 'kerapoxy'));
        
        q['bathroom_floor'] -= 1;
        if (qMasterWall > 0) q['master_bath_wall'] -= 1;
        else q['common_bath_wall'] -= 1;
        
        isPackageActive = true;
        labelText = '에폭시 75만원 패키지 적용'; 
    } 
    // B. 폴리 30만원 (욕실2 + 현관1)
    else if (qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0 && isAreaPoly('bathroom_floor') && isAreaPoly('entrance')) {
        appliedPackagePrice = 300000;
        appliedPackageOriginalPrice = (getBasePrice('bathroom_floor', 'poly') * 2) + getBasePrice('entrance', 'poly');
        
        q['bathroom_floor'] -= 2;
        q['entrance'] -= 1;
        
        isPackageActive = true;
        labelText = '폴리 30만원 패키지 적용'; 
    } 
    // C. 폴리 50만원 (욕실바닥1 + 벽전체1) - 개별가(45만)보다 싸면 개별가로 계산
    else if (qBathFloor === 1 && qBathWallTotal === 1 && isAreaPoly('bathroom_floor') && isAreaPoly(qMasterWall > 0 ? 'master_bath_wall' : 'common_bath_wall')) {
        const individualPrice = getBasePrice('bathroom_floor', 'poly') + (qMasterWall > 0 ? getBasePrice('master_bath_wall', 'poly') : getBasePrice('common_bath_wall', 'poly')); 
        
        if (individualPrice < 500000) { 
            // 개별 가격(45만)이 패키지 가격(50만)보다 저렴하므로, 패키지 할인은 적용되지 않음 (개별가 합산)
        } else {
             // 개별 가격이 50만 이상일 때만 패키지 적용 (할인 발생)
             appliedPackagePrice = 500000;
             appliedPackageOriginalPrice = individualPrice;
             
             q['bathroom_floor'] -= 1;
             if (qMasterWall > 0) q['master_bath_wall'] -= 1;
             else q['common_bath_wall'] -= 1;
             
             isPackageActive = true;
             labelText = '폴리 50만원 패키지 적용'; 
        }
    }
    
    // ★ 패키지 최종 가격 및 할인액 계산 및 합산
    if (appliedPackagePrice > 0) {
        total += appliedPackagePrice;
        packageDiscount = appliedPackageOriginalPrice - appliedPackagePrice;
        
        if (packageDiscount > 0) {
            itemizedPrices.push({
                id: 'package_discount', label: labelText, quantity: 1, unit: '건', material: '',
                originalPrice: Math.floor(packageDiscount / 1000) * 1000, 
                calculatedPrice: 0, 
                discount: Math.floor(packageDiscount / 1000) * 1000,
                isPackageItem: true, isDiscount: true,
            });
        }
    }


    // --- 2. 잔여 항목 및 개별 항목 가격 계산 ---
    ALL_AREAS.forEach(area => { 
        const initialCount = quantities[area.id] || 0;
        if (initialCount === 0) return;

        const count = q[area.id] || 0;
        const itemMaterial = m[area.id] || 'poly'; 
        const basePrice = getBasePrice(area.id, itemMaterial); 
        
        let itemOriginalTotal = basePrice * initialCount * selectedHousing.multiplier;
        let remainingOriginalPrice = basePrice * count * selectedHousing.multiplier;
        let remainingCalculatedPrice = remainingOriginalPrice;
        let remainingDiscount = 0;

        let finalCalculatedPrice = 0;
        let finalDiscount = 0;
        let isFreeServiceItem = false;
        let packageCount = initialCount - count;

        // 1. 현관 무료 서비스 처리 (폴리/패키지 시)
        if (area.id === 'entrance' && isFreeEntrance && itemMaterial === 'poly') { 
              finalCalculatedPrice = 0;
              finalDiscount = itemOriginalTotal;
              isFreeServiceItem = true;
              total += finalCalculatedPrice;
        } else if (packageCount > 0 && ['bathroom_floor', 'master_bath_wall', 'common_bath_wall', 'shower_booth', 'bathtub_wall'].includes(area.id)) {
            // 2. 핵심 패키지 항목 처리 (패키지에 포함된 항목은 0원 처리)
            
            if (count === 0) {
                finalCalculatedPrice = 0;
                finalDiscount = itemOriginalTotal - 0; 
            } else {
                // 패키지 외 잔여 수량은 개별 가격 합산
                finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000;
                finalDiscount = Math.floor(remainingDiscount / 1000) * 1000;
                total += finalCalculatedPrice;
            }

        } else {
            // 3. 일반 항목 또는 기타 개별 할인 항목 처리 (패키지 할인은 없지만, 패키지 선택 유무에 따라 개별 할인 적용)
            
            // 거실 바닥 할인
            if (area.id === 'living_room' && isPackageActive) { 
                const discountAmount = itemMaterial === 'poly' ? 50000 : 150000;
                let fixedDiscount = discountAmount * initialCount;
                remainingCalculatedPrice = Math.max(0, itemOriginalTotal - fixedDiscount);
                remainingDiscount = fixedDiscount;
            } 
            // 베란다 할인 (폴리 선택 시)
            else if (area.id === 'balcony_laundry' && isPackageActive && itemMaterial === 'poly') {
                let fixedPrice = 100000 * initialCount;
                remainingDiscount = itemOriginalTotal - fixedPrice;
                remainingCalculatedPrice = fixedPrice;
            }
            // 실리콘 욕조 할인
            else if (area.id === 'silicon_bathtub' && isPackageActive) { 
                let fixedPrice = 50000 * initialCount;
                remainingDiscount = itemOriginalTotal - fixedPrice;
                remainingCalculatedPrice = fixedPrice;
            }
            // 실리콘 걸레받이 할인
            else if (area.id === 'silicon_living_baseboard' && isPackageActive) { 
                let fixedPrice = 350000 * initialCount;
                remainingDiscount = itemOriginalTotal - fixedPrice;
                remainingCalculatedPrice = fixedPrice;
            }
            
            finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000;
            finalDiscount = Math.floor(remainingDiscount / 1000) * 1000;
            total += finalCalculatedPrice;
        }


        // 최종적으로 견적서에 표시될 가격
        itemizedPrices.push({
            id: area.id, label: area.label, quantity: initialCount, unit: area.unit,
            material: itemMaterial, 
            originalPrice: Math.floor(itemOriginalTotal / 1000) * 1000, 
            calculatedPrice: finalCalculatedPrice,
            discount: finalDiscount,
            isFreeService: isFreeServiceItem,
            isPackageItem: packageCount > 0 && !isFreeServiceItem,
            isDiscount: false,
        });

    });
    
    // --- 3. 리뷰 할인 적용 (유지) ---
    let discountAmount = 0;
    REVIEW_EVENTS.forEach(evt => {
      if (selectedReviews.has(evt.id)) {
        discountAmount += evt.discount;
        
        itemizedPrices.push({
            id: evt.id, label: evt.label, quantity: 1, unit: '건', material: '',
            originalPrice: evt.discount, calculatedPrice: 0, discount: evt.discount,
            isPackageItem: false, isDiscount: true,
        });
      }
    });
    total -= discountAmount;
    
    return { 
      price: Math.max(0, Math.floor(total / 1000) * 1000), 
      label: labelText,
      isPackageActive,
      isFreeEntrance,
      discountAmount,
      itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount),
    };

  }, [housingType, quantities, selectedReviews, areaMaterials]);


// ... (나머지 컴포넌트 코드 및 UI 로직은 변경 없음)

  // 패키지 토스트 로직 (유지)
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


  // 이미지 저장 로직 (유지)
  const handleImageSave = async () => {
    const node = quoteRef.current;
    if (!node) {
      alert("이미지 저장 영역을 찾을 수 없습니다.");
      return;
    }
    
    try {
      await delay(100); 
      const options = {
        backgroundColor: '#FFFFFF', scale: 4, useCORS: true, 
        windowHeight: node.offsetHeight, windowWidth: node.offsetWidth,
      };
      const canvas = await html2canvas(node, options); 
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `줄눈의미학_견적서_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '').trim()}.png`; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setShowModal(false);
    } catch (error) {
      console.error("이미지 캡처 및 저장 실패:", error);
      alert("이미지 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
  const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
  
  // 현재 단계 제목 (Header에 표시할 간결한 제목)
  const stepTitles = {
    1: '현장 유형 선택',
    2: '줄눈 소재 선택',
    3: '욕실 시공 범위',
    4: '기타 시공 범위',
    5: '추가 시공 및 할인/FAQ',
  };

  // 각 단계의 아이콘
  const stepIcons = {
    1: <Home className="h-5 w-5 text-amber-400" />,
    2: <Hammer className="h-5 w-5 text-amber-400" />,
    3: <Bath className="h-5 w-5 text-amber-400" />,
    4: <LayoutGrid className="h-5 w-5 text-amber-400" />,
    5: <Gift className="h-5 w-5 text-amber-400" />,
  };
  
  // 가격 포맷팅 헬퍼
  const formatPrice = (price) => `${Math.floor(price / 1000) * 1000}원`;

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans pb-40`}>
      <GlobalStyles />

      {/* Header: 짙은 네이비 배경 + 단계 표시기 */}
      <header className="bg-indigo-900 text-white sticky top-0 z-20 shadow-xl">
        <div className="p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-extrabold text-gray-50 tracking-wide flex items-center gap-2"><TrendingUp className="h-6 w-6" /> 줄눈의미학</h1>
            <button onClick={() => window.location.reload()} className="text-xs bg-indigo-800 px-3 py-1 rounded-full text-white hover:bg-indigo-700 transition active:scale-95 shadow-md">
              <RefreshCw size={12} className="inline mr-1" /> 초기화
            </button>
          </div>
          
          {/* 단계 표시기 및 현재 단계 타이틀 통합 */}
          <div className="bg-indigo-700/50 rounded-xl p-3 shadow-inner border border-indigo-700">
              <div className="flex items-center justify-between mb-2">
                  <div className='flex items-center gap-2'>
                      {stepIcons[currentStep]}
                      <span className='text-sm font-extrabold text-amber-400'>
                          STEP {currentStep} / {TOTAL_STEPS}
                      </span>
                  </div>
                  <span className='text-lg font-extrabold text-white'>
                      {stepTitles[currentStep]}
                  </span>
              </div>
              
              {/* 진행 바 */}
              <div className="w-full bg-indigo-500 rounded-full h-2">
                  <div 
                      className="bg-amber-400 h-2 rounded-full step-indicator" 
                      style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                  ></div>
              </div>
          </div>
        </div>
      </header>

      {/* main: 스크롤 최소화를 위해 패딩 조정 */}
      <main className="max-w-md mx-auto p-4 space-y-6">
          
        {/* --- Step 1: 현장 유형 선택 (유지) --- */}
        {currentStep === 1 && (
          <div className='space-y-6 animate-fade-in'>
              <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                <Home className="h-5 w-5 text-indigo-600" /> 현장 유형 선택
              </h3>
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
          </div>
        )}
        
        {/* --- Step 2: 줄눈 소재 선택 (유지) --- */}
        {currentStep === 2 && (
          <div className='space-y-6 animate-fade-in'>
              <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                <Hammer className="h-5 w-5 text-indigo-600" /> 줄눈 소재 선택
              </h3>
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
                    {/* 소재 옵션 */}
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
              <div className="mt-5 pt-3 border-t border-gray-100 flex justify-center">
                  <button 
                      onClick={() => setShowMaterialModal(true)} 
                      className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-lg font-extrabold text-sm hover:bg-indigo-100 transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                      <Info size={16} className='text-indigo-500' fill='currentColor'/> 소재 양생기간 확인하기
                  </button>
              </div>
            </section>
          </div>
        )}

        {/* --- Step 3: 욕실 범위 선택 (소재 버튼 유지) --- */}
        {currentStep === 3 && (
          <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
              <Bath className="h-5 w-5 text-indigo-600" /> 욕실 시공 범위 및 소재 선택
            </h3 >
            <div className="space-y-4">
              {BATHROOM_AREAS.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMaterial = areaMaterials[area.id];
                const currentPrice = currentMaterial === 'poly' ? area.polyPrice : area.epoxyPrice;
                const baseMaterial = MATERIALS.find(m => m.id === currentMaterial);

                return (
                  <div key={area.id} className={`p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                        {/* 1. 항목 및 가격 표시 */}
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                                <div>
                                    <div className="font-semibold text-gray-800">{area.label}</div>
                                    <div className="text-sm font-bold text-indigo-600">{currentPrice.toLocaleString()}원~</div>
                                </div>
                            </div>
                            {/* 2. 수량 컨트롤 */}
                            <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md border border-gray-200">
                                <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>-</button> 
                                <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                                <button onClick={() => handleQuantityChange(area.id, 1)} className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90">+</button> 
                            </div>
                        </div>
                        {/* 3. 소재 선택 버튼 */}
                        <div className='mt-3 pt-2 border-t border-gray-200/50 flex justify-between items-center text-xs'>
                            <span className={`font-semibold ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>소재 선택: {baseMaterial?.label}</span>
                            <div className='flex gap-1'>
                                <button
                                    onClick={() => handleAreaMaterialChange(area.id, 'poly')}
                                    className={`px-3 py-1 rounded-full border font-bold transition-colors ${currentMaterial === 'poly' ? 'material-selected bg-indigo-700 border-indigo-700 text-white' : 'material-unselected text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    폴리
                                </button>
                                <button
                                    onClick={() => handleAreaMaterialChange(area.id, 'kerapoxy')}
                                    className={`px-3 py-1 rounded-full border font-bold transition-colors ${currentMaterial === 'kerapoxy' ? 'material-selected bg-indigo-700 border-indigo-700 text-white' : 'material-unselected text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    에폭시
                                </button>
                            </div>
                        </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        
        {/* --- Step 4: 기타 시공 범위 선택 (소재 버튼 유지) --- */}
        {currentStep === 4 && (
          <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
              <LayoutGrid className="h-5 w-5 text-indigo-600" /> 기타 시공 범위 및 소재 선택
            </h3 >
            <div className="space-y-4">
              {OTHER_AREAS.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMaterial = areaMaterials[area.id];
                const currentPrice = currentMaterial === 'poly' ? area.polyPrice : area.epoxyPrice;
                const baseMaterial = MATERIALS.find(m => m.id === currentMaterial);

                return (
                  <div key={area.id} className={`p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                        {/* 1. 항목 및 가격 표시 */}
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                                <div>
                                    <div className="font-semibold text-gray-800">{area.label}</div>
                                    <div className="text-sm font-bold text-indigo-600">{formatPrice(currentPrice)}~</div>
                                </div>
                            </div>
                            {/* 2. 수량 컨트롤 */}
                            <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md border border-gray-200">
                                <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>-</button> 
                                <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                                <button onClick={() => handleQuantityChange(area.id, 1)} className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90">+</button> 
                            </div>
                        </div>
                        {/* 3. 소재 선택 버튼 */}
                        <div className='mt-3 pt-2 border-t border-gray-200/50 flex justify-between items-center text-xs'>
                            <span className={`font-semibold ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>소재 선택: {baseMaterial?.label}</span>
                            <div className='flex gap-1'>
                                <button
                                    onClick={() => handleAreaMaterialChange(area.id, 'poly')}
                                    className={`px-3 py-1 rounded-full border font-bold transition-colors ${currentMaterial === 'poly' ? 'material-selected bg-indigo-700 border-indigo-700 text-white' : 'material-unselected text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    폴리
                                </button>
                                <button
                                    onClick={() => handleAreaMaterialChange(area.id, 'kerapoxy')}
                                    className={`px-3 py-1 rounded-full border font-bold transition-colors ${currentMaterial === 'kerapoxy' ? 'material-selected bg-indigo-700 border-indigo-700 text-white' : 'material-unselected text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    에폭시
                                </button>
                            </div>
                        </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- Step 5: 추가 시공 및 할인/FAQ (유지) --- */}
        {currentStep === 5 && (
          <div className='space-y-6 animate-fade-in'>
              {/* 5-1. 추가 시공 (실리콘/리폼) */}
              <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                    <Eraser className="h-5 w-5 text-indigo-600" /> 추가 시공 (실리콘/리폼)
                </h3 >
                <div className="space-y-3">
                    {SILICON_AREAS.map((area) => {
                      const Icon = area.icon;
                      const isSelected = quantities[area.id] > 0;
                      const currentPrice = area.polyPrice;
                      return (
                        <div key={area.id} className={`flex items-center justify-between p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}> 
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div> 
                                <div>
                                    <div className="font-semibold text-gray-800">{area.label}</div>
                                    <div className="text-xs text-gray-500">{currentPrice.toLocaleString()}원{area.desc && <span className="block text-indigo-600">{area.desc}</span>}</div> 
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md border border-gray-200">
                                <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-indigo-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>-</button> 
                                <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                                <button onClick={() => handleQuantityChange(area.id, 1)} className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90">+</button> 
                            </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* 5-2. 할인 이벤트 */}
              <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                    <Gift className="h-5 w-5 text-indigo-600" /> 할인 이벤트 적용
                  </h3>
                  {soomgoReviewEvent && (
                    <button
                        onClick={() => toggleReview(soomgoReviewEvent.id)}
                        className={`w-full py-3 rounded-lg border-2 transition font-extrabold text-sm active:scale-[0.99] shadow-md flex items-center justify-center gap-2 relative overflow-hidden ${
                            isSoomgoReviewApplied
                            ? 'bg-amber-100 text-amber-800 border-amber-500'
                            : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
                        }`}
                    >
                        {isSoomgoReviewApplied ? <CheckCircle2 size={18} className='text-amber-600'/> : <Sparkles size={18} className='text-indigo-500'/>}
                        <span>{isSoomgoReviewApplied ? `리뷰 할인 적용 중 (-${soomgoReviewEvent.discount.toLocaleString()}원)` : `숨고 리뷰 약속하고 ${soomgoReviewEvent.discount.toLocaleString()}원 할인받기!`}</span>
                    </button>
                  )}
              </section>
              
              {/* 5-3. FAQ */}
              <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2 border-b pb-2">
                      <HelpCircle className="h-5 w-5 text-indigo-600"/> 자주 묻는 질문 (FAQ)
                  </h3 >
                  <div className="space-y-1">
                      {FAQ_ITEMS.map((item, index) => (
                          <Accordion key={index} question={item.question} answer={item.answer} />
                      ))}
                  </div>
              </section>
              
              {/* 숨고 후기 바로가기 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                  <button 
                      onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
                      className="w-full py-3 rounded-lg bg-indigo-700 text-white font-bold text-base hover:bg-indigo-800 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                      <Star size={20} fill="currentColor" className="text-white" /> 
                      고객 만족도 확인 (숨고 평점 5.0+)
                  </button>
              </div>
          </div>
        )}
      </main>

      {/* 하단 고정바 (네비게이션 및 최종 견적) */}
      <>
        <PackageToast isVisible={showToast} onClose={handleCloseToast} />

        <div className="fixed bottom-0 left-0 right-0 bg-indigo-900 shadow-2xl safe-area-bottom z-20">
            <div className="max-w-md mx-auto p-4 flex flex-col gap-3"> 
                
                {/* 1. 금액 정보 및 패키지 라벨 */}
                <div className='flex items-center justify-between w-full text-white'> 
                    <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold text-white'>총 예상 견적</span>
                        <div className="flex items-end gap-1">
                            <span className="text-3xl font-extrabold text-white">{calculation.price.toLocaleString()}</span>
                            <span className="text-base font-normal text-white">원</span>
                        </div>
                    </div>
                    <div className='flex flex-col items-end'>
                        {calculation.label && (
                             <div className="text-xs font-bold text-amber-300 mb-0.5 whitespace-nowrap">
                                 <Crown size={12} className='inline mr-1 text-amber-300'/> {calculation.label}
                             </div>
                        )}
                    </div>
                </div>

                {/* 2. 네비게이션 버튼 */}
                <div className='flex gap-3'>
                    {/* 이전 버튼 */}
                    <button 
                        onClick={handlePrev} 
                        disabled={currentStep === 1}
                        className={`py-3 rounded-xl font-bold transition-all w-1/4 flex items-center justify-center text-sm ${
                            currentStep > 1 
                                ? 'bg-indigo-700 text-white hover:bg-indigo-800 active:scale-95' 
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <ChevronLeft size={16} className='mr-1'/> 이전
                    </button>

                    {/* 다음 / 견적서 보기 버튼 */}
                    {currentStep < TOTAL_STEPS ? (
                        <button 
                            onClick={handleNext} 
                            className="w-3/4 py-3 rounded-xl font-extrabold text-lg bg-indigo-700 text-white hover:bg-indigo-800 transition active:scale-95 shadow-md flex items-center justify-center gap-1"
                        >
                            다음 단계로 <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                setShowModal(true);
                                setShowToast(false); 
                            }} 
                            disabled={!hasSelections} 
                            className={`w-3/4 py-3 rounded-xl font-extrabold text-lg transition-all 
                                ${hasSelections 
                                    ? 'bg-amber-400 text-indigo-900 hover:bg-amber-300 active:scale-95 shadow-md' 
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            <Calculator size={20} className='mr-1' /> 최종 견적서 확인
                        </button>
                    )}
                </div>
            </div>
          </div>
      </>

      {/* 견적서 모달 (유지) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
            <div className="bg-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /> 줄눈의미학</h3> 
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition active:scale-95">
                <X size={20} />
              </button>
            </div>
            
            {/* 캡처 전용 견적서 양식 */}
            <div className="p-5 text-gray-800 bg-white overflow-y-auto max-h-[70vh]"> 
              <div ref={quoteRef} id="quote-content" className="border-4 border-indigo-700 rounded-lg p-5 space-y-3 mx-auto" style={{ width: '320px' }}>
                
                {/* 헤더 및 로고 영역 */}
                <div className="flex flex-col items-center border-b border-gray-300 pb-3 mb-3">
                    <h1 className='text-xl font-extrabold text-indigo-800 text-center'>줄눈의미학 예상 견적서</h1>
                </div>

                {/* 기본 정보 테이블 */}
                <div className="space-y-2 border-b border-gray-200 pb-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex-shrink-0">현장 유형</span>
                      <span className='text-right font-medium flex-shrink-0'>{HOUSING_TYPES.find(h => h.id === housingType).label}</span>
                    </div>
                </div>

                {/* 시공 및 할인 내역 */}
                <div className="space-y-2 text-sm border-b border-gray-200 pb-3">
                    {/* 패키지 포함 서비스 내역 */}
                    {calculation.isPackageActive && (
                        <div className="bg-indigo-50/70 p-2 rounded-md border-l-4 border-indigo-500 text-xs font-semibold text-gray-700">
                            <p className='flex items-center gap-1 text-indigo-800 font-extrabold mb-1'>
                                <Crown size={12} className='text-indigo-400'/> 패키지 포함 서비스 내역
                            </p>
                            <ul className='list-disc list-inside text-[11px] ml-1 space-y-0.5 text-left'>
                                
                                {calculation.isFreeEntrance && <li className='py-[1px]'>현관 바닥 서비스 (폴리아스파틱)</li>}
                                <li className='py-[1px]'>변기테두리, 바닥테두리</li>
                                <li className='py-[1px]'>욕실 젠다이/세면대 실리콘</li>
                            </ul>
                        </div>
                    )}

                    {/* 개별 항목 루프 (항목별 소재 표시 추가) */}
                    {calculation.itemizedPrices
                        .filter(item => !item.isDiscount) 
                        .map(item => {
                        
                        const isDiscounted = item.discount > 0;
                        const finalPriceText = item.calculatedPrice.toLocaleString();
                        const materialLabel = item.material === 'poly' ? '폴리' : item.material === 'kerapoxy' ? '에폭시' : '';

                        return (
                            <div key={item.id} className="flex flex-col text-gray-800 pl-2 pr-1 pt-1 border-b border-gray-100 last:border-b-0">
                                
                                {/* 항목 이름 및 수량 */}
                                <div className="flex justify-between items-center">
                                    <span className={`w-3/5 font-semibold text-gray-700 text-sm`}>
                                        <span className="text-gray-400 mr-1">-</span>
                                        {item.label} 
                                        {materialLabel && <span className='text-[10px] ml-1 px-1 bg-gray-200 rounded-full text-indigo-700 font-bold'>{materialLabel}</span>}
                                        {item.quantity > 0 && <span className="text-gray-400 text-xs font-normal"> x {item.quantity}</span>}
                                    </span>
                                    
                                    {/* 최종 적용 가격 */}
                                    <span className={`text-right w-2/5 font-bold text-sm text-indigo-600`}> 
                                        {item.calculatedPrice > 0 ? `${finalPriceText}원` : (item.isFreeService ? '무료' : '패키지 포함')}
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

                    {/* 할인 항목 루프 */}
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

                {/* 총 합계 영역 */}
                <div className="pt-3 text-center"> 
                    
                    <div className="flex justify-end items-end"> 
                        <div className="text-right">
                            <span className="text-3xl font-extrabold text-indigo-700">{calculation.price.toLocaleString()}원</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>

                {/* 안내 사항 영역 */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className='w-full py-1.5 px-2 text-center bg-gray-100 text-indigo-600 rounded-md font-bold text-[11px] shadow-sm flex items-center justify-center'>
                        참고 | 바닥 30x30cm, 벽면 30x60cm 크기 기준
                    </div>
                </div>
              </div>
            </div>
            
            {/* 견적서 모달 하단 컨트롤 영역 */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                {/* 1. 숨고 리뷰 이벤트 버튼 */}
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
                
                <div className='grid grid-cols-2 gap-3'>
                    <button onClick={handleImageSave} className="flex items-center justify-center gap-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition text-sm active:scale-95 shadow-md"> 
                        <ImageIcon size={16} /> <span>견적서 저장</span>
                    </button>
                    <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-1 bg-indigo-700 text-white py-3 rounded-lg font-bold hover:bg-indigo-800 transition shadow-md text-sm active:scale-95 col-span-1"> 
                        <Phone size={16} /> <span>상담원 연결</span>
                    </button>
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