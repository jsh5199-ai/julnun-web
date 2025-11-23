import React, { useState, useMemo } from 'react';
import { 
  Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid, 
  CheckCircle2, Info, Copy, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, ChevronDown, HelpCircle, X
} from 'lucide-react';

// =================================================================
// [스타일] 애니메이션 & 폰트 정의 (Pretendard 적용)
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    
    body { font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
    
    .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    
    /* 스크롤바 숨김 (깔끔함 유지) */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// =================================================================
// [데이터] (기존 로직 유지)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 입주', multiplier: 1.0, desc: '현재 공실 상태' },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0, desc: '백시멘트 제거 필요' },
];

const MATERIALS = [
  { 
    id: 'poly', label: '폴리아스파틱', priceMod: 1.0, 
    description: '탄성과 광택이 우수한 가성비 소재',
    badge: 'Standard', badgeColor: 'bg-teal-50 text-teal-700'
  },
  { 
    id: 'kerapoxy', label: '케라폭시/에폭시', priceMod: 1.8, 
    description: '반영구적 수명과 매트한 고급 질감',
    badge: 'Premium', badgeColor: 'bg-amber-50 text-amber-700'
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
    { question: "시공 시간은 얼마나 걸리나요?", answer: "평균 4~6시간 소요되며, 범위에 따라 1일 이상 소요될 수 있습니다." },
    { question: "물 사용은 언제부터 가능한가요?", answer: "폴리아스파틱은 6시간 후, 케라폭시는 24~48시간 양생이 필요합니다." },
    { question: "A/S 기간은 어떻게 되나요?", answer: "폴리아스파틱 2년, 케라폭시 5년 무상 A/S를 보증합니다. (고객과실 제외)" },
];

// =================================================================
// [컴포넌트] 아코디언 (심플 버전)
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left hover:bg-gray-50/50 transition px-2 rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[15px] ${isOpen ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{question}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-slate-500 pb-4 pl-2 leading-relaxed bg-gray-50/30 rounded-b-lg">{answer}</p>
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

  // --- 로직 (이전과 동일) ---
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

    // 패키지 로직
    if (selectedMaterial.id === 'poly' && qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
        total += 300000; q['bathroom_floor'] -= 2; q['entrance'] -= 1; isPackageActive = true; labelText = '30만원 패키지';
    } else if (selectedMaterial.id === 'kerapoxy' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        total += 750000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '에폭시 75만원 패키지';
    } else if (selectedMaterial.id === 'poly' && qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
        total += 500000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '50만원 패키지';
    } else if (selectedMaterial.id === 'kerapoxy') {
        if (qBathFloor >= 2 && qBathWallTotal >= 2) { total += 1300000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '프리미엄 풀패키지'; }
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { total += 950000; q['bathroom_floor'] -= 2; q['shower_booth'] -= 1; q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '프리미엄 패키지 A'; }
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { total += 750000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '프리미엄 패키지 B'; }
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
            
            // 할인 로직
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
    let text = `[줄눈의미학 상세 견적서]\n\n`;
    text += `■ 현장: ${HOUSING_TYPES.find(h => h.id === housingType).label}\n`;
    text += `■ 재료: ${MATERIALS.find(m => m.id === material).label} ${material === 'poly' ? (polyOption === 'pearl' ? '(펄)' : '(무광)') : (epoxyOption === 'kerapoxy' ? '(케라폭시)' : '(스타라이크)')}\n\n`;
    
    const allAreas = [...SERVICE_AREAS, ...SILICON_AREAS];
    const activeAreas = allAreas.filter(area => quantities[area.id] > 0);
    
    if (activeAreas.length > 0) {
        text += `[선택 시공]\n`;
        activeAreas.forEach(area => {
            let note = '';
            if (area.id === 'entrance' && calculation.isFreeEntrance) note = ' (서비스 Free)';
            text += `• ${area.label}: ${quantities[area.id]}${area.unit}${note}\n`;
        });
    }

    if (selectedReviews.size > 0) {
        text += `\n[할인 혜택]\n`;
        REVIEW_EVENTS.forEach(evt => { if (selectedReviews.has(evt.id)) text += `• ${evt.label}: -${evt.discount.toLocaleString()}원\n`; });
    }
    
    if (calculation.isPackageActive) {
        text += `\n[패키지 서비스]\n• 변기/바닥 테두리, 젠다이/싱크볼 서비스\n`;
    }

    text += `\n💰 총 견적: ${calculation.price.toLocaleString()}원`;
    if (calculation.label) text += ` (${calculation.label} 적용)`;
    text += `\n\n※ 사진 확인 후 정확한 최종 견적이 안내됩니다.`;
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateQuoteText()).then(() => alert("견적서가 복사되었습니다!")).catch(() => alert("복사 실패"));
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-32">
      <GlobalStyles />

      {/* 헤더: 투명하지만 스크롤시 블러 처리되는 모던 스타일 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="text-teal-500 fill-teal-500" size={18} />
            줄눈의미학
          </h1>
          <button onClick={() => window.location.reload()} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition flex items-center gap-1">
            <RefreshCw size={12} /> 초기화
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-6 space-y-8">
        
        {/* 1. 현장 유형: 카드형 버튼 */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 ml-1">STEP 01. 현장 확인</h2>
          <div className="grid grid-cols-2 gap-3">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`relative p-4 rounded-2xl text-left transition-all duration-300 ${
                  housingType === type.id 
                    ? 'bg-white shadow-[0_4px_12px_rgba(20,184,166,0.15)] ring-2 ring-teal-500 ring-offset-1' 
                    : 'bg-white shadow-sm hover:shadow-md border border-transparent'
                }`}
              >
                <div className={`text-lg mb-1 ${housingType === type.id ? 'text-teal-600' : 'text-slate-400'}`}>
                    {type.id === 'new' ? <Home /> : <Hammer />}
                </div>
                <div className={`font-bold ${housingType === type.id ? 'text-slate-800' : 'text-slate-500'}`}>{type.label}</div>
                <div className="text-[11px] text-slate-400 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. 재료 선택: 깔끔한 리스트형 */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 ml-1">STEP 02. 재료 선택</h2>
          <div className="space-y-3">
            {MATERIALS.map((item) => (
              <div key={item.id} 
                onClick={() => setMaterial(item.id)}
                className={`group p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  material === item.id 
                    ? 'bg-white border-teal-500 shadow-[0_4px_12px_rgba(20,184,166,0.1)]' 
                    : 'bg-white border-transparent shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold text-lg ${material === item.id ? 'text-slate-900' : 'text-slate-600'}`}>{item.label}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.description}</p>
                
                {/* 하위 옵션 (애니메이션 적용) */}
                <div className={`grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300 ${material === item.id ? 'max-h-20 opacity-100 mt-3 pt-3 border-t border-dashed border-slate-100' : 'max-h-0 opacity-0'}`}>
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`py-2 text-xs rounded-lg font-bold transition-colors ${polyOption === 'pearl' ? 'bg-teal-100 text-teal-700' : 'bg-slate-50 text-slate-400'}`}>✨ 펄(유광)</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`py-2 text-xs rounded-lg font-bold transition-colors ${polyOption === 'no_pearl' ? 'bg-teal-100 text-teal-700' : 'bg-slate-50 text-slate-400'}`}>☁️ 무펄(무광)</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`py-2 text-xs rounded-lg font-bold transition-colors ${epoxyOption === 'kerapoxy' ? 'bg-amber-100 text-amber-800' : 'bg-slate-50 text-slate-400'}`}>👑 케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`py-2 text-xs rounded-lg font-bold transition-colors ${epoxyOption === 'starlike' ? 'bg-amber-100 text-amber-800' : 'bg-slate-50 text-slate-400'}`}>🌟 스타라이크</button>
                        </>
                    )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 시공 범위: 모던한 카운터 UI */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 ml-1">STEP 03. 공간 선택</h2>
          <div className="bg-white rounded-3xl shadow-sm p-4 space-y-6">
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">줄눈 시공</h3>
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <area.icon size={16} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-700 text-sm">{area.label}</div>
                                <div className="text-[10px] text-slate-400">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${quantities[area.id] > 0 ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-slate-50 text-slate-300'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-teal-600' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} 
                                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-colors flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">실리콘 리폼</h3>
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                                <area.icon size={16} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-700 text-sm">{area.label}</div>
                                <div className="text-[10px] text-slate-400">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${quantities[area.id] > 0 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-50 text-slate-300'}`}>-</button>
                             <span className={`w-4 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-orange-600' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center">+</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* 4. 리뷰 이벤트: 티켓 디자인 */}
        <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 ml-1">할인 혜택</h2>
          <div className="grid grid-cols-2 gap-3">
            {REVIEW_EVENTS.map((evt) => (
              <div 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`relative overflow-hidden p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedReviews.has(evt.id) 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transform scale-[1.02]' 
                    : 'bg-white shadow-sm text-slate-500 hover:bg-gray-50'
                }`}
              >
                {selectedReviews.has(evt.id) && <div className="absolute top-0 right-0 bg-white/20 px-2 py-1 text-[9px] font-bold rounded-bl-lg">적용됨</div>}
                <div className="flex flex-col items-center gap-1">
                   <Gift size={20} className={selectedReviews.has(evt.id) ? 'text-yellow-300' : 'text-slate-300'} />
                   <span className="font-bold text-xs mt-1">{evt.label}</span>
                   <span className={`text-sm font-extrabold ${selectedReviews.has(evt.id) ? 'text-white' : 'text-slate-800'}`}>-{evt.discount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ 섹션 */}
        <section className="pt-4 pb-8">
            <h2 className="text-sm font-semibold text-slate-400 mb-3 ml-1 flex items-center gap-1"><HelpCircle size={14}/> 자주 묻는 질문</h2>
            <div className="bg-white rounded-2xl shadow-sm p-2">
                {FAQ_ITEMS.map((item, idx) => <Accordion key={idx} question={item.question} answer={item.answer} />)}
            </div>
        </section>

      </main>

      {/* --- 하단 플로팅 액션 --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        
        {/* 패키지 알림 배너 (플로팅) */}
        {calculation.isPackageActive && (
            <div className="absolute bottom-[90px] left-0 right-0 px-4 animate-slide-up">
                <div className="max-w-md mx-auto bg-slate-800/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 border border-slate-700">
                    <div className="bg-teal-500 p-2 rounded-full shadow-lg shadow-teal-500/30">
                        <Gift size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-teal-300 text-sm mb-1">🎉 {calculation.label || '특별 혜택'} 적용 중!</div>
                        <ul className="text-xs text-slate-300 space-y-0.5">
                            {calculation.isFreeEntrance && <li>• 현관 바닥 무료 시공</li>}
                            <li>• 변기 테두리, 바닥 테두리 서비스</li>
                            <li>• 욕실 젠다이/싱크볼 오염방지</li>
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {/* 최종 결제 바 */}
        <div className="bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 safe-area-bottom">
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                <div>
                    <div className="text-[10px] text-slate-400 font-medium mb-0.5">예상 견적금액</div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{calculation.price.toLocaleString()}</span>
                        <span className="text-sm font-bold text-slate-400 mb-1">원</span>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)} 
                    disabled={!hasSelections}
                    className={`h-12 px-6 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 ${hasSelections ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                    견적서 보기
                </button>
            </div>
        </div>
      </div>

      {/* --- 견적서 모달 (글래스모피즘) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
                <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center sticky top-0">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="text-teal-500" /> 견적서 확인
                    </h3>
                    <button onClick={() => setShowModal(false)} className="bg-white p-1 rounded-full text-slate-400 hover:text-slate-600 shadow-sm"><X size={18}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
                    {/* 정보 요약 */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">현장</span><span className="font-bold">{HOUSING_TYPES.find(h => h.id === housingType).label}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">재료</span><span className="font-bold text-teal-600">{MATERIALS.find(m => m.id === material).label}</span></div>
                    </div>
                    
                    <div className="border-t border-dashed border-slate-200 my-2"></div>

                    {/* 상세 내역 */}
                    <div className="space-y-2">
                        {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => (
                            <div key={area.id} className="flex justify-between text-sm items-center">
                                <span className="text-slate-700">{area.label} <span className="text-slate-400 text-xs">x{quantities[area.id]}</span></span>
                                <span className="font-medium text-slate-900">
                                    {area.id === 'entrance' && calculation.isFreeEntrance 
                                        ? <span className="text-teal-500 font-bold">Free</span> 
                                        : `${(area.basePrice * quantities[area.id]).toLocaleString()}원`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* 패키지/할인 */}
                    {(calculation.isPackageActive || calculation.discountAmount > 0) && (
                        <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
                             {calculation.isPackageActive && (
                                <div className="flex gap-2 text-teal-600 font-bold">
                                    <Gift size={14} /> <span>{calculation.label} 적용됨</span>
                                </div>
                             )}
                             {REVIEW_EVENTS.map(evt => selectedReviews.has(evt.id) && (
                                 <div key={evt.id} className="flex justify-between text-slate-500 pl-5">
                                     <span>{evt.label}</span>
                                     <span className="text-red-500">-{evt.discount.toLocaleString()}원</span>
                                 </div>
                             ))}
                        </div>
                    )}
                    
                    {/* 주의사항 */}
                    <div className="flex gap-2 bg-red-50 p-3 rounded-xl text-[11px] text-red-600 leading-snug">
                        <Info size={16} className="shrink-0" />
                        <p>타일 크기나 현장 오염도에 따라 추가 비용이 발생할 수 있습니다.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3 sticky bottom-0">
                    <button onClick={copyToClipboard} className="py-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-100 transition flex items-center justify-center gap-1"><Copy size={14}/> 견적 복사</button>
                    <button onClick={() => window.location.href = 'tel:010-0000-0000'} className="py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition flex items-center justify-center gap-1 shadow-lg shadow-teal-200"><Phone size={14}/> 전화 상담</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}