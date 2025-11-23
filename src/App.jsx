import React, { useState, useMemo } from 'react';
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, ChevronDown, HelpCircle, X, ShieldCheck
} from 'lucide-react';

// =================================================================
// [스타일] Warm & Modern 테마 정의
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    
    body { 
        font-family: "Pretendard Variable", "Pretendard", -apple-system, sans-serif;
        background-color: #F5F5F4; /* Stone-100: 따뜻한 배경색 */
        color: #44403C; /* Stone-700: 부드러운 검정 */
    }
    
    .font-serif-title { font-family: 'Times New Roman', serif; } /* 포인트용 세리프 */
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    .glass-panel {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// =================================================================
// [데이터] (로직 유지)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 입주', multiplier: 1.0, desc: '새로운 시작, 깨끗한 공간' },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0, desc: '생활의 흔적을 지우는 리폼' },
];

const MATERIALS = [
  { 
    id: 'poly', label: 'Standard Poly', subLabel: '폴리아스파틱', priceMod: 1.0, 
    description: '합리적인 가격과 우수한 탄성, 가성비 최고의 선택',
    badge: 'Standard', badgeColor: 'bg-stone-100 text-stone-600'
  },
  { 
    id: 'kerapoxy', label: 'Premium Epoxy', subLabel: '케라폭시/에폭시', priceMod: 1.8, 
    description: '매트한 질감과 반영구적인 수명, 호텔 욕실의 품격',
    badge: 'High-End', badgeColor: 'bg-[#0c4a45] text-white' 
  },
];

