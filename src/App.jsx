import React, { useState, useMemo } from 'react';
import { 
  Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Gift, Eraser, Star, ChevronDown, ArrowRight, X, Trees
} from 'lucide-react';

// =================================================================
// [스타일] Modern Wood & Natural Theme
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    
    body { 
        font-family: "Pretendard Variable", "Pretendard", -apple-system, sans-serif;
        background-color: #FAFAF9; /* Stone-50: 따뜻한 크림 배경 */
        color: #44403C; /* Stone-700: 웜 그레이 텍스트 */
    }
    
    /* 애니메이션: 부드럽게 떠오르는 효과 */
    @keyframes slideUpFade { 
        from { opacity: 0; transform: translateY(15px); } 
        to { opacity: 1; transform: translateY(0); } 
    }
    .animate-enter { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* 우드톤 전용 그림자 (따뜻한 갈색 그림자) */
    .shadow-wood { box-shadow: 0 4px 20px -2px rgba(120, 53, 15, 0.08); }
    .shadow-floating { box-shadow: 0 10px 30px -5px rgba(69, 26, 3, 0.15); }
  `}</style>
);

// =================================================================
// [데이터] (기존 로직 및 데이터 100% 유지)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 입주', multiplier: 1.0, desc: '설레는 첫 입주' },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0, desc: '새집처럼 리폼' },
];

const MATERIALS = [
  { 
    id: 'poly', label: 'Standard', subLabel: '폴리아스파틱', priceMod: 1.0, 
    description: '탄성과 광택이 우수한 실속형 소재',
    tags: ['가성비', '탄성우수']
  },
  { 
    id: 'kerapoxy', label: 'Premium', subLabel: '케라폭시/에폭시', priceMod: 1.8, 
    description: '매트한 질감, 변색 없는 반영구 수명',
    tags: ['반영구', '무광매트']
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
    { question: "시공 소요 시간은?", answer: "평균 4~6시간 소요됩니다." },
    { question: "물 사용 가능 시간?", answer: "폴리 6시간, 케라폭시 24시간 후 가능합니다." },
    { question: "A/S 기간은?", answer: "폴리 2년, 케라폭시 5년 무상 보증합니다." },
];

// =================================================================
// [컴포넌트] Wood Style Accordion
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-[#E7E5E4] last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[15px] transition-colors ${isOpen ? 'font-bold text-[#78350F]' : 'font-medium text-[#78716C] group-hover:text-[#57534E]'}`}>{question}</span>
                <ChevronDown className={`w-4 h-4 text-[#A8A29E] transition-transform ${isOpen ? 'rotate-180 text-[#78350F]' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-[#78716C] pb-4 pl-1">{answer}</p>
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
        if (qBathFloor >= 2 && qBathWallTotal >= 2) { total += 1300000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '풀패키지 할인'; }
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { total += 950000; q['bathroom_floor'] -= 2; q['shower_booth'] -= 1; q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '패키지 A 할인'; }
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { total += 750000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '패키지 B 할인'; }
        else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '현관 무료'; }
        else if (qBathFloor === 1) { total += 350000; q['bathroom_floor'] -= 1; labelText = '최소 시공'; }
    } else { 
      if (qBathFloor >= 2 && qBathWallTotal >= 2) { total += 700000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '풀패키지 할인'; }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { total += 380000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '실속 패키지'; }
      else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '현관 무료'; }
      else if (qBathFloor === 1) { total += 200000; q['bathroom_floor'] -= 1; labelText = '최소 시공'; }
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

  // --- 텍스트 생성 ---
  const generateQuoteText = () => {
    let text = `[줄눈의미학 견적서]\n\n`;
    text += `■ 현장: ${HOUSING_TYPES.find(h => h.id === housingType).label}\n`;
    text += `■ 재료: ${MATERIALS.find(m => m.id === material).subLabel}\n`;
    
    const allAreas = [...SERVICE_AREAS, ...SILICON_AREAS];
    const activeAreas = allAreas.filter(area => quantities[area.id] > 0);
    
    if (activeAreas.length > 0) {
        text += `\n[선택 내역]\n`;
        activeAreas.forEach(area => {
            let note = '';
            if (area.id === 'entrance' && calculation.isFreeEntrance) note = ' (서비스)';
            text += `- ${area.label}: ${quantities[area.id]}${area.unit}${note}\n`;
        });
    }

    if (calculation.isPackageActive) text += `\n[🎁 패키지 적용됨]\n변기/바닥 테두리, 젠다이/싱크볼 서비스 포함\n`;

    text += `\n총 견적: ${calculation.price.toLocaleString()}원`;
    text += `\n\n* 실제 견적은 현장 상황에 따라 달라질 수 있습니다.`;
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateQuoteText()).then(() => alert("견적서가 복사되었습니다!")).catch(() => alert("복사 실패"));
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className="min-h-screen pb-32 font-sans selection:bg-[#78350F] selection:text-white">
      <GlobalStyles />

      {/* 헤더: 깨끗하고 내추럴한 상단 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="text-[#78350F]"><Trees size={18} strokeWidth={2.5} /></div>
             <span className="font-bold text-lg tracking-tight text-[#44403C]">줄눈의미학</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-full hover:bg-[#E7E5E4] transition text-[#78716C]">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-20 space-y-10">
        
        {/* STEP 1: 현장 유형 */}
        <section className="animate-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-[#A8A29E] border border-[#D6D3D1] px-2 py-0.5 rounded-full">01</span>
            <h2 className="text-lg font-bold text-[#44403C]">현장 확인</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`relative flex flex-col items-start p-5 rounded-[20px] transition-all duration-300 ${
                  housingType === type.id 
                    ? 'bg-white shadow-wood ring-2 ring-[#78350F]' 
                    : 'bg-white border border-[#E7E5E4] hover:bg-[#F5F5F4]'
                }`}
              >
                <div className={`mb-3 p-3 rounded-2xl ${housingType === type.id ? 'bg-[#78350F] text-white' : 'bg-[#F5F5F4] text-[#A8A29E]'}`}>
                    {type.id === 'new' ? <Home size={20} /> : <Hammer size={20} />}
                </div>
                <div className={`font-bold text-base ${housingType === type.id ? 'text-[#292524]' : 'text-[#78716C]'}`}>{type.label}</div>
                <div className="text-xs text-[#A8A29E] mt-1 text-left leading-tight">{type.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: 재료 선택 */}
        <section className="animate-enter" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-[#A8A29E] border border-[#D6D3D1] px-2 py-0.5 rounded-full">02</span>
            <h2 className="text-lg font-bold text-[#44403C]">재료 선택</h2>
          </div>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} 
                onClick={() => setMaterial(item.id)}
                className={`group relative overflow-hidden p-6 rounded-[24px] cursor-pointer transition-all duration-300 ${
                  material === item.id 
                    ? 'bg-white shadow-wood ring-2 ring-[#78350F]' 
                    : 'bg-white border border-[#E7E5E4] hover:bg-[#F5F5F4]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg text-[#292524]">{item.label}</span>
                            {material === item.id && <CheckCircle2 size={18} className="text-[#78350F] fill-[#78350F] text-white" />}
                        </div>
                        <span className="text-sm text-[#57534E] font-medium">{item.subLabel}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-[#F5F5F4] text-[#78716C] px-2 py-1 rounded-full font-bold">{tag}</span>
                        ))}
                    </div>
                </div>
                
                {/* 하위 옵션 (스르륵 열림) */}
                <div className={`transition-all duration-500 ease-out ${material === item.id ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex gap-2 p-1.5 bg-[#F5F5F4] rounded-xl">
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${polyOption === 'pearl' ? 'bg-white text-[#78350F] shadow-sm' : 'text-[#A8A29E] hover:text-[#78716C]'}`}>✨ 펄(유광)</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${polyOption === 'no_pearl' ? 'bg-white text-[#78350F] shadow-sm' : 'text-[#A8A29E] hover:text-[#78716C]'}`}>☁️ 무펄(무광)</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${epoxyOption === 'kerapoxy' ? 'bg-white text-[#78350F] shadow-sm' : 'text-[#A8A29E] hover:text-[#78716C]'}`}>케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${epoxyOption === 'starlike' ? 'bg-white text-[#78350F] shadow-sm' : 'text-[#A8A29E] hover:text-[#78716C]'}`}>스타라이크</button>
                        </>
                    )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEP 3: 공간 선택 */}
        <section className="animate-enter" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-[#A8A29E] border border-[#D6D3D1] px-2 py-0.5 rounded-full">03</span>
            <h2 className="text-lg font-bold text-[#44403C]">시공 공간</h2>
          </div>
          
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[#E7E5E4] space-y-8">
            {/* 줄눈 섹션 */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-[#A8A29E] uppercase tracking-widest pl-1 border-b border-[#F5F5F4] pb-2">Grout Area</h3>
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#FAFAF9] flex items-center justify-center text-[#A8A29E]">
                                <area.icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="font-bold text-[#44403C] text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-[#A8A29E] font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'bg-white border border-[#D6D3D1] text-[#78350F]' : 'bg-[#F5F5F4] text-[#D6D3D1]'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-[#78350F]' : 'text-[#D6D3D1]'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} 
                                className="w-8 h-8 rounded-full bg-[#78350F] text-white hover:bg-[#451a03] transition-all flex items-center justify-center shadow-sm">+</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 실리콘 섹션 */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-[#A8A29E] uppercase tracking-widest pl-1 border-b border-[#F5F5F4] pb-2">Silicon Reform</h3>
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#FAFAF9] flex items-center justify-center text-[#A8A29E]">
                                <area.icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="font-bold text-[#44403C] text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-[#A8A29E] font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'bg-white border border-[#D6D3D1] text-[#92400e]' : 'bg-[#F5F5F4] text-[#D6D3D1]'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-[#92400e]' : 'text-[#D6D3D1]'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 rounded-full bg-[#92400e] text-white hover:bg-[#78350f] transition-all flex items-center justify-center shadow-sm">+</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* 할인 혜택 */}
        <section className="animate-enter" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#44403C]">할인 혜택</h2>
            <Gift size={20} className="text-[#A8A29E]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`flex flex-col items-center justify-center p-5 rounded-[20px] border transition-all duration-300 ${
                  selectedReviews.has(evt.id) 
                    ? 'bg-[#292524] border-[#292524] text-[#FAFAF9] shadow-md' 
                    : 'bg-white border-[#E7E5E4] text-[#A8A29E] hover:border-[#D6D3D1]'
                }`}
              >
                <div className="text-xs font-medium mb-1 opacity-80">{evt.label}</div>
                <div className={`text-lg font-bold ${selectedReviews.has(evt.id) ? 'text-[#FDE68A]' : 'text-[#D6D3D1]'}`}>-{evt.discount.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-8">
             <h2 className="text-lg font-bold text-[#44403C] mb-4">자주 묻는 질문</h2>
             <div className="bg-white rounded-[24px] p-4 border border-[#E7E5E4]">
                {FAQ_ITEMS.map((item, idx) => <Accordion key={idx} question={item.question} answer={item.answer} />)}
             </div>
        </section>

      </main>

      {/* --- Floating Bottom Bar (Wood Style) --- */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        
        {/* Toast Notification */}
        {calculation.isPackageActive && (
            <div className="absolute bottom-20 left-0 right-0 animate-enter">
                <div className="bg-[#451a03]/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-floating flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[#FDE68A] font-bold text-sm">🎉 {calculation.label} 적용</span>
                        <span className="text-[10px] text-[#D6D3D1]">현관 무료 시공 등 혜택 포함</span>
                    </div>
                </div>
            </div>
        )}

        {/* Main Action Button */}
        <button 
            onClick={() => setShowModal(true)} 
            disabled={!hasSelections}
            className={`w-full h-16 rounded-[24px] shadow-floating flex items-center justify-between px-6 transition-all transform active:scale-95 ${
                hasSelections 
                ? 'bg-[#451a03] text-white hover:bg-[#292524]' 
                : 'bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed'
            }`}
        >
            <div className="flex flex-col items-start">
                <span className="text-[10px] opacity-70 font-medium tracking-wider">TOTAL ESTIMATE</span>
                <div className="text-xl font-bold flex items-baseline gap-1">
                    {calculation.price.toLocaleString()}
                    <span className="text-sm font-normal opacity-70">원</span>
                </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasSelections ? 'bg-[#78350F] text-white' : 'bg-[#D6D3D1] text-white'}`}>
                <ArrowRight size={20} />
            </div>
        </button>
      </div>

      {/* --- Modal (Warm Theme) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-[#292524]/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-[#FAFAF9] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-enter max-h-[90vh] flex flex-col">
                <div className="p-6 pb-2">
                    <div className="w-12 h-1 bg-[#D6D3D1] rounded-full mx-auto mb-6 sm:hidden" />
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-2xl text-[#44403C]">견적 내역</h3>
                        <button onClick={() => setShowModal(false)} className="bg-[#E7E5E4] p-2 rounded-full text-[#78716C] hover:bg-[#D6D3D1]"><X size={20}/></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#E7E5E4]">
                            <div className="p-2 bg-[#FAFAF9] rounded-xl"><Home size={20} className="text-[#78350F]"/></div>
                            <div className="flex-1">
                                <div className="text-xs text-[#A8A29E] font-bold">TYPE</div>
                                <div className="font-bold text-[#44403C]">{HOUSING_TYPES.find(h => h.id === housingType).label}</div>
                            </div>
                            <div className="flex-1 border-l pl-4 border-[#E7E5E4]">
                                <div className="text-xs text-[#A8A29E] font-bold">MATERIAL</div>
                                <div className="font-bold text-[#78350F]">{MATERIALS.find(m => m.id === material).label}</div>
                            </div>
                        </div>

                        <div className="max-h-[30vh] overflow-y-auto no-scrollbar space-y-3 py-2">
                            {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => (
                                <div key={area.id} className="flex justify-between items-center text-sm p-3 hover:bg-white rounded-xl transition-colors">
                                    <span className="text-[#57534E] font-medium">{area.label} <span className="text-[#A8A29E] text-xs">x{quantities[area.id]}</span></span>
                                    <span className="font-bold text-[#44403C]">
                                        {area.id === 'entrance' && calculation.isFreeEntrance 
                                            ? <span className="text-[#78350F]">Free</span> 
                                            : `${(area.basePrice * quantities[area.id]).toLocaleString()}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-[#E7E5E4] mt-auto">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[#78716C] font-bold">총 합계</span>
                        <span className="text-3xl font-bold text-[#451a03]">{calculation.price.toLocaleString()}<span className="text-lg text-[#A8A29E] ml-1">원</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={copyToClipboard} className="py-4 rounded-2xl bg-[#F5F5F4] border border-[#E7E5E4] font-bold text-[#57534E] hover:bg-[#E7E5E4] transition">견적 복사</button>
                        <button onClick={() => window.location.href = 'tel:010-0000-0000'} className="py-4 rounded-2xl bg-[#78350F] text-white font-bold hover:bg-[#451a03] transition shadow-lg flex items-center justify-center gap-2">
                            <Phone size={18} /> 전화 상담
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}