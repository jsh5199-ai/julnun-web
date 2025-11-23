import React, { useState, useMemo } from 'react';
import { 
  Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Gift, Eraser, Star, ChevronDown, ArrowRight, X
} from 'lucide-react';

// =================================================================
// [스타일] Dark Mode: Midnight Premium
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    
    body { 
        font-family: "Pretendard Variable", "Pretendard", -apple-system, sans-serif;
        background-color: #09090b; /* Zinc-950: 아주 깊은 어둠 */
        color: #f4f4f5; /* Zinc-100: 밝은 화이트 텍스트 */
    }
    
    /* 네온 글로우 효과 */
    .glow-effect { box-shadow: 0 0 20px -5px rgba(45, 212, 191, 0.3); }
    
    /* 애니메이션 */
    @keyframes fadeInScale { 
        from { opacity: 0; transform: scale(0.96) translateY(10px); } 
        to { opacity: 1; transform: scale(1) translateY(0); } 
    }
    .animate-card { animation: fadeInScale 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// =================================================================
// [데이터] (다크모드용 배지 컬러 수정)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 입주', multiplier: 1.0, desc: '새 집, 설레는 시작' },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0, desc: '오염 제거 및 리폼' },
];

const MATERIALS = [
  { 
    id: 'poly', label: 'Standard', subLabel: '폴리아스파틱', priceMod: 1.0, 
    description: '우수한 탄성과 광택, 가성비 최고의 선택',
    tags: ['가성비', '탄성우수'],
    badgeColor: 'bg-teal-900/50 text-teal-200 border border-teal-800'
  },
  { 
    id: 'kerapoxy', label: 'Premium', subLabel: '케라폭시/에폭시', priceMod: 1.8, 
    description: '호텔 같은 무광 매트 질감, 반영구적 수명',
    tags: ['반영구', '무광매트'],
    badgeColor: 'bg-amber-900/50 text-amber-200 border border-amber-800'
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
// [컴포넌트] Dark Accordion
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-zinc-800 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[15px] transition-colors ${isOpen ? 'font-bold text-teal-400' : 'font-medium text-zinc-400 group-hover:text-zinc-200'}`}>{question}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${isOpen ? 'rotate-180 text-teal-400' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-zinc-500 pb-4">{answer}</p>
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

  // --- Logic (Unchanged) ---
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

  // --- Text Gen ---
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
    <div className="min-h-screen pb-32 selection:bg-teal-500 selection:text-white">
      <GlobalStyles />

      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-teal-500 text-black p-1 rounded-md"><Sparkles size={14} fill="black"/></div>
             <span className="font-bold text-lg tracking-tight text-white">줄눈의미학</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-full hover:bg-zinc-800 transition">
            <RefreshCw size={18} className="text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-20 space-y-10">
        
        {/* STEP 1: 현장 유형 */}
        <section className="animate-card" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">어떤 현장인가요?</h2>
            <span className="text-[10px] font-bold text-zinc-500 border border-zinc-700 px-2 py-1 rounded-full">STEP 1</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`relative flex flex-col items-start p-5 rounded-[24px] transition-all duration-300 ${
                  housingType === type.id 
                    ? 'bg-zinc-800 border-2 border-teal-500 glow-effect' 
                    : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <div className={`mb-3 p-3 rounded-full ${housingType === type.id ? 'bg-teal-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    {type.id === 'new' ? <Home size={20} /> : <Hammer size={20} />}
                </div>
                <div className={`font-bold text-base ${housingType === type.id ? 'text-white' : 'text-zinc-400'}`}>{type.label}</div>
                <div className="text-xs text-zinc-500 mt-1 text-left leading-tight">{type.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: 재료 선택 */}
        <section className="animate-card" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">재료를 선택하세요</h2>
            <span className="text-[10px] font-bold text-zinc-500 border border-zinc-700 px-2 py-1 rounded-full">STEP 2</span>
          </div>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} 
                onClick={() => setMaterial(item.id)}
                className={`group relative overflow-hidden p-6 rounded-[28px] cursor-pointer transition-all duration-300 ${
                  material === item.id 
                    ? 'bg-zinc-800 border-2 border-teal-500 glow-effect' 
                    : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold text-lg ${material === item.id ? 'text-white' : 'text-zinc-400'}`}>{item.label}</span>
                            {material === item.id && <CheckCircle2 size={16} className="text-teal-400 fill-teal-400" />}
                        </div>
                        <span className="text-sm text-zinc-400 font-medium">{item.subLabel}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded-full font-bold border border-zinc-800">{tag}</span>
                        ))}
                    </div>
                </div>
                
                {/* 하위 옵션 */}
                <div className={`transition-all duration-300 ease-out ${material === item.id ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${polyOption === 'pearl' ? 'bg-teal-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>✨ 펄(유광)</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${polyOption === 'no_pearl' ? 'bg-teal-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>☁️ 무펄(무광)</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${epoxyOption === 'kerapoxy' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`flex-1 py-3 text-xs rounded-lg font-bold transition-all ${epoxyOption === 'starlike' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>스타라이크</button>
                        </>
                    )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEP 3: 공간 선택 */}
        <section className="animate-card" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">시공 공간</h2>
            <span className="text-[10px] font-bold text-zinc-500 border border-zinc-700 px-2 py-1 rounded-full">STEP 3</span>
          </div>
          
          <div className="bg-zinc-900 rounded-[32px] p-6 border border-zinc-800 space-y-8">
            {/* 줄눈 섹션 */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Grout Area</h3>
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-zinc-500 border border-zinc-800">
                                <area.icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="font-bold text-zinc-200 text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-zinc-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'bg-teal-500 text-black' : 'bg-zinc-800 text-zinc-600'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-teal-400' : 'text-zinc-600'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} 
                                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-teal-500 hover:text-black transition-all flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full h-px bg-zinc-800" />

            {/* 실리콘 섹션 */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Silicon Reform</h3>
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-zinc-500 border border-zinc-800">
                                <area.icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="font-bold text-zinc-200 text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-zinc-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-600'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-amber-500' : 'text-zinc-600'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* 할인 혜택 */}
        <section className="animate-card" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">할인 혜택</h2>
            <Gift size={20} className="text-teal-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`flex flex-col items-center justify-center p-5 rounded-[24px] border transition-all duration-300 ${
                  selectedReviews.has(evt.id) 
                    ? 'bg-zinc-800 border-teal-500/50 text-white shadow-lg' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                <div className="text-xs font-bold mb-1 opacity-70">{evt.label}</div>
                <div className={`text-lg font-bold ${selectedReviews.has(evt.id) ? 'text-teal-400' : 'text-zinc-600'}`}>-{evt.discount.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-8">
             <h2 className="text-xl font-bold text-white mb-4">자주 묻는 질문</h2>
             <div className="bg-zinc-900 rounded-[24px] p-4 border border-zinc-800">
                {FAQ_ITEMS.map((item, idx) => <Accordion key={idx} question={item.question} answer={item.answer} />)}
             </div>
        </section>

      </main>

      {/* --- Floating Bottom Bar --- */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        
        {/* Toast */}
        {calculation.isPackageActive && (
            <div className="absolute bottom-20 left-0 right-0 animate-card">
                <div className="bg-teal-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-700/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-teal-200 font-bold text-sm">🎉 {calculation.label} 적용</span>
                        <span className="text-[10px] text-teal-400/70">현관 무료 시공 등 혜택 포함</span>
                    </div>
                </div>
            </div>
        )}

        {/* Action Button */}
        <button 
            onClick={() => setShowModal(true)} 
            disabled={!hasSelections}
            className={`w-full h-16 rounded-[24px] shadow-2xl flex items-center justify-between px-6 transition-all transform active:scale-95 border ${
                hasSelections 
                ? 'bg-teal-500 text-black border-teal-400 hover:bg-teal-400' 
                : 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
            }`}
        >
            <div className="flex flex-col items-start">
                <span className={`text-[10px] font-medium ${hasSelections ? 'text-teal-900/60' : 'text-zinc-500'}`}>TOTAL ESTIMATE</span>
                <div className="text-xl font-bold flex items-baseline gap-1">
                    {calculation.price.toLocaleString()}
                    <span className={`text-sm font-normal ${hasSelections ? 'text-teal-900/60' : 'text-zinc-600'}`}>원</span>
                </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasSelections ? 'bg-black text-teal-500' : 'bg-zinc-900 text-zinc-700'}`}>
                <ArrowRight size={20} />
            </div>
        </button>
      </div>

      {/* --- Modal (Dark) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-[#18181b] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-card max-h-[90vh] flex flex-col border border-zinc-800">
                <div className="p-6 pb-2">
                    <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-2xl text-white">견적 내역</h3>
                        <button onClick={() => setShowModal(false)} className="bg-zinc-800 p-2 rounded-full text-zinc-400 hover:text-white"><X size={20}/></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                            <div className="p-2 bg-black rounded-xl border border-zinc-800"><Home size={20} className="text-zinc-400"/></div>
                            <div className="flex-1">
                                <div className="text-xs text-zinc-500 font-bold">TYPE</div>
                                <div className="font-bold text-zinc-200">{HOUSING_TYPES.find(h => h.id === housingType).label}</div>
                            </div>
                            <div className="flex-1 border-l pl-4 border-zinc-800">
                                <div className="text-xs text-zinc-500 font-bold">MATERIAL</div>
                                <div className="font-bold text-teal-400">{MATERIALS.find(m => m.id === material).label}</div>
                            </div>
                        </div>

                        <div className="max-h-[30vh] overflow-y-auto no-scrollbar space-y-3 py-2">
                            {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => (
                                <div key={area.id} className="flex justify-between items-center text-sm p-3 hover:bg-zinc-900 rounded-xl transition-colors border border-transparent hover:border-zinc-800">
                                    <span className="text-zinc-400 font-medium">{area.label} <span className="text-zinc-600 text-xs">x{quantities[area.id]}</span></span>
                                    <span className="font-bold text-zinc-200">
                                        {area.id === 'entrance' && calculation.isFreeEntrance 
                                            ? <span className="text-teal-400">Free</span> 
                                            : `${(area.basePrice * quantities[area.id]).toLocaleString()}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-zinc-900 border-t border-zinc-800 mt-auto">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-zinc-500 font-bold">총 합계</span>
                        <span className="text-3xl font-bold text-white">{calculation.price.toLocaleString()}<span className="text-lg text-zinc-600 ml-1">원</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={copyToClipboard} className="py-4 rounded-2xl bg-black border border-zinc-800 font-bold text-zinc-400 hover:bg-zinc-900 transition">견적 복사</button>
                        <button onClick={() => window.location.href = 'tel:010-0000-0000'} className="py-4 rounded-2xl bg-teal-500 text-black font-bold hover:bg-teal-400 transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
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