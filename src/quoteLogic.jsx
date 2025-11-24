// quoteLogic.js

// [1] 상수 데이터
export const HOUSING_TYPES = [
  { id: 'new', label: '신축 입주', multiplier: 1.0, icon: 'home' },
  { id: 'old', label: '구축/거주 중', multiplier: 1.0, icon: 'hammer' },
];

export const MATERIALS = [
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

export const MATERIAL_GUIDE = [
    { material: '폴리아스파틱 (Polyaspartic)', pros: ['시공 비용이 저렴함', '탄성이 우수하여 크랙(crack)에 강함'], cons: ['에폭시 대비 수명이 짧음 (5~7년)', '광택이 있어 호불호가 갈림'], color: 'slate' },
    { material: '에폭시 (Epoxy)', pros: ['변색/변질 없는 반영구적 수명', '매트하고 고급스러운 마감'], cons: ['시공 비용이 높음', '경화 시간이 길어 사용까지 오래 걸림'], color: 'blue' },
];

const EPOXY_OVERRIDE_PRICES = {
    'bathroom_floor': 350000, 'shower_booth': 300000, 'bathtub_wall': 300000,
    'master_bath_wall': 550000, 'common_bath_wall': 550000, 'balcony_laundry': 300000,
    'kitchen_wall': 300000, 'living_room': 1100000, 'entrance': 100000,
};

export const SERVICE_AREAS = [
  { id: 'entrance', label: '현관', basePrice: 50000, icon: 'door', unit: '개소' },
  { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: 'bath', unit: '개소' },
  { id: 'shower_booth', label: '샤워부스 벽', basePrice: 150000, icon: 'bath', unit: '구역' },
  { id: 'bathtub_wall', label: '욕조 벽', basePrice: 150000, icon: 'bath', unit: '구역' },
  { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: 'bath', unit: '구역' },
  { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: 'bath', unit: '구역' },
  { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 120000, icon: 'layout', unit: '개소' },
  { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: 'utensils', unit: '구역' },
  { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: 'home', unit: '구역' },
];

export const SILICON_AREAS = [
  { id: 'silicon_bathtub', label: '욕조 테두리', basePrice: 80000, icon: 'eraser', unit: '개소' },
  { id: 'silicon_sink', label: '세면대+젠다이', basePrice: 30000, icon: 'eraser', unit: '개소' },
  { id: 'silicon_kitchen_line', label: '주방 상판 실리콘', basePrice: 50000, icon: 'eraser', unit: '구역' }, 
  { id: 'silicon_living_baseboard', label: '거실 걸레받이', basePrice: 400000, icon: 'eraser', unit: '구역' },
];

export const REVIEW_EVENTS = [
  { id: 'soomgo_review', label: '숨고 리뷰 약속', discount: 20000, icon: 'star' },
  { id: 'karrot_review', label: '당근마켓 후기', discount: 10000, icon: 'star' },
];

export const FAQ_ITEMS = [
    { question: "시공 소요 시간은?", answer: "표준 시공 기준 평균 4~6시간 소요되지만, 범위에 따라 2일이 소요되는 경우도 있습니다." },
    { question: "물 사용 가능 시간?", answer: "폴리는 시공 후 6시간, 스타라이크는 시공 후 24시간, 케라폭시는 시공 후 48시간 후" },
    { question: "A/S 보증 기간은?", answer: "폴리 2년, 케라폭시 5년 무상 보증을 제공합니다." },
];

// [2] 아이콘 경로
export const ICON_PATHS = {
    trophy: <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 6 9Zm12 0h1.5a2.5 2.5 0 0 0 0-5H18a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5ZM6 9H4.5A2.5 2.5 0 0 1 2 6.5V6a2 2 0 0 1 2-2h2M18 9h1.5A2.5 2.5 0 0 0 22 6.5V6a2 2 0 0 0-2-2h-2M12 2a2 2 0 0 1 2 2v2H10V4a2 2 0 0 1 2-2ZM8.21 13c.23 2.14 1.68 3.52 3.79 3.52s3.56-1.38 3.79-3.52M12 16.5a6.5 6.5 0 0 1-6.5-6.5v-3h13v3a6.5 6.5 0 0 1-6.5 6.5ZM12 22v-5.5" />,
    medal: <><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" /><path d="M11 12 5.12 2.2" /><path d="m13 12 5.88-9.8" /><path d="M8 7h8" /><circle cx="12" cy="17" r="5" /><path d="M12 18v-2h-.5" /></>,
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    hammer: <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0-3L12 9m3.5-3.5L21 11l-9 9-5-5" />,
    check: <polyline points="20 6 9 17 4 12" />,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    refresh: <><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" /><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>,
    gift: <><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    bath: <><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-1.5C3.805 1.285 2 2.375 2 4.5c0 3.5 2.5 5 2.5 5" /><path d="M10 5.5v3" /><path d="M7.5 10h12" /><path d="M5.5 13h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" /></>,
    eraser: <><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /><path d="m5 11 9 9" /></>,
    layout: <><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></>,
    door: <><path d="M13 4h3a2 2 0 0 1 2 2v14" /><path d="M2 20h3" /><path d="M13 20h9" /><path d="M10 12v.01" /><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4.485-1.121A2 2 0 0 1 13 4.562Z" /></>,
    utensils: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
};

// [3] 핵심 계산 함수
export const getBasePrice = (id, material) => {
    const area = SERVICE_AREAS.find(a => a.id === id) || SILICON_AREAS.find(a => a.id === id);
    if (!area) return 0;
    if (material === 'kerapoxy' && EPOXY_OVERRIDE_PRICES[id] !== undefined) {
        return EPOXY_OVERRIDE_PRICES[id]; 
    }
    return area.basePrice;
};

export const calculateEstimate = (quantities, housingTypeId, materialId, selectedReviews) => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingTypeId);
    const selectedMaterial = MATERIALS.find(m => m.id === materialId);
    let q = { ...quantities };
    let total = 0; 
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false;
    let isMinCost = false;
    const FREE_SILICON_AREAS = ['silicon_sink']; 

    let originalTotal = 0;
    const allAreasCombined = [...SERVICE_AREAS, ...SILICON_AREAS];
    allAreasCombined.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
            let price = getBasePrice(area.id, materialId) * count * selectedHousing.multiplier;
            if (materialId === 'poly' && !EPOXY_OVERRIDE_PRICES[area.id]) {
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

    // --- 패키지 로직 ---
    if (selectedMaterial.id === 'poly') {
      if (qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) {
        total += 300000; q['bathroom_floor'] -= 2; q['entrance'] -= 1; isPackageActive = true; labelText = '30만원 패키지';
      } else if (qBathFloor >= 1 && qBathWallOne && qBathFloor === 1 && qBathWallTotal === 1) {
          total += 500000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '50만원 패키지';
      } else if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
          total += 700000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '풀패키지 할인'; 
      }
      else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
          total += 380000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '실속 패키지'; 
      }
      else if (qBathFloor >= 2 && qEntrance >= 1) { isPackageActive = true; isFreeEntrance = true; labelText = '현관 무료 혜택'; }
    } else if (selectedMaterial.id === 'kerapoxy') {
        // [수정됨] 55만원 패키지 우선 적용
        if (qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) { 
            total += 550000; q['bathroom_floor'] -= 2; q['entrance'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '에폭시 바닥 현관 패키지 (55만원)'; 
        }
        else if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
            total += 1400000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '에폭시 풀패키지 (135만원)'; 
        } 
        else if (qBathFloor >= 2 && qShower >= 1 && qBathtub >= 1) { 
            total += 1050000; q['bathroom_floor'] -= 2; q['shower_booth'] -= 1; q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '에폭시 복합 패키지 (105만원)'; 
        } 
        else if (qBathFloor >= 2 && (qShower >= 1 || qBathtub >= 1)) { 
            total += 800000; q['bathroom_floor'] -= 2; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '에폭시 더블 패키지 (80만원)'; 
        } 
        else if (qBathFloor >= 1 && qBathWallTotal >= 1) { 
            total += 750000; q['bathroom_floor'] -= 1; qMasterWall >= 1 ? q['master_bath_wall'] -= 1 : q['common_bath_wall'] -= 1; isPackageActive = true; labelText = '에폭시 싱글 벽면 패키지 (75만원)'; 
        } 
        else if (qBathFloor >= 1 && (qShower >= 1 || qBathtub >= 1)) { 
            total += 550000; q['bathroom_floor'] -= 1; qShower >= 1 ? q['shower_booth'] -= 1 : q['bathtub_wall'] -= 1; isPackageActive = true; labelText = '에폭시 싱글 패키지 (55만원)'; 
        }
        else if (qBathFloor >= 2) { 
            total += 550000; q['bathroom_floor'] -= 2; isPackageActive = true; labelText = '에폭시 바닥 더블 패키지 (60만원)'; 
        }
    }

    // 잔여 항목 계산
    [...SERVICE_AREAS, ...SILICON_AREAS].forEach(area => {
        const count = q[area.id] || 0;
        if (count > 0) {
            if (isPackageActive && FREE_SILICON_AREAS.includes(area.id)) return; 
            let price = getBasePrice(area.id, materialId) * count * selectedHousing.multiplier;
            if (area.id === 'entrance' && isFreeEntrance) return;
            
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

    const priceAfterPackageDiscount = total; 
    const totalCount = Object.values(quantities).reduce((a, b) => a + b, 0);
    if (totalCount === 1 && priceAfterPackageDiscount < 200000 && priceAfterPackageDiscount > 0) {
        total = 200000; isMinCost = true;
    }

    let discountAmount = 0;
    if (labelText === '30만원 패키지') {
        // 30만원 패키지 할인 전 가격은 UI에서만 처리하므로 계산에는 영향 없음
    }

    if (!isMinCost) { 
        REVIEW_EVENTS.forEach(evt => { if (selectedReviews.has(evt.id)) discountAmount += evt.discount; });
        total -= discountAmount;
    }

    return { 
        price: Math.max(0, Math.floor(total / 1000) * 1000), 
        label: labelText, isPackageActive, isFreeEntrance, discountAmount, isMinCost, 
        fullOriginalPrice: originalTotal, priceAfterPackageDiscount, totalReviewDiscount: discountAmount, 
        FREE_SILICON_AREAS 
    };
};