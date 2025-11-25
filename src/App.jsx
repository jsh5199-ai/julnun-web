import React, { useState, useMemo, useCallback, useRef } from 'react'; 
import html2canvas from 'html2canvas'; 
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Trophy, Clock, Image as ImageIcon
} from 'lucide-react';

const delay = ms => new Promise(res => setTimeout(res, ms)); 

// =================================================================
// [스타일] 애니메이션 정의 (유지)
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes professionalPulse { 
      0%, 100% { box-shadow: 0 0 0 0 rgba(100, 116, 139, 0.4); } 
      50% { box-shadow: 0 0 0 8px rgba(100, 116, 139, 0); } 
    }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    
    .selection-box { transition: all 0.2s ease-in-out; }
    .selection-selected {
      border: 3px solid #3b82f6;
      background-color: #f0f9ff;
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
    badge: '프리미엄', badgeColor: 'bg-amber-100 text-amber-800'
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
  { id: 'silicon_kitchen_line', label: '주방 실리콘오염방지', basePrice: 50000, icon: Eraser, unit: '구역', desc: '음식물 오염 방지' },
  { id: 'silicon_living_baseboard', basePrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35만' },
];

const ALL_AREAS = [...SERVICE_AREAS, ...SILICON_AREAS];

const REVIEW_EVENTS = [
  { id: 'soomgo_review', label: '숨고 리뷰이벤트', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
  { id: 'karrot_review', label: '당근마켓 리뷰이벤트', discount: 10000, icon: Star, desc: '동네생활 후기 작성 약속' },
];

const FAQ_ITEMS = [
    { question: "Q1. 시공 시간은 얼마나 걸리나요?", answer: "시공범위에 따라 다르지만, 평균적으로 4~6시간 정도 소요되고 있으며 범위/소재에 따라 최대 2일 시공이 걸리는 경우도 있습니다." },
    { question: "Q2. 줄눈 시공 후 바로 사용 가능한가요?", answer: "줄눈시공 후 폴리아스파틱은 6시간, 케라폭시는 2~3일, 스타라이크는 24시간 정도 양생기간이 필요합니다. 그 시간 동안은 물 사용을 자제해주시는 것이 가장 좋습니다." },
    { question: "Q3. 왜 줄눈 시공을 해야 하나요?", answer: "줄눈은 곰팡이와 물때가 끼는 것을 방지하고, 타일 틈새 오염을 막아 청소가 쉬워지며, 인테리어 효과까지 얻을 수 있는 필수 시공입니다." },
    { question: "Q4. A/S 기간 및 조건은 어떻게 되나요?", answer: "시공 후 폴리아스파틱은 2년, 에폭시는 5년의 A/S를 제공합니다. 단, 고객 부주의나 타일 문제로 인한 하자는 소액의 출장비가 발생할 수 있습니다." },
    { question: "Q5. 구축 아파트도 시공이 가능한가요?", answer: "네, 가능합니다. 기존 줄눈을 제거하는 그라인딩 작업이 추가로 필요하며, 현재 견적은 신축/구축 동일하게 적용됩니다." },
];

// =================================================================
// [컴포넌트] Accordion & MaterialDetailModal (유지)
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100">
            <button
                className="flex justify-between items-center w-full py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm md:text-base pr-4">{question}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180 text-blue-600' : 'text-gray-400'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 py-3 animate-slide-down' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-gray-600 pl-4 pr-2 bg-blue-50/50 p-3 rounded-md border-l-4 border-blue-500">{answer}</p>
            </div>
        </div>
    );
};

