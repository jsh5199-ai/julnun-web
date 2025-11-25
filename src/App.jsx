// ... (계산 로직 유지)

// --- 잔여 항목 및 패키지 포함 항목 모두 계산 ---
ALL_AREAS.forEach(area => {
    // ... (중략)
    
    // 2. 핵심 패키지 항목 처리 로직 내에서 Living Room 할인을 제거 (Living Room은 핵심 패키지 항목이 아님)
    else if (packageCount > 0 && ['bathroom_floor', 'master_bath_wall', 'common_bath_wall', 'shower_booth', 'bathtub_wall'].includes(area.id)) {
        
        // ... (중략)
        
        if (count === 0) {
            // ... (중략)
        } else {
            // ★★★ 여기서 Living Room 관련 로직 제거 ★★★
            // 남은 수량(count)에 대한 일반 할인 적용 (있을 경우)
            // if (area.id === 'living_room' && isPackageActive) { 👈 이 부분이 불필요함.
            //     let fixedDiscount = (selectedMaterial.id === 'poly' ? 50000 : 150000) * count;
            //     remainingCalculatedPrice = Math.max(0, remainingCalculatedPrice - fixedDiscount);
            //     remainingDiscount = fixedDiscount;
            // } 
            
            finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000;
            finalDiscount = Math.floor(remainingDiscount / 1000) * 1000;
            total += finalCalculatedPrice;
        }

    } else {
        // 3. 일반 항목 또는 기타 패키지 할인이 적용되는 항목 처리 (여기에 Living Room 할인 로직을 남김)
        
        // Living Room 할인 로직은 여기에만 존재
        if (area.id === 'living_room' && isPackageActive) {
            let fixedDiscount = (selectedMaterial.id === 'poly' ? 50000 : 150000) * initialCount; 
            remainingCalculatedPrice = Math.max(0, itemOriginalTotal - fixedDiscount);
            remainingDiscount = fixedDiscount;
        } 
        // ... (나머지 실리콘 할인 로직 유지)
        
        finalCalculatedPrice = Math.floor(remainingCalculatedPrice / 1000) * 1000;
        finalDiscount = Math.floor(remainingDiscount / 1000) * 1000;
        total += finalCalculatedPrice;
    }
    
    // ... (중략)
});