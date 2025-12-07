// ⭐️ [App Main] ⭐️
export default function App() {
    // ... (기존 state 및 로직 유지) ...
    const [housingType, setHousingType] = useState('new');
    const [material, setMaterial] = useState('poly');
    const [polyOption, setPolyOption] = useState('pearl');
    const [epoxyOption, setEpoxyOption] = useState('kerapoxy');
    const [selectedGroutColor, setSelectedGroutColor] = useState(GROUT_COLORS[0].id);
    const [brightnessLevel, setBrightnessLevel] = useState(0);
    const [tileImageURL, setTileImageURL] = useState(DEFAULT_TILE_IMAGE_URL);
    const [quantities, setQuantities] = useState([...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 0 }), {}));
    const [areaMaterials, setAreaMaterials] = useState([...ALL_AREAS].reduce((acc, area) => ({ ...acc, [area.id]: 'poly' }), {}));
    const [selectedReviews, setSelectedReviews] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(YOUTUBE_VIDEOS[0].id);
    const quoteRef = useRef(null);
    const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';

    useEffect(() => {
        if (quantities['entrance'] > 0 && areaMaterials['entrance'] !== 'poly') {
            setAreaMaterials(prev => ({ ...prev, 'entrance': 'poly' }));
        }
    }, [quantities['entrance']]);

    // ⭐️ 수량 변경 핸들러 (바닥 2곳 합산 로직 포함)
    const handleQuantityChange = useCallback((id, delta) => {
        setQuantities(prev => {
            const currentQty = prev[id] || 0;
            let newQty = Math.max(0, currentQty + delta);
            const newQuantities = { ...prev, [id]: newQty };
            if (newQty > 0) {
                if (id === 'master_bath_wall' && (newQuantities['shower_booth'] || 0) > 0) newQuantities['shower_booth'] = 0;
                if (id === 'common_bath_wall' && (newQuantities['bathtub_wall'] || 0) > 0) newQuantities['bathtub_wall'] = 0;
                if (id === 'shower_booth' && (newQuantities['master_bath_wall'] || 0) > 0) newQuantities['master_bath_wall'] = 0;
                if (id === 'bathtub_wall' && (newQuantities['common_bath_wall'] || 0) > 0) newQuantities['common_bath_wall'] = 0;
            }
            
            // 바닥 합산 계산 (안방+공용)
            const prevFloorCount = (prev['master_bath_floor'] || 0) + (prev['common_bath_floor'] || 0);
            const newFloorCount = (newQuantities['master_bath_floor'] || 0) + (newQuantities['common_bath_floor'] || 0);

            // 현관 무료 로직 (바닥 2곳 이상 시 자동 선택)
            if (newFloorCount >= 2 && newQuantities['entrance'] === 0) { 
                newQuantities['entrance'] = 1; 
            }
            else if (newFloorCount < 2 && prevFloorCount >= 2 && prev['entrance'] === 1 && newQuantities['entrance'] === 1) {
                if (newQuantities['entrance'] === 1) { newQuantities['entrance'] = 0; }
            }
            return newQuantities;
        });
    }, []);

    const handleAreaMaterialChange = useCallback((id, mat) => {
        if (id === 'entrance') { setAreaMaterials(prev => ({ ...prev, [id]: 'poly' })); }
        else { setAreaMaterials(prev => ({ ...prev, [id]: mat })); }
    }, []);

    const toggleReview = useCallback((id) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    }, []);

    const getSelectionSummary = useCallback((q, areaMats) => {
        const summary = {};
        for (const id in q) {
            const qty = q[id];
            if (qty > 0) {
                const mat = (id === 'entrance') ? 'poly' : areaMats[id];
                const matKey = (mat === 'poly') ? 'poly' : 'kerapoxy';
                if (!summary[matKey]) summary[matKey] = {};
                summary[matKey][id] = qty;
            }
        }
        if (q['entrance'] > 0) {
            if (!summary['poly']) summary['poly'] = {};
            summary['poly']['entrance'] = q['entrance'];
            if(summary['kerapoxy'] && summary['kerapoxy']['entrance']) delete summary['kerapoxy']['entrance'];
        }
        return summary;
    }, []);

    const findMatchingPackage = useCallback((selectionSummary, quantities) => {
           const filterSelections = (selections) => {
             const filtered = {};
             for (const id in selections) {
                 if (!OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION.includes(id)) {
                     filtered[id] = selections[id];
                 }
             }
             return filtered;
         };

        const filteredPolySelections = filterSelections(selectionSummary['poly'] || {});
        const filteredEpoxySelections = filterSelections(selectionSummary['kerapoxy'] || {});

        // ⭐️ [중요] 안방/공용 바닥을 'bathroom_floor'라는 가상의 키로 합산하여 패키지 매칭
        const virtualPolyFloors = (filteredPolySelections['master_bath_floor'] || 0) + (filteredPolySelections['common_bath_floor'] || 0);
        const virtualEpoxyFloors = (filteredEpoxySelections['master_bath_floor'] || 0) + (filteredEpoxySelections['common_bath_floor'] || 0);
        
        // 기존 개별 키는 유지하되, 패키지 매칭용 합산 키 추가
        if (virtualPolyFloors > 0) filteredPolySelections['bathroom_floor'] = virtualPolyFloors;
        if (virtualEpoxyFloors > 0) filteredEpoxySelections['bathroom_floor'] = virtualEpoxyFloors;

        const totalSelectedCount = Object.values(filteredPolySelections).reduce((sum, v) => sum + v, 0) +
                                   Object.values(filteredEpoxySelections).reduce((sum, v) => sum + v, 0) 
                                   - (virtualPolyFloors > 0 ? virtualPolyFloors : 0) // 중복 합산 방지 (가상키 제외)
                                   - (virtualEpoxyFloors > 0 ? virtualEpoxyFloors : 0);

        if (totalSelectedCount === 0) return null;
        const sortedPackages = MIXED_PACKAGES;

        for (const pkg of sortedPackages) {
            let tempPolySelections = { ...filteredPolySelections };
            let tempEpoxySelections = { ...filteredEpoxySelections };
            let appliedAutoEntrance = false;

            // ⭐️ 패키지 타입에 따라 비교할 키(Key) 정리 (Aliasing 처리)
            const pkgAreaIds = getPackageAreaIds(pkg);
            const usesGenericFloor = pkgAreaIds.includes('bathroom_floor');
            
            // 이 패키지가 'bathroom_floor'를 쓴다면 -> 구체적 바닥 키(master/common)는 비교 대상에서 제거
            // 이 패키지가 구체적 바닥 키를 쓴다면 -> 가상 키(bathroom_floor)는 비교 대상에서 제거
            if (usesGenericFloor) {
                delete tempPolySelections['master_bath_floor'];
                delete tempPolySelections['common_bath_floor'];
                delete tempEpoxySelections['master_bath_floor'];
                delete tempEpoxySelections['common_bath_floor'];
            } else {
                delete tempPolySelections['bathroom_floor'];
                delete tempEpoxySelections['bathroom_floor'];
            }

            // Flexible 패키지 로직 (기존 유지)
            if (pkg.isFlexible) {
                // ...
                const requiredPolyAreas = pkg.P_areas.map(([id]) => id).filter(id => id !== 'entrance');
                const requiredEpoxyAreas = pkg.E_areas.map(([id]) => id);
                let baseMatch = true;
                for (const id of requiredPolyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                    const requiredQty = pkg.P_areas.find(([pkId]) => pkId === id)[1];
                    if ((tempPolySelections[id] || 0) !== requiredQty) {
                        baseMatch = false;
                        break;
                    }
                }
                if (!baseMatch) continue;

                for (const id of requiredEpoxyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                    const requiredQty = pkg.E_areas.find(([pkId]) => pkId === id)[1];
                    if ((tempEpoxySelections[id] || 0) !== requiredQty) {
                        baseMatch = false;
                        break;
                    }
                }
                if (!baseMatch) continue;

                const flexibleSelectedPolyCount = pkg.flexibleGroup.filter(id => tempPolySelections[id] > 0).length;
                const flexibleSelectedEpoxyCount = pkg.flexibleGroup.filter(id => tempEpoxySelections[id] > 0).length;
                const isPolyFlexiblePackage = pkg.id.startsWith('USER_P_');
                const isEpoxyFlexiblePackage = pkg.id.startsWith('USER_E_');
                let flexibleMatch = false;

                if (isPolyFlexiblePackage) {
                    flexibleMatch = flexibleSelectedPolyCount === 1 && flexibleSelectedEpoxyCount === 0;
                    if (flexibleMatch) {
                        const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempPolySelections[id] > 0);
                        if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                        if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                    }
                } else if (isEpoxyFlexiblePackage) {
                    flexibleMatch = flexibleSelectedEpoxyCount === 1 && flexibleSelectedEpoxyCount === 0;
                    if (flexibleMatch) {
                        const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempEpoxySelections[id] > 0);
                        if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                        if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                    }
                }

                if (baseMatch && flexibleMatch) {
                    return { ...pkg, autoEntrance: appliedAutoEntrance };
                }
                continue;
            }

            // Standard Package Logic
            let isMatch = true;
            for (const [id, requiredQty] of pkg.P_areas) {
                if ((tempPolySelections[id] || 0) !== requiredQty) {
                    isMatch = false; break;
                }
            }
            if (!isMatch) continue;

            for (const [id, requiredQty] of pkg.E_areas) {
                if ((tempEpoxySelections[id] || 0) !== requiredQty) {
                    isMatch = false; break;
                }
            }
            if (!isMatch) continue;

            // ID Set Check
            const selectedAreaIds = new Set([
                ...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), 
                ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)
            ]);
            const packageAreaIdsSet = new Set(getPackageAreaIds(pkg));
            
            const isIdSetMatch = selectedAreaIds.size === packageAreaIdsSet.size &&
                                     [...selectedAreaIds].every(id => packageAreaIdsSet.has(id));

            if (isIdSetMatch) {
                return { ...pkg, autoEntrance: appliedAutoEntrance };
            }
        }
        return null;
    }, []);

    const calculation = useMemo(() => {
        // ... (계산 로직 전체 유지) ...
          const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
        let itemizedPrices = [];

        const selectionSummary = getSelectionSummary(quantities, areaMaterials);
        const matchedPackageResult = findMatchingPackage(selectionSummary, quantities);
        const matchedPackage = matchedPackageResult ? matchedPackageResult : null;

        let q = { ...quantities };
        let total = 0;
        let labelText = null;
        let isPackageActive = false;
        let isFreeEntrance = false;
        let totalAreaCount = Object.values(quantities).some(v => v > 0) ? Object.keys(quantities).filter(k => quantities[k] > 0).length : 0;
        
        // ⭐️ 바닥 합산 수량
        let totalBathroomFloorCount = (q['master_bath_floor'] || 0) + (q['common_bath_floor'] || 0);

        let packageAreas = [];

        if (matchedPackage) {
            total = matchedPackage.price;
            isPackageActive = true;
            labelText = '패키지 할인 적용 중';
            packageAreas = getPackageAreaIds(matchedPackage);
            
            // 패키지에 포함된 항목 수량 0 처리
            packageAreas.forEach(id => { 
                if (id === 'bathroom_floor') {
                    q['master_bath_floor'] = 0;
                    q['common_bath_floor'] = 0;
                } else {
                    q[id] = 0; 
                }
            });

            if (quantities['entrance'] >= 1) {
                isFreeEntrance = true;
                q['entrance'] = 0;
            }
        }

        if (totalBathroomFloorCount >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
            isFreeEntrance = true;
            isPackageActive = true;
            labelText = '현관 서비스 적용 중';
            q['entrance'] = 0;
        }

        let priceBeforeAllDiscount = 0;

        ALL_AREAS.forEach(area => {
            const initialCount = quantities[area.id] || 0;
            if (initialCount === 0) return;
            const count = q[area.id] || 0;
            const areaMatId = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
            const isEpoxy = areaMatId === 'kerapoxy';

            const priceKey = areaMatId === 'poly' ? 'poly' : 'epoxy';

            let originalPriceFromConst = (ORIGINAL_PRICES[area.id] && ORIGINAL_PRICES[area.id][priceKey] !== undefined)
                ? ORIGINAL_PRICES[area.id][priceKey]
                : (area.basePrice * (isEpoxy ? MATERIALS.find(m => m.id === 'kerapoxy').priceMod : 1.0) * selectedHousing.multiplier);

            let itemOriginalTotal = originalPriceFromConst * initialCount;
            priceBeforeAllDiscount += itemOriginalTotal; 

            let finalUnitBasePrice = area.basePrice;
            if (area.id === 'balcony_laundry') {
                finalUnitBasePrice = isEpoxy ? 250000 : 100000;
            } else if (area.id === 'kitchen_wall') {
                finalUnitBasePrice = isEpoxy ? 250000 : 150000;
            } else if (area.id === 'living_room') {
                finalUnitBasePrice = isEpoxy ? 1100000 : 550000;
            } else if (area.id === 'entrance') {
                finalUnitBasePrice = 50000;
            } else if (BATHROOM_AREAS.some(a => a.id === area.id)) {
                finalUnitBasePrice = area.basePrice * (isEpoxy ? 1.8 : 1.0);
            } else if (area.id === 'silicon_kitchen_top') {
                finalUnitBasePrice = 50000;
            }

            const calculatedPricePerUnit = Math.floor(finalUnitBasePrice * selectedHousing.multiplier);
            let finalCalculatedPrice = 0;
            let finalDiscount = 0;
            let isFreeServiceItem = false;
            
            // 패키지 카운트 계산 (바닥인 경우 합산)
            let packageCount = initialCount - count;

            let isPackageItemFlag = false;

            // 무료 현관 또는 패키지 포함 항목 처리
            const isAreaInPackage = packageAreas.includes(area.id) || (area.id.includes('bath_floor') && packageAreas.includes('bathroom_floor'));

            if ((matchedPackage || isFreeEntrance) && isAreaInPackage && count === 0) {
                 finalCalculatedPrice = 0;
                 finalDiscount = itemOriginalTotal; 
                 isFreeServiceItem = area.id === 'entrance' || isAreaInPackage;
                 isPackageItemFlag = true; 
            }
            else if (area.id === 'entrance' && isFreeEntrance && !matchedPackage && count === 0) {
                finalCalculatedPrice = 0;
                finalDiscount = itemOriginalTotal; 
                isFreeServiceItem = true;
                isPackageItemFlag = true; 
            }
            else {
                let remainingCalculatedPrice = calculatedPricePerUnit * count;
                let remainingDiscount = 0;

                if (area.id === 'silicon_bathtub' && totalAreaCount >= 3) {
                    const nonPackageOriginalPrice = 80000 * count;
                    const fixedPriceForRemaining = 50000 * count;
                    if (count > 0) {
                        remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                        remainingCalculatedPrice = fixedPriceForRemaining;
                        isPackageItemFlag = true; 
                    }
                } else if (area.id === 'silicon_living_baseboard' && totalAreaCount >= 3) {
                    const nonPackageOriginalPrice = 400000 * count;
                    const fixedPriceForRemaining = 350000 * count;
                    if (count > 0) {
                        remainingDiscount = nonPackageOriginalPrice - fixedPriceForRemaining;
                        remainingCalculatedPrice = fixedPriceForRemaining;
                        isPackageItemFlag = true;
                    }
                } else if (area.id === 'silicon_sink') {
                    remainingCalculatedPrice = 30000 * count;
                }
                finalCalculatedPrice = remainingCalculatedPrice;
                finalDiscount = remainingDiscount;
                total += finalCalculatedPrice;
            }

            finalCalculatedPrice = Math.floor(finalCalculatedPrice / 1000) * 1000;
            itemOriginalTotal = Math.floor(itemOriginalTotal / 1000) * 1000;
            finalDiscount = Math.floor(finalDiscount / 1000) * 1000;

            itemizedPrices.push({
                id: area.id,
                label: area.label,
                quantity: initialCount, 
                unit: area.unit,
                originalPrice: itemOriginalTotal, 
                calculatedPrice: finalCalculatedPrice,
                discount: finalDiscount,
                isFreeService: isFreeServiceItem,
                isPackageItem: isPackageItemFlag || !isFreeServiceItem && (isPackageActive || finalDiscount > 0),
                isDiscount: false,
                // 한글로 데이터 직접 생성 (렌더링 시 오류 방지)
                materialLabel: ['silicon_bathtub', 'silicon_kitchen_top', 'silicon_living_baseboard'].includes(area.id) 
                    ? '실리콘' 
                    : (areaMatId === 'poly' ? '폴리아스파틱' : '에폭시')
            });
        });

        let discountAmount = 0;
        REVIEW_EVENTS.forEach(evt => {
            if (selectedReviews.has(evt.id)) {
                discountAmount += evt.discount;
                itemizedPrices.push({ id: evt.id, label: evt.label, quantity: 1, unit: '건', originalPrice: evt.discount, calculatedPrice: 0, discount: evt.discount, isPackageItem: false, isDiscount: true, materialLabel: 'Event' });
            }
        });
        total -= discountAmount;

        let originalCalculatedPrice = Math.max(0, Math.floor(total / 1000) * 1000);
        let finalPrice = originalCalculatedPrice;
        let minimumFeeApplied = false;

        if (finalPrice > 0 && finalPrice < MIN_FEE) {
            finalPrice = MIN_FEE;
            minimumFeeApplied = true;
        }


        if (isFreeEntrance && !matchedPackage) {
            labelText = '현관 서비스 적용 중';
        } else if (matchedPackage) {
            labelText = '패키지 할인 적용 중';
        }

        return {
            price: finalPrice,
            originalCalculatedPrice,
            priceBeforeAllDiscount: Math.floor(priceBeforeAllDiscount / 1000) * 1000, 
            label: labelText,
            isPackageActive: isPackageActive || isFreeEntrance,
            isFreeEntrance: isFreeEntrance,
            discountAmount: priceBeforeAllDiscount - finalPrice, 
            minimumFeeApplied,
            itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount),
        };
    }, [quantities, selectedReviews, housingType, areaMaterials, getSelectionSummary, findMatchingPackage]);

    const handleTileImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => { setTileImageURL(reader.result); };
            reader.readAsDataURL(file);
        }
    };
    const handleTileImageReset = useCallback(() => { setTileImageURL(DEFAULT_TILE_IMAGE_URL); }, []);

    const selectedMaterialData = MATERIALS.find(m => m.id === material);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    const hasSelections = Object.values(quantities).some(v => v > 0);
    const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
    const currentEmbedUrl = getEmbedUrl(currentVideo.id);

    const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => {
        if (areaId === 'entrance') {
            return (
                <div className='mt-3 pt-2 border-t border-slate-100 flex items-center justify-center'>
                     <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                         현관 = 폴리아스파틱 (Poly) 고정
                     </span>
                </div>
            );
        }
        if (['silicon_bathtub', 'silicon_kitchen_top', 'silicon_living_baseboard'].includes(areaId)) {
            return (
                <div className='mt-3 pt-2 border-t border-slate-100 flex items-center justify-center'>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        실리콘 전용 소재
                    </span>
                </div>
            );
        }
        return (
            <div className={`mt-3 pt-2 border-t border-slate-100 ${isQuantitySelected ? 'animate-slide-down' : ''}`}>
                <div className='flex gap-2'>
                    {MATERIALS.map(mat => (
                        <button
                            key={mat.id}
                            onClick={(e) => { e.stopPropagation(); onChange(areaId, mat.id); }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 border
                                ${currentMat === mat.id
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {mat.label.split('(')[0].trim()}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderAreaList = (areas) => (
        <div className="space-y-4">
            {areas.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
                
                // ⭐️ 자동선택 로직 (안방+공용 바닥 합산 >= 2 이면 현관 자동)
                const totalBathroomFloor = (quantities['master_bath_floor'] || 0) + (quantities['common_bath_floor'] || 0);
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && totalBathroomFloor >= 2 && !calculation.isPackageActive;
                
                const description = area.desc || area.basePrice ? ((area.desc && area.desc.trim() !== '') ? (<div className="text-xs text-indigo-500 mt-0.5">{area.desc}</div>) : null) : null;

                return (
                    <div key={area.id} className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 card-shadow group ${isSelected ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-lg' : 'bg-white border-transparent hover:border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors duration-300 ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
                                    <Icon size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className={`font-bold text-base transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{area.label}</div>
                                    {description}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => handleQuantityChange(area.id, -1)}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-all active:scale-90 bg-white shadow-sm ${quantities[area.id] > 0 ? 'text-slate-800 hover:text-red-500' : 'text-slate-300'}`}
                                >-</button>
                                <span className={`w-6 text-center text-sm font-black ${quantities[area.id] > 0 ? 'text-slate-800' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                                <button
                                    onClick={() => { handleQuantityChange(area.id, 1); if (quantities[area.id] === 0) handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material); }}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-all active:scale-90 bg-white shadow-sm hover:text-indigo-600 hover:bg-indigo-50 text-slate-800`}
                                >+</button>
                            </div>
                        </div>
                        {isSelected && (
                            <MaterialSelectButtons areaId={area.id} currentMat={currentMat} onChange={handleAreaMaterialChange} isQuantitySelected={isSelected} />
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50 font-sans pb-48 selection:bg-indigo-100 selection:text-indigo-900`}>
            <GlobalStyles />

            {/* ⭐️ [수정] glass-header 대신 opaque-header 클래스 사용 및 bg-white로 불투명 배경 확보 */}
            <header className="opaque-header sticky top-0 z-30 transition-all duration-300 bg-white border-b border-slate-100">
                <div className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                            M
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tighter">MIHAK<span className="text-indigo-600 text-[10px] font-bold ml-1 align-top">PRO</span></h1>
                    </div>
                    <div className='flex gap-2'>
                        <button onClick={() => window.location.href = `tel:${PHONE_NUMBER}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-indigo-600 transition active:scale-90">
                            <Phone size={18} />
                        </button>
                        <button onClick={() => window.location.reload()} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-indigo-600 transition active:scale-90">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
                <ReservationTicker variant="top-bar" />
            </header>

            <main className="max-w-lg mx-auto p-5 space-y-8">
                
                <section className="bg-white rounded-[1.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-white animate-fade-in group">
                    <div className="relative aspect-video w-full bg-slate-900">
                         <iframe key={currentVideo.id} width="100%" height="100%" src={currentEmbedUrl} title={currentVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0 opacity-90 group-hover:opacity-100 transition-opacity duration-500"></iframe>
                    </div>
                    <div className="p-2 flex gap-2 bg-white">
                        {YOUTUBE_VIDEOS.map((video) => (
                            <button
                                key={video.id}
                                onClick={() => setActiveVideoId(video.id)}
                                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 active:scale-[0.98] ${activeVideoId === video.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {video.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ⭐️ [디자인 수정됨] 시공 소재 선택 섹션 - 배경 아이콘 복구, 문구 아이콘 제거 */}
                <section className="animate-fade-in delay-200">
                    <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-md shadow-indigo-200">1</span>
                        시공 소재 안내
                    </h2>
                    
                    <div className="space-y-5">
                        {MATERIALS.map((item) => {
                            const isSelected = item.id === material;
                            // 소재별 테마 컬러 설정
                            const theme = item.id === 'poly' 
                                ? { 
                                    bg: 'bg-gradient-to-br from-white to-slate-50', 
                                    border: 'border-slate-200', 
                                    activeBorder: 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2',
                                    iconColor: 'text-slate-200',
                                    activeIconColor: 'text-indigo-600',
                                    badge: 'bg-slate-100 text-slate-600'
                                    }
                                : { 
                                    bg: 'bg-gradient-to-br from-[#fffdf5] to-[#fff7ed]', 
                                    border: 'border-amber-100', 
                                    activeBorder: 'border-amber-500 ring-2 ring-amber-500 ring-offset-2',
                                    iconColor: 'text-amber-100',
                                    activeIconColor: 'text-amber-600',
                                    badge: 'bg-amber-100 text-amber-700'
                                    };

                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setMaterial(item.id)} 
                                    className={`relative overflow-hidden rounded-[1.5rem] cursor-pointer transition-all duration-300 group ${isSelected ? `${theme.activeBorder} shadow-xl` : `${theme.border} border shadow-sm hover:shadow-md hover:-translate-y-1`} ${theme.bg}`}
                                >
                                    {/* ⭐️ [복구] 배경 장식 아이콘 */}
                                    <div className={`absolute -right-4 -bottom-4 opacity-20 transition-transform duration-500 ${isSelected ? 'scale-110 rotate-12' : 'scale-100'}`}>
                                        {item.id === 'poly' ? <Sparkles size={120} className={theme.iconColor} /> : <Crown size={120} className={theme.iconColor} />}
                                    </div>

                                    <div className="p-6 relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className='flex items-center gap-3'>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? `${theme.activeIconColor} bg-current border-transparent` : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <div>
                                                    <span className={`font-black text-xl ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{item.label}</span>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full shadow-sm ${theme.badge}`}>
                                                {item.badge}
                                            </span>
                                        </div>
                                        
                                        <p className={`text-sm pl-9 leading-relaxed font-medium ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {item.description}
                                        </p>
                                        
                                        {/* ⭐️ [수정] 상세 옵션 버튼 - 문구 아이콘 제거 */}
                                        <div className={`grid grid-rows-[0fr] transition-all duration-300 ease-out ${isSelected ? 'grid-rows-[1fr] mt-5' : 'mt-0'}`}>
                                            <div className="overflow-hidden pl-1">
                                                <div className="p-1.5 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-inner flex gap-2">
                                                    {item.id === 'poly' && (
                                                        <>
                                                            <button onClick={(e) => { e.stopPropagation(); setPolyOption('pearl'); }} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 ${polyOption === 'pearl' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-transparent text-slate-500 hover:bg-white'}`}>
                                                                펄
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); setPolyOption('no_pearl'); }} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 ${polyOption === 'no_pearl' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-transparent text-slate-500 hover:bg-white'}`}>
                                                                무펄
                                                            </button>
                                                        </>
                                                    )}
                                                    {item.id === 'kerapoxy' && (
                                                        <>
                                                            <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('starlike'); }} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 ${epoxyOption === 'starlike' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-transparent text-slate-500 hover:bg-white'}`}>
                                                                스타라이크 EVO
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('kerapoxy'); }} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 ${epoxyOption === 'kerapoxy' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-transparent text-slate-500 hover:bg-white'}`}>
                                                                케라폭시
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={() => setShowMaterialModal(true)} className="w-full mt-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-1.5">
                        <HelpCircle size={14} className='text-indigo-500'/> 소재 선택이 고민되시나요? 비교 가이드 보기
                    </button>

                    <ColorPalette
                        selectedColorId={selectedGroutColor} onSelect={setSelectedGroutColor}
                        onTileImageUpload={handleTileImageUpload} tileImageURL={tileImageURL}
                        brightnessLevel={brightnessLevel} onBrightnessChange={setBrightnessLevel}
                        onTileImageReset={handleTileImageReset}
                    />
                </section>

                <section className="animate-fade-in delay-300 mt-16 pt-10 border-t border-slate-200/60">
                     <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold">2</span>
                        시공 범위 선택
                    </h2>

                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                                <ShieldCheck size={18} strokeWidth={2.5} />
                            </div>
                            <div className='flex-1'>
                                <div className="text-sm font-bold text-indigo-900">신축·구축 동일 정가제</div>
                                <div className="text-[11px] text-indigo-700/80 leading-tight mt-0.5">난이도에 따른 추가금 없는 정직한 시공</div>
                            </div>
                        </div>
                        <div className="h-px bg-indigo-200/50 w-full"></div>
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                                <Ruler size={18} strokeWidth={2.5} />
                            </div>
                            <div className='flex-1'>
                                <div className="text-sm font-bold text-indigo-900">견적 기준 사이즈</div>
                                <div className="text-[11px] text-indigo-700/80 leading-tight mt-0.5">바닥 30x30cm, 벽면 30x60cm 타일크기 기준</div>
                            </div>
                        </div>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1 uppercase tracking-wider">Bathroom</h3>
                    {renderAreaList(BATHROOM_AREAS)}

                    <div className="h-px bg-slate-200 my-8"></div>

                    <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1 uppercase tracking-wider">Living & Kitchen</h3>
                    {renderAreaList(OTHER_AREAS)}
                </section>

                   <section className="animate-fade-in delay-500">
                       <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold">3</span>
                        실리콘 리폼
                    </h2>
                    {renderAreaList(SILICON_AREAS)}
                </section>

                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 animate-fade-in delay-700">
                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-amber-400"/> 자주 묻는 질문
                    </h2>
                    <div className="space-y-2">
                        {FAQ_ITEMS.map((item, index) => <Accordion key={index} question={item.question} answer={item.answer} />)}
                    </div>
                </section>

                <button
                    onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition shadow-xl shadow-slate-300 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Star size={20} className="text-amber-400" fill="currentColor" />
                    실제 고객 후기 보러가기 (5.0점)
                </button>
            </main>

            {hasSelections && (
                <div className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 animate-slide-up">
                    <div className="max-w-lg mx-auto">
                        <div className="px-5 pb-2">
                            <ReservationTicker />
                        </div>

                        {/* ⭐️ [수정됨] glass-panel 제거 -> bg-white로 변경하여 완전 불투명 처리 */}
                        <div className="bg-white border-t border-slate-200 px-5 pt-5 pb-12 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] safe-area-bottom rounded-t-[2rem]">
                            <div className='flex items-end justify-between mb-4'>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 mb-1">예상 견적 금액</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-[#0f172a] tracking-tighter">{calculation.price.toLocaleString()}</span>
                                        <span className="text-base font-bold text-slate-600">원</span>
                                    </div>
                                </div>
                                
                                <div className='flex flex-col items-end'>
                                    {calculation.minimumFeeApplied && (
                                        <div className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full mb-1">
                                            최소 출장비 적용
                                        </div>
                                    )}
                                    {calculation.label && !calculation.minimumFeeApplied && (
                                            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full mb-1 flex items-center gap-1">
                                                <Crown size={10} fill="currentColor"/> {calculation.label}
                                            </div>
                                    )}
                                    {((calculation.minimumFeeApplied || calculation.isPackageActive) && (calculation.priceBeforeAllDiscount > calculation.price)) && (
                                        <span className="text-xs text-slate-400 line-through font-medium">
                                            {calculation.priceBeforeAllDiscount.toLocaleString()}원
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className='grid grid-cols-5 gap-3'>
                                <button
                                    onClick={() => { setShowModal(true); }}
                                    className="col-span-3 py-4 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <List size={18} /> 견적서 확인
                                </button>
                                <a
                                    href={KAKAO_CHAT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="col-span-2 py-4 rounded-2xl font-bold text-slate-900 bg-[#FAE100] hover:bg-[#FCE620] shadow-lg shadow-yellow-200/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Layers size={18} /> 카톡상담
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
            {showModal && (
                <QuoteModal
                    calculation={calculation}
                    onClose={() => setShowModal(false)}
                    quoteRef={quoteRef}
                    selectedReviews={selectedReviews}
                    toggleReview={toggleReview}
                />
            )}
        </div>
    );
}