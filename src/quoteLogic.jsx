/**
 * /src/quoteLogic.jsx
 * 줄눈 견적 계산기의 데이터 및 비즈니스 로직을 포함하는 모듈입니다.
 */

const MIN_COST = 200000; 

// [데이터 정의]
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

// ***************************************************************
// [체크 완료] SERVICE_AREAS (구역 누락 문제 해결)
// ***************************************************************
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

export const FAQ_ITEMS = [ 
    { question: '줄눈 시공은 왜 필요한가요?', answer: '줄눈 사이에 곰팡이, 물때, 오염물질이 침투하는 것을 막아주어 청결한 환경을 유지하고 타일을 보호합니다. 또한, 시각적인 미관을 개선합니다.' },
    { question: '시공 시간은 얼마나 걸리나요?', answer: '일반적인 아파트 기준, 하루(약 6~8시간) 정도 소요되며, 시공 후 24시간 양생 시간이 필요합니다.' },
    { question: '다른 업체보다 비싼데 이유가 뭔가요?', answer: '저희는 10년 보증의 최고급 폴리아스파틱 소재를 사용하고, 하자 없는 꼼꼼한 시공을 원칙으로 합니다. 견적의 차이는 곧 시공 품질과 내구성에 반영됩니다.' },
    { question: 'AS는 어떻게 되나요?', answer: '폴리아스파틱 시공은 10년, 에폭시 시공은 2년 무상 A/S를 보장합니다. 단, 고객 부주의로 인한 하자는 제외됩니다.' },
];

// [가격 정의]
const PRICE_TABLE = {
    poly: {
        new: {
            bathroom1: 150000, bathroom2: 150000, veranda: 100000, kitchen: 70000, entrance: 50000,
        },
        old: {
            bathroom1: 270000, bathroom2: 270000, veranda: 180000, kitchen: 126000, entrance: 90000,
        },
    },
    epoxy: { 
        new: {
            bathroom1: 100000, bathroom2: 100000, veranda: 70000, kitchen: 50000, entrance: 30000,
        },
        old: {
            bathroom1: 180000, bathroom2: 180000, veranda: 126000, kitchen: 90000, entrance: 54000,
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

// [핵심 계산 로직]
export const calculateEstimate = (quantities, housingType, effectiveMaterialId, selectedReviews) => {
    
    let baseMaterial = 'poly';
    if (effectiveMaterialId === 'kerapoxy' || effectiveMaterialId === 'starlike' || effectiveMaterialId === 'epoxy') {
        baseMaterial = 'epoxy';
    }

    let subTotal = 0;
    let fullOriginalPrice = 0;

    // 1. 순수 시공 항목 가격 계산 및 합계 누적
    SERVICE_AREAS.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
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
    // B. 패키지 및 서비스 적용 (할인 로직) - 패키지 미적용 문제 해결 집중
    // ---------------------------------------------------

    let isPackageActive = false;
    let priceAfterPackageDiscount = subTotal;
    let label = "";
    const FREE_SILICON_AREAS = [];
    let isFreeEntrance = false;

    // ********** 패키지 활성화 조건 재확인 **********
    const bathCount = (quantities.bathroom1 || 0) + (quantities.bathroom2 || 0);
    const hasVeranda = (quantities.veranda || 0) > 0;
    const hasKitchen = (quantities.kitchen || 0) > 0;
    
    // 조건: 욕실 2개 이상 선택 AND (베란다 1개 이상 OR 주방 1개 이상)
    if (bathCount >= 2 && (hasVeranda || hasKitchen)) {
        isPackageActive = true;
        
        // 1. 패키지 이름/라벨 결정
        if (bathCount >= 2 && hasVeranda && hasKitchen) {
            label = "풀패키지 할인";
        } else {
            label = "부분 패키지 할인";
        }
        
        // 2. 서비스 항목 결정 및 가격 조정 (차감)
        
        // [현관 무료 서비스] (Polyaspartic으로만 제공)
        if ((quantities.entrance || 0) > 0) {
             const entrancePrice = PRICE_TABLE.poly[housingType].entrance || 0;
             // 현관 가격을 차감 (priceAfterPackageDiscount는 subTotal로 초기화됨)
             priceAfterPackageDiscount -= entrancePrice * (quantities.entrance || 0);
             isFreeEntrance = true;
        }

        // [실리콘 무료 서비스] (욕실 젠다이/세면대 - silicon_sink)
        if (bathCount >= 2 && (quantities.silicon_sink || 0) > 0) {
            const sinkSiliconPrice = SILICON_AREAS.find(a => a.id === 'silicon_sink').basePrice;
            // 실리콘 가격을 차감
            priceAfterPackageDiscount -= (quantities.silicon_sink || 0) * sinkSiliconPrice;
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