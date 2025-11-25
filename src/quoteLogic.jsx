/**
 * /src/quoteLogic.jsx
 * 줄눈 견적 계산기의 데이터 및 비즈니스 로직을 포함하는 모듈입니다.
 */

const MIN_COST = 200000; // 최소 출장 비용 (원)

// ... (HOUSING_TYPES, MATERIALS, MATERIAL_GUIDE, SERVICE_AREAS, SILICON_AREAS, REVIEW_EVENTS, ICON_PATHS, PRICE_TABLE 정의 부분은 동일)
export const HOUSING_TYPES = [
    { id: 'new', label: '신축 입주 예정', icon: 'home' },
    { id: 'old', label: '거주 중/재시공', icon: 'refreshCw' },
];

export const MATERIALS = [
    { id: 'poly', label: '폴리아스파틱', subLabel: 'Polyaspartic', description: '최고급 마감재. 강력한 내구성, 황변 현상 및 탈락 방지. 시공 후 10년 품질 보증.', tags: ['최고급'], badgeColor: 'bg-green-100 text-green-700' },
    { id: 'epoxy', label: '에폭시 (세라믹)', subLabel: 'Epoxy', description: '기본형 재료. 저렴하지만 황변 가능성 및 내구성이 낮음. 욕실 전용.', tags: ['기본형'], badgeColor: 'bg-yellow-100 text-yellow-700' },
];

export const MATERIAL_GUIDE = [
    { material: '폴리아스파틱', color: 'blue', pros: ['강력한 내구성', '황변 없음', '10년 보증', '빠른 건조'], cons: ['상대적으로 높은 비용'] },
    { material: '에폭시', color: 'slate', pros: ['저렴한 비용', '다양한 색상'], cons: ['황변 가능성 높음', '내구성 약함', '탈락 가능성'] },
];

export const SERVICE_AREAS = [
    { id: 'bathroom1', label: '욕실 1', icon: 'bathtub' },
    { id: 'bathroom2', label: '욕실 2', icon: 'bathtub' },
    { id: 'veranda', label: '베란다', icon: 'wind' },
    { id: 'kitchen', label: '주방 바닥', icon: 'soup' },
    { id: 'entrance', label: '현관 바닥', icon: 'key' },
];

export const SILICON_AREAS = [
    { id: 'silicon_sink', label: '욕실 젠다이/세면대', icon: 'scissors', basePrice: 40000 },
    { id: 'silicon_kitchen', label: '주방 싱크대/걸레받이', icon: 'scissors', basePrice: 50000 },
];

