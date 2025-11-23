import React, { useState, useMemo } from 'react';
import { 
  Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  Check, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Gift, Eraser, Star, ChevronDown, ArrowRight, X, ShieldCheck
} from 'lucide-react';

// =================================================================
// [스타일] Modern Executive: High Contrast & Professional
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    
    body { 
        font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
        background-color: #FFFFFF;
        color: #0f172a; /* Slate-900: 깊은 네이비 블랙 */
    }
    
    /* 애니메이션: 빠르고 간결하게 */
    @keyframes fadeUp { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
    }
    .animate-enter { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* 그림자: 얕고 선명하게 (Sharp Shadow) */
    .shadow-sharp { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1); }
    .shadow-floating-bar { box-shadow: 0 -4px 20px -5px rgba(15, 23, 42, 0.1); }
  `}</style>
);

// =================================================================
// [데이터] (기존 로직 유지)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 입주', multiplier: 1.0, desc: '새로운 공간, 완벽한 시작' },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0, desc: '생활 오염 제거 및 리폼' },
];

const MATERIALS = [
  { 
    id: 'poly', label: 'Standard', subLabel: '폴리아스파틱', priceMod: 1.0, 
    description: '우수한 탄성과 광택, 합리적인 고기능성 소재',
    tags: ['가성비', '탄성우수'],
    badgeColor: 'bg-slate-100 text-slate-600'
  },
  { 
    id: 'kerapoxy', label: 'Premium', subLabel: '케라폭시/에폭시', priceMod: 1.8, 
    description: '매트한 질감과 반영구적 내구성, 호텔급 마감',
    tags: ['반영구', '무광매트'],
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100'
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
    { question: "시공 소요 시간은?", answer: "표준 시공 기준 평균 4~6시간 소요됩니다." },
    { question: "물 사용 가능 시간?", answer: "폴리 6시간, 케라폭시 24시간 경화 후 가능합니다." },
    { question: "A/S 보증 기간은?", answer: "폴리 2년, 케라폭시 5년 무상 보증을 제공합니다." },
];

// =================================================================
// [컴포넌트] Professional Accordion
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-200 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[15px] transition-colors ${isOpen ? 'font-bold text-slate-900' : 'font-medium text-slate-600 group-hover:text-slate-900'}`}>{question}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-700' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-slate-500 pb-4">{answer}</p>
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

  // --- 비즈니스 로직 (유지) ---
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
        else if (qBathFloor === 1) { total += 350000; q['bathroom_floor'] -= 1; labelText = '최소 시공'; }
    } else { 
      if (qBathFloor >= 2 && qBathWallTotal >= 2) { total += 700000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '풀패키지 할인'; }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { total += 380000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '실속 패키지'; }
      else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '현관 무료 혜택'; }
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
    let text = `[줄눈의미학 | 견적서]\n\n`;
    text += `■ 현장: ${HOUSING_TYPES.find(h => h.id === housingType).label}\n`;
    text += `■ 재료: ${MATERIALS.find(m => m.id === material).subLabel}\n`;
    
    const allAreas = [...SERVICE_AREAS, ...SILICON_AREAS];
    const activeAreas = allAreas.filter(area => quantities[area.id] > 0);
    
    if (activeAreas.length > 0) {
        text += `\n[선택 시공 내역]\n`;
        activeAreas.forEach(area => {
            let note = '';
            if (area.id === 'entrance' && calculation.isFreeEntrance) note = ' (Service)';
            text += `• ${area.label}: ${quantities[area.id]}${area.unit}${note}\n`;
        });
    }

    if (calculation.isPackageActive) text += `\n[패키지 혜택 적용]\n• 변기/바닥 테두리, 젠다이/싱크볼 서비스\n`;

    text += `\n총 견적: ${calculation.price.toLocaleString()}원`;
    text += `\n\n* 현장 상황에 따라 최종 견적은 변동될 수 있습니다.`;
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateQuoteText()).then(() => alert("견적서가 복사되었습니다.")).catch(() => alert("복사 실패"));
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className="min-h-screen pb-36 selection:bg-blue-900 selection:text-white">
      <GlobalStyles />

      {/* 헤더: 프로페셔널 & 미니멀 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
             <ShieldCheck size={22} className="text-blue-700" strokeWidth={2} />
             <span className="font-bold text-xl tracking-tight text-slate-900">줄눈의미학</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-md hover:bg-slate-100 transition text-slate-500">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-24 space-y-12">
        
        {/* STEP 1: 현장 유형 (고대비 선택) */}
        <section className="animate-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">현장 유형</h2>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">STEP 01</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`relative flex flex-col items-start p-5 rounded-xl transition-all duration-300 border ${
                  housingType === type.id 
                    ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div className={`mb-3 ${housingType === type.id ? 'text-blue-400' : 'text-slate-400'}`}>
                    {type.id === 'new' ? <Home size={22} strokeWidth={1.5} /> : <Hammer size={22} strokeWidth={1.5} />}
                </div>
                <div className="font-bold text-base mb-1">{type.label}</div>
                <div className={`text-xs ${housingType === type.id ? 'text-slate-300' : 'text-slate-500'}`}>{type.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: 재료 선택 (명확한 구분) */}
        <section className="animate-enter" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">시공 소재</h2>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">STEP 02</span>
          </div>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} 
                onClick={() => setMaterial(item.id)}
                className={`group relative overflow-hidden p-6 rounded-xl cursor-pointer transition-all duration-300 border ${
                  material === item.id 
                    ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{item.label}</span>
                            {material === item.id && <CheckCircle2 size={18} className="text-blue-400" />}
                        </div>
                        <span className={`text-sm font-medium ${material === item.id ? 'text-slate-300' : 'text-slate-500'}`}>{item.subLabel}</span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-semibold tracking-wider ${material === item.id ? 'bg-blue-900 text-blue-300' : item.badgeColor}`}>{item.tags[0]}</span>
                </div>
                <p className={`text-xs leading-relaxed ${material === item.id ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
                
                {/* 하위 옵션 (세련된 토글) */}
                <div className={`transition-all duration-300 ease-out ${material === item.id ? 'max-h-24 opacity-100 mt-5' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex gap-3">
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${polyOption === 'pearl' ? 'bg-white text-[#0f172a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>펄(유광)</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${polyOption === 'no_pearl' ? 'bg-white text-[#0f172a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>무펄(무광)</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${epoxyOption === 'kerapoxy' ? 'bg-white text-[#0f172a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${epoxyOption === 'starlike' ? 'bg-white text-[#0f172a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>스타라이크</button>
                        </>
                    )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEP 3: 공간 선택 (깔끔한 리스트 & 카운터) */}
        <section className="animate-enter" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">시공 구역</h2>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">STEP 03</span>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* 줄눈 섹션 */}
            <div className="p-5 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><LayoutGrid size={14}/> Grout Area</h3>
            </div>
            <div className="p-2">
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                <area.icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-slate-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-0.5">
                             <button onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-blue-700 hover:bg-blue-50' : 'text-slate-300'}`}>-</button>
                             <span className={`w-6 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-blue-900' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} 
                                className="w-8 h-8 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 실리콘 섹션 */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 border-t">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Eraser size={14}/> Silicon Reform</h3>
            </div>
            <div className="p-2">
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                                <area.icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-slate-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-0.5">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-orange-700 hover:bg-orange-50' : 'text-slate-300'}`}>-</button>
                             <span className={`w-6 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-orange-900' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* 할인 혜택 (단단한 버튼) */}
        <section className="animate-enter" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">프로모션</h2>
            <Gift size={20} className="text-blue-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 ${
                  selectedReviews.has(evt.id) 
                    ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1 mb-2">
                    <Star size={14} className={selectedReviews.has(evt.id) ? 'text-yellow-400' : 'text-slate-300'} fill={selectedReviews.has(evt.id) ? 'currentColor' : 'none'} />
                    <span className={`text-xs font-medium ${selectedReviews.has(evt.id) ? 'text-slate-300' : 'text-slate-500'}`}>{evt.label}</span>
                </div>
                <div className={`text-lg font-bold ${selectedReviews.has(evt.id) ? 'text-white' : 'text-slate-400'}`}>-{evt.discount.toLocaleString()}원</div>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-8">
             <h2 className="text-xl font-bold text-slate-900 mb-5">자주 묻는 질문</h2>
             <div className="bg-white rounded-xl border border-slate-200 px-4">
                {FAQ_ITEMS.map((item, idx) => <Accordion key={idx} question={item.question} answer={item.answer} />)}
             </div>
        </section>

      </main>

      {/* --- Floating Bottom Bar (Executive Style) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 pb-8 shadow-floating-bar">
        <div className="max-w-md mx-auto relative">
            {/* Toast Notification */}
            {calculation.isPackageActive && (
                <div className="absolute bottom-full left-0 right-0 mb-4 animate-enter">
                    <div className="bg-blue-900 text-white px-4 py-3 rounded-lg shadow-md flex items-center gap-3">
                        <div className="bg-blue-800 p-1.5 rounded-md"><Gift size={16} className="text-blue-200"/></div>
                        <div className="flex-1">
                            <span className="font-bold text-sm block">{calculation.label} 적용됨</span>
                            <span className="text-[11px] text-blue-200 opacity-80">서비스 시공이 포함되었습니다.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Action Button */}
            <button 
                onClick={() => setShowModal(true)} 
                disabled={!hasSelections}
                className={`w-full h-14 rounded-lg flex items-center justify-between px-6 transition-all ${
                    hasSelections 
                    ? 'bg-[#0f172a] text-white hover:bg-slate-800 shadow-sharp' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
                <div className="flex flex-col items-start">
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${hasSelections ? 'text-slate-400' : 'text-slate-400'}`}>Total Estimate</span>
                    <div className="text-lg font-bold flex items-baseline gap-1">
                        {calculation.price.toLocaleString()}
                        <span className="text-sm font-normal opacity-80">원</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                    견적서 확인 <ArrowRight size={18} />
                </div>
            </button>
        </div>
      </div>

      {/* --- Modal (Professional Clean) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-enter max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-700"/> 견적 상세 내역</h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition"><X size={24}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto no-scrollbar space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold mb-1">현장 유형</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1"><Home size={14} className="text-slate-400"/>{HOUSING_TYPES.find(h => h.id === housingType).label}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold mb-1">시공 소재</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1"><Sparkles size={14} className="text-blue-500"/>{MATERIALS.find(m => m.id === material).label}</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">선택 내역 <span className="text-xs font-normal text-slate-500">({[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).length}개)</span></h4>
                        <div className="space-y-2 border-t border-slate-100 pt-2">
                            {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => (
                                <div key={area.id} className="flex justify-between items-center text-sm py-2">
                                    <span className="text-slate-600 font-medium flex items-center gap-2">
                                        {area.id.startsWith('silicon') ? <Eraser size={14} className="text-orange-400"/> : <LayoutGrid size={14} className="text-blue-400"/>}
                                        {area.label} <span className="text-slate-400 text-xs">x{quantities[area.id]}</span>
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {area.id === 'entrance' && calculation.isFreeEntrance 
                                            ? <span className="text-blue-600">Service</span> 
                                            : `${(area.basePrice * quantities[area.id]).toLocaleString()}원`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(calculation.isPackageActive || calculation.discountAmount > 0) && (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm border border-blue-100">
                             {calculation.isPackageActive && (
                                <div className="flex justify-between text-blue-800 font-bold">
                                    <span className="flex items-center gap-1"><Gift size={14}/> {calculation.label}</span>
                                    <span>적용됨</span>
                                </div>
                             )}
                             {REVIEW_EVENTS.map(evt => selectedReviews.has(evt.id) && (
                                 <div key={evt.id} className="flex justify-between text-blue-700">
                                     <span className="flex items-center gap-1"><Star size={14}/> {evt.label}</span>
                                     <span>-{evt.discount.toLocaleString()}원</span>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-600 font-bold">최종 예상 견적</span>
                        <span className="text-2xl font-bold text-slate-900">{calculation.price.toLocaleString()}<span className="text-base text-slate-500 font-medium ml-1">원</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={copyToClipboard} className="py-3.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"><Copy size={16}/> 견적 복사</button>
                        <button onClick={() => window.location.href = 'tel:010-0000-0000'} className="py-3.5 rounded-lg bg-[#0f172a] text-white font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                            <Phone size={16} /> 전화 상담
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}