import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle,
  Ruler // 타일 크기 선택에 사용할 새로운 아이콘
} from 'lucide-react';

// =================================================================
// [스타일] 애니메이션 정의 
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { transform: translateY(0); } }
    @keyframes bounceUp { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    .animate-bounce-up { animation: bounceUp 2s infinite; }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    /* 가상 이미지 경로가 없으므로 대체 스타일 제공 */
    .tile-example {
        background-color: #f0f4f8; /* Light blue background */
        background-image: repeating-linear-gradient(
            45deg,
            #e2e8f0 0,
            #e2e8f0 1px,
            #f0f4f8 1px,
            #f0f4f8 20px
        );
        background-size: 20px 20px;
        color: #64748b;
        font-size: 10px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
  `}</style>
);

// =================================================================
// [NEW 2] 타일 크기 선택 옵션 (섹션 2)
// =================================================================
const TILE_SIZE_OPTIONS = [
    { id: '30x30', label: '30x30cm (표준 바닥)', desc: '가장 일반적인 욕실 바닥 크기', imageSrc: '/images/tiles/tile_30x30.jpg' },
    { id: '60x60', label: '60x60cm (대형)', desc: '거실 또는 넓은 욕실에 사용', imageSrc: '/images/tiles/tile_60x60.jpg' },
    { id: '30x60', label: '30x60cm (표준 벽)', desc: '가장 흔한 욕실 벽 타일 크기', imageSrc: '/images/tiles/tile_30x60.jpg' },
    { id: '20x20', label: '20x20cm (소형)', desc: '빈티지 또는 작은 욕실에 사용', imageSrc: '/images/tiles/tile_20x20.jpg' },
];

// =================================================================
// [1] 현장 유형 설정
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 아파트(입주 전)', multiplier: 1.0 },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];

// =================================================================
// [2] 재료 설정 (섹션 3)
// =================================================================
const MATERIALS = [
  { 
    id: 'poly', label: '폴리아스파틱', priceMod: 1.0, 
    description: '탄성과 광택이 우수하며 가성비가 좋습니다.',
    badge: '일반', badgeColor: 'bg-teal-100 text-teal-700'
  },
  { 
    id: 'kerapoxy', label: '에폭시(무광/무펄)', priceMod: 1.8, 
    description: '내구성이 뛰어나고 매트한 질감.',
    badge: '프리미엄', badgeColor: 'bg-orange-100 text-orange-600'
  },
];

// =================================================================
// [3] 줄눈 시공 구역 (섹션 4)
// =================================================================
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

// =================================================================
// [4] 실리콘 교체/리폼 구역 (섹션 5)
// =================================================================
const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '단독 8만 / 패키지시 5만' },
  { id: 'silicon_sink', label: '세면대+젠다이 교체', basePrice: 30000, icon: Eraser, unit: '개소', desc: '오염된 실리콘 제거 후 재시공' },
  { id: 'silicon_kitchen_line', label: '주방 실리콘오염방지', basePrice: 50000, icon: Eraser, unit: '구역', desc: '음식물 오염 방지' },
  { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: Sofa, unit: '구역', desc: '단독 40만 / 패키지시 35만' },
];

// =================================================================
// [5] 리뷰 이벤트 (섹션 6)
// =================================================================
const REVIEW_EVENTS = [
  { id: 'soomgo_review', label: '숨고 리뷰이벤트', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
  { id: 'karrot_review', label: '당근마켓 리뷰이벤트', discount: 10000, icon: Star, desc: '동네생활 후기 작성 약속' },
];

// =================================================================
// [6] FAQ 데이터
// =================================================================
const FAQ_ITEMS = [
    { question: "Q1. 시공 시간은 얼마나 걸리나요?", answer: "시공범위에 따라 다르지만, 평균적으로 4~6시간 정도 소요되고 있으며 범위/소재에 따라 최대 2일 시공이 걸리는 경우도 있습니다." },
    { question: "Q2. 줄눈 시공 후 바로 사용 가능한가요?", answer: "줄눈시공 후 폴리아스파틱은 6시간, 케라폭시는 2~3일, 스타라이크는 24시간 정도 양생기간이 필요합니다. 그 시간 동안은 물 사용을 자제해주시는 것이 가장 좋습니다." },
    { question: "Q3. 왜 줄눈 시공을 해야 하나요?", answer: "줄눈은 곰팡이와 물때가 끼는 것을 방지하고, 타일 틈새 오염을 막아 청소가 쉬워지며, 인테리어 효과까지 얻을 수 있는 필수 시공입니다." },
    { question: "Q4. A/S 기간 및 조건은 어떻게 되나요?", answer: "시공 후 폴리아스파틱은 2년, 에폭시는 5년의 A/S를 제공합니다. 단, 고객 부주의나 타일 문제로 인한 하자는 소액의 출장비가 발생할 수 있습니다." },
    { question: "Q5. 구축 아파트도 시공이 가능한가요?", answer: "네, 가능합니다. 기존 줄눈을 제거하는 그라인딩 작업이 추가로 필요하며, 현재 견적은 신축/구축 동일하게 적용됩니다." },
];

// =================================================================
// [7] Accordion 컴포넌트
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200">
            <button
                className="flex justify-between items-center w-full py-4 text-left font-bold text-gray-800 hover:bg-gray-50 transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm md:text-base pr-4">{question}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180 text-teal-600' : 'text-gray-500'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 py-3' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-gray-600 pl-4 pr-2 bg-gray-50 p-3 rounded-lg border-l-4 border-teal-500">{answer}</p>
            </div>
        </div>
    );
};


export default function GroutEstimatorApp() {
  const [housingType, setHousingType] = useState('new');
  const [material, setMaterial] = useState('poly');
  const [selectedTileSize, setSelectedTileSize] = useState(null); 
  
  const [polyOption, setPolyOption] = useState('pearl');
  const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
  
  const [quantities, setQuantities] = useState(
    [...SERVICE_AREAS, ...SILICON_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {})
  );
  
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [showModal, setShowModal] = useState(false);

  const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';
  
  // 캡처 기능을 위한 ref 설정
  const quoteRef = useRef(null); 

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const nextValue = Math.max(0, prev[id] + delta);
      const nextState = { ...prev, [id]: nextValue };

      // 벽 전체 선택 시 샤워부스/욕조 벽 선택 해제
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
            
            // 🌟 실리콘 항목 할증 제외 로직 (최신 요청 반영)
            const isSiliconArea = SILICON_AREAS.some(s => s.id === area.id);

            if (isSiliconArea && selectedMaterial.id === 'kerapoxy') {
                currentMod = 1.0; 
            }
            
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

  const generateQuoteText = () => {
    const housingLabel = HOUSING_TYPES.find(h => h.id === housingType).label;
    let materialLabel = MATERIALS.find(m => m.id === material).label;
    
    if (material === 'poly') materialLabel += ` (${polyOption === 'pearl' ? '펄' : '무펄'})`;
    else if (material === 'kerapoxy') materialLabel += ` (${epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})`;
    
    let text = `[줄눈의미학 견적 문의]\n\n`;
    text += `🏠 현장유형: ${housingLabel}\n`;
    
    // 타일 크기 정보 추가
    const tileLabel = TILE_SIZE_OPTIONS.find(opt => opt.id === selectedTileSize)?.label || "선택 안 함";
    text += `📏 타일 크기: ${tileLabel}\n`;
    
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
  
  // ✨ 견적서 모달 내용을 이미지로 캡처하는 함수
  const captureQuoteImage = async () => {
    if (quoteRef.current) {
        try {
            // html2canvas가 설치되어 있다면 이 코드가 작동합니다.
            const html2canvas = (await import('html2canvas')).default; 
            const canvas = await html2canvas(quoteRef.current, {
                scale: 2, // 고해상도 캡처
                logging: false,
                useCORS: true,
            });

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('견적서 이미지가 다운로드되었습니다!');
            
        } catch (error) {
            console.error('Image capture failed:', error);
            alert('이미지 캡처 라이브러리(html2canvas)가 설치되지 않았거나 오류가 발생했습니다. 터미널에 "npm install html2canvas"를 입력하여 설치해주세요.');
        }
    }
  };


  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans ${calculation.isPackageActive ? 'pb-48' : 'pb-28'}`}>
      {/* 스타일 주입 */}
      <GlobalStyles />

      <header className="bg-teal-600 text-white sticky top-0 z-20 shadow-md">
        <div className="p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="줄눈의미학"
              className="h-8 w-auto object-contain bg-white rounded-full" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {/* ✨ 헤더 문구: "줄눈의미학" */}
            <h1 className="text-xl font-bold">줄눈의미학</h1>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs bg-teal-700 px-2 py-1 rounded hover:bg-teal-800 transition">
            <RefreshCw size={12} className="inline mr-1" /> 초기화
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* --- 1. 현장 유형 섹션 --- */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Home className="h-5 w-5 text-teal-600" /> 1. 현장 유형을 선택하세요
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  housingType === type.id ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="font-bold text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* --- ✨ 2. 타일 크기 선택 섹션 (NEW MANUAL) --- */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Ruler className="h-5 w-5 text-blue-600" /> 2. 타일 크기를 선택하세요
          </h2>
          <p className="text-xs text-gray-500 mb-3">욕실 바닥 타일의 크기를 선택하면 보다 정확한 견적이 가능합니다.</p>
          <div className="grid grid-cols-2 gap-3">
            {TILE_SIZE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedTileSize(option.id)}
                className={`group flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  selectedTileSize === option.id ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {/* 시각적 예시 (IMG 태그로 변경) */}
                <div className="w-full h-16 rounded-md mb-2 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                        src={option.imageSrc} 
                        alt={`${option.label} 예시 사진`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        // 이미지 로드 실패 시 대체 텍스트 표시
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x64/f0f4f8/64748b?text=Image+Missing"; }}
                    />
                </div>

                <div className="font-bold text-sm">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* --- 3. 시공 재료 선택 --- */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Hammer className="h-5 w-5 text-teal-600" /> 3. 시공 재료 선택
          </h2>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <div onClick={() => setMaterial(item.id)} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${item.id === material ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className='flex items-center gap-3'>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${item.id === material ? 'border-teal-600' : 'border-gray-400'}`}>
                          {item.id === material && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                        </div>
                        <span className="font-bold text-gray-800">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                {item.id === 'poly' && item.id === material && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-teal-100 space-y-2 animate-slide-down">
                    <div className="text-xs font-bold text-teal-700 flex items-center gap-1"><Palette size={12} /> 펄 유무 선택</div>
                    <div className="flex gap-2">
                      <button onClick={() => setPolyOption('pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'pearl' ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>펄</button>
                      <button onClick={() => setPolyOption('no_pearl')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${polyOption === 'no_pearl' ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>무펄</button>
                    </div>
                  </div>
                )}
                {item.id === 'kerapoxy' && item.id === material && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-orange-100 space-y-2 animate-slide-down">
                    <div className="text-xs font-bold text-orange-700 flex items-center gap-1"><Crown size={12} /> 브랜드 선택</div>
                    <div className="flex gap-2">
                      <button onClick={() => setEpoxyOption('kerapoxy')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'kerapoxy' ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>케라폭시</button>
                      <button onClick={() => setEpoxyOption('starlike')} className={`flex-1 py-2 text-sm rounded-md border transition-all ${epoxyOption === 'starlike' ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>스타라이크</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- 4. 원하는 시공범위를 선택해주세요 --- */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Calculator className="h-5 w-5 text-teal-600" /> 4. 원하는 시공범위를 선택해주세요
          </h2>
          <div className="space-y-3">
            {SERVICE_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-teal-600"><Icon size={20} /></div>
                    <div>
                      <div className="font-bold text-gray-800">{area.label}</div>
                      <div className="text-xs text-gray-500">기본 {area.basePrice.toLocaleString()}원~{area.desc && <span className="block text-teal-600">{area.desc}</span>}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200">
                    <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-full transition ${quantities[area.id] > 0 ? 'text-teal-600 hover:bg-teal-50 font-bold text-lg' : 'text-gray-300'}`}>-</button>
                    <span className={`w-6 text-center font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{quantities[area.id]}</span>
                    <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-full font-bold text-lg">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 5. 실리콘 교체할 곳 선택 --- */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Eraser className="h-5 w-5 text-teal-600" /> 5. 실리콘 교체할 곳 선택
          </h2>
          <div className="space-y-3">
            {SILICON_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-teal-600"><Icon size={20} /></div>
                    <div>
                      <div className="font-bold text-gray-800">{area.label}</div>
                      <div className="text-xs text-gray-500">{area.basePrice.toLocaleString()}원{area.desc && <span className="block text-teal-600">{area.desc}</span>}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200">
                    <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-full transition ${quantities[area.id] > 0 ? 'text-teal-600 hover:bg-teal-50 font-bold text-lg' : 'text-gray-300'}`}>-</button>
                    <span className={`w-6 text-center font-bold ${quantities[area.id] > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{quantities[area.id]}</span>
                    <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-full font-bold text-lg">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 6. 할인 혜택 (리뷰 이벤트) --- */}
        <section className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3 text-indigo-900">
            <Gift className="h-5 w-5 text-indigo-600" /> 6. 할인 혜택 (리뷰 이벤트)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`p-3 rounded-lg border-2 transition-all relative overflow-hidden ${selectedReviews.has(evt.id) ? 'border-indigo-500 bg-white shadow-md ring-1 ring-indigo-500' : 'border-gray-200 bg-white/50 text-gray-500 hover:bg-white'}`}
              >
                {selectedReviews.has(evt.id) && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-bold">선택됨</div>}
                <div className="flex flex-col items-center text-center gap-1">
                  <span className={`font-bold text-sm ${selectedReviews.has(evt.id) ? 'text-indigo-900' : 'text-gray-600'}`}>{evt.label}</span>
                  <span className={`text-xs font-bold ${selectedReviews.has(evt.id) ? 'text-pink-600' : 'text-gray-400'}`}>-{evt.discount.toLocaleString()}원</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-indigo-400 mt-2 text-center">※ 중복 선택 가능합니다. 시공 완료 후 꼭 작성해주세요!</p>
        </section>
        
        
        {/* --- 자주 묻는 질문 (FAQ) --- */}
        <section className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-6">
            <h2 className="text-xl font-bold text-teal-700 mb-2 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-teal-600"/> 자주 묻는 질문
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
            className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-base hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Star size={20} fill="white" className="text-yellow-300" />
            숨고 후기 바로가기 (고객 만족도 확인)
          </button>
        </div>
      </main>

      {/* 하단 고정바 */}
      <>
        {calculation.isPackageActive && (
          <div className="fixed bottom-[90px] left-4 right-4 max-w-md mx-auto z-10 animate-bounce-up">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg shadow-lg">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-full flex-shrink-0 mt-1"><Gift className="w-5 h-5 text-yellow-300" /></div>
                <div className="text-xs flex-1">
                  <div className="font-bold text-yellow-300 mb-0.5">🎉 패키지 혜택 적용중!</div>
                  <div className="space-y-0.5">
                    {calculation.isFreeEntrance && <div>- 현관 바닥 서비스(폴리아스파틱)</div>}
                    <div>- 변기테두리, 바닥테두리</div>
                    <div>- 욕실 젠다이 실리콘 오염방지</div>
                    <div>- 주방 싱크볼</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-indigo-400/50 text-center">
                  <p className="text-[11px] font-bold text-yellow-300 bg-indigo-800/30 py-1 px-2 rounded">
                      🚨 견적은 바닥 30x30cm, 벽면 30x60cm 기준이며,<br/>
                      기준보다 작을 경우(조각타일 시공불가)
                  </p>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 safe-area-bottom z-20">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">총 예상 견적가</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-teal-600">{calculation.price.toLocaleString()}<span className="text-sm font-normal text-gray-500">원</span></div>
                {calculation.label && <div className="text-xs font-bold text-orange-500 mb-1 animate-pulse">{calculation.label}</div>}
              </div>
            </div>
            <button onClick={() => setShowModal(true)} disabled={!hasSelections} className={`px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all ${hasSelections ? 'bg-teal-600 hover:bg-teal-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}>견적서 보기</button>
          </div>
        </div>
      </>

      {/* 견적서 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            
            {/* ✨ Ref를 여기에 적용하여 캡처 대상을 지정 */}
            <div ref={quoteRef}> 
                <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />예상 견적서</h3>
                  <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">✕</button>
                </div>
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">현장 유형</span>
                      <span className="font-bold">{HOUSING_TYPES.find(h => h.id === housingType).label}</span>
                    </div>
                    
                    {/* 타일 크기 정보 */}
                    <div className="flex justify-between border-b pb-2 bg-blue-50 p-2 rounded">
                        <span className="text-blue-700 font-bold flex items-center gap-1"><Ruler size={16}/> 타일 크기</span>
                        <span className="font-bold text-blue-800">
                            {TILE_SIZE_OPTIONS.find(opt => opt.id === selectedTileSize)?.label || "선택 안 함"}
                        </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">시공 재료</span>
                      <span className="font-bold text-teal-600">
                        {MATERIALS.find(m => m.id === material).label}
                        {material === 'poly' && <span className="text-xs ml-1 text-gray-500">({polyOption === 'pearl' ? '펄' : '무펄'})</span>}
                        {material === 'kerapoxy' && <span className="text-xs ml-1 text-gray-500">({epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})</span>}
                      </span>
                    </div>
                    
                    <div className="space-y-2 border-b pb-4">
                      <p className="text-gray-500 text-xs mb-1 font-bold">📋 줄눈 시공 범위</p>
                      {SERVICE_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-gray-50 p-2 rounded"><span>{area.label} <span className="text-gray-400 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                    </div>

                    {SILICON_AREAS.some(area => quantities[area.id] > 0) && (
                      <div className="space-y-2 border-b pb-4">
                        <p className="text-gray-500 text-xs mb-1 font-bold">🧴 실리콘 교체 범위</p>
                        {SILICON_AREAS.map(area => {if (quantities[area.id] > 0) {return (<div key={area.id} className="flex justify-between items-center bg-orange-50 p-2 rounded border border-orange-100"><span>{area.label} <span className="text-gray-400 text-xs">x {quantities[area.id]}</span></span></div>);}return null;})}
                      </div>
                    )}

                    {calculation.discountAmount > 0 && (
                      <div className="space-y-2 border-b pb-4">
                        <p className="text-gray-500 text-xs mb-1 font-bold">🎁 할인 혜택</p>
                        {REVIEW_EVENTS.map(evt => {if (selectedReviews.has(evt.id)) {return (<div key={evt.id} className="flex justify-between items-center bg-indigo-50 p-2 rounded border border-indigo-100 text-indigo-800"><span>{evt.label}</span><span className="font-bold text-pink-600">-{evt.discount.toLocaleString()}원</span></div>);}return null;})}
                      </div>
                    )}

                    <div className="space-y-2 border-b pb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="text-red-700 text-xs mb-1 font-bold flex items-center gap-1">
                            <Info size={14} /> 추가 비용 발생 가능 요소
                        </p>
                        <ul className="list-disc list-outside text-xs text-gray-700 ml-4 space-y-1">
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
                        <div className="bg-indigo-50 p-3 rounded-lg mb-3 text-xs text-indigo-800 border border-indigo-100">
                          <div className="font-bold mb-1 flex items-center gap-1"><Gift size={14} /> 서비스 혜택 적용됨</div>
                          <ul className="list-disc list-inside text-indigo-600 space-y-0.5 pl-1">
                            {calculation.isFreeEntrance && <li>현관 바닥 (무료)</li>}
                            <li>변기테두리, 바닥테두리</li>
                            <li>욕실 젠다이 실리콘 오염방지</li>
                            <li>주방 싱크볼</li>
                          </ul>
                        </div>
                      )}
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-gray-800">총 예상 합계</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-teal-600">{calculation.price.toLocaleString()}원</span>
                          {calculation.label && <div className="text-xs text-orange-500 font-bold mt-1">{calculation.label}</div>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-right mt-1">VAT 별도 / 현장상황별 상이</p>
                    </div>
                  </div>
                </div>
            </div>
            {/* 버튼 섹션 */}
            <div className="p-4 bg-gray-50 grid grid-cols-3 gap-3">
               <button onClick={copyToClipboard} className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition text-xs"><Copy size={16} />견적 저장</button>
               <button onClick={captureQuoteImage} className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition text-xs"><ImageIcon size={16} />이미지로 저장</button>
               <button onClick={() => window.location.href = 'tel:010-7734-6709'} className="flex items-center justify-center gap-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-sm text-xs"><Phone size={16} />전화 연결</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}