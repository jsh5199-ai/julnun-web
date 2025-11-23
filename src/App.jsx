import React, { useState, useMemo } from 'react';

// =================================================================
// [0] 아이콘 시스템 (오류 방지용 자체 SVG)
// =================================================================
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    hammer: <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0-3L12 9m3.5-3.5L21 11l-9 9-5-5" />,
    check: <polyline points="20 6 9 17 4 12" />,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    arrowRight: (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    ),
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    refresh: (
      <>
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
        <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </>
    ),
    gift: (
      <>
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </>
    ),
    sparkles: <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />,
    bath: (
      <>
        <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-1.5C3.805 1.285 2 2.375 2 4.5c0 3.5 2.5 5 2.5 5" />
        <path d="M10 5.5v3" />
        <path d="M7.5 10h12" />
        <path d="M5.5 13h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
      </>
    ),
    eraser: (
      <>
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
      </>
    ),
    layout: (
      <>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </>
    ),
    door: (
      <>
        <path d="M13 4h3a2 2 0 0 1 2 2v14" />
        <path d="M2 20h3" />
        <path d="M13 20h9" />
        <path d="M10 12v.01" />
        <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4.485-1.121A2 2 0 0 1 13 4.562Z" />
      </>
    ),
    utensils: (
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};

// =================================================================
// [1] 스타일 정의: Navy & White Theme (요청 반영)
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    
    body { 
        font-family: "Pretendard Variable", "Pretendard", sans-serif;
        background-color: #FFFFFF;
        color: #1e3a8a; /* Navy-900: 메인 텍스트 컬러도 네이비 계열로 통일 */
        margin: 0;
        padding: 0;
    }
    
    /* 애니메이션 */
    @keyframes fadeUp { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
    }
    .animate-enter { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* 그림자 & 효과 */
    .shadow-card { box-shadow: 0 4px 12px rgba(30, 58, 138, 0.08); }
    .shadow-float { box-shadow: 0 10px 40px -10px rgba(30, 58, 138, 0.2); }
    .shadow-sharp { box-shadow: 0 0 0 1px rgba(30, 58, 138, 0.05), 0 2px 4px rgba(30, 58, 138, 0.1); }
  `}</style>
);

// =================================================================
// [2] 데이터 (문구 수정 반영)
// =================================================================
const HOUSING_TYPES = [
  { id: 'new', label: '신축 입주', multiplier: 1.0, icon: 'home' },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0, icon: 'hammer' },
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
    badgeColor: 'bg-blue-50 text-blue-700'
  },
];

const SERVICE_AREAS = [
  { id: 'entrance', label: '현관', basePrice: 50000, icon: 'door', unit: '개소' },
  { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: 'bath', unit: '개소' },
  { id: 'shower_booth', label: '샤워부스 벽', basePrice: 150000, icon: 'bath', unit: '구역' },
  { id: 'bathtub_wall', label: '욕조 벽', basePrice: 150000, icon: 'bath', unit: '구역' },
  { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: 'bath', unit: '구역' },
  { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: 'bath', unit: '구역' },
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 150000, icon: 'layout', unit: '개소' },
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: 'utensils', unit: '구역' },
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: 'home', unit: '구역' },
];

const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리', basePrice: 80000, icon: 'eraser', unit: '개소' },
  { id: 'silicon_sink', label: '세면대+젠다이', basePrice: 30000, icon: 'eraser', unit: '개소' },
  { id: 'silicon_kitchen_line', label: '주방 라인', basePrice: 50000, icon: 'eraser', unit: '구역' },
  { id: 'silicon_living_baseboard', label: '거실 걸레받이', basePrice: 400000, icon: 'eraser', unit: '구역' },
];

const REVIEW_EVENTS = [
  { id: 'soomgo_review', label: '숨고 리뷰 약속', discount: 20000, icon: 'star' },
  { id: 'karrot_review', label: '당근마켓 후기', discount: 10000, icon: 'star' },
];

const FAQ_ITEMS = [
    { question: "시공 소요 시간은?", answer: "표준 시공 기준 평균 4~6시간 소요됩니다." },
    { question: "물 사용 가능 시간?", answer: "폴리 6시간, 케라폭시 24시간 경화 후 가능합니다." },
    { question: "A/S 보증 기간은?", answer: "폴리 2년, 케라폭시 5년 무상 보증을 제공합니다." },
];

// =================================================================
// [3] 컴포넌트: Accordion
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[15px] transition-colors ${isOpen ? 'font-bold text-[#1e3a8a]' : 'font-medium text-slate-600 group-hover:text-[#1e3a8a]'}`}>{question}</span>
                <Icon name="chevronDown" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} size={16} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-slate-500 pb-4">{answer}</p>
            </div>
        </div>
    );
};

