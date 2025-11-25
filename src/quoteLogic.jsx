/**
 * /src/quoteLogic.jsx
 * 줄눈 견적 계산기의 데이터 및 비즈니스 로직을 포함하는 모듈입니다.
 * 모든 상수는 외부 React 컴포넌트에서 import 할 수 있도록 export 합니다.
 */

const MIN_COST = 200000; // 최소 출장 비용 (원)

/** 현장 유형 */
export const HOUSING_TYPES = [
    { id: 'new', label: '신축 입주 예정', icon: 'home' },
    { id: 'old', label: '거주 중/재시공', icon: 'refreshCw' },
];

/** 시공 재료 (메인 선택) */
export const MATERIALS = [
    { id: 'poly', label: '폴리아스파틱', subLabel: 'Polyaspartic', description: '최고급 마감재. 강력한 내구성, 황변 현상 및 탈락 방지. 시공 후 10년 품질 보증.', tags: ['최고급'], badgeColor: 'bg-green-100 text-green-700' },
    { id: 'epoxy', label: '에폭시 (세라믹)', subLabel: 'Epoxy', description: '기본형 재료. 저렴하지만 황변 가능성 및 내구성이 낮음. 욕실 전용.', tags: ['기본형'], badgeColor: 'bg-yellow-100 text-yellow-700' },
];

/** 소재 가이드 (정보 제공용) */
export const MATERIAL_GUIDE = [
    { material: '폴리아스파틱', color: 'blue', pros: ['강력한 내구성', '황변 없음', '10년 보증', '빠른 건조'], cons: ['상대적으로 높은 비용'] },
    { material: '에폭시', color: 'slate', pros: ['저렴한 비용', '다양한 색상'], cons: ['황변 가능성 높음', '내구성 약함', '탈락 가능성'] },
];

/** 서비스 구역 (줄눈 시공) */
export const SERVICE_AREAS = [
    { id: 'bathroom1', label: '욕실 1', icon: 'bathtub' },
    { id: 'bathroom2', label: '욕실 2', icon: 'bathtub' },
    { id: 'veranda', label: '베란다', icon: 'wind' },
    { id: 'kitchen', label: '주방 바닥', icon: 'soup' },
    { id: 'entrance', label: '현관 바닥', icon: 'key' },
];

/** 실리콘 오염방지 구역 */
export const SILICON_AREAS = [
    { id: 'silicon_sink', label: '욕실 젠다이/세면대', icon: 'scissors', basePrice: 40000 },
    { id: 'silicon_kitchen', label: '주방 싱크대/걸레받이', icon: 'scissors', basePrice: 50000 },
];

/** 리뷰 이벤트 (할인) */
export const REVIEW_EVENTS = [
    { id: 'blog', label: '블로그 리뷰', discount: 20000 },
    { id: 'cafe', label: '카페 리뷰', discount: 10000 },
];

/** 아이콘 경로 */
export const ICON_PATHS = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    refreshCw: 'M23 4v6h-6M1 20v-6h6M3.5 13C2.3 11.5 2 9.7 2 8c0-5 4-8 9-8s9 3 9 8-4 8-9 8h-4',
    check: 'M20 6L9 17l-5-5',
    chevronDown: 'M6 9l6 6 6-6',
    trophy: 'M6 9l6 6 6-6',
    medal: 'M12 11c0-1.7-1.3-3-3-3s-3 1.3-3 3 1.3 3 3 3 3-1.3 3-3zM12 21h-2v-3h-2v3h-2v-3H4v3H2v-7h10v7zM22 10.5h-10.5V2H22v8.5z',
    layout: 'M4 4h16v16H4zM12 4v16',
    eraser: 'M14 3l7 7-9.5 9.5-7-7 9.5-9.5zM21 10L14 3',
    gift: 'M20 12v10H4V12M2 7h20v5H2V7zM12 2v5M8 2v5M16 2v5',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 18.23l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z',
    info: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-8v-4m0 8h.01',
    arrowRight: 'M5 12h14M12 5l7 7-7 7',
    copy: 'M13 14H5V4h7l1 1zm0-7h7v10H7v-3',
    phone: 'M22 16.92v3.34a2 2 0 01-2 2h-1c-2.8 0-5.6-.8-8.1-2.4-3.5-2.2-6.5-5.2-8.7-8.7-1.6-2.5-2.4-5.3-2.4-8.1v-1a2 2 0 012-2h3.34a2 2 0 012 1.54l.56 2.82a2 2 0 01-.4 1.7L7.9 10.1a15.2 15.2 0 008.1 8.1l1.24-1.84a2 2 0 011.7-.4l2.82.56a2 2 0 011.54 2z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.5 13C2.3 11.5 2 9.7 2 8c0-5 4-8 9-8s9 3 9 8-4 8-9 8h-4',
    x: 'M18 6L6 18M6 6l12 12',
    key: 'M21 21l-5.2-5.2M17 5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z',
    bathtub: 'M18 9c0 4.97-4.03 9-9 9s-9-4.03-9-9',
    wind: 'M9.59 4.59A2 2 0 0111 4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2h-2a2 2 0 00-2 2h-2a2 2 0 00-2 2',
    soup: 'M2 15h20M7 15v-4a5 5 0 0110 0v4M12 19h1a3 3 0 000-6',
    scissors: 'M20 7L13 14M20 17l-7-7M2 7l6 6M2 17l6-6M9 7l1.5 1.5M9 17l1.5-1.5M10 10a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3zM14 14a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z',
};

