import React, { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';

// =================================================================
// [0] 아이콘 시스템 (오류 방지용 자체 SVG)
// =================================================================
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    trophy: (
      <>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 6 9ZM18 9h1.5a2.5 2.5 0 0 0 0-5H18a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5ZM6 9H4.5A2.5 2.5 0 0 1 2 6.5V6a2 2 0 0 1 2-2h2M18 9h1.5A2.5 2.5 0 0 0 22 6.5V6a2 2 0 0 0-2-2h-2M12 2a2 2 0 0 1 2 2v2H10V4a2 2 0 0 1 2-2ZM8.21 13c.23 2.14 1.68 3.52 3.79 3.52s3.56-1.38 3.79-3.52M12 16.5a6.5 6.5 0 0 1-6.5-6.5v-3h13v3a6.5 6.5 0 0 1-6.5 6.5ZM12 22v-5.5" />
      </>
    ),
    medal: (
      <>
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
        <path d="M11 12 5.12 2.2" />
        <path d="m13 12 5.88-9.8" />
        <path d="M8 7h8" />
        <circle cx="12" cy="17" r="5" />
        <path d="M12 18v-2h-.5" />
      </>
    ),
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
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
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
// [1] 스타일 정의
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
    
    body { 
        font-family: "Pretendard Variable", "Pretendard", sans-serif;
        background-color: #FFFFFF;
        color: #1e3a8a;
        margin: 0;
        padding: 0;
        font-size: 16px;
    }
    
    /* 애니메이션 */
    @keyframes fadeUp { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
    }
    .animate-enter { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    @keyframes pulse-slow { 
        0%, 100% { opacity: 1; } 
        50% { opacity: 0.7; }
    }
    .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; } 
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* 그림자 */
    .shadow-card { box-shadow: 0 4px 12px rgba(30, 58, 138, 0.08); }
    .shadow-float { box-shadow: 0 -5px 20px -5px rgba(30, 58, 138, 0.15); }
    
    /* 이미지 저장 영역 전용 스타일 (흰색 배경 강제) */
    .quote-canvas-container { 
        background-color: #FFFFFF !important; 
        padding: 24px; 
        border-radius: 10px; 
    }
  `}</style>
);

// =================================================================
// [2] 데이터
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
    id: 'kerapoxy', label: 'Premium', subLabel: '에폭시', priceMod: 1.8, 
    description: '매트한 질감과 반영구적 내구성, 호텔급 마감',
    tags: ['반영구', '무광매트'],
    badgeColor: 'bg-blue-50 text-blue-700'
  },
];

const MATERIAL_GUIDE = [
    { 
        material: '폴리아스파틱 (Polyaspartic)', 
        pros: ['시공 비용이 저렴함', '탄성이 우수하여 크랙(crack)에 강함'], 
        cons: ['에폭시 대비 수명이 짧음 (5~7년)', '광택이 있어 호불호가 갈림'], 
        color: 'slate' 
    },
    { 
        material: '에폭시 (Epoxy)', 
        pros: ['변색/변질 없는 반영구적 수명', '매트하고 고급스러운 마감'], 
        cons: ['시공 비용이 높음', '경화 시간이 길어 사용까지 오래 걸림'], 
        color: 'blue' 
    },
];

// 에폭시 견적가 오버라이드를 위한 지도
const EPOXY_OVERRIDE_PRICES = {
    'bathroom_floor': 350000,
    'shower_booth': 300000,
    'bathtub_wall': 300000,
    'master_bath_wall': 550000,
    'common_bath_wall': 550000,
    'balcony_laundry': 300000,
    'kitchen_wall': 300000,
    'living_room': 1100000,
    'entrance': 100000, 
};

const getBasePrice = (id, material) => {
    const area = SERVICE_AREAS.find(a => a.id === id) || SILICON_AREAS.find(a => a.id === id);
    if (!area) return 0;
    
    // [수정된 로직] 에폭시(kerapoxy) 선택 시 오버라이드된 가격 적용
    if (material === 'kerapoxy' && EPOXY_OVERRIDE_PRICES[id] !== undefined) {
        return EPOXY_OVERRIDE_PRICES[id]; 
    }
    
    return area.basePrice;
};

const SERVICE_AREAS = [
  { id: 'entrance', label: '현관', basePrice: 100000, icon: 'door', unit: '개소' }, // 100000
  { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: 'bath', unit: '개소' }, // 150000
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
  { id: 'silicon_kitchen_line', label: '주방 상판 실리콘', basePrice: 50000, icon: 'eraser', unit: '구역' }, 
  { id: 'silicon_living_baseboard', label: '거실 걸레받이', basePrice: 400000, icon: 'eraser', unit: '구역' },
];

const REVIEW_EVENTS = [
  { id: 'soomgo_review', label: '숨고 리뷰 약속', discount: 20000, icon: 'star' },
  { id: 'karrot_review', label: '당근마켓 후기', discount: 10000, icon: 'star' },
];

const FAQ_ITEMS = [
    { question: "시공 소요 시간은?", answer: "평균 4~6시간, 범위에 따라 길게는 2~3일 일정으로 진행됩니다." },
    { question: "각 소재별 양생기간은?", answer: "폴리아스파틱은 6시간, 에폭시(케라폭시)는 2~3일, 스타라이크 evo는 24시간입니다." },
    { question: "시공이 불가한 경우는?", answer: "타일 파손/들뜸이 심한 경우, 또는 조각 타일 시공은 불가합니다." }, 
    { question: "A/S 보증 기간은?", answer: "폴리 2년, 에폭시 5년 무상 보증을 제공합니다." }, 
];

// =================================================================
// [3] 컴포넌트: Accordion
// =================================================================
const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                className="flex justify-between items-center w-full py-5 text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-base transition-colors ${isOpen ? 'font-bold text-[#1e3a8a]' : 'font-medium text-slate-600 group-hover:text-[#1e3a8a]'}`}>{question}</span>
                <Icon name="chevronDown" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} size={18} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-slate-500 pb-5 leading-relaxed">{answer}</p>
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

  // [NEW STATE] 패키지/소재 정보 토글
  const [packageToastDismissed, setPackageToastDismissed] = useState(false);
  const [showMaterialGuide, setShowMaterialGuide] = useState(false);
  
  // [NEW REF] 견적서 캡처용 Ref (견적 내용만 감싸도록 수정됨)
  const quoteRef = useRef(null);

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
    setPackageToastDismissed(false);
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
    let total = 0; // Price after itemization/packages, before review discount
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false;
    let isMinCost = false;

    // 패키지 선택 시 가격 합산에서 제외될 실리콘 서비스 항목 (세면대+젠다이만 FREE)
    const FREE_SILICON_AREAS = ['silicon_sink']; 

    // --- 1. 순수 개별 견적 합계 (Full Original Price) 계산 ---
    let originalTotal = 0;
    const allAreasCombined = [...SERVICE_AREAS, ...SILICON_AREAS];
    allAreasCombined.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
            let price = getBasePrice(area.id, material) * count * selectedHousing.multiplier;
            
            // 폴리아스파틱 (poly) 선택 시에만 priceMod (1.0)을 곱하고, 에폭시는 getBasePrice에서 이미 가격이 설정됨
            if (material === 'poly' && !EPOXY_OVERRIDE_PRICES[area.id]) {
                price *= selectedMaterial.priceMod;
            }
            
            originalTotal += price;
        }
    });

    const qBathFloor = q['bathroom_floor'] || 0;
    const qShower = q['shower_booth'] || 0;
    const qBathtub = q['bathtub_wall'] || 0;
    const qMasterWall = q['master_bath_wall'] || 0;
    const qCommonWall = q['common_bath_wall'] || 0;
    const qEntrance = q['entrance'] || 0;
    const qBathWallOne = (qMasterWall >= 1 || qCommonWall >= 1);
    const qBathWallTotal = qMasterWall + qCommonWall;

    // --- 2. 패키지 로직 (할인 적용 시작) ---
    if (selectedMaterial.id === 'poly' && qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
        total += 300000; q['bathroom_floor'] -= 2; q['entrance'] -= 1; isPackageActive = true; labelText = '30만원 패키지';
    } else if (selectedMaterial.id === 'kerapoxy') {
        // [수정된 로직] 에폭시 60만원 패키지 (욕실 바닥 2곳, 현관 바닥 1곳)
        if (qBathFloor >= 2 && qEntrance >= 1) {
            total += 600000; q['bathroom_floor'] -= 2; q['entrance'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '에폭시 60만원 패키지';
        } 
        else if (qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
            total += 750000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '에폭시 75만원 패키지';
        } 
        else if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
            total += 1300000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = 'Premium 풀패키지'; 
        }
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { 
            total += 950000; q['bathroom_floor'] -= 2; q['shower_booth'] -= 1; q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = 'Premium 패키지 A'; 
        }
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
            total += 750000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = 'Premium 패키지 B'; 
        }
    } else { 
      if (qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
          total += 500000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '50만원 패키지';
      } else if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
          total += 700000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '풀패키지 할인'; 
      }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
          total += 380000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '실속 패키지'; 
      }
      else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '현관 무료 혜택'; }
    }

    // --- 3. 잔여 개별 항목 계산 (FREE 서비스 제외) ---
    [...SERVICE_AREAS, ...SILICON_AREAS].forEach(area => {
        const count = q[area.id] || 0;
        if (count > 0) {
            
            // [수정된 로직] FREE_SILICON_AREAS는 가격 합산에서 제외
            if (isPackageActive && FREE_SILICON_AREAS.includes(area.id)) {
                return; 
            }
            
            let price = getBasePrice(area.id, material) * count * selectedHousing.multiplier;
            
            if (area.id === 'entrance' && isFreeEntrance) return;
            
            // 폴리아스파틱 (poly) 선택 시에만 priceMod 적용 (에폭시는 getBasePrice에서 이미 가격 설정됨)
            if (material === 'poly' && !EPOXY_OVERRIDE_PRICES[area.id]) {
                price *= selectedMaterial.priceMod;
            }

            // [추가 할인 로직 유지]
            if (isPackageActive) {
                if (area.id === 'living_room' && selectedMaterial.id === 'poly') price -= 50000 * count;
                else if (area.id === 'living_room' && selectedMaterial.id === 'kerapoxy') price -= 150000 * count; 
                else if (area.id === 'balcony_laundry' && selectedMaterial.id === 'poly') price = 100000 * count;
                else if (area.id === 'silicon_bathtub') price = 50000 * count;
                else if (area.id === 'silicon_living_baseboard') price = 350000 * count;
            }
            total += price;
        }
    });

    const priceAfterPackageDiscount = total; // 패키지 할인 적용된 최종 금액
    
    // 최소 시공비 (1곳 && 20만원 미만)
    const totalCount = Object.values(quantities).reduce((a, b) => a + b, 0);
    if (totalCount === 1 && priceAfterPackageDiscount < 200000 && priceAfterPackageDiscount > 0) {
        total = 200000;
        isMinCost = true;
    }

    let discountAmount = 0;
    let priceBeforeReviewDiscount = priceAfterPackageDiscount;

    // 30만원 패키지 할인 전 가격을 35만원으로 오버라이드
    if (labelText === '30만원 패키지') {
        priceBeforeReviewDiscount = 350000;
    }

    if (!isMinCost) { 
        REVIEW_EVENTS.forEach(evt => { if (selectedReviews.has(evt.id)) discountAmount += evt.discount; });
        total -= discountAmount;
    }

    return { 
        price: Math.max(0, Math.floor(total / 1000) * 1000), 
        label: labelText, 
        isPackageActive, 
        isFreeEntrance, 
        discountAmount, 
        isMinCost,
        fullOriginalPrice: originalTotal, 
        priceAfterPackageDiscount: priceAfterPackageDiscount,
        totalReviewDiscount: discountAmount,
        FREE_SILICON_AREAS: FREE_SILICON_AREAS,
    };
  }, [housingType, material, quantities, selectedReviews]);

  // --- 이미지 저장 함수 (클립보드 대체) ---
  const saveAsImage = async () => {
    if (!quoteRef.current) {
        alert("에러: 견적서 영역을 찾을 수 없습니다.");
        return;
    }

    // [핵심 로직 활성화]
    try {
      const element = quoteRef.current;
      
      const originalOverflow = element.style.overflow;
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, { 
          scale: 2, // 고해상도 캡처 (선명도 증가)
          logging: false,
          useCORS: true,
      });
      
      element.style.overflow = originalOverflow; // 원상 복구

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `줄눈의미학_견적서_${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      
      alert("견적서 이미지가 성공적으로 저장되었습니다!");
      
    } catch (error) {
      console.error("이미지 저장 중 오류 발생:", error);
      alert("이미지 저장에 실패했습니다. (콘솔 확인)");
    }
  };

  const hasSelections = Object.values(quantities).some(v => v > 0);
  const showPulse = hasSelections && !showModal;
  const showPackageBanner = calculation.isPackageActive && !packageToastDismissed && !calculation.isMinCost;

  // --- 렌더링 ---
  return (
    <div className="min-h-screen pb-44 selection:bg-[#1e3a8a] selection:text-white bg-white">
      <GlobalStyles />

      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-[#1e3a8a] text-white p-1 rounded-md"><Icon name="shield" size={18} /></div>
             <span className="font-bold text-lg tracking-tight text-[#1e3a8a]">줄눈의미학</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-md hover:bg-slate-50 transition text-slate-500">
            <Icon name="refresh" size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-24 space-y-10">
        
        {/* 상단 홍보 배너 */}
        <div className="animate-enter bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#1e3a8a] font-bold text-lg">
                <Icon name="trophy" size={20} className="text-[#1e3a8a]" />
                숨고 리뷰/평점 1등 업체
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
                <Icon name="medal" size={16} className="text-slate-400" />
                시공경험 1만건 이상의 검증된 실력
            </div>
        </div>

        {/* STEP 1: 현장 유형 */}
        <section className="animate-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">현장 유형</h2>
            <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full">STEP 01</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HOUSING_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setHousingType(type.id)}
                className={`flex flex-col items-start p-6 rounded-xl transition-all duration-200 border ${
                  housingType === type.id 
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div className={`mb-3 ${housingType === type.id ? 'text-white' : 'text-slate-400'}`}>
                    <Icon name={type.icon} size={26} />
                </div>
                <div className="font-bold text-lg">{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: 재료 선택 */}
        <section className="animate-enter" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e3a8a]">시공 소재</h2>
            <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full">STEP 02</span>
          </div>
          
          {/* 소재 정보 확인 버튼 및 가이드 */}
          <div className="mb-4">
              <button 
                  onClick={() => setShowMaterialGuide(!showMaterialGuide)} 
                  className="w-full text-center py-2 text-sm font-semibold rounded-lg text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                  소재 정보 {showMaterialGuide ? '숨기기' : '확인하기'} 
                  <Icon name="chevronDown" size={16} className={`transition-transform ${showMaterialGuide ? 'rotate-180' : ''}`} />
              </button>
              
              {/* 소재 장단점 섹션 */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showMaterialGuide ? 'max-h-96 opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      {MATERIAL_GUIDE.map((guide, idx) => (
                          <div key={idx} className="border-b border-slate-200 last:border-0 pb-3 last:pb-0">
                              <h4 className={`font-bold text-base mb-1 ${guide.color === 'blue' ? 'text-blue-700' : 'text-slate-700'}`}>
                                  {guide.material}
                              </h4>
                              <div className="flex text-sm">
                                  <div className="w-1/2 pr-2 text-green-700">
                                      <span className="font-bold">장점: </span>{guide.pros.join(', ')}
                                  </div>
                                  <div className="w-1/2 pl-2 border-l border-slate-200 text-red-700">
                                      <span className="font-bold">단점: </span>{guide.cons.join(', ')}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          
          {/* 소재 선택 카드 */}
          <div className="space-y-4">
            {MATERIALS.map((item) => (
              <div key={item.id} 
                onClick={() => setMaterial(item.id)}
                className={`group relative overflow-hidden p-6 rounded-xl transition-all duration-200 border ${
                  material === item.id 
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{item.label}</span>
                            {material === item.id && <Icon name="check" size={20} className="text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${material === item.id ? 'text-slate-200' : 'text-slate-500'}`}>{item.subLabel}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold tracking-wider ${material === item.id ? 'bg-[#172554] text-blue-200' : item.badgeColor}`}>{item.tags[0]}</span>
                </div>
                <p className={`text-sm leading-relaxed ${material === item.id ? 'text-slate-300' : 'text-slate-500'}`}>{item.description}</p>
                
                <div className={`transition-all duration-300 ease-out ${material === item.id ? 'max-h-24 opacity-100 mt-5' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex gap-3">
                    {item.id === 'poly' ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${polyOption === 'pearl' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>펄</button>
                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${polyOption === 'no_pearl' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>무펄</button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${epoxyOption === 'kerapoxy' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>케라폭시</button>
                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike');}} className={`flex-1 py-3 text-sm rounded-lg font-bold transition-all border ${epoxyOption === 'starlike' ? 'bg-white text-[#1e3a8a] border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>스타라이크</button>
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
            <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full">STEP 03</span>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Icon name="layout" size={16}/> 줄눈 시공 범위</h3>
            </div>
            <div className="p-2">
                {SERVICE_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-blue-100 text-[#1e3a8a]' : 'bg-slate-100 text-slate-400'}`}>
                                <Icon name={area.icon} size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-lg">{area.label}</div>
                                <div className="text-sm text-slate-500 font-medium">
                                    {getBasePrice(area.id, material).toLocaleString()}원~
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-1">
                             <button onClick={() => handleQuantityChange(area.id, -1)} 
                                className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-[#1e3a8a] hover:bg-blue-50' : 'text-slate-300'}`}><Icon name="x" size={14} className="rotate-45" /></button>
                             <span className={`w-8 text-center text-lg font-bold ${quantities[area.id] > 0 ? 'text-[#1e3a8a]' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} 
                                className="w-9 h-9 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"><Icon name="x" size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 border-t">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Icon name="eraser" size={16}/> 실리콘 오염방지</h3>
            </div>
            <div className="p-2">
                {SILICON_AREAS.map((area) => (
                    <div key={area.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${quantities[area.id] > 0 ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${quantities[area.id] > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                                <Icon name={area.icon} size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-lg">{area.label}</div>
                                <div className="text-sm text-slate-500 font-medium">{area.basePrice.toLocaleString()}원~</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-1">
                             <button onClick={() => handleQuantityChange(area.id, -1)} className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${quantities[area.id] > 0 ? 'text-orange-700 hover:bg-orange-50' : 'text-slate-300'}`}><Icon name="x" size={14} className="rotate-45" /></button>
                             <span className={`w-8 text-center text-lg font-bold ${quantities[area.id] > 0 ? 'text-orange-900' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                             <button onClick={() => handleQuantityChange(area.id, 1)} className="w-9 h-9 rounded-md text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center"><Icon name="x" size={14} /></button>
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
            <Icon name="gift" size={24} className="text-[#1e3a8a]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {REVIEW_EVENTS.map((evt) => (
              <button 
                key={evt.id} 
                onClick={() => toggleReview(evt.id)} 
                className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 ${
                  selectedReviews.has(evt.id) 
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-card' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1 mb-2">
                    <Icon name="star" size={16} className={selectedReviews.has(evt.id) ? 'text-yellow-400' : 'text-slate-300'} />
                    <span className={`text-sm font-medium ${selectedReviews.has(evt.id) ? 'text-slate-300' : 'text-slate-500'}`}>{evt.label}</span>
                </div>
                <div className={`text-xl font-bold ${selectedReviews.has(evt.id) ? 'text-white' : 'text-slate-400'}`}>-{evt.discount.toLocaleString()}원</div>
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
              <p className="text-sm text-rose-500 font-bold bg-rose-50 inline-block px-4 py-2 rounded-lg">※ 서비스 이용 후 꼭! 작성해주세요</p>
          </div>
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
            
            {/* [NEW] 최소 시공비 안내 배너 */}
            {calculation.isMinCost && (
                <div className="absolute bottom-full left-0 right-0 mb-4 animate-enter">
                    <div className="bg-rose-600 text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-3">
                        <div className="bg-rose-700 p-1.5 rounded-md"><Icon name="info" size={18} /></div>
                        <div className="flex-1">
                            <span className="font-bold text-sm block">현재 견적가는 최소출장비용입니다.</span>
                            <span className="text-xs text-rose-100 opacity-90">선택하신 구역의 합계가 최소금액 미만입니다.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* [NEW] 패키지 안내 + 타일 크기 안내 (복원됨) */}
            {showPackageBanner && (
                <div className="absolute bottom-full left-0 right-0 mb-4 animate-enter mx-auto max-w-md">
                    <div className="bg-[#1e3a8a]/95 backdrop-blur text-white p-4 rounded-xl shadow-lg border border-blue-900">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#172554] p-2 rounded-lg shrink-0"><Icon name="gift" size={20} /></div>
                                <div>
                                    <div className="font-bold text-base text-white mb-1">{calculation.label} 적용중!</div>
                                    <ul className="text-xs text-blue-100 space-y-1 pl-1">
                                        {/* 현관 서비스 소재 명시 */}
                                        {calculation.isFreeEntrance && <li>• 현관 바닥 시공 (서비스 - 폴리아스파틱)</li>}
                                        <li>• 변기 테두리 / 바닥 테두리 서비스</li>
                                        {/* 주방 상판은 유료화 되었으므로 제거됨 */}
                                        {calculation.FREE_SILICON_AREAS.includes('silicon_sink') && <li>• 욕실 젠다이/세면대 실리콘 오염방지</li>}
                                    </ul>
                                </div>
                            </div>
                            <button onClick={() => setPackageToastDismissed(true)} className="p-1 rounded-full text-slate-300 hover:text-white bg-transparent transition">
                                <Icon name="x" size={16} />
                            </button>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg flex items-start gap-2">
                            <Icon name="info" size={14} className="mt-0.5 text-yellow-300 shrink-0"/>
                            <span className="text-[11px] text-blue-50 leading-snug">
                                <span className="font-bold text-yellow-300">타일 크기 기준:</span> 바닥 30x30cm, 벽면 30x60cm 크기 기준이며, 이보다 작거나 조각 타일인 경우 현장에서 추가 비용이 발생할 수 있습니다.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Button */}
            <button 
                onClick={() => setShowModal(true)} 
                disabled={!hasSelections}
                className={`w-full h-16 rounded-lg flex items-center justify-between px-6 transition-all ${
                    showPulse 
                    ? 'bg-[#1e3a8a] text-white hover:bg-[#1e40af] shadow-sharp animate-pulse-slow' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
                <div className="flex flex-col items-start">
                    <span className={`text-xs font-bold tracking-wider uppercase ${hasSelections ? 'text-white/70' : 'text-slate-400'}`}>Total Estimate</span>
                    <div className="text-xl font-bold flex items-baseline gap-1">
                        {calculation.price.toLocaleString()}
                        <span className="text-base font-normal opacity-80">원</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-base">
                    견적서 확인 <Icon name="arrowRight" size={20} />
                </div>
            </button>
        </div>
      </div>

      {/* --- Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            
            {/* Modal Container: 캡처 영역과 버튼 영역을 분리 */}
            <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl animate-enter max-h-[90vh] flex flex-col">
                
                {/* 닫기 버튼 (모바일 상단) */}
                <button 
                    onClick={() => setShowModal(false)} 
                    className="absolute top-3 right-3 z-10 p-2 text-slate-400 hover:text-slate-600 transition"
                >
                    <Icon name="x" size={24} />
                </button>

                {/* [REF 적용] 견적서 내용 (스크롤 영역) */}
                <div ref={quoteRef} className="flex-1 overflow-y-auto no-scrollbar quote-canvas-container"> 
                    
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-2xl text-[#0f172a] flex items-center gap-2">
                            <Icon name="shield" size={24} className="text-[#1e3a8a]"/> 정식 견적서
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">발행일: {new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 mb-4">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-sm text-slate-500 font-bold mb-1">현장 유형</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1 text-lg">{HOUSING_TYPES.find(h => h.id === housingType).label}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-sm text-slate-500 font-bold mb-1">시공 소재</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1 text-lg">
                                {/* [수정된 로직] 소재명 상세 표기 */}
                                {material === 'poly' ? (
                                    '폴리아스파틱'
                                ) : (
                                    `에폭시 (${epoxyOption === 'kerapoxy' ? '케라폭시' : '스타라이크'})`
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-base font-bold text-[#1e3a8a] mb-3 flex items-center gap-2">선택 내역</h4>
                        <div className="space-y-3 border-t border-slate-100 pt-3">
                            {[...SERVICE_AREAS, ...SILICON_AREAS].filter(a => quantities[a.id] > 0).map(area => {
                                const isFreeSilicon = calculation.isPackageActive && calculation.FREE_SILICON_AREAS.includes(area.id);
                                return (
                                    <div key={area.id} className="flex justify-between items-center text-base py-1">
                                        <span className="text-slate-700 font-medium flex items-center gap-2">
                                            <Icon name={area.icon} size={16} className="text-slate-400"/>
                                            {area.label} <span className="text-slate-400 text-sm">x{quantities[area.id]}</span>
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {area.id === 'entrance' && calculation.isFreeEntrance 
                                                ? <span className="text-[#1e3a8a]">Service (Poly)</span> 
                                                : isFreeSilicon 
                                                    ? <span className="text-[#1e3a8a]">Service</span>
                                                    : `${(getBasePrice(area.id, material) * quantities[area.id]).toLocaleString()}원` 
                                            }
                                        </span>
                                    </div>
                                )})}
                        </div>
                    </div>

                    {/* 가격 비교 섹션 */}
                    <div className="space-y-2 py-4 border-y border-slate-200 mt-4">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                            <span>순수 개별 견적 합계</span>
                            <span className='line-through text-slate-400'>
                                {calculation.fullOriginalPrice.toLocaleString()}원
                            </span>
                        </div>
                        
                        {(calculation.isPackageActive || calculation.isMinCost) && (
                            <div className="flex justify-between items-center text-sm font-medium text-blue-700">
                                <span>패키지/최소 비용 적용가</span>
                                <span className='font-bold'>
                                    {calculation.priceAfterPackageDiscount.toLocaleString()}원
                                </span>
                            </div>
                        )}
                        
                        {calculation.totalReviewDiscount > 0 && (
                            <div className="flex justify-between items-center text-base font-bold text-red-600">
                                <span>리뷰 할인</span>
                                <span>-{calculation.totalReviewDiscount.toLocaleString()}원</span>
                            </div>
                        )}
                        
                        {/* 총 할인 금액 */}
                        <div className="flex justify-between items-center text-base font-bold pt-2 border-t border-slate-100">
                            <span className="text-red-600">총 할인 금액</span>
                            <span className="text-red-600">
                                -{(calculation.fullOriginalPrice - calculation.price).toLocaleString()}원
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-slate-900">최종 결제 금액</span>
                            <span className="text-3xl font-bold text-blue-700">{calculation.price.toLocaleString()}원</span>
                        </div>
                    </div>

                    {/* 서비스 & 주의사항 */}
                    <div className="space-y-4 pt-4">
                        
                        {calculation.isPackageActive && !calculation.isMinCost && (
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm border border-blue-100">
                                <h4 className="text-[#1e3a8a] font-bold flex items-center gap-2"><Icon name="gift" size={16}/> 패키지 서비스 (FREE)</h4>
                                <ul className="list-disc list-inside text-slate-700 space-y-1 pl-1">
                                    <li>현관 바닥 시공 (폴리아스파틱)</li>
                                    <li>변기 테두리, 욕실 바닥 테두리</li>
                                    {calculation.FREE_SILICON_AREAS.includes('silicon_sink') && <li>욕실 젠다이/세면대 실리콘 오염방지</li>}
                                </ul>
                            </div>
                        )}

                        {/* 타일/재시공 경고 (최종 안내) */}
                        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 text-slate-700">
                            <h4 className="font-bold flex items-center gap-2 mb-1 text-red-600"><Icon name="info" size={16}/> 시공 시 유의사항</h4>
                            <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                                <li>타일 기준: 바닥 30x30cm, 벽면 30x60cm 크기 기준이며, 조각 타일 시공은 불가하며, 크기가 작을 경우 추가 비용이 발생합니다.</li>
                                <li>재시공(셀프포함)의 경우 1.5~2배의 추가비용이 발생합니다.</li>
                            </ul>
                        </div>
                        
                        {calculation.isMinCost && (
                            <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 text-rose-700">
                                <div className="flex items-center gap-2 font-bold mb-1"><Icon name="info" size={16}/> 최소 출장비 적용</div>
                                <p className="text-sm opacity-90">선택하신 시공 범위가 최소 기준 미만이라, 기본 출장비 20만원이 적용되었습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 액션 버튼 (고정 영역) */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex-none">
                    <p className='text-xs text-center text-slate-500 mb-4'>* 위 내용은 이미지로 저장되며, 현장 상황에 따라 변동될 수 있습니다.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={saveAsImage} className="py-4 rounded-lg bg-[#0f172a] text-white font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                            <Icon name="copy" size={18}/> 이미지 저장
                        </button>
                        {/* 전화번호 변경 적용: 010-7734-6709 */}
                        <button onClick={() => window.location.href = 'tel:010-7734-6709'} className="py-4 rounded-lg bg-[#1e3a8a] text-white font-bold hover:bg-[#1e40af] transition flex items-center justify-center gap-2">
                            <Icon name="phone" size={18} /> 전화 상담
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}