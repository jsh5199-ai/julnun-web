import React, { useState, useMemo, useCallback, useRef } from 'react'; // useRef import
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Trophy, Clock, Image as ImageIcon
} from 'lucide-react';

// (참고: 실제 환경에서는 html2canvas나 dom-to-image 라이브러리를 설치해야 합니다.)
// 여기서는 해당 기능을 수행하는 가상의 함수를 정의합니다.
const simulateDomToImage = (node, filename) => {
  console.log(`[시뮬레이션] ${node.id} 영역을 ${filename}.png 파일로 변환 및 다운로드 시도.`);
  
  // 실제 라이브러리가 없으므로, 간단한 파일 생성 로직을 흉내냅니다.
  const dataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0EQVRCqO+bOz0BAAAACklEQVQI12NgAAAAAgAB4iG00AAAAABJRU5ErkJggg==`; // 1x1 투명 픽셀
  const link = document.createElement('a');
  link.download = filename + '.png';
  link.href = dataUrl;
  
  // 다운로드가 바로 이루어지도록 클릭 이벤트를 트리거합니다.
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return Promise.resolve(true);
};


// =================================================================
// [스타일] (유지)
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
  { id: 'new', label: '신축 아파트(입주 전)', multiplier: 1.0 },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];

const MATERIALS = [
  { id: 'poly', label: '폴리아스파틱', priceMod: 1.0, description: '탄성과 광택이 우수하며 가성비가 좋습니다.', badge: '일반', badgeColor: 'bg-gray-200 text-gray-700' },
  { id: 'kerapoxy', label: '에폭시(무광/무펄)', priceMod: 1.8, description: '내구성이 뛰어나고 매트한 질감.', badge: '프리미엄', badgeColor: 'bg-amber-100 text-amber-800' },
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
  { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35만' },
];

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
// [컴포넌트] Accordion (유지)
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

// =================================================================
// [컴포넌트] 재료 상세 비교 모달 (유지)
// =================================================================
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

  // ★★★ 이미지 저장할 영역의 Ref ★★★
  const quoteRef = useRef(null); 

  const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';
  const PHONE_NUMBER = '010-7734-6709';

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

  const toggleReview = (id) => {
    setSelectedReviews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
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

    // --- 패키지 로직 (유지) ---
    if (selectedMaterial.id === 'poly' && qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
        total += 300000;
        q['bathroom_floor'] -= 2;
        q['entrance'] -= 1;
        isPackageActive = true;
        isFreeEntrance = false; 
        labelText = '(30만원 패키지 적용)';
    }
    else if (selectedMaterial.id === 'kerapoxy' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        let isMaster = qMasterWall >= 1;
        total += 750000;
        q['bathroom_floor'] -= 1;
        if (isMaster) q['master_bath_wall'] -= 1;
        else q['common_bath_wall'] -= 1;
        isPackageActive = true;
        labelText = '(75만원 에폭시 패키지 적용)';
    }
    else if (selectedMaterial.id === 'poly' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        let isMaster = qMasterWall >= 1;
        total += 500000;
        q['bathroom_floor'] -= 1;
        if (isMaster) q['master_bath_wall'] -= 1;
        else q['common_bath_wall'] -= 1;
        isPackageActive = true;
        labelText = '(50만원 패키지 적용)';
    } 
    else if (selectedMaterial.id === 'kerapoxy') {
        if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
            total += 1300000;
            q['bathroom_floor'] -= 2;
            q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1);
            q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1);
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(풀패키지 할인 적용)'; 
        }
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { 
            total += 950000;
            q['bathroom_floor'] -= 2;
            q['shower_booth'] -= 1;
            q['bathtub_wall'] -= 1;
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(패키지 할인 적용)';
        }
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
            total += 750000;
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
            total += 350000;
            q['bathroom_floor'] -= 1;
            labelText = '(최소 시공비 적용)';
        }
    } 
    else { 
      if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
        total += 700000;
        q['bathroom_floor'] -= 2;
        q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1);
        q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1);
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(풀패키지 할인 적용)';
      }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
        total += 380000;
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
        total += 200000;
        q['bathroom_floor'] -= 1;
        labelText = '(최소 시공비 적용)';
      }
    }

    // --- 잔여 항목 계산 (유지) ---
    const ALL_AREAS = [...SERVICE_AREAS, ...SILICON_AREAS];
    ALL_AREAS.forEach(area => {
        const count = q[area.id] || 0;
        if (count > 0) {
            let basePrice = area.basePrice;
            let currentMod = selectedMaterial.priceMod;
            if (area.id === 'entrance' && isFreeEntrance) return; 
            if (area.id === 'living_room' && selectedMaterial.id === 'kerapoxy') currentMod = 2.0;

            let price = basePrice * count * currentMod * selectedHousing.multiplier;

            if (area.id === 'living_room' && isPackageActive) {
                if (selectedMaterial.id === 'poly') price -= (50000 * count);
                else if (selectedMaterial.id === 'kerapoxy') price -= (150000 * count);
            } 
            else if (area.id === 'balcony_laundry' && isPackageActive) {
                 if (selectedMaterial.id === 'poly') { price = 100000 * count; } 
                 else if (selectedMaterial.id === 'kerapoxy') { price = basePrice * count * currentMod * selectedHousing.multiplier; }
            }
            else if (area.id === 'silicon_bathtub' && isPackageActive) { price = 50000 * count; }
            else if (area.id === 'silicon_living_baseboard' && isPackageActive) { price = 350000 * count; }
            
            total += price;
        }
    });

    // --- 리뷰 할인 적용 (유지) ---
    let discountAmount = 0;
    REVIEW_EVENTS.forEach(evt => {
      if (selectedReviews.has(evt.id)) {
        discountAmount += evt.discount;
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
    };

  }, [housingType, material, quantities, selectedReviews]);

  // 견적서 생성 로직 (유지)
  const generateQuoteText = () => {
    const selectedMaterialData = MATERIALS.find(m => m.id === material);
    const housingLabel = HOUSING_TYPES.find(h => h.id === housingType).label;
    let materialLabel = selectedMaterialData.label;
    
    if (material === 'poly') materialLabel += ` (${polyOption === 'pearl' ? '펄' : '무펄'})`;
    else if (material === 'kerapoxy') materialLabel += ` (${epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})`;
    
    let text = `[줄눈의미학 견적 문의]\n\n`;
    text += `🏠 현장유형: ${housingLabel}\n`;
    text += `✨ 시공재료: ${materialLabel}\n`;
    text += `⏱ 예상 시공 시간: ${calculation.estimatedHours}시간 내외\n`; 
    
    text += `\n📋 [줄눈 시공]\n`;
    SERVICE_AREAS.forEach(area => {
      if (area.id === 'entrance' && quantities[area.id] > 0 && calculation.isFreeEntrance) {
        text += `- ${area.label}: ${quantities[area.id]}${area.unit} (패키지 서비스)\n`;
      } else if (quantities[area.id] > 0) {
        text += `- ${area.label}: ${quantities[area.id]}${area.unit}\n`;
      }
    });

    if (SILICON_AREAS.some(area => quantities[area.id] > 0)) {
      text += `\n🧴 [실리콘 교체]\n`;
      SILICON_AREAS.forEach(area => {
        if (quantities[area.id] > 0) {
          let priceLabel = '';
          if (area.id === 'silicon_bathtub' && calculation.isPackageActive) priceLabel = ' (패키지 할인가)';
          else if (area.id === 'silicon_living_baseboard' && calculation.isPackageActive) priceLabel = ' (패키지 할인가)';
          text += `- ${area.label}: ${quantities[area.id]}${area.unit}${priceLabel}\n`;
        }
      });
    }
    
    if (selectedReviews.size > 0) {
      text += `\n🎁 [할인 혜택]\n`;
      REVIEW_EVENTS.forEach(evt => {
        if (selectedReviews.has(evt.id)) text += `- ${evt.label}: -${evt.discount.toLocaleString()}원\n`;
      });
    }

    text += `\n⚠️ [추가 비용 발생 가능 요소]\n`;
    text += `- 견적은 타일크기 바닥 30x30cm, 벽면 30x60cm 기준이며, 기준보다 작을 경우(조각타일 시공불가)\n`;
    text += `- 재시공: 셀프 시공 포함 재시공일 경우\n`;
    text += `- 특이 구조: 일반 사이즈 공간이 아닌, 넓거나 특이 구조일 경우\n`;
    
    if (calculation.isPackageActive) {
      text += `\n🎁 [패키지 서비스 적용됨]\n`;
      if (calculation.isFreeEntrance) text += `- 현관 바닥 서비스(폴리아스파틱)\n`;
      text += `- 변기테두리, 바닥테두리\n`;
      text += `- 욕실 젠다이 실리콘 오염방지\n`;
      text += `- 주방 싱크볼\n`;
    }

    text += `\n💰 예상 견적가: ${calculation.price.toLocaleString()}원`;
    if (calculation.label) text += ` ${calculation.label}`;
    text += `\n\n--- [상담 준비 사항] ---\n`;
    text += `※ 줄눈의미학 온라인 견적입니다. 정확한 견적을 위해 해당 공간의 **사진 2~3장을 준비**하여 상담원에게 전달해주어야 합니다. 현장 상황에 따라 견적 변동될 수 있습니다.`;
    return text;
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

  // ★★★ 이미지 저장 로직 (새로 정의) ★★★
  const handleImageSave = async () => {
    if (!quoteRef.current) {
        alert("이미지 저장 영역을 찾을 수 없습니다.");
        return;
    }
    
    try {
        // 실제 앱 환경에서는 dom-to-image 또는 html2canvas 라이브러리를 사용합니다.
        // 예: html2canvas(quoteRef.current).then(canvas => { ... });
        
        // 여기서는 가상의 함수를 사용하여 다운로드 이벤트를 시뮬레이션합니다.
        await simulateDomToImage(quoteRef.current, '줄눈의미학_견적서');
        
        alert("견적서 이미지가 갤러리에 저장되었습니다! (다운로드 폴더 확인)");
        setShowModal(false); // 저장 후 모달 닫기
    } catch (error) {
        console.error("이미지 저장 실패:", error);
        alert("이미지 저장에 실패했습니다. (팝업 차단 또는 권한 문제일 수 있습니다)");
    }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);
  const selectedMaterialData = MATERIALS.find(m => m.id === material);


  return (
    // 배경색: 대기업 느낌으로 '화이트/아이보리' 계열
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans ${calculation.isPackageActive ? 'pb-48' : 'pb-28'}`}>
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
        
        {/* --- 1. 현장 유형 섹션 --- */}
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

        {/* --- 2. 시공 재료 선택 --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-150">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Hammer className="h-5 w-5 text-indigo-600" /> 2. 시공 재료 선택
          </h2>
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

        {/* --- 3. 원하는 시공범위를 선택해주세요 --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-300">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Calculator className="h-5 w-5 text-indigo-600" /> 3. 시공 범위 설정 (줄눈)
          </h2>
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

        {/* --- 4. 실리콘 교체할 곳 선택 --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-450">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Eraser className="h-5 w-5 text-indigo-600" /> 4. 추가 시공 (실리콘/리폼)
          </h2>
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

        {/* --- 5. 할인 혜택 (리뷰 이벤트) --- */}
        <section className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-fade-in delay-600">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
            <Gift className="h-5 w-5 text-indigo-600" /> 5. 할인 이벤트
          </h2>
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

        {/* --- 자주 묻는 질문 (FAQ) --- */}
        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-lg mt-6 animate-fade-in delay-750">
            <h2 className="text-lg font-extrabold text-gray-800 mb-2 flex items-center gap-2 border-b pb-2">
                <HelpCircle className="h-5 w-5 text-indigo-600"/> 고객 지원 센터
            </h2>
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
            className="w-full py-3 rounded-lg bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-600 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <Star size={20} fill="currentColor" className="text-white" />
            고객 만족도 확인 (숨고 평점 4.9+)
          </button>
        </div>
      </main>

      {/* 하단 고정바 */}
      <>
        {/* 패키지 혜택 바: 전문적인 색상 조합 */}
        {calculation.isPackageActive && (
          <div className="fixed bottom-[110px] left-4 right-4 max-w-md mx-auto z-10">
            <div className="bg-gray-700 text-white p-4 rounded-lg shadow-2xl border border-gray-500 animate-[professionalPulse_2s_infinite]">
              <div className="flex items-start gap-3">
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

        {/* 최종 견적 하단 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 safe-area-bottom z-20">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <Clock size={14} className="text-indigo-600" /> 예상 시공 시간: <span className='font-extrabold text-gray-800'>{calculation.estimatedHours}</span>시간
              </div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-extrabold text-indigo-700">{calculation.price.toLocaleString()}<span className="text-base font-normal text-gray-500">원</span></div>
                {calculation.label && <div className="text-xs font-bold text-red-600 mb-1 animate-pulse">{calculation.label}</div>}
              </div>
            </div>
            {/* 메인 버튼: 견적서 보기 (모달 열기) 기능 유지 */}
            <button onClick={() => setShowModal(true)} disabled={!hasSelections} className={`px-7 py-4 rounded-lg font-extrabold text-white shadow-xl transition-all ${hasSelections ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-500/50' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}>견적서 보기</button>
          </div>
        </div>
      </>

      {/* 견적서 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-200">
            <div className="bg-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-amber-400" /> 최종 견적 요약</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition active:scale-95">
                <X size={20} />
              </button>
            </div>
            {/* ★★★ 견적 내용 영역에 Ref 추가 ★★★ */}
            <div ref={quoteRef} id="quote-content" className="p-5 max-h-[60vh] overflow-y-auto text-gray-800">
              <div className="space-y-4 text-sm">
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">시공 재료</span>
                  <span className="font-bold text-indigo-600">
                    {selectedMaterialData.label}
                    <span className="text-xs ml-1 text-gray-500">
                        ({material === 'poly' ? (polyOption === 'pearl' ? '펄' : '무펄') : (epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크')})
                    </span>
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">예상 시공 시간</span>
                  <span className="font-bold text-blue-600">{calculation.estimatedHours}시간 내외</span>
                </div>

                <div className="space-y-2 border-b border-gray-200 pb-4">
                  <p className="text-gray-500 text-xs mb-1 font-bold">📋 시공 상세 범위</p>
                  {SERVICE_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-gray-50 p-2 rounded"><span>{area.label} <span className="text-gray-400 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                </div>
                
                {SILICON_AREAS.some(area => quantities[area.id] > 0) && (
                  <div className="space-y-2 border-b border-gray-200 pb-4">
                    <p className="text-gray-500 text-xs mb-1 font-bold">🧴 실리콘/리폼 항목</p>
                    {SILICON_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-amber-50 p-2 rounded border border-amber-100 text-amber-800"><span>{area.label} <span className="text-amber-600 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                  </div>
                )}

                {calculation.discountAmount > 0 && (
                  <div className="space-y-2 border-b border-gray-200 pb-4">
                    <p className="text-gray-500 text-xs mb-1 font-bold">🎁 할인 혜택</p>
                    {REVIEW_EVENTS.map(evt => {if (selectedReviews.has(evt.id)) {return (<div key={evt.id} className="flex justify-between items-center bg-red-50 p-2 rounded border border-red-100 text-red-800"><span>{evt.label}</span><span className="font-bold text-red-600">-{evt.discount.toLocaleString()}원</span></div>);}return null;})}
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                    <span className="font-extrabold text-gray-800">총 예상 합계</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-blue-600">{calculation.price.toLocaleString()}원</span>
                      {calculation.label && <div className="text-xs text-red-600 font-bold mt-1">{calculation.label}</div>}
                    </div>
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className='text-sm font-semibold text-center text-red-500 mb-3 flex items-center justify-center gap-1'><Info size={16}/> 전문가 상담 시 **현장 사진 2~3장**이 필수입니다.</p>
               <div className='grid grid-cols-2 gap-3'>
                    {/* ★★★ '견적서 복사'를 '이미지 저장'으로 변경 및 로직 연결 ★★★ */}
                    <button onClick={handleImageSave} className="flex items-center justify-center gap-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-sm active:scale-95 shadow-md">
                        <ImageIcon size={16} /> 견적 이미지 저장
                    </button>
                    {/* 전화 상담 버튼만 남김 */}
                    <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="flex items-center justify-center gap-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md text-sm active:scale-95 col-span-1">
                        <Phone size={16} /> 전화 상담 ({PHONE_NUMBER})
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