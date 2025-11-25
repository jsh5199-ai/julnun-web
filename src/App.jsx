import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle,
} from 'lucide-react';

// =================================================================
// [스타일] 애니메이션 정의 및 메인 컬러 팔레트 정의
// =================================================================
const GlobalStyles = () => (
  <style>{`
    /* 기존 애니메이션 유지 */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseShadow { 0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); } 50% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    
    /* 세련된 버튼 효과를 위한 utility 클래스 */
    .btn-selected { 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(99, 102, 241, 0.5); /* indigo-500 ring */
      transform: translateY(-2px);
    }
    .btn-selected:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
    }
    
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
  `}</style>
);

// =================================================================
// [데이터] (변화 없음)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 아파트(입주 전)', multiplier: 1.0 },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];

const MATERIALS = [
  { 
    id: 'poly', label: '폴리아스파틱', priceMod: 1.0, 
    description: '탄성과 광택이 우수하며 가성비가 좋습니다.',
    badge: '일반', badgeColor: 'bg-indigo-300 text-indigo-900' // 밝은 네이비
  },
  { 
    id: 'kerapoxy', label: '에폭시(무광/무펄)', priceMod: 1.8, 
    description: '내구성이 뛰어나고 매트한 질감.',
    badge: '프리미엄', badgeColor: 'bg-amber-500 text-gray-900' // 강조색
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
// [컴포넌트] Accordion (배경/텍스트 색상 변경)
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-700">
            <button
                className="flex justify-between items-center w-full py-4 text-left font-bold text-gray-100 hover:bg-gray-800 transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm md:text-base pr-4">{question}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180 text-indigo-400' : 'text-gray-400'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 py-3 animate-slide-down' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-gray-300 pl-4 pr-2 bg-gray-800 p-3 rounded-lg border-l-4 border-indigo-500">{answer}</p>
            </div>
        </div>
    );
};


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

  const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';

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
  
  // 계산 로직은 유지
  const calculation = useMemo(() => {
    // ... (calculation 로직은 이전 코드와 동일)
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
    const selectedMaterial = MATERIALS.find(m => m.id === material);

    let q = { ...quantities };
    let total = 0;
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false;

    const qBathFloor = q['bathroom_floor'] || 0;
    const qShower = q['shower_booth'] || 0;
    const qBathtub = q['bathtub_wall'] || 0;
    const qMasterWall = q['master_bath_wall'] || 0;
    const qCommonWall = q['common_bath_wall'] || 0;
    const qEntrance = q['entrance'] || 0;

    const qBathWallOne = (qMasterWall >= 1 || qCommonWall >= 1);
    const qBathWallTotal = qMasterWall + qCommonWall;

    // --- 패키지 로직 시작 (우선순위 순서대로) ---

    // 0-A. 폴리 30만원 패키지: 욕실 바닥 2 + 현관 1 
    if (selectedMaterial.id === 'poly' && qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
        total += 300000;
        q['bathroom_floor'] -= 2;
        q['entrance'] -= 1;
        isPackageActive = true;
        isFreeEntrance = false; // 현관이 포함되므로 서비스 아님
        labelText = '(30만원 패키지 적용)';
    }

    // 0-B. 에폭시 75만원 패키지: 욕실 바닥 1 + 벽 전체 1 (에폭시 전용)
    else if (selectedMaterial.id === 'kerapoxy' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        let isMaster = qMasterWall >= 1;
        
        total += 750000;
        q['bathroom_floor'] -= 1;
        if (isMaster) q['master_bath_wall'] -= 1;
        else q['common_bath_wall'] -= 1;
        
        isPackageActive = true;
        labelText = '(75만원 에폭시 패키지 적용)';
    }
    
    // 0-C. 폴리 50만원 패키지: 욕실 바닥 1 + 벽 전체 1 (폴리 전용)
    else if (selectedMaterial.id === 'poly' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        let isMaster = qMasterWall >= 1;
        
        total += 500000;
        q['bathroom_floor'] -= 1;
        if (isMaster) q['master_bath_wall'] -= 1;
        else q['common_bath_wall'] -= 1;
        
        isPackageActive = true;
        labelText = '(50만원 패키지 적용)';
    } 

    // 1. 에폭시 (고급형) 나머지 패키지
    else if (selectedMaterial.id === 'kerapoxy') {
        if (qBathFloor >= 2 && qBathWallTotal >= 2) { // 욕실 바닥 2 + 벽 전체 2 (풀패키지 130만)
            total += 1300000;
            q['bathroom_floor'] -= 2;
            q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1);
            q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1);
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(풀패키지 할인 적용)'; 
        }
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { // 욕실2 + 샤워+욕조 (95만)
            total += 950000;
            q['bathroom_floor'] -= 2;
            q['shower_booth'] -= 1;
            q['bathtub_wall'] -= 1;
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(패키지 할인 적용)';
        }
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { // 욕실2 + 샤워 OR 욕조 (75만)
            total += 750000;
            q['bathroom_floor'] -= 2;
            if (qShower >= 1) q['shower_booth'] -= 1;
            else q['bathtub_wall'] -= 1;
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(패키지 할인 적용)'; 
        }
        else if (qBathFloor >= 2 && qEntrance >= 1) { // 욕실2 + 현관 (혜택 적용)
            isPackageActive = true;
            isFreeEntrance = true; 
            labelText = '(패키지 혜택 적용)';
        }
        else if (qBathFloor === 1) { // 최소 시공비
            total += 350000;
            q['bathroom_floor'] -= 1;
            labelText = '(최소 시공비 적용)';
        }
    } 
    
    // 2. 일반형 (폴리아스파틱) 나머지 패키지
    else { 
      if (qBathFloor >= 2 && qBathWallTotal >= 2) { // 욕실 바닥 2 + 벽 전체 2 (풀패키지 70만)
        total += 700000;
        q['bathroom_floor'] -= 2;
        q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1);
        q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1);
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(풀패키지 할인 적용)';
      }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { // 욕실2 + 샤워 OR 욕조 (38만)
        total += 380000;
        q['bathroom_floor'] -= 2;
        if (qShower >= 1) q['shower_booth'] -= 1;
        else q['bathtub_wall'] -= 1;
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(패키지 할인 적용)';
      }
      else if (qBathFloor >= 2 && qEntrance >= 1) { // 욕실2 + 현관 (혜택 적용)
        isPackageActive = true;
        isFreeEntrance = true;
        labelText = '(패키지 혜택 적용)';
      }
      else if (qBathFloor === 1) { // 최소 시공비
        total += 200000;
        q['bathroom_floor'] -= 1;
        labelText = '(최소 시공비 적용)';
      }
    }

    // --- 패키지 로직 끝 / 잔여 항목 계산 시작 ---
    
    const ALL_AREAS = [...SERVICE_AREAS, ...SILICON_AREAS];
    
    ALL_AREAS.forEach(area => {
        const count = q[area.id] || 0;
        if (count > 0) {
            let basePrice = area.basePrice;
            let currentMod = selectedMaterial.priceMod;
            
            // 현관 무료 서비스 적용 (패키지 활성화 + 현관이 서비스로 지정된 경우)
            if (area.id === 'entrance' && isFreeEntrance) {
                return; 
            } 
            
            // 거실 바닥 고급형 가격 모디파이어 (일반 1.0, 고급 2.0)
            if (area.id === 'living_room' && selectedMaterial.id === 'kerapoxy') currentMod = 2.0;

            let price = basePrice * count * currentMod * selectedHousing.multiplier;

            // 거실 바닥 패키지 할인
            if (area.id === 'living_room' && isPackageActive) {
                if (selectedMaterial.id === 'poly') price -= (50000 * count);
                else if (selectedMaterial.id === 'kerapoxy') price -= (150000 * count);
            } 
            
            // 베란다/세탁실 패키지 할인
            else if (area.id === 'balcony_laundry' && isPackageActive) {
                 if (selectedMaterial.id === 'poly') {
                    price = 100000 * count; 
                 } else if (selectedMaterial.id === 'kerapoxy') {
                    price = basePrice * count * currentMod * selectedHousing.multiplier;
                 }
            }
            
            // 실리콘 리폼/걸레받이 패키지 할인
            else if (area.id === 'silicon_bathtub' && isPackageActive) {
                price = 50000 * count; 
            }
            else if (area.id === 'silicon_living_baseboard' && isPackageActive) {
                price = 350000 * count;
            }
            
            total += price;
        }
    });

    // --- 리뷰 할인 적용 ---
    let discountAmount = 0;
    REVIEW_EVENTS.forEach(evt => {
      if (selectedReviews.has(evt.id)) {
        discountAmount += evt.discount;
      }
    });
    
    total -= discountAmount;

    return { 
      price: Math.max(0, Math.floor(total / 1000) * 1000), 
      label: labelText,
      isPackageActive,
      isFreeEntrance,
      discountAmount,
    };

  }, [housingType, material, quantities, selectedReviews]);

  // 견적서 생성/복사 로직은 유지
  const generateQuoteText = () => {
    // ... (generateQuoteText 로직은 이전 코드와 동일)
    const housingLabel = HOUSING_TYPES.find(h => h.id === housingType).label;
    let materialLabel = MATERIALS.find(m => m.id === material).label;
    
    if (material === 'poly') materialLabel += ` (${polyOption === 'pearl' ? '펄' : '무펄'})`;
    else if (material === 'kerapoxy') materialLabel += ` (${epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})`;
    
    let text = `[줄눈의미학 견적 문의]\n\n`;
    text += `🏠 현장유형: ${housingLabel}\n`;
    text += `✨ 시공재료: ${materialLabel}\n`;
    
    text += `\n📋 [줄눈 시공]\n`;
    SERVICE_AREAS.forEach(area => {
      // 현관이 무료일 경우 견적서에 [무료]로 표시
      if (area.id === 'entrance' && quantities[area.id] > 0 && calculation.isFreeEntrance) {
        text += `- ${area.label}: ${quantities[area.id]}${area.unit} (패키지 서비스)\n`;
      } else if (quantities[area.id] > 0) {
        text += `- ${area.label}: ${quantities[area.id]}${area.unit}\n`;
      }
    });

    // 실리콘 교체 범위
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
    
    // 리뷰 할인 혜택
    if (selectedReviews.size > 0) {
      text += `\n🎁 [할인 혜택]\n`;
      REVIEW_EVENTS.forEach(evt => {
        if (selectedReviews.has(evt.id)) text += `- ${evt.label}: -${evt.discount.toLocaleString()}원\n`;
      });
    }

    // 추가 비용 발생 가능 요소 (견적서에도 포함 - 요청하신 문구로 수정)
    text += `\n⚠️ [추가 비용 발생 가능 요소]\n`;
    text += `- 견적은 타일크기 바닥 30x30cm, 벽면 30x60cm 기준이며, 기준보다 작을 경우(조각타일 시공불가)\n`;
    text += `- 재시공: 셀프 시공 포함 재시공일 경우\n`;
    text += `- 특이 구조: 일반 사이즈 공간이 아닌, 넓거나 특이 구조일 경우\n`;
    
    // 패키지 서비스 내역
    if (calculation.isPackageActive) {
      text += `\n🎁 [패키지 서비스 적용됨]\n`;
      if (calculation.isFreeEntrance) text += `- 현관 바닥 서비스(폴리아스파틱)\n`;
      text += `- 변기테두리, 바닥테두리\n`;
      text += `- 욕실 젠다이 실리콘 오염방지\n`;
      text += `- 주방 싱크볼\n`;
    }

    text += `\n💰 예상 견적가: ${calculation.price.toLocaleString()}원`;
    if (calculation.label) text += ` ${calculation.label}`;
    text += `\n\n※ 줄눈의미학 온라인 견적입니다. 정확한 견적을 위해 해당 공간의 사진을 상담원에게 전달해주어야 합니다. 현장 상황에 따라 변동될 수 있습니다.`;
    return text;
  };

  const copyToClipboard = async () => {
    // ... (copyToClipboard 로직은 이전 코드와 동일)
    const text = generateQuoteText();
    
    try {
        // 1. 최신 방식 시도 (HTTPS 환경)
        await navigator.clipboard.writeText(text);
        alert("견적서가 복사되었습니다!");
    } catch (err) {
        // 2. 실패 시(HTTP 등) 구형 방식 사용 (Fallback)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert("견적서가 복사되었습니다!");
        } catch (err) {
            console.error('Unable to copy', err);
            alert("복사에 실패했습니다. 수동으로 복사해주세요.");
        }
        document.body.removeChild(textArea);
    }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    // 배경색 변경: bg-gray-50 -> bg-gray-900 (다크 모드 베이스)
    <div className={`min-h-screen bg-gray-900 text-gray-100 font-sans ${calculation.isPackageActive ? 'pb-48' : 'pb-28'}`}>
      {/* 스타일 주입 */}
      <GlobalStyles />

      {/* 헤더: 색상 변경 및 그림자 강화 */}
      <header className="bg-indigo-900 text-white sticky top-0 z-20 shadow-2xl">
        <div className="p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="줄눈의미학"
              className="h-8 w-auto object-contain bg-white rounded-full p-0.5" // 로고에 미세한 흰색 테두리
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-xl font-bold text-gray-50 tracking-wide">줄눈의미학</h1>
          </div>
          {/* 초기화 버튼 디자인 변경 */}
          <button onClick={() => window.location.reload()} className="text-xs bg-indigo-700/50 border border-indigo-600 px-2 py-1 rounded-full text-indigo-200 hover:bg-indigo-700 transition active:scale-95 shadow-md">
            <RefreshCw size={12} className="inline mr-1" /> 초기화
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* --- 1. 현장 유형 섹션 (배경색 변경 및 둥근 모서리) --- */}
        <section className="bg-gray-800 p-5 rounded-3xl shadow-2xl border border-gray-700 animate-fade-in">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-indigo-400">
            <Home className="h-6 w-6 text-indigo-400" /> 1. 현장 유형을 선택하세요
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                // 버튼 스타일 변경: 입체적인 느낌 (btn-selected 클래스 사용)
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                  housingType === type.id 
                    ? 'border-indigo-500 bg-indigo-600 text-white btn-selected' 
                    : 'border-gray-700 bg-gray-700 text-gray-300 hover:border-indigo-500 hover:bg-gray-600 shadow-md'
                }`}
              >
                <div className="font-bold text-base">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* --- 2. 시공 재료 선택 --- */}
        <section className="bg-gray-800 p-5 rounded-3xl shadow-2xl border border-gray-700 animate-fade-in delay-150">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-indigo-400">
            <Hammer className="h-6 w-6 text-indigo-400" /> 2. 시공 재료 선택
          </h2>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <div onClick={() => setMaterial(item.id)} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${item.id === material ? 'border-indigo-500 bg-indigo-800 ring-2 ring-indigo-500 shadow-xl' : 'border-gray-700 bg-gray-700 hover:bg-gray-600'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className='flex items-center gap-3'>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition ${item.id === material ? 'border-indigo-400' : 'border-gray-500'}`}>
                          {item.id === material && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 transition scale-110" />}
                        </div>
                        <span className="font-bold text-gray-100">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  </div>
                </div>
                {item.id === 'poly' && item.id === material && (
                  <div className="mt-3 ml-6 pl-4 border-l-2 border-indigo-500 space-y-2 animate-slide-down bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm font-bold text-indigo-400 flex items-center gap-2"><Palette size={14} /> 펄 유무 선택</div>
                    <div className="flex gap-3">
                      <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-lg border transition-all ${polyOption === 'pearl' ? 'bg-indigo-500 text-white border-indigo-500 font-bold shadow-md' : 'bg-gray-600 text-gray-300 border-gray-600 hover:bg-gray-500'}`}>펄</button>
                      <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-lg border transition-all ${polyOption === 'no_pearl' ? 'bg-indigo-500 text-white border-indigo-500 font-bold shadow-md' : 'bg-gray-600 text-gray-300 border-gray-600 hover:bg-gray-500'}`}>무펄</button>
                    </div>
                  </div>
                )}
                {item.id === 'kerapoxy' && item.id === material && (
                  <div className="mt-3 ml-6 pl-4 border-l-2 border-amber-500 space-y-2 animate-slide-down bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm font-bold text-amber-400 flex items-center gap-2"><Crown size={14} /> 브랜드 선택</div>
                    <div className="flex gap-3">
                      <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-lg border transition-all ${epoxyOption === 'kerapoxy' ? 'bg-amber-500 text-gray-900 border-amber-500 font-bold shadow-md' : 'bg-gray-600 text-gray-300 border-gray-600 hover:bg-gray-500'}`}>케라폭시</button>
                      <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-lg border transition-all ${epoxyOption === 'starlike' ? 'bg-amber-500 text-gray-900 border-amber-500 font-bold shadow-md' : 'bg-gray-600 text-gray-300 border-gray-600 hover:bg-gray-500'}`}>스타라이크</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- 3. 원하는 시공범위를 선택해주세요 (아이템 디자인 개선) --- */}
        <section className="bg-gray-800 p-5 rounded-3xl shadow-2xl border border-gray-700 animate-fade-in delay-300">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-indigo-400">
            <Calculator className="h-6 w-6 text-indigo-400" /> 3. 원하는 시공범위를 선택해주세요
          </h2>
          <div className="space-y-4">
            {SERVICE_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;
              return (
                <div key={area.id} className={`flex items-center justify-between p-4 rounded-xl border transition duration-150 ${isSelected ? 'bg-indigo-900 border-indigo-600 shadow-lg' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full shadow-md ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-500 text-gray-100'}`}><Icon size={20} /></div>
                    <div>
                      <div className="font-bold text-gray-100">{area.label}</div>
                      <div className="text-xs text-gray-400">기본 {area.basePrice.toLocaleString()}원~{area.desc && <span className="block text-indigo-300">{area.desc}</span>}</div>
                    </div>
                  </div>
                  {/* 수량 조절 버튼 그룹 */}
                  <div className="flex items-center gap-2 bg-gray-900 px-2 py-1 rounded-full shadow-inner border border-gray-700">
                    <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-full transition active:scale-90 text-xl font-bold ${quantities[area.id] > 0 ? 'text-indigo-400 hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}>-</button>
                    <span className={`w-6 text-center font-bold text-base ${quantities[area.id] > 0 ? 'text-white' : 'text-gray-600'}`}>{quantities[area.id]}</span>
                    <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 flex items-center justify-center text-indigo-400 hover:bg-gray-800 rounded-full font-bold text-xl transition active:scale-90">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 4. 실리콘 교체할 곳 선택 --- */}
        <section className="bg-gray-800 p-5 rounded-3xl shadow-2xl border border-gray-700 animate-fade-in delay-450">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-indigo-400">
            <Eraser className="h-6 w-6 text-indigo-400" /> 4. 실리콘 교체할 곳 선택
          </h2>
          <div className="space-y-4">
            {SILICON_AREAS.map((area) => {
              const Icon = area.icon;
              const isSelected = quantities[area.id] > 0;
              return (
                <div key={area.id} className={`flex items-center justify-between p-4 rounded-xl border transition duration-150 ${isSelected ? 'bg-amber-900 border-amber-600 shadow-lg' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full shadow-md ${isSelected ? 'bg-amber-500 text-gray-900' : 'bg-gray-500 text-gray-100'}`}><Icon size={20} /></div>
                    <div>
                      <div className="font-bold text-gray-100">{area.label}</div>
                      <div className="text-xs text-gray-400">{area.basePrice.toLocaleString()}원{area.desc && <span className="block text-amber-300">{area.desc}</span>}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900 px-2 py-1 rounded-full shadow-inner border border-gray-700">
                    <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-full transition active:scale-90 text-xl font-bold ${quantities[area.id] > 0 ? 'text-amber-400 hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}>-</button>
                    <span className={`w-6 text-center font-bold text-base ${quantities[area.id] > 0 ? 'text-white' : 'text-gray-600'}`}>{quantities[area.id]}</span>
                    <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 flex items-center justify-center text-amber-400 hover:bg-gray-800 rounded-full font-bold text-xl transition active:scale-90">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 5. 할인 혜택 (리뷰 이벤트) --- */}
        <section className="bg-indigo-900 p-5 rounded-3xl shadow-2xl border border-indigo-700 animate-fade-in delay-600">
          <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-amber-400">
            <Gift className="h-6 w-6 text-amber-400" /> 5. 할인 혜택 (리뷰 이벤트)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                // 버튼 스타일 변경: 배경과 테두리 색상 조합
                className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden active:scale-95 ${selectedReviews.has(evt.id) ? 'border-amber-500 bg-amber-900 shadow-xl' : 'border-indigo-700 bg-indigo-800 text-gray-300 hover:bg-indigo-700'}`}
              >
                {selectedReviews.has(evt.id) && <div className="absolute top-0 right-0 bg-amber-500 text-gray-900 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold shadow-md">APPLIED</div>}
                <div className="flex flex-col items-center text-center gap-1">
                  <span className={`font-bold text-base ${selectedReviews.has(evt.id) ? 'text-white' : 'text-gray-300'}`}>{evt.label}</span>
                  <span className={`text-sm font-extrabold ${selectedReviews.has(evt.id) ? 'text-red-400' : 'text-indigo-400'}`}>-{evt.discount.toLocaleString()}원</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-indigo-400 mt-3 text-center">※ 중복 선택 가능합니다. 시공 완료 후 꼭 작성해주세요!</p>
        </section>
        
        
        {/* --- 자주 묻는 질문 (FAQ) --- */}
        <section className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-2xl mt-8 animate-fade-in delay-750">
            <h2 className="text-xl font-extrabold text-indigo-400 mb-2 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-indigo-400"/> 자주 묻는 질문
            </h2>
            <div className="space-y-1">
                {FAQ_ITEMS.map((item, index) => (
                    <Accordion key={index} question={item.question} answer={item.answer} />
                ))}
            </div>
        </section>

        
        {/* 숨고 후기 바로가기 */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <button 
            onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
            className="w-full py-4 rounded-xl bg-amber-500 text-gray-900 font-extrabold text-lg hover:bg-amber-600 transition shadow-2xl flex items-center justify-center gap-2 active:scale-95"
          >
            <Star size={20} fill="currentColor" className="text-white" />
            숨고 후기 바로가기
          </button>
        </div>
      </main>

      {/* 하단 고정바 */}
      <>
        {/* 패키지 혜택 바: 애니메이션 및 색상 변경 */}
        {calculation.isPackageActive && (
          <div className="fixed bottom-[110px] left-4 right-4 max-w-md mx-auto z-10">
            <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-2xl border border-indigo-500 animate-[pulseShadow_2s_infinite]">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-full flex-shrink-0 mt-1"><Gift className="w-5 h-5 text-amber-300" /></div>
                <div className="text-sm flex-1">
                  <div className="font-extrabold text-amber-300 mb-1">🎉 패키지 혜택 적용중!</div>
                  <div className="space-y-0.5 text-xs text-indigo-100">
                    {calculation.isFreeEntrance && <div>- 현관 바닥 서비스(폴리아스파틱)</div>}
                    <div>- 변기테두리, 바닥테두리</div>
                    <div>- 욕실 젠다이 실리콘 오염방지</div>
                    <div>- 주방 싱크볼</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-indigo-400/50 text-center">
                  <p className="text-[11px] font-bold text-amber-300 bg-indigo-900/50 py-1 px-2 rounded">
                      🚨 견적은 타일 크기 기준이며, 기준 외 타일 크기/재시공 시 추가 비용 발생 가능
                  </p>
              </div>
            </div>
          </div>
        )}

        {/* 최종 견적 하단 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-inner p-4 safe-area-bottom z-20">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-400 font-medium">총 예상 견적가</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-extrabold text-indigo-400">{calculation.price.toLocaleString()}<span className="text-base font-normal text-gray-300">원</span></div>
                {calculation.label && <div className="text-xs font-bold text-red-400 mb-1 animate-pulse">{calculation.label}</div>}
              </div>
            </div>
            {/* 메인 버튼: 색상 및 그림자 강조 */}
            <button onClick={() => setShowModal(true)} disabled={!hasSelections} className={`px-7 py-4 rounded-xl font-extrabold text-white shadow-xl transition-all ${hasSelections ? 'bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] shadow-indigo-500/50' : 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none'}`}>견적서 보기</button>
          </div>
        </div>
      </>

      {/* 견적서 모달 (색상 및 디자인 변경) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-down border border-gray-700">
            <div className="bg-indigo-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-amber-300" />예상 견적서</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition active:scale-95">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto text-gray-200">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">현장 유형</span>
                  <span className="font-bold">{HOUSING_TYPES.find(h => h.id === housingType).label}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">시공 재료</span>
                  <span className="font-bold text-indigo-400">
                    {MATERIALS.find(m => m.id === material).label}
                    {material === 'poly' && <span className="text-xs ml-1 text-gray-500">({polyOption === 'pearl' ? '펄' : '무펄'})</span>}
                    {material === 'kerapoxy' && <span className="text-xs ml-1 text-gray-500">({epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})</span>}
                  </span>
                </div>
                
                <div className="space-y-2 border-b border-gray-700 pb-4">
                  <p className="text-gray-400 text-xs mb-1 font-bold">📋 줄눈 시공 범위</p>
                  {SERVICE_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-gray-700 p-2 rounded"><span>{area.label} <span className="text-gray-500 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                </div>

                {SILICON_AREAS.some(area => quantities[area.id] > 0) && (
                  <div className="space-y-2 border-b border-gray-700 pb-4">
                    <p className="text-gray-400 text-xs mb-1 font-bold">🧴 실리콘 교체 범위</p>
                    {SILICON_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-amber-900 p-2 rounded border border-amber-800 text-amber-200"><span>{area.label} <span className="text-amber-300 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                  </div>
                )}

                {calculation.discountAmount > 0 && (
                  <div className="space-y-2 border-b border-gray-700 pb-4">
                    <p className="text-gray-400 text-xs mb-1 font-bold">🎁 할인 혜택</p>
                    {REVIEW_EVENTS.map(evt => {if (selectedReviews.has(evt.id)) {return (<div key={evt.id} className="flex justify-between items-center bg-indigo-900 p-2 rounded border border-indigo-700 text-indigo-200"><span>{evt.label}</span><span className="font-bold text-red-400">-{evt.discount.toLocaleString()}원</span></div>);}return null;})}
                  </div>
                )}

                <div className="space-y-2 border-b border-gray-700 pb-4 bg-red-900/30 p-3 rounded-lg border border-red-800">
                    <p className="text-red-400 text-xs mb-1 font-bold flex items-center gap-1">
                        <Info size={14} /> 추가 비용 발생 가능 요소
                    </p>
                    <ul className="list-disc list-outside text-xs text-gray-300 ml-4 space-y-1">
                        <li>
                            <span className="font-bold">견적 기준:</span> 타일크기 바닥 30x30cm, 벽면 30x60cm 기준이며, 기준보다 작을 경우(조각타일 시공불가)
                        </li>
                        <li>
                            <span className="font-bold">재시공:</span> 셀프 시공 포함 재시공일 경우
                        </li>
                        <li>
                            <span className="font-bold">특이 구조:</span> 일반 사이즈 공간이 아닌, 넓거나 특이 구조일 경우
                        </li>
                    </ul>
                </div>

                <div className="pt-2 mt-2">
                  {calculation.isPackageActive && (
                    <div className="bg-indigo-900/50 p-3 rounded-lg mb-3 text-xs text-indigo-200 border border-indigo-700">
                      <div className="font-bold mb-1 flex items-center gap-1"><Sparkles size={14} className="text-amber-300" /> 서비스 혜택 적용됨</div>
                      <ul className="list-disc list-inside text-indigo-400 space-y-0.5 pl-1">
                        {calculation.isFreeEntrance && <li>현관 바닥 (무료)</li>}
                        <li>변기테두리, 바닥테두리</li>
                        <li>욕실 젠다이 실리콘 오염방지</li>
                        <li>주방 싱크볼</li>
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3 border-t border-gray-700">
                    <span className="font-extrabold text-gray-100">총 예상 합계</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-indigo-400">{calculation.price.toLocaleString()}원</span>
                      {calculation.label && <div className="text-xs text-red-400 font-bold mt-1">{calculation.label}</div>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                </div>
              </div>
            </div>
            {/* 모달 하단 버튼 */}
            <div className="p-4 bg-gray-900 grid grid-cols-2 gap-3 border-t border-gray-700">
               <button onClick={copyToClipboard} className="flex items-center justify-center gap-1 bg-gray-700 border border-gray-600 text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-600 transition text-sm active:scale-95 shadow-lg"><Copy size={16} />견적 저장</button>
               <button onClick={() => window.location.href = 'tel:010-7734-6709'} className="flex items-center justify-center gap-1 bg-amber-500 text-gray-900 py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow-lg text-sm active:scale-95"><Phone size={16} />전화 연결</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}