export const REVIEW_EVENTS = [
    { id: 'blog', label: '블로그 리뷰', discount: 20000 },
    { id: 'cafe', label: '카페 리뷰', discount: 10000 },
];

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

    // 1. 줄눈 시공 항목 가격 계산 및 합계 누적 (fullOriginalPrice 및 subTotal)
    SERVICE_AREAS.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
            // 해당 현장 유형에 맞는 기본 단가 적용
            // bathroom1, bathroom2, veranda, kitchen, entrance 모두 여기서 가격을 가져옵니다.
            const price = PRICE_TABLE[baseMaterial][housingType][area.id] || 0;
            fullOriginalPrice += price * count;
            subTotal += price * count;
        }
    });

    // 2. 실리콘 오염방지 항목 가격 계산 및 합계 누적
    SILICON_AREAS.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
            fullOriginalPrice += area.basePrice * count;
            subTotal += area.basePrice * count;
        }
    });

    // ---------------------------------------------------
    // B. 패키지 및 서비스 적용 (할인 로직)
    // ---------------------------------------------------

    let isPackageActive = false;
    let priceAfterPackageDiscount = subTotal;
    let label = "";
    const FREE_SILICON_AREAS = [];
    let isFreeEntrance = false;

    // 패키지 활성화 조건 (욕실 2개 이상 선택 AND (베란다 1개 이상 OR 주방 1개 이상) 선택)
    const bathCount = (quantities.bathroom1 || 0) + (quantities.bathroom2 || 0);
    const hasVeranda = (quantities.veranda || 0) > 0;
    const hasKitchen = (quantities.kitchen || 0) > 0;
    
    if (bathCount >= 2 && (hasVeranda || hasKitchen)) {
        isPackageActive = true;
        
        // 1. 패키지 이름/라벨 결정
        if (bathCount >= 2 && hasVeranda && hasKitchen) {
            label = "풀패키지 할인";
        } else if (bathCount >= 2 && hasVeranda) {
            label = "베란다 패키지";
        } else if (bathCount >= 2 && hasKitchen) {
            label = "주방 패키지";
        }
        
        // 2. 서비스 항목 결정 및 가격 조정 (차감)
        
        // [현관 무료 서비스] (Polyaspartic으로만 제공한다고 가정)
        // 현관이 선택되었고 수량이 1개 이상일 경우
        if ((quantities.entrance || 0) > 0) {
             // 현관 가격을 차감하고, 서비스 플래그 설정
             const entrancePrice = PRICE_TABLE.poly[housingType].entrance || 0;
             // priceAfterPackageDiscount는 이미 subTotal(entrance 포함)로 초기화되었으므로 가격을 차감함
             priceAfterPackageDiscount -= entrancePrice * (quantities.entrance || 0); // 수량만큼 차감
             isFreeEntrance = true;
             
             // 주의: 현관이 2개 이상 선택되는 경우는 일반적이지 않으나, 계산 로직의 정확도를 위해 수량 적용
        }

        // [실리콘 무료 서비스] (욕실 젠다이/세면대)
        if (bathCount >= 2 && (quantities.silicon_sink || 0) > 0) {
            // priceAfterPackageDiscount는 이미 subTotal(실리콘 싱크 포함)로 초기화되었으므로 가격을 차감함
            priceAfterPackageDiscount -= (quantities.silicon_sink || 0) * (SILICON_AREAS.find(a => a.id === 'silicon_sink').basePrice);
            FREE_SILICON_AREAS.push('silicon_sink');
        }
    }

    // ---------------------------------------------------
    // C. 최소 출장 비용 적용 (Minimum Cost)
    // ---------------------------------------------------
    
    let isMinCost = false;
    if (priceAfterPackageDiscount < MIN_COST && subTotal > 0) {
        priceAfterPackageDiscount = MIN_COST;
        isMinCost = true;
    }

    // ---------------------------------------------------
    // D. 리뷰 할인 적용 (Review Discount)
    // ---------------------------------------------------

    let totalReviewDiscount = 0;
    selectedReviews.forEach(id => {
        const event = REVIEW_EVENTS.find(evt => evt.id === id);
        if (event) {
            totalReviewDiscount += event.discount;
        }
    });

    // ---------------------------------------------------
    // E. 최종 가격 계산
    // ---------------------------------------------------
    let finalPrice = priceAfterPackageDiscount - totalReviewDiscount;
    finalPrice = Math.max(0, finalPrice);

    return {
        price: finalPrice, // 최종 결제 금액
        fullOriginalPrice: fullOriginalPrice, // 할인이 하나도 적용 안 된 순수 합계
        priceAfterPackageDiscount: priceAfterPackageDiscount, // 패키지/최소 금액 적용 후 가격
        totalReviewDiscount: totalReviewDiscount, // 총 리뷰 할인 금액
        isPackageActive: isPackageActive, // 패키지 적용 여부
        isMinCost: isMinCost, // 최소 금액 적용 여부
        label: label, // 패키지 라벨
        isFreeEntrance: isFreeEntrance, // 현관 무료 서비스 여부
        FREE_SILICON_AREAS: FREE_SILICON_AREAS, // 무료 실리콘 구역 목록
    };
};