const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
                <h3 className="font-extrabold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-amber-400" /> 재료별 상세 스펙</h3>
                <button onClick={onClose} className="text-white/80 hover:text-white transition active:scale-95"><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left font-extrabold text-gray-700">구분</th>
                            <th className="px-3 py-3 text-center font-extrabold text-gray-700">폴리아스파틱</th>
                            <th className="px-3 py-3 text-center font-extrabold text-amber-700">에폭시/케라폭시</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-semibold text-gray-900">내구성</td>
                            <td className="px-3 py-3 text-center text-gray-600">우수</td>
                            <td className="px-3 py-3 text-center font-bold text-amber-600">최상 (전문가용)</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-3 py-3 font-semibold text-gray-900">A/S 기간</td>
                            <td className="px-3 py-3 text-center font-bold text-blue-600">2년</td>
                            <td className="px-3 py-3 text-center font-bold text-amber-600">5년</td>
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
                <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition active:scale-95">확인</button>
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
    [...SERVICE_AREAS, ...SILICON_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false); 
  const [showPackageInfo, setShowPackageInfo] = useState(true);

  const quoteRef = useRef(null); 

  const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';
  const PHONE_NUMBER = '010-7734-6709';

  const handleClosePackageInfo = () => {
      setShowPackageInfo(false);
  };

  // --- calculation 로직 (원가 추적 기능 통합) ---
  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const nextValue = Math.max(0, prev[id] + delta);
      const nextState = { ...prev, [id]: nextValue };
      if ((id === 'master_bath_wall' || id === 'common_bath_wall') && delta > 0) {
        nextState['shower_booth'] = 0;
        nextState['bathtub_wall'] = 0;
      }
      return nextState;
    });
  };

  // 👈 리뷰 토글 함수 (useCallback으로 최적화)
  const toggleReview = useCallback((id) => {
    setSelectedReviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  
  const calculation = useMemo(() => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
    const selectedMaterial = MATERIALS.find(m => m.id === material);

    let q = { ...quantities };
    let total = 0;
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false;
    let totalAreaCount = Object.values(quantities).reduce((sum, count) => sum + count, 0);

    const qBathFloor = q['bathroom_floor'] || 0;
    const qShower = q['shower_booth'] || 0;
    const qBathtub = q['bathtub_wall'] || 0;
    const qMasterWall = q['master_bath_wall'] || 0;
    const qCommonWall = q['common_bath_wall'] || 0;
    const qEntrance = q['entrance'] || 0;

    const qBathWallOne = (qMasterWall >= 1 || qCommonWall >= 1);
    const qBathWallTotal = qMasterWall + qCommonWall;

    let packageDiscount = 0;
    const itemizedPrices = [];

    // --- 패키지 로직 (패키지 가격을 결정하고 해당 항목 카운트 임시 차감) ---
    
    // --- 패키지 1: 폴리 30만원 (욕실2+현관1) ---
    if (selectedMaterial.id === 'poly' && qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
        total += 300000;
        q['bathroom_floor'] -= 2;
        q['entrance'] -= 1;
        isPackageActive = true;
        isFreeEntrance = false; 
        labelText = '(30만원 패키지 적용)';
        packageDiscount = (150000 * 2) + 50000 - 300000;
    }
    // --- 패키지 2: 에폭시 75만원 (욕실바닥1+벽전체1) ---
    else if (selectedMaterial.id === 'kerapoxy' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        let isMaster = qMasterWall >= 1;
        total += 750000;
        q['bathroom_floor'] -= 1;
        if (isMaster) q['master_bath_wall'] -= 1;
        else q['common_bath_wall'] -= 1;
        isPackageActive = true;
        labelText = '(75만원 에폭시 패키지 적용)';
        packageDiscount = (150000 * selectedMaterial.priceMod) + (300000 * selectedMaterial.priceMod) - 750000;
    }
    // --- 패키지 3: 폴리 50만원 (욕실바닥1+벽전체1) ---
    else if (selectedMaterial.id === 'poly' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        let isMaster = qMasterWall >= 1;
        total += 500000;
        q['bathroom_floor'] -= 1;
        if (isMaster) q['master_bath_wall'] -= 1;
        else q['common_bath_wall'] -= 1;
        isPackageActive = true;
        labelText = '(50만원 패키지 적용)';
        packageDiscount = (150000 * selectedMaterial.priceMod) + (300000 * selectedMaterial.priceMod) - 500000;
        if(packageDiscount < 0) packageDiscount = 0; 
    }
    // --- 에폭시 기타 패키지 ---
    else if (selectedMaterial.id === 'kerapoxy') {
        let originalPackagePrice = 0;
        let finalPackagePrice = 0;

        if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
            finalPackagePrice = 1300000;
            originalPackagePrice = (150000 * 2 * selectedMaterial.priceMod) + (300000 * 2 * selectedMaterial.priceMod); 
            total += finalPackagePrice;
            q['bathroom_floor'] -= 2;
            q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1);
            q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1);
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(풀패키지 할인 적용)'; 
        }
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { 
            finalPackagePrice = 950000;
            originalPackagePrice = (150000 * 2 * selectedMaterial.priceMod) + (150000 * 2 * selectedMaterial.priceMod); 
            total += finalPackagePrice;
            q['bathroom_floor'] -= 2;
            q['shower_booth'] -= 1;
            q['bathtub_wall'] -= 1;
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(패키지 할인 적용)';
        }
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
            finalPackagePrice = 750000;
            originalPackagePrice = (150000 * 2 * selectedMaterial.priceMod) + (150000 * selectedMaterial.priceMod);
            total += finalPackagePrice;
            q['bathroom_floor'] -= 2;
            if (qShower >= 1) q['shower_booth'] -= 1;
            else q['bathtub_wall'] -= 1;
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(패키지 할인 적용)'; 
        }
        else if (qBathFloor >= 2 && qEntrance >= 1) { 
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(패키지 혜택 적용)';
        }
        else if (qBathFloor === 1) { 
            finalPackagePrice = 350000;
            originalPackagePrice = 150000 * selectedMaterial.priceMod;
            total += finalPackagePrice;
            q['bathroom_floor'] -= 1;
            labelText = '(최소 시공비 적용)';
        }
        if (originalPackagePrice > 0) packageDiscount = originalPackagePrice - finalPackagePrice;
        if(packageDiscount < 0) packageDiscount = 0; 
    } 
    // --- 폴리 기타 패키지 ---
    else { 
        let originalPackagePrice = 0;
        let finalPackagePrice = 0;

      if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
        finalPackagePrice = 700000;
        originalPackagePrice = (150000 * 2) + (300000 * 2);
        total += finalPackagePrice;
        q['bathroom_floor'] -= 2;
        q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1);
        q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1);
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(풀패키지 할인 적용)';
      }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
        finalPackagePrice = 380000;
        originalPackagePrice = (150000 * 2) + 150000; 
        total += finalPackagePrice;
        q['bathroom_floor'] -= 2;
        if (qShower >= 1) q['shower_booth'] -= 1;
        else q['bathtub_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(패키지 할인 적용)';
      }
      else if (qBathFloor >= 2 && qEntrance >= 1) { 
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(패키지 혜택 적용)';
      }
      else if (qBathFloor === 1) { 
        finalPackagePrice = 200000;
        originalPackagePrice = 150000;
        total += finalPackagePrice;
        q['bathroom_floor'] -= 1;
        labelText = '(최소 시공비 적용)';
      }
      if (originalPackagePrice > 0) packageDiscount = originalPackagePrice - finalPackagePrice;
      if(packageDiscount < 0) packageDiscount = 0; 
    }
    
    // 패키지 자체 할인 내역 추가
    if(packageDiscount > 0) {
        itemizedPrices.push({
            id: 'package_discount',
            label: labelText.replace(/[\(\)]/g, '').trim(),
            quantity: 1,
            unit: '건',
            originalPrice: packageDiscount, 
            calculatedPrice: 0,
            discount: packageDiscount,
            isPackageItem: true,
            isDiscount: true,
        });
    }


    // --- 잔여 항목 및 패키지 포함 항목 모두 계산 ---
    ALL_AREAS.forEach(area => {
        const initialCount = quantities[area.id] || 0;
        
        if (initialCount === 0) return;

        const count = q[area.id] || 0;
        const originalBasePrice = area.basePrice;

        let currentMod = selectedMaterial.priceMod;
        if (area.id === 'living_room' && selectedMaterial.id === 'kerapoxy') currentMod = 2.0;

        // 원가 (할인 및 패키지 적용 전)
        let itemOriginalTotal = originalBasePrice * initialCount * currentMod * selectedHousing.multiplier;
        
        let remainingOriginalPrice = originalBasePrice * count * currentMod * selectedHousing.multiplier;
        let remainingCalculatedPrice = remainingOriginalPrice;
        let remainingDiscount = 0;

        let finalCalculatedPrice = 0;
        let finalDiscount = 0;
        let isFreeServiceItem = false;
        let packageCount = initialCount - count;

        // 1. 현관 무료 서비스 처리
        if (area.id === 'entrance' && isFreeEntrance) {
             finalCalculatedPrice = 0;
             finalDiscount = itemOriginalTotal;
             isFreeServiceItem = true;
             total += finalCalculatedPrice;
        } else if (packageCount > 0 && ['bathroom_floor', 'master_bath_wall', 'common_bath_wall', 'shower_booth', 'bathtub_wall'].includes(area.id)) {
            // 2. 핵심 패키지 항목 처리 (욕실바닥/벽 전체/샤워/욕조)
            
            if (count === 0) {
                // 전체가 패키지에 포함됨
                finalCalculatedPrice = 0;
                finalDiscount = 0;
            } else {
                // 일부가 패키지에 포함되고, 남은 수량은 일반 할인 로직 적용
                if (area.id === 'living_room' && isPackageActive) {
                    let fixedDiscount = (selectedMaterial.id === 'poly' ? 50000 : 150000) * count;
                    remainingCalculatedPrice = Math.max(0, remainingCalculatedPrice - fixedDiscount);
                    remainingDiscount = fixedDiscount;
                } 
                
                finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000;
                finalDiscount = Math.floor(remainingDiscount / 1000) * 1000;
                total += finalCalculatedPrice;
            }

        } else {
            // 3. 일반 항목 또는 기타 패키지 할인이 적용되는 항목 처리
            
            if (area.id === 'living_room' && isPackageActive) {
                let fixedDiscount = (selectedMaterial.id === 'poly' ? 50000 : 150000) * initialCount;
                remainingCalculatedPrice = Math.max(0, itemOriginalTotal - fixedDiscount);
                remainingDiscount = fixedDiscount;
            } 
            else if (area.id === 'balcony_laundry' && isPackageActive) {
                if (selectedMaterial.id === 'poly') { 
                    let fixedPrice = 100000 * initialCount;
                    remainingDiscount = itemOriginalTotal - fixedPrice;
                    remainingCalculatedPrice = fixedPrice;
                }
            }
            else if (area.id === 'silicon_bathtub' && isPackageActive) { 
                let fixedPrice = 50000 * initialCount;
                remainingDiscount = itemOriginalTotal - fixedPrice;
                remainingCalculatedPrice = fixedPrice;
            }
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
            id: area.id,
            label: area.label,
            quantity: initialCount,
            unit: area.unit,
            originalPrice: Math.floor(itemOriginalTotal / 1000) * 1000, 
            calculatedPrice: finalCalculatedPrice,
            discount: finalDiscount,
            isFreeService: isFreeServiceItem,
            isPackageItem: packageCount > 0 && !isFreeServiceItem,
            isDiscount: false,
        });

    });
    
    // --- 리뷰 할인 적용 (유지) ---
    let discountAmount = 0;
    REVIEW_EVENTS.forEach(evt => {
      if (selectedReviews.has(evt.id)) {
        discountAmount += evt.discount;
        
        itemizedPrices.push({
            id: evt.id,
            label: evt.label,
            quantity: 1,
            unit: '건',
            originalPrice: evt.discount,
            calculatedPrice: 0,
            discount: evt.discount,
            isPackageItem: false,
            isDiscount: true,
        });
      }
    });
    total -= discountAmount;
    
    // 예상 시공 시간 계산 (유지)
    let estimatedHours = 0;
    if (totalAreaCount > 0) {
        estimatedHours = 4;
        estimatedHours += Math.floor(quantities['bathroom_floor'] * 1);
        estimatedHours += Math.floor((quantities['master_bath_wall'] + quantities['common_bath_wall']) * 1.5);
        estimatedHours += (quantities['living_room'] > 0 ? 2 : 0);
        estimatedHours = Math.max(4, Math.min(estimatedHours, 8));
    }


    return { 
      price: Math.max(0, Math.floor(total / 1000) * 1000), 
      label: labelText,
      isPackageActive,
      isFreeEntrance,
      discountAmount,
      estimatedHours,
      itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount),
    };

  }, [housingType, material, quantities, selectedReviews]);

  // 견적서 생성 로직 (유지)
  const generateQuoteText = () => {
    return `[줄눈의미학 예상 견적서]\n\n총 예상 금액: ${calculation.price.toLocaleString()}원`;
  };

  // 클립보드 복사 로직 (유지)
  const copyToClipboard = async () => {
    const text = generateQuoteText();
    
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch (err) {
            console.error('Unable to copy', err);
            alert("복사에 실패했습니다. 수동으로 복사해주세요.");
            return false;
        }
        document.body.removeChild(textArea);
    }
  };

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
            backgroundColor: '#FFFFFF',
            scale: 2, 
            useCORS: true, 
            windowHeight: node.offsetHeight, 
            windowWidth: node.offsetWidth,
        };

        const canvas = await html2canvas(node, options); 

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        
        const windowContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>줄눈 견적 이미지 저장</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { margin: 0; background: #f0f0f0; display: flex; flex-direction: column; align-items: center; padding-top: 70px; }
                        img { max-width: 95%; height: auto; border: 1px solid #ccc; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                        .info {
                            position: fixed; top: 0; left: 0; right: 0; 
                            background: #d4edda;
                            color: #155724; 
                            padding: 10px; text-align: center; font-size: 16px; 
                            font-weight: bold; border-bottom: 2px solid #c3e6cb;
                            z-index: 1000;
                        }
                    </style>
                </head>
                <body>
                    <div class="info">
                        ✅ 저장을 위해 이미지를 길게(꾹) 눌러 '저장'하세요. (PC는 우클릭)
                    </div>
                    <img src="${dataUrl}" alt="줄눈 견적서 이미지"/>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(windowContent);
            printWindow.document.close();
            setShowModal(false);
        } else {
            alert("팝업 차단이 설정되어 있습니다. 해제 후 다시 시도해주세요.");
        }
        
    } catch (error) {
        console.error("이미지 캡처 및 저장 실패:", error);
        alert("이미지 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const selectedMaterialData = MATERIALS.find(m => m.id === material);


  return (
    <div className={`min-h-screen bg-gray-50 bg-gray-50 text-gray-800 font-sans ${calculation.isPackageActive ? 'pb-48' : 'pb-28'}`}>
      <GlobalStyles />

      {/* 헤더: 짙은 네이비 배경 (프리미엄) */}
      <header className="bg-indigo-900 text-white sticky top-0 z-20 shadow-xl">
        <div className="p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-extrabold text-gray-50 tracking-wide">프리미엄 줄눈 견적</h1>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs bg-indigo-800 px-3 py-1 rounded-full text-indigo-300 hover:bg-indigo-700 transition active:scale-95 shadow-md">
            <RefreshCw size={12} className="inline mr-1" /> 초기화
          </button>
        </div>
      </header>

      {/* --- 브랜드 핵심 가치 슬로건 (유지) --- */}
      <div className="bg-white py-3 border-b border-gray-100 shadow-md">
        <div className="max-w-md mx-auto px-4 flex justify-around text-center">
            <p className="flex items-center text-xs font-semibold text-gray-700 gap-1"><Trophy size={14} className="text-amber-500" /> 업계 최고 평점</p>
            <p className="flex items-center text-xs font-semibold text-gray-700 gap-1"><CheckCircle2 size={14} className="text-indigo-600" /> 최대 5년 A/S</p>
            <p className="flex items-center text-xs font-semibold text-gray-700 gap-1"><Zap size={14} className="text-sky-500" /> 책임 시공 보증</p>
        </div>
        
      </div>
      {/* ------------------------------------ */}

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* --- 1. 현장 유형 섹션 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Home className="h-5 w-5 text-indigo-600" /> 1. 현장 유형을 선택하세요
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 selection-box active:scale-[0.99] ${
                  housingType === type.id 
                    ? 'selection-selected font-bold text-indigo-900' 
                    : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400'
                }`}
              >
                <div className="text-base font-semibold">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* --- 2. 시공 재료 선택 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-150">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Hammer className="h-5 w-5 text-indigo-600" /> 2. 시공 재료 선택
          </h2 >
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <div onClick={() => setMaterial(item.id)} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 selection-box active:scale-[0.99] ${item.id === material ? 'selection-selected shadow-md' : 'border-gray-300 bg-white hover:border-indigo-400'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className='flex items-center gap-3'>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition ${item.id === material ? 'border-blue-600' : 'border-gray-400'}`}>
                          {item.id === material && <CheckCircle2 size={12} className="text-blue-600" />}
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
                {item.id === 'poly' && item.id === material && (
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-blue-300 space-y-2 animate-slide-down bg-gray-50/50 p-3 rounded-md">
                    <div className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Palette size={12} /> 옵션 선택 (펄 유무)</div>
                    <div className="flex gap-2">
                      <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'pearl' ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>펄</button>
                      <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'no_pearl' ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>무펄</button>
                    </div>
                  </div>
                )}
                {item.id === 'kerapoxy' && item.id === material && (
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-amber-500 space-y-2 animate-slide-down bg-amber-50/50 p-3 rounded-md">
                    <div className="text-xs font-bold text-amber-700 flex items-center gap-1"><Crown size={12} /> 옵션 선택 (브랜드)</div>
                    <div className="flex gap-2">
                      <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'kerapoxy' ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>케라폭시</button>
                      <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'starlike' ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>스타라이크</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- 3. 원하는 시공범위를 선택해주세요 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Calculator className="h-5 w-5 text-indigo-600" /> 3. 시공 범위 선택
          </h2 >
          <div className="space-y-3">
            {SERVICE_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;
              return (
                <div key={area.id} className={`flex items-center justify-between p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-indigo-600'}`}><Icon size={18} /></div>
                    <div>
                      <div className="font-semibold text-gray-800">{area.label}</div>
                      <div className="text-xs text-gray-500">기본 {area.basePrice.toLocaleString()}원~{area.desc && <span className="block text-indigo-600">{area.desc}</span>}</div>
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

        {/* --- 4. 실리콘 교체할 곳 선택 (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-450">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Eraser className="h-5 w-5 text-indigo-600" /> 4. 추가 시공 (실리콘/리폼)
          </h2 >
          <div className="space-y-3">
            {SILICON_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;
              return (
                <div key={area.id} className={`flex items-center justify-between p-3 rounded-lg border transition duration-150 ${isSelected ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full shadow-sm ${isSelected ? 'bg-amber-500 text-white' : 'bg-gray-200 text-amber-600'}`}><Icon size={18} /></div>
                    <div>
                      <div className="font-semibold text-gray-800">{area.label}</div>
                      <div className="text-xs text-gray-500">{area.basePrice.toLocaleString()}원{area.desc && <span className="block text-amber-600">{area.desc}</span>}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-1 py-1 rounded-full shadow-md border border-gray-200">
                    <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 flex items-center justify-center rounded-full transition active:scale-90 text-lg font-bold ${quantities[area.id] > 0 ? 'text-amber-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>-</button>
                    <span className={`w-5 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{quantities[area.id]}</span>
                    <button onClick={() => handleQuantityChange(area.id, 1)} className="w-7 h-7 flex items-center justify-center text-amber-600 hover:bg-gray-100 rounded-full font-bold text-lg transition active:scale-90">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 5. 할인 혜택 (리뷰 이벤트) (유지) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-600">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Gift className="h-5 w-5 text-indigo-600" /> 5. 할인 이벤트
          </h2 >
          <div className="grid grid-cols-2 gap-3">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`p-3 rounded-lg border-2 transition-all relative overflow-hidden selection-box active:scale-[0.98] ${selectedReviews.has(evt.id) ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-red-300'}`}
              >
                {selectedReviews.has(evt.id) && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">APPLIED</div>}
                <div className="flex flex-col items-center text-center gap-1">
                  <span className={`font-semibold text-sm ${selectedReviews.has(evt.id) ? 'text-gray-800' : 'text-gray-600'}`}>{evt.label}</span>
                  <span className={`text-xs font-bold ${selectedReviews.has(evt.id) ? 'text-red-600' : 'text-gray-400'}`}>-{evt.discount.toLocaleString()}원</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">※ 중복 선택 가능합니다. 시공 완료 후 꼭 작성해주세요!</p>
        </section>
        
        {/* --- 재료 상세 비교 버튼 (유지) --- */}
        <div className="flex justify-center pt-2">
            <button 
                onClick={() => setShowMaterialModal(true)} 
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition active:scale-95"
            >
                <Info size={16} /> 최고급 재료 상세 스펙 비교하기
            </button>
        </div>

        {/* --- 자주 묻는 질문 (FAQ) (유지) --- */}
        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-lg mt-6 animate-fade-in delay-750">
            <h2 className="text-lg font-extrabold text-gray-800 mb-2 flex items-center gap-2 border-b pb-2">
                <HelpCircle className="h-5 w-5 text-indigo-600"/> 고객 지원 센터
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
            className="w-full py-3 rounded-lg bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-600 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <Star size={20} fill="currentColor" className="text-white" />
            고객 만족도 확인 (숨고 평점 5.0+)
          </button>
        </div>
      </main>

      {/* 하단 고정바 */}
      <>
        {/* 패키지 혜택 바: 닫기 버튼 추가 */}
        {calculation.isPackageActive && showPackageInfo && (
          <div className="fixed bottom-[110px] left-4 right-4 max-w-md mx-auto z-10">
            <div className="bg-gray-700 text-white p-4 rounded-lg shadow-2xl border border-gray-500 animate-[professionalPulse_2s_infinite]">
              
              {/* 닫기 버튼 */}
              <button 
                  onClick={handleClosePackageInfo} 
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition active:scale-95 rounded-full bg-gray-600/50"
              >
                  <X size={16} />
              </button>
              
              <div className="flex items-start gap-3 pr-6">
                <div className="bg-white/20 p-2 rounded-full flex-shrink-0 mt-1"><Zap className="w-5 h-5 text-amber-300" /></div>
                <div className="text-sm flex-1">
                  <div className="font-extrabold text-amber-300 mb-1">🎉 프리미엄 패키지 적용 중!</div>
                  <div className="space-y-0.5 text-xs text-gray-300">
                    {calculation.isFreeEntrance && <div>- 현관 바닥 서비스 (일반 재료)</div>}
                    <div>- 변기테두리, 바닥테두리</div>
                    <div>- 욕실 젠다이 실리콘 오염방지</div>
                    <div>- 주방 싱크볼</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-600/50 text-center">
                  <p className="text-[11px] font-bold text-gray-300 bg-gray-800/50 py-1 px-2 rounded">
                      🚨 정확한 견적은 전문가 상담 시 확정됩니다.
                  </p>
              </div>
            </div>
          </div>
        )}

        {/* 최종 견적 하단 바 (유지) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 safe-area-bottom z-20">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            {/* 금액 영역: 좁은 화면에서 밀림 방지 */}
            <div className='flex-shrink-0 w-auto'> 
              <div className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <Clock size={14} className="text-indigo-600" /> 예상 시공 시간: <span className='font-extrabold text-gray-800'>{calculation.estimatedHours}</span>시간
              </div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-extrabold text-indigo-700">{calculation.price.toLocaleString()}<span className="text-base font-normal text-gray-500">원</span></div>
                {calculation.label && <div className="text-xs font-bold text-red-600 mb-1 animate-pulse">{calculation.label}</div>}
              </div>
            </div>
            {/* 버튼 영역: 작은 화면에서 패딩/폰트 크기 조정 */}
            <button onClick={() => setShowModal(true)} disabled={!hasSelections} className={`px-5 py-3 sm:px-7 sm:py-4 rounded-lg font-extrabold text-sm sm:text-base text-white shadow-xl transition-all ${hasSelections ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-500/50' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}>견적서 보기</button>
          </div>
        </div>
      </>

      {/* 견적서 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
            <div className="bg-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-amber-400" /> 견적서 (이미지 저장용)</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition active:scale-95">
                <X size={20} />
              </button>
            </div>
            
            {/* ★★★ 캡처 전용 견적서 양식 (원가 비교 적용) ★★★ */}
            <div className="p-5 text-gray-800 bg-white overflow-y-auto max-h-[70vh]"> 
              <div ref={quoteRef} id="quote-content" className="border-4 border-indigo-700 rounded-lg p-5 space-y-4 mx-auto" style={{ width: '320px' }}>
                
                {/* 헤더 및 로고 영역 */}
                <div className="flex flex-col items-center border-b border-gray-300 pb-3 mb-3">
                    <h1 className='text-xl font-extrabold text-indigo-800'>줄눈의미학 예상 견적서</h1>
                    <p className='text-xs text-gray-500 mt-1'>Final Quotation Summary</p>
                </div>

                {/* 기본 정보 테이블 */}
                <div className="space-y-2 border-b border-gray-200 pb-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold flex-shrink-0">현장 유형</span>
                      <span className='text-right flex-shrink-0'>{HOUSING_TYPES.find(h => h.id === housingType).label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold flex-shrink-0 pr-2">시공 재료</span> 
                      <span className="font-bold text-indigo-600 text-right flex-shrink-0">
                        {selectedMaterialData.label} ({material === 'poly' ? (polyOption === 'pearl' ? '펄' : '무펄') : (epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크')})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold flex-shrink-0">예상 시공 시간</span>
                      <span className="font-bold text-gray-700 text-right flex-shrink-0">{calculation.estimatedHours}시간 내외</span>
                    </div>
                </div>

                {/* 시공 및 할인 내역 */}
                <div className="space-y-2 text-sm border-b border-gray-200 pb-3">
                    <p className="font-extrabold text-gray-800 flex items-center gap-1"><Calculator size={14}/> 시공 내역 및 가격</p>

                    {/* 개별 항목 루프 (시공 내역) */}
                    {calculation.itemizedPrices
                        .filter(item => !item.isDiscount) // 할인 항목 제외
                        .map(item => {
                        
                        const isDiscounted = item.discount > 0;
                        const finalPriceText = item.calculatedPrice > 0 ? `${item.calculatedPrice.toLocaleString()}원` : (item.isFreeService ? '무료' : '패키지 포함');
                        
                        return (
                            <div key={item.id} className="flex flex-col text-gray-800 pl-2 pr-1 pt-1 border-b border-gray-100 last:border-b-0">
                                
                                {/* 항목 이름 및 수량 */}
                                <div className="flex justify-between items-center">
                                    <span className={`w-3/5 font-semibold text-gray-700`}>
                                        <span className="text-gray-400 mr-1">-</span>
                                        {item.label} 
                                        {item.quantity > 0 && <span className="text-gray-400 text-xs font-normal"> x {item.quantity}</span>}
                                    </span>
                                    
                                    {/* 원가 또는 최종 적용 가격 */}
                                    <span className={`text-right w-2/5 font-bold ${isDiscounted ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                                        {item.originalPrice.toLocaleString()}원
                                    </span>
                                </div>

                                {/* 할인가 및 최종 가격 표시 */}
                                {isDiscounted && (
                                    <div className="flex justify-between items-center text-xs text-red-500 mt-0.5 pb-1 pl-3">
                                        <span className='font-normal'>
                                            {item.isFreeService ? '🎁 무료 서비스 적용' : '✨ 할인가 적용'}
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                            {finalPriceText}
                                        </span>
                                    </div>
                                )}
                                
                            </div>
                        );
                    })}

                    {/* 할인 항목 루프 (리뷰 할인 포함) */}
                    {calculation.itemizedPrices
                        .filter(item => item.isDiscount && item.id !== 'soomgo_review')
                        .map(item => (
                            <div key={item.id} className="flex justify-between items-center text-red-600 font-semibold pl-2 pr-1 pt-1 border-b border-gray-100 last:border-b-0">
                                <span className={`w-3/5`}>
                                    <Gift size={12} className='inline mr-1'/> {item.label} 
                                </span>
                                <span className={`text-right w-2/5`}>
                                    -{item.originalPrice.toLocaleString()}원
                                </span>
                            </div>
                       ))}
                </div>

                {/* 총 합계 영역 */}
                <div className="pt-3">
                    
                    {/* 👈 [수정된 부분]: 총액 위에 리뷰 버튼 배치 */}
                    {REVIEW_EVENTS.map(evt => {
                        if (evt.id === 'soomgo_review') {
                            const isApplied = selectedReviews.has(evt.id);
                            return (
                                <div key={evt.id} className='mb-2'>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleReview(evt.id);
                                        }}
                                        className={`w-full py-2 rounded-lg transition active:scale-[0.99] text-xs font-bold flex items-center justify-center gap-2 shadow-md ${isApplied ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600 border border-red-300 hover:bg-red-200'}`}
                                    >
                                        <Gift size={14}/> 
                                        <span>{isApplied ? `숨고 리뷰이벤트 해제 (-${evt.discount.toLocaleString()}원)` : `숨고 리뷰이벤트 적용 (+20,000원 할인)`}</span>
                                    </button>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {/* 👆 [수정된 부분 끝] */}
                    
                    <div className="flex justify-between items-end">
                        <span className="font-extrabold text-lg text-gray-900">총액</span>
                        <div className="text-right">
                            <span className="text-3xl font-extrabold text-blue-600">{calculation.price.toLocaleString()}원</span>
                            {calculation.label && <div className="text-xs text-red-600 font-bold mt-1">{calculation.label}</div>}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>

                {/* 안내 사항 영역 */}
                   <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className='text-xs font-semibold text-red-600 mb-1 flex items-center gap-1'>
                          <Info size={14}/> 주의 사항
                      </p>
                      <ul className='list-disc list-outside text-[11px] text-gray-600 ml-4 space-y-0.5'>
                          <li>정확한 견적을 위해 **현장 사진 2~3장**이 필수입니다.</li>
                          <li>견적 기준 타일 크기 외(조각 타일, 특이 구조) 시 추가 비용이 발생할 수 있습니다.</li>
                      </ul>
                   </div>
              </div>
            </div>
            {/* ★★★ 캡처 영역 끝 ★★★ */}
            
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className='text-sm font-semibold text-center text-red-500 mb-3 flex items-center justify-center gap-1'><Info size={16}/> 전문가 상담 시 **현장 사진 2~3장**이 필수입니다.</p>
               <div className='grid grid-cols-2 gap-3'>
                    {/* '이미지 저장' 버튼 연결 */}
                    <button onClick={handleImageSave} className="flex items-center justify-center gap-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-sm active:scale-95 shadow-md">
                        <ImageIcon size={16} /> 견적 이미지 저장
                    </button>
                    {/* 전화 상담 버튼 문구 수정 (연락처 삭제) */}
                    <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md text-sm active:scale-95 col-span-1">
                        <Phone size={16} /> 전화 상담
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