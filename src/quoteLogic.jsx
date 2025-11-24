// quoteLogic.jsx

// ... (상단 데이터 부분은 그대로 유지) ...

// [3] 핵심 계산 함수
export const getBasePrice = (id, material) => {
    const area = SERVICE_AREAS.find(a => a.id === id) || SILICON_AREAS.find(a => a.id === id);
    if (!area) return 0;
    if (material === 'kerapoxy' && EPOXY_OVERRIDE_PRICES[id] !== undefined) {
        return EPOXY_OVERRIDE_PRICES[id]; 
    }
    return area.basePrice;
};

// [수정됨] 차액 보정 로직 적용
export const calculateEstimate = (quantities, housingTypeId, materialId, selectedReviews, itemMaterials = {}) => {
    const selectedHousing = HOUSING_TYPES.find(h => h.id === housingTypeId);
    const selectedMaterial = MATERIALS.find(m => m.id === materialId);
    let q = { ...quantities };
    let total = 0; 
    let labelText = null;
    let isPackageActive = false; 
    let isFreeEntrance = false;
    let isMinCost = false;
    const FREE_SILICON_AREAS = ['silicon_sink']; 

    // [1] 순수 개별 견적 합계 (참고용, 실제 선택된 소재 기준)
    let originalTotal = 0;
    const allAreasCombined = [...SERVICE_AREAS, ...SILICON_AREAS];
    
    allAreasCombined.forEach(area => {
        const count = quantities[area.id] || 0;
        if (count > 0) {
            const currentItemMaterial = itemMaterials[area.id] || materialId;
            let price = getBasePrice(area.id, currentItemMaterial) * count * selectedHousing.multiplier;
            const matInfo = MATERIALS.find(m => m.id === currentItemMaterial);
            
            if (currentItemMaterial === 'poly' && !EPOXY_OVERRIDE_PRICES[area.id]) {
                price *= matInfo.priceMod;
            }
            originalTotal += price;
        }
    });

    // [2] 패키지 계산을 위한 수량 변수 (메인 소재 기준 로직을 위해 사용)
    const qBathFloor = q['bathroom_floor'] || 0;
    const qShower = q['shower_booth'] || 0;
    const qBathtub = q['bathtub_wall'] || 0;
    const qMasterWall = q['master_bath_wall'] || 0;
    const qCommonWall = q['common_bath_wall'] || 0;
    const qEntrance = q['entrance'] || 0;
    const qBathWallOne = (qMasterWall >= 1 || qCommonWall >= 1);
    const qBathWallTotal = qMasterWall + qCommonWall;

    // --- 패키지 로직 (메인 소재 기준으로 우선 적용) ---
    // 주의: 여기서 total에 더해지는 금액은 "메인 소재" 가격 기준입니다.
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
        // [55만원 패키지 우선 적용]
        if (qBathFloor >= 2 && qEntrance >= 1 && qBathWallTotal === 0 && qShower === 0 && qBathtub === 0) { 
            total += 550000; q['bathroom_floor'] -= 2; q['entrance'] -= 1; isPackageActive = true; isFreeEntrance = true; labelText = '에폭시 바닥 현관 패키지 (55만원)'; 
        }
        else if (qBathFloor >= 2 && qBathWallTotal >= 2) { 
            total += 1400000; q['bathroom_floor'] -= 2; q['master_bath_wall'] = Math.max(0, q['master_bath_wall'] - 1); q['common_bath_wall'] = Math.max(0, q['common_bath_wall'] - 1); isPackageActive = true; isFreeEntrance = true; labelText = '에폭시 풀패키지 (140만원)'; 
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
            total += 550000; q['bathroom_floor'] -= 2; isPackageActive = true; labelText = '에폭시 바닥 더블 패키지 (55만원)'; 
        }
    }

    // [3] 잔여 개별 항목 계산 (메인 소재 가격 기준)
    // 중요: 여기서도 일단 '메인 소재' 가격으로 더합니다. 소재 변경 차액은 아래 [4]에서 한꺼번에 처리합니다.
    [...SERVICE_AREAS, ...SILICON_AREAS].forEach(area => {
        const count = q[area.id] || 0;
        if (count > 0) {
            if (isPackageActive && FREE_SILICON_AREAS.includes(area.id)) return; 
            
            // 일단 메인 소재(materialId) 가격으로 계산
            let price = getBasePrice(area.id, materialId) * count * selectedHousing.multiplier;
            
            // 메인 소재가 폴리일 경우 모디파이어 적용
            if (materialId === 'poly' && !EPOXY_OVERRIDE_PRICES[area.id]) {
                price *= selectedMaterial.priceMod;
            }

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

    // [4] 소재 변경 차액 보정 (Material Adjustment)
    // 실제 선택된 소재(itemMaterials)와 메인 소재(materialId)가 다른 경우, 그 차액만큼 더하거나 뺍니다.
    allAreasCombined.forEach(area => {
        const count = quantities[area.id] || 0;
        const currentItemMaterial = itemMaterials[area.id] || materialId;

        if (count > 0 && currentItemMaterial !== materialId) {
            // A. 메인 소재 기준 가격 (이미 total에 반영된 기준)
            let mainBasePrice = getBasePrice(area.id, materialId);
            if (materialId === 'poly' && !EPOXY_OVERRIDE_PRICES[area.id]) {
                mainBasePrice *= selectedMaterial.priceMod; // 1.0
            }

            // B. 실제 선택 소재 기준 가격
            let actualBasePrice = getBasePrice(area.id, currentItemMaterial);
            const actualMatInfo = MATERIALS.find(m => m.id === currentItemMaterial);
            if (currentItemMaterial === 'poly' && !EPOXY_OVERRIDE_PRICES[area.id]) {
                actualBasePrice *= actualMatInfo.priceMod;
            }

            // C. 차액 계산 (실제 - 메인)
            // 예: 에폭시(35만) -> 폴리(15만) 변경 시: 15 - 35 = -20만 (Total에서 차감)
            const diff = (actualBasePrice - mainBasePrice) * count * selectedHousing.multiplier;
            
            // 현관이 무료 서비스(FreeEntrance)인 경우, 소재를 바꿔도 0원이어야 하므로 차액 계산 제외
            if (area.id === 'entrance' && isFreeEntrance) {
                // 현관 무료인데 소재를 바꿨다고 돈을 더하거나 빼면 안됨
            } else {
                total += diff;
            }
        }
    });

    const priceAfterPackageDiscount = total; 
    const totalCount = Object.values(quantities).reduce((a, b) => a + b, 0);
    if (totalCount === 1 && priceAfterPackageDiscount < 200000 && priceAfterPackageDiscount > 0) {
        total = 200000; isMinCost = true;
    }

    let discountAmount = 0;
    if (labelText === '30만원 패키지') {
        // 30만원 패키지 오버라이드는 이미 로직에 포함됨
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