const SERVICE_AREAS = [
  { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소' },
  { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
  { id: 'shower_booth', label: '샤워부스 벽', basePrice: 150000, icon: Bath, unit: '구역' },
  { id: 'bathtub_wall', label: '욕조 벽', basePrice: 150000, icon: Bath, unit: '구역' },
  { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
  { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: Bath, unit: '구역' },
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 150000, icon: LayoutGrid, unit: '개소' },
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역' },
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역' },
];

const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리', basePrice: 80000, icon: Eraser, unit: '개소' },
  { id: 'silicon_sink', label: '세면대+젠다이', basePrice: 30000, icon: Eraser, unit: '개소' },
  { id: 'silicon_kitchen_line', label: '주방 라인', basePrice: 50000, icon: Eraser, unit: '구역' },
  { id: 'silicon_living_baseboard', label: '거실 걸레받이', basePrice: 400000, icon: Sofa, unit: '구역' },
];

const REVIEW_EVENTS = [
  { id: 'soomgo_review', label: '숨고 리뷰 약속', discount: 20000, icon: Star },
  { id: 'karrot_review', label: '당근마켓 후기', discount: 10000, icon: Star },
];

const FAQ_ITEMS = [
    { question: "시공 시간은 얼마나 걸리나요?", answer: "꼼꼼한 시공을 위해 평균 4~6시간이 소요됩니다." },
    { question: "물 사용은 언제부터 가능한가요?", answer: "폴리아스파틱은 6시간, 케라폭시는 24시간 이상의 양생이 필요합니다." },
    { question: "A/S 보증 기간은?", answer: "시공 품질에 대한 자신감으로 최대 2~5년의 무상 A/S를 보증합니다." },
];

// =================================================================
// [컴포넌트] 아코디언 (Clean Style)
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-stone-200 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left transition-colors hover:text-[#0f5132]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[15px] ${isOpen ? 'font-bold text-[#1c1917]' : 'font-medium text-[#57534e]'}`}>{question}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0f5132]' : 'text-stone-400'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-[#78716c] pb-4 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

// =================================================================
// [메인 앱]
// =================================================================
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

  // --- 비즈니스 로직 (수정 없음) ---
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

    const qBathFloor = q['bathroom_floor'] || 0;
    const qShower = q['shower_booth'] || 0;
    const qBathtub = q['bathtub_wall'] || 0;
    const qMasterWall = q['master_bath_wall'] || 0;
    const qCommonWall = q['common_bath_wall'] || 0;
    const qEntrance = q['entrance'] || 0;
    const qBathWallOne = (qMasterWall >= 1 || qCommonWall >= 1);
    const qBathWallTotal = qMasterWall + qCommonWall;

    if (selectedMaterial.id === 'poly' && qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
        total += 300000; q['bathroom_floor'] -= 2; q['entrance'] -= 1; isPackageActive = true; labelText = '30만원 패키지';
    } else if (selectedMaterial.id === 'kerapoxy' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        total += 750000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '에폭시 75만원 패키지';
    } else if (selectedMaterial.id === 'poly' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        total += 500000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '50만원 패키지';
    } else if (selectedMaterial.id === 'kerapoxy') {
        if (qBathFloor >= 2 && qBathWallTotal >= 2) { total += 1300000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = 'Premium 풀패키지'; }
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { total += 950000; q['bathroom_floor'] -= 2; q['shower_booth'] -= 1; q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = 'Premium 패키지 A'; }
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { total += 750000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = 'Premium 패키지 B'; }
        else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '현관 무료 혜택'; }
        else if (qBathFloor === 1) { total += 350000; q['bathroom_floor'] -= 1; labelText = 'Basic'; }
    } else { 
      if (qBathFloor >= 2 && qBathWallTotal >= 2) { total += 700000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '풀패키지 할인'; }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { total += 380000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '실속 패키지'; }
      else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '현관 무료 혜택'; }
      else if (qBathFloor === 1) { total += 200000; q['bathroom_floor'] -= 1; labelText = 'Basic'; }
    }

    [...SERVICE_AREAS, ...SILICON_AREAS].forEach(area => {
        const count = q[area.id] || 0;
        if (count > 0) {
            let price = area.basePrice * count * selectedMaterial.priceMod * selectedHousing.multiplier;
            if (area.id === 'entrance' && isFreeEntrance) return;
            if (area.id === 'living_room' && selectedMaterial.id === 'kerapoxy') price = area.basePrice * count * 2.0 * selectedHousing.multiplier;
            if (isPackageActive) {
                if (area.id === 'living_room') price -= (selectedMaterial.id === 'poly' ? 50000 : 150000) * count;
                else if (area.id === 'balcony_laundry' && selectedMaterial.id === 'poly') price = 100000 * count;
                else if (area.id === 'silicon_bathtub') price = 50000 * count;
                else if (area.id === 'silicon_living_baseboard') price = 350000 * count;
            }
            total += price;
        }
    });

    let discountAmount = 0;
    REVIEW_EVENTS.forEach(evt => { if (selectedReviews.has(evt.id)) discountAmount += evt.discount; });
    total -= discountAmount;

    return { price: Math.max(0, Math.floor(total / 1000) * 1000), label: labelText, isPackageActive, isFreeEntrance, discountAmount };
  }, [housingType, material, quantities, selectedReviews]);

  // --- 견적서 텍스트 생성 ---
  const generateQuoteText = () => {
    let text = `[줄눈의미학 | Premium Grout Service]\n\n`;
    text += `■ 공간: ${HOUSING_TYPES.find(h => h.id === housingType).label}\n`;
    text += `■ 소재: ${MATERIALS.find(m => m.id === material).subLabel} ${material === 'poly' ? (polyOption === 'pearl' ? '(펄)' : '(무광)') : (epoxyOption === 'kerapoxy' ? '(케라폭시)' : '(스타라이크)')}\n\n`;
    
    const allAreas = [...SERVICE_AREAS, ...SILICON_AREAS];
    const activeAreas = allAreas.filter(area => quantities[area.id] > 0);
    
    if (activeAreas.length > 0) {
        text += `[선택 시공 내역]\n`;
        activeAreas.forEach(area => {
            let note = '';
            if (area.id === 'entrance' && calculation.isFreeEntrance) note = ' (Service)';
            text += `• ${area.label}: ${quantities[area.id]}${area.unit}${note}\n`;
        });
    }
    
    if (calculation.isPackageActive) {
        text += `\n[패키지 서비스 혜택]\n• 변기/바닥 테두리, 젠다이/싱크볼 서비스\n`;
    }

    text += `\n총 견적: ${calculation.price.toLocaleString()}원`;
    if (calculation.label) text += ` (${calculation.label})`;
    text += `\n\n* 현장 상황에 따라 견적은 변동될 수 있습니다.`;
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateQuoteText()).then(() => alert("견적서가 복사되었습니다!")).catch(() => alert("복사 실패"));
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#44403C] pb-36">
      <GlobalStyles />

      {/* 헤더: Warm & Trustworthy */}
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-[#0c4a45] flex items-center justify-center text-white">
                 <Sparkles size={16} strokeWidth={2} />
             </div>
             <div>
                 <h1 className="text-lg font-bold tracking-tight text-[#1c1917]">줄눈의미학</h1>
             </div>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-full hover:bg-stone-100 transition text-[#78716c]">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-8 space-y-10">
        
        {/* 1. 현장 유형: Warm Card Style */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-bold text-[#A8A29E] mb-4 tracking-wide">STEP 01. 현장 확인</h2>
          <div className="flex gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`flex-1 p-5 rounded-2xl text-left transition-all duration-300 ${
                  housingType === type.id 
                    ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#0c4a45] ring-1 ring-[#0c4a45]/20' 
                    : 'bg-white shadow-sm border border-stone-100 hover:border-stone-300'
                }`}
              >
                <div className={`mb-2 ${housingType === type.id ? 'text-[#0c4a45]' : 'text-stone-300'}`}>
                    {type.id === 'new' ? <Home size={24} /> : <Hammer size={24} />}
                </div>
                <div className={`font-bold text-base ${housingType === type.id ? 'text-[#1c1917]' : 'text-stone-500'}`}>{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. 재료 선택: Magazine List Style */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-bold text-[#A8A29E] mb-4 tracking-wide">STEP 02. 소재 선택</h2>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} 
                onClick={() => setMaterial(item.id)}
                className={`relative overflow-hidden p-6 rounded-2xl cursor-pointer transition-all duration-300 bg-white ${
                  material === item.id 
                    ? 'shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-[#0c4a45] border-transparent' 
                    : 'border border-stone-100 hover:border-stone-200'
                }`}
              >
                {material === item.id && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0c4a45]" />}
                
                <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                        <span className={`block font-serif-title text-xl mb-1 ${material === item.id ? 'text-[#0c4a45] font-bold' : 'text-stone-400'}`}>{item.label}</span>
                        <span className="text-sm font-medium text-[#57534e]">{item.subLabel}</span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wider ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-xs text-[#78716c] leading-relaxed pl-2 mb-4">{item.description}</p>
                
                {/* 세부 옵션: 부드러운 버튼 */}
                <div className={`transition-all duration-500 ease-in-out pl-2 ${material === item.id ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex gap-2">
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`px-4 py-2 text-xs rounded-lg transition-colors ${polyOption === 'pearl' ? 'bg-[#0c4a45] text-white' : 'bg-stone-100 text-stone-500'}`}>펄 (유광)</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`px-4 py-2 text-xs rounded-lg transition-colors ${polyOption === 'no_pearl' ? 'bg-[#0c4a45] text-white' : 'bg-stone-100 text-stone-500'}`}>무펄 (무광)</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`px-4 py-2 text-xs rounded-lg transition-colors ${epoxyOption === 'kerapoxy' ? 'bg-[#0c4a45] text-white' : 'bg-stone-100 text-stone-500'}`}>케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`px-4 py-2 text-xs rounded-lg transition-colors ${epoxyOption === 'starlike' ? 'bg-[#0c4a45] text-white' : 'bg-stone-100 text-stone-500'}`}>스타라이크</button>
                        </>
                    )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 시공 범위: Clean List */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-sm font-bold text-[#A8A29E] mb-4 tracking-wide">STEP 03. 공간 구성</h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-8">
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <LayoutGrid size={16} className="text-[#0c4a45]"/>
                    <h3 className="text-sm font-bold text-[#1c1917]">줄눈 시공</h3>
                </div>
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between group">
                        <div className="flex flex-col">
                            <span className="font-medium text-[#44403C] text-[15px]">{area.label}</span>
                            <span className="text-[11px] text-[#A8A29E]">{area.basePrice.toLocaleString()}원~</span>
                        </div>
                        <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1">
                             <button onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${quantities[area.id] > 0 ? 'bg-white shadow-sm text-[#0c4a45]' : 'text-stone-300'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-[#0c4a45]' : 'text-stone-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} 
                                className="w-7 h-7 rounded-md bg-white shadow-sm text-[#0c4a45] flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <Eraser size={16} className="text-[#92400e]"/>
                    <h3 className="text-sm font-bold text-[#1c1917]">실리콘 리폼</h3>
                </div>
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-medium text-[#44403C] text-[15px]">{area.label}</span>
                            <span className="text-[11px] text-[#A8A29E]">{area.basePrice.toLocaleString()}원~</span>
                        </div>
                        <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${quantities[area.id] > 0 ? 'bg-white shadow-sm text-[#92400e]' : 'text-stone-300'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-[#92400e]' : 'text-stone-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-7 h-7 rounded-md bg-white shadow-sm text-[#92400e] flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* 4. 혜택: Elegant Badge Style */}
        <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-sm font-bold text-[#A8A29E] mb-4 tracking-wide">할인 혜택</h2>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  selectedReviews.has(evt.id) 
                    ? 'bg-[#1c1917] border-[#1c1917] text-[#FAFAF9]' 
                    : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'
                }`}
              >
                <div className="text-xs font-medium mb-1">{evt.label}</div>
                <div className={`text-lg font-bold ${selectedReviews.has(evt.id) ? 'text-[#fbbf24]' : 'text-stone-300'}`}>-{evt.discount.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ: Clean Accordion */}
        <section className="pb-8">
             <h2 className="text-sm font-bold text-[#A8A29E] mb-4 tracking-wide flex items-center gap-2"><HelpCircle size={14}/> 시공 가이드</h2>
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                {FAQ_ITEMS.map((item, idx) => <Accordion key={idx} question={item.question} answer={item.answer} />)}
             </div>
        </section>

      </main>

      {/* --- 하단 액션 바 (Floating) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        
        {/* 패키지 적용 알림 (Toast Style) */}
        {calculation.isPackageActive && (
            <div className="absolute bottom-24 left-6 right-6 animate-slide-up">
                <div className="bg-[#1c1917]/95 backdrop-blur text-[#FAFAF9] p-4 rounded-xl shadow-2xl flex items-center justify-between border border-stone-700">
                    <div className="flex flex-col">
                        <span className="text-[#fbbf24] font-bold text-sm flex items-center gap-1"><Gift size={14}/> {calculation.label || '특별 혜택'} 적용</span>
                        <span className="text-[11px] text-stone-400 mt-0.5">현관 무료 / 서비스 시공 포함</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-[#333] flex items-center justify-center">
                        <ShieldCheck size={16} className="text-[#fbbf24]" />
                    </div>
                </div>
            </div>
        )}

        {/* 결제 버튼 영역 */}
        <div className="bg-white border-t border-stone-100 p-5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-area-bottom">
            <div className="max-w-md mx-auto flex items-center justify-between gap-6">
                <div className="flex flex-col">
                    <span className="text-[11px] text-stone-400 font-medium">예상 견적가</span>
                    <span className="text-2xl font-serif-title font-bold text-[#1c1917] tracking-tight">{calculation.price.toLocaleString()}<span className="text-sm font-sans text-stone-400 ml-1">원</span></span>
                </div>
                <button 
                    onClick={() => setShowModal(true)} 
                    disabled={!hasSelections}
                    className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg ${hasSelections ? 'bg-[#0c4a45] text-white hover:bg-[#0a3f3b] shadow-[#0c4a45]/20' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                >
                    견적서 확인하기
                </button>
            </div>
        </div>
      </div>

      {/* --- 견적서 모달 (Warm Theme) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1917]/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#FAFAF9] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
                <div className="bg-white p-5 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-[#1c1917]">견적 내역서</h3>
                    <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-3">
                            <span className="text-stone-500">현장 유형</span>
                            <span className="font-bold text-[#1c1917]">{HOUSING_TYPES.find(h => h.id === housingType).label}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-stone-200 pb-3">
                            <span className="text-stone-500">시공 소재</span>
                            <span className="font-bold text-[#0c4a45]">{MATERIALS.find(m => m.id === material).label}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Selected Areas</p>
                        {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => (
                            <div key={area.id} className="flex justify-between text-sm items-center">
                                <span className="text-[#44403C]">{area.label} <span className="text-stone-400 text-xs">x{quantities[area.id]}</span></span>
                                <span className="font-medium text-[#1c1917]">
                                    {area.id === 'entrance' && calculation.isFreeEntrance 
                                        ? <span className="text-[#0c4a45] font-bold">Service</span> 
                                        : `${(area.basePrice * quantities[area.id]).toLocaleString()}원`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {(calculation.isPackageActive || calculation.discountAmount > 0) && (
                        <div className="bg-[#E7E5E4]/50 p-4 rounded-xl space-y-2 text-xs">
                             {calculation.isPackageActive && (
                                <div className="flex justify-between text-[#0c4a45] font-bold">
                                    <span>패키지 적용</span>
                                    <span>{calculation.label}</span>
                                </div>
                             )}
                             {REVIEW_EVENTS.map(evt => selectedReviews.has(evt.id) && (
                                 <div key={evt.id} className="flex justify-between text-stone-500">
                                     <span>{evt.label}</span>
                                     <span className="text-[#b91c1c]">-{evt.discount.toLocaleString()}원</span>
                                 </div>
                             ))}
                        </div>
                    )}
                    
                    <div className="bg-[#fff1f2] p-3 rounded-lg flex gap-2 items-start">
                        <Info size={14} className="text-[#e11d48] mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[#e11d48] leading-snug">현장 상태(오염도, 타일 크기 등)에 따라 추가 비용이 발생할 수 있습니다.</p>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-stone-100 grid grid-cols-2 gap-3">
                    <button onClick={copyToClipboard} className="py-3.5 rounded-xl bg-stone-100 text-stone-600 font-bold text-sm hover:bg-stone-200 transition">견적 복사</button>
                    <button onClick={() => window.location.href = 'tel:010-0000-0000'} className="py-3.5 rounded-xl bg-[#0c4a45] text-white font-bold text-sm hover:bg-[#0a3f3b] transition shadow-lg shadow-[#0c4a45]/20">전화 상담</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}