/** 자주 묻는 질문 */
export const FAQ_ITEMS = [ // <<<<<<<<<<< 이 부분이 export 되어야 합니다.
    { question: '줄눈 시공은 왜 필요한가요?', answer: '줄눈 사이에 곰팡이, 물때, 오염물질이 침투하는 것을 막아주어 청결한 환경을 유지하고 타일을 보호합니다. 또한, 시각적인 미관을 개선합니다.' },
    { question: '시공 시간은 얼마나 걸리나요?', answer: '일반적인 아파트 기준, 하루(약 6~8시간) 정도 소요되며, 시공 후 24시간 양생 시간이 필요합니다.' },
    { question: '다른 업체보다 비싼데 이유가 뭔가요?', answer: '저희는 10년 보증의 최고급 폴리아스파틱 소재를 사용하고, 하자 없는 꼼꼼한 시공을 원칙으로 합니다. 견적의 차이는 곧 시공 품질과 내구성에 반영됩니다.' },
    { question: 'AS는 어떻게 되나요?', answer: '폴리아스파틱 시공은 10년, 에폭시 시공은 2년 무상 A/S를 보장합니다. 단, 고객 부주의로 인한 하자는 제외됩니다.' },
];

const PRICE_TABLE = {
    poly: {
        new: {
            bathroom1: 150000,
            bathroom2: 150000,
            veranda: 100000,
            kitchen: 70000,
            entrance: 50000,
        },
        old: {
            bathroom1: 270000, 
            bathroom2: 270000,
            veranda: 180000,
            kitchen: 126000,
            entrance: 90000,
        },
    },
    epoxy: { 
        new: {
            bathroom1: 100000,
            bathroom2: 100000,
            veranda: 70000,
            kitchen: 50000,
            entrance: 30000,
        },
        old: {
            bathroom1: 180000,
            bathroom2: 180000,
            veranda: 126000,
            kitchen: 90000,
            entrance: 54000,
        },
    }
};

export const getBasePrice = (areaId, materialId) => {
    const siliconArea = SILICON_AREAS.find(a => a.id === areaId);
    if (siliconArea) {
        return siliconArea.basePrice;
    }

    let baseMaterial = 'poly';
    if (materialId === 'kerapoxy' || materialId === 'starlike' || materialId === 'epoxy') {
        baseMaterial = 'epoxy';
    }
    return PRICE_TABLE[baseMaterial].new[areaId] || 0;
};

export const calculateEstimate = (quantities, housingType, effectiveMaterialId, selectedReviews) => {
    
    let baseMaterial = 'poly';
    if (effectiveMaterialId === 'kerapoxy' || effectiveMaterialId === 'starlike' || effectiveMaterialId === 'epoxy') {
        baseMaterial = 'epoxy';
    }

    let subTotal = 0;
    let fullOriginalPrice = 0;

    SERVICE_AREAS.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
            const price = PRICE_TABLE[baseMaterial][housingType][area.id] || 0;
            fullOriginalPrice += price * count;
            subTotal += price * count;
        }
    });

    SILICON_AREAS.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
            fullOriginalPrice += area.basePrice * count;
            subTotal += area.basePrice * count;
        }
    });

    let isPackageActive = false;
    let priceAfterPackageDiscount = subTotal;
    let label = "";
    const FREE_SILICON_AREAS = [];
    let isFreeEntrance = false;

    const bathCount = (quantities.bathroom1 || 0) + (quantities.bathroom2 || 0);
    const hasVeranda = (quantities.veranda || 0) > 0;
    const hasKitchen = (quantities.kitchen || 0) > 0;
    
    if (bathCount >= 2 && (hasVeranda || hasKitchen)) {
        isPackageActive = true;
        
        if (bathCount >= 2 && hasVeranda && hasKitchen) {
            label = "풀패키지 할인";
        } else if (bathCount >= 2 && hasVeranda) {
            label = "베란다 패키지";
        } else if (bathCount >= 2 && hasKitchen) {
            label = "주방 패키지";
        }
        
        if ((quantities.entrance || 0) > 0) {
             const entrancePrice = PRICE_TABLE.poly[housingType].entrance || 0;
             priceAfterPackageDiscount -= entrancePrice * (quantities.entrance || 0);
             isFreeEntrance = true;
        }

        if (bathCount >= 2 && (quantities.silicon_sink || 0) > 0) {
            priceAfterPackageDiscount -= (quantities.silicon_sink || 0) * (SILICON_AREAS.find(a => a.id === 'silicon_sink').basePrice);
            FREE_SILICON_AREAS.push('silicon_sink');
        }
    }

    let isMinCost = false;
    if (priceAfterPackageDiscount < MIN_COST && subTotal > 0) {
        priceAfterPackageDiscount = MIN_COST;
        isMinCost = true;
    }

    let totalReviewDiscount = 0;
    selectedReviews.forEach(id => {
        const event = REVIEW_EVENTS.find(evt => evt.id === id);
        if (event) {
            totalReviewDiscount += event.discount;
        }
    });

    let finalPrice = priceAfterPackageDiscount - totalReviewDiscount;
    finalPrice = Math.max(0, finalPrice);

    return {
        price: finalPrice,
        fullOriginalPrice: fullOriginalPrice,
        priceAfterPackageDiscount: priceAfterPackageDiscount,
        totalReviewDiscount: totalReviewDiscount,
        isPackageActive: isPackageActive,
        isMinCost: isMinCost,
        label: label,
        isFreeEntrance: isFreeEntrance,
        FREE_SILICON_AREAS: FREE_SILICON_AREAS,
    };
};