// =================================================================
// [4] 메인 앱
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

  // --- 비즈니스 로직 ---
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
        text += `\n[선택 내역]\n`;
        activeAreas.forEach(area => {
            let note = '';
            if (area.id === 'entrance' && calculation.isFreeEntrance) note = ' (Service)';
            text += `• ${area.label}: ${quantities[area.id]}${area.unit}${note}\n`;
        });
    }

    if (calculation.isPackageActive) text += `\n[패키지 적용]\n• 변기/바닥 테두리, 젠다이/싱크볼 서비스\n`;
    text += `\n총 견적: ${calculation.price.toLocaleString()}원`;
    text += `\n\n* 현장 상황에 따라 최종 견적은 변동될 수 있습니다.`;
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateQuoteText()).then(() => alert("견적서가 복사되었습니다.")).catch(() => alert("복사 실패"));
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);

  return (
    <div className="min-h-screen pb-40 selection:bg-[#1e3a8a] selection:text-white bg-white">
      <GlobalStyles />

      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-[#1e3a8a] text-white p-1 rounded-md"><Icon name="shield" size={16} /></div>
             <span className="font-bold text-lg tracking-tight text-[#1e3a8a]">줄눈의미학</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-md hover:bg-slate-50 transition text-slate-500">
            <Icon name="refresh" size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-24 space-y-10">
        
        {/* STEP 1: 현장 유형 */}
        <section className="animate-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">현장 유형</h2>
            <span className="text-[10px] font-bold text-[#1e3a8a] bg-blue-50 px-2.5 py-1 rounded-full">STEP 01</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`flex flex-col items-start p-5 rounded-xl transition-all duration-200 border ${
                  housingType === type.id 
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div className={`mb-3 ${housingType === type.id ? 'text-white' : 'text-slate-400'}`}>
                    <Icon name={type.icon} size={22} />
                </div>
                <div className="font-bold text-base mb-1">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: 재료 선택 */}
        <section className="animate-enter" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">시공 소재</h2>
            <span className="text-[10px] font-bold text-[#1e3a8a] bg-blue-50 px-2.5 py-1 rounded-full">STEP 02</span>
          </div>
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} 
                onClick={() => setMaterial(item.id)}
                className={`group relative overflow-hidden p-6 rounded-xl cursor-pointer transition-all duration-200 border ${
                  material === item.id 
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{item.label}</span>
                            {material === item.id && <Icon name="check" size={18} className="text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${material === item.id ? 'text-slate-200' : 'text-slate-500'}`}>{item.subLabel}</span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wider ${material === item.id ? 'bg-[#172554] text-blue-200' : item.badgeColor}`}>{item.tags[0]}</span>
                </div>
                <p className={`text-xs leading-relaxed ${material === item.id ? 'text-slate-300' : 'text-slate-500'}`}>{item.description}</p>
                
                {/* 하위 옵션 */}
                <div className={`transition-all duration-300 ease-out ${material === item.id ? 'max-h-24 opacity-100 mt-5' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex gap-3">
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${polyOption === 'pearl' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-[#172554] text-slate-300 border-[#172554] hover:bg-[#1e40af]'}`}>펄</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${polyOption === 'no_pearl' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-[#172554] text-slate-300 border-[#172554] hover:bg-[#1e40af]'}`}>무펄</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${epoxyOption === 'kerapoxy' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-[#172554] text-slate-300 border-[#172554] hover:bg-[#1e40af]'}`}>케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`flex-1 py-2.5 text-xs rounded-lg font-bold transition-all border ${epoxyOption === 'starlike' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-[#172554] text-slate-300 border-[#172554] hover:bg-[#1e40af]'}`}>스타라이크</button>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">시공 구역</h2>
            <span className="text-[10px] font-bold text-[#1e3a8a] bg-blue-50 px-2.5 py-1 rounded-full">STEP 03</span>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Icon name="layout" size={14}/> 줄눈 시공 범위</h3>
            </div>
            <div className="p-2">
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-blue-100 text-[#1e3a8a]' : 'bg-slate-100 text-slate-400'}`}>
                                <Icon name={area.icon} size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-slate-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-0.5">
                             <button onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-[#1e3a8a] hover:bg-blue-50' : 'text-slate-300'}`}><Icon name="x" size={12} className="rotate-45" /></button>
                             <span className={`w-6 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-[#1e3a8a]' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} 
                                className="w-8 h-8 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"><Icon name="x" size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 border-t">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Icon name="eraser" size={14}/> 실리콘 오염방지/리폼</h3>
            </div>
            <div className="p-2">
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                                <Icon name={area.icon} size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-[15px]">{area.label}</div>
                                <div className="text-[11px] text-slate-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-0.5">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-orange-700 hover:bg-orange-50' : 'text-slate-300'}`}><Icon name="x" size={12} className="rotate-45" /></button>
                             <span className={`w-6 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-orange-900' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-8 h-8 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"><Icon name="x" size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* 할인 혜택 */}
        <section className="animate-enter" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">프로모션</h2>
            <Icon name="gift" size={20} className="text-[#1e3a8a]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 ${
                  selectedReviews.has(evt.id) 
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1 mb-2">
                    <Icon name="star" size={14} className={selectedReviews.has(evt.id) ? 'text-yellow-400' : 'text-slate-300'} />
                    <span className={`text-xs font-medium ${selectedReviews.has(evt.id) ? 'text-slate-300' : 'text-slate-500'}`}>{evt.label}</span>
                </div>
                <div className={`text-lg font-bold ${selectedReviews.has(evt.id) ? 'text-white' : 'text-slate-400'}`}>-{evt.discount.toLocaleString()}원</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-rose-500 font-bold mt-3">※ 서비스 이용 후 꼭! 작성해주세요</p>
        </section>

        {/* FAQ */}
        <section className="pb-8">
             <h2 className="text-xl font-bold text-[#1e3a8a] mb-5">자주 묻는 질문</h2>
             <div className="bg-white rounded-xl border border-slate-200 px-4">
                {FAQ_ITEMS.map((item, idx) => <Accordion key={idx} question={item.question} answer={item.answer} />)}
             </div>
        </section>

      </main>

      {/* --- Floating Bottom Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 pb-8 shadow-float">
        <div className="max-w-md mx-auto relative">
            {/* Toast */}
            {calculation.isPackageActive && (
                <div className="absolute bottom-full left-0 right-0 mb-4 animate-enter">
                    <div className="bg-[#1e3a8a] text-white px-4 py-3 rounded-lg shadow-md flex items-center gap-3">
                        <div className="bg-[#172554] p-1.5 rounded-md"><Icon name="gift" size={16} /></div>
                        <div className="flex-1">
                            <span className="font-bold text-sm block">{calculation.label} 적용됨</span>
                            <span className="text-[11px] text-blue-200 opacity-80">서비스 시공이 포함되었습니다.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Button */}
            <button 
                onClick={() => setShowModal(true)} 
                disabled={!hasSelections}
                className={`w-full h-14 rounded-lg flex items-center justify-between px-6 transition-all ${
                    hasSelections 
                    ? 'bg-[#1e3a8a] text-white hover:bg-[#1e40af] shadow-sharp' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
                <div className="flex flex-col items-start">
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${hasSelections ? 'text-white/60' : 'text-slate-400'}`}>Total Estimate</span>
                    <div className="text-lg font-bold flex items-baseline gap-1">
                        {calculation.price.toLocaleString()}
                        <span className="text-sm font-normal opacity-80">원</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                    견적서 확인 <Icon name="arrowRight" size={18} />
                </div>
            </button>
        </div>
      </div>

      {/* --- Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-enter max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-[#1e3a8a] flex items-center gap-2"><Icon name="shield" size={20} className="text-[#1e3a8a]"/> 견적 상세 내역</h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition"><Icon name="x" size={24}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto no-scrollbar space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold mb-1">현장 유형</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1"><Icon name="home" size={14}/> {HOUSING_TYPES.find(h => h.id === housingType).label}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-xs text-slate-500 font-bold mb-1">시공 소재</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1"><Icon name="sparkles" size={14} className="text-blue-500"/> {MATERIALS.find(m => m.id === material).label}</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">선택 내역 <span className="text-xs font-normal text-slate-500">({[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).length}개)</span></h4>
                        <div className="space-y-2 border-t border-slate-100 pt-2">
                            {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => (
                                <div key={area.id} className="flex justify-between items-center text-sm py-2">
                                    <span className="text-slate-600 font-medium flex items-center gap-2">
                                        <Icon name={area.icon} size={14} className="text-slate-400"/>
                                        {area.label} <span className="text-slate-400 text-xs">x{quantities[area.id]}</span>
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {area.id === 'entrance' && calculation.isFreeEntrance 
                                            ? <span className="text-[#1e3a8a]">Service</span> 
                                            : `${(area.basePrice * quantities[area.id]).toLocaleString()}원`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(calculation.isPackageActive || calculation.discountAmount > 0) && (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm border border-blue-100">
                             {calculation.isPackageActive && (
                                <div className="flex justify-between text-[#1e3a8a] font-bold">
                                    <span className="flex items-center gap-1"><Icon name="gift" size={14}/> {calculation.label}</span>
                                    <span>적용됨</span>
                                </div>
                             )}
                             {REVIEW_EVENTS.map(evt => selectedReviews.has(evt.id) && (
                                 <div key={evt.id} className="flex justify-between text-[#1e3a8a]">
                                     <span className="flex items-center gap-1"><Icon name="star" size={14}/> {evt.label}</span>
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
                        <button onClick={copyToClipboard} className="py-3.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"><Icon name="copy" size={16}/> 견적 복사</button>
                        <button onClick={() => window.location.href = 'tel:010-0000-0000'} className="py-3.5 rounded-lg bg-[#1e3a8a] text-white font-bold hover:bg-[#1e40af] transition flex items-center justify-center gap-2">
                            <Icon name="phone" size={16} /> 전화 상담
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}