import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
    CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon, Download, DollarSign, List, Layers, ArrowRight
} from 'lucide-react';

// =================================================================
// ⭐️ 상수 정의 (기존 로직 100% 유지)
// =================================================================
const MIN_FEE = 200000;
const KAKAO_CHAT_URL = 'http://pf.kakao.com/_jAxnYn/chat';
const PHONE_NUMBER = '010-7734-6709';
const DEFAULT_TILE_IMAGE_URL = '/default_tile.jpg';

const GROUT_COLORS = [
    { id: 'white', code: '#ffffff', label: '화이트', isDark: false },
    { id: 'light_beige', code: '#e2dfda', label: '103번', isDark: false },
    { id: 'light_gray', code: '#ccccca', label: '110번', isDark: false },
    { id: 'silver_gray', code: '#afb0aa', label: '111번', isDark: false },
    { id: 'medium_gray', code: '#848685', label: '112번', isDark: true },
    { id: 'dark_gray', code: '#797671', label: '113번', isDark: true },
    { id: 'black', code: '#49494b', label: '114번', isDark: true },
    { id: 'charcoal', code: '#565556', label: '119번', isDark: true },
    { id: 'shine_silver', code: '#c2c2c2', label: '127번', isDark: false },
    { id: 'moca_beige', code: '#dbcbbd', label: '131번', isDark: false },
    { id: 'sand_brown', code: '#887965', label: '133번', isDark: true },
    { id: 'dark_brown', code: '#85786f', label: '134번', isDark: true },
    { id: 'vintage_brown', code: '#96877e', label: '141번', isDark: true },
    { id: 'oat_brown', code: '#b0a9a4', label: '180번', isDark: false },
    { id: 'burnt_brown', code: '#8b8784', label: '187번', isDark: true },
];

const BRIGHT_COLOR_CODE = '#ffffff';
const DARK_COLOR_CODE = '#565556';

const ORIGINAL_PRICES = {
    'bathroom_floor': { poly: 230000, epoxy: 400000 },
    'shower_booth': { poly: 150000, epoxy: 300000 },
    'bathtub_wall': { poly: 150000, epoxy: 300000 },
    'master_bath_wall': { poly: 300000, epoxy: 600000 },
    'common_bath_wall': { poly: 300000, epoxy: 600000 },
    'entrance': { poly: 50000, epoxy: 100000 },
    'balcony_laundry': { poly: 100000, epoxy: 250000 },
    'kitchen_wall': { poly: 150000, epoxy: 250000 },
    'living_room': { poly: 550000, epoxy: 1100000 },
    'silicon_bathtub': { poly: 80000, epoxy: 80000 },
    'silicon_sink': { poly: 30000, epoxy: 30000 },
    'silicon_living_baseboard': { poly: 400000, epoxy: 400000 },
};

const mixColors = (color1, color2, weight) => {
    color1 = color1.replace('#', '');
    color2 = color2.replace('#', '');
    const r1 = parseInt(color1.substring(0, 2), 16);
    const g1 = parseInt(color1.substring(2, 4), 16);
    const b1 = parseInt(color1.substring(4, 6), 16);
    const r2 = parseInt(color2.substring(0, 2), 16);
    const g2 = parseInt(color2.substring(2, 4), 16);
    const b2 = parseInt(color2.substring(4, 6), 16);
    const r = Math.round(r1 * (1 - weight) + r2 * weight);
    const g = Math.round(g1 * (1 - weight) + g2 * weight);
    const b = Math.round(b1 * (1 - weight) + b2 * weight);
    const toHex = (c) => ('0' + Math.max(0, Math.min(255, c)).toString(16)).slice(-2);
    return '#' + toHex(r) + toHex(g) + toHex(b);
};

// =================================================================
// 🎨 [디자인] 전역 스타일 및 애니메이션 정의
// =================================================================
const GlobalStyles = () => (
    <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body { font-family: 'Pretendard', sans-serif; background-color: #f8fafc; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
        .animate-pulse-soft { animation: pulse-soft 2s infinite ease-in-out; }
        
        .glass-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        
        .glass-bottom-bar {
            background: rgba(15, 23, 42, 0.9); /* slate-900 with opacity */
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-shadow {
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-shadow:active { transform: scale(0.995); }

        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    `}</style>
);

// =================================================================
// [데이터] (데이터 구조 유지)
// =================================================================
const HOUSING_TYPES = [
    { id: 'new', label: '신축 아파트 (입주 전)', multiplier: 1.0 },
    { id: 'old', label: '구축 / 거주 중', multiplier: 1.0 },
];
const MATERIALS = [
    {
        id: 'poly', label: '폴리아스파틱', priceMod: 1.0,
        description: '탄성과 광택이 우수하며 가성비가 좋은 스탠다드 소재',
        badge: 'STANDARD', badgeColor: 'bg-slate-200 text-slate-700'
    },
    {
        id: 'kerapoxy', label: '케라폭시/에폭시', priceMod: 1.8,
        description: '반영구적 내구성과 매트한 질감의 프리미엄 소재',
        badge: 'PREMIUM', badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200'
    },
];
const BATHROOM_AREAS = [
    { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
    { id: 'shower_booth', label: '샤워부스 벽 (3면)', basePrice: 150000, icon: LayoutGrid, unit: '구역' },
    { id: 'bathtub_wall', label: '욕조 벽 (3면)', basePrice: 150000, icon: LayoutGrid, unit: '구역' },
    { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: LayoutGrid, unit: '구역' },
    { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: LayoutGrid, unit: '구역' },
];
const OTHER_AREAS = [
    { id: 'entrance', label: '현관 바닥', basePrice: 50000, icon: DoorOpen, unit: '개소', desc: '' },
    { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: Home, unit: '개소', desc: '' },
    { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: '' },
    { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '' },
];
const SILICON_AREAS = [
    { id: 'silicon_bathtub', label: '욕조 테두리 실리콘 교체', basePrice: 80000, icon: Eraser, unit: '개소', desc: '' },
    { id: 'silicon_sink', label: '세면대+젠다이 실리콘', basePrice: 30000, icon: Eraser, unit: '개소', desc: '' },
    { id: 'silicon_living_baseboard', label: '거실 걸레받이 실리콘', basePrice: 400000, icon: LayoutGrid, unit: '구역', desc: '' },
];
const ALL_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS, ...SILICON_AREAS];
const REVIEW_EVENTS = [
    { id: 'soomgo_review', label: '숨고 리뷰 약속 할인', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
];
const FAQ_ITEMS = [
    { question: "Q. 시공 시간은 얼마나 걸리나요?", answer: "시공범위에 따라 다르지만, 평균적으로 4~6시간 정도 소요되고 있으며 범위/소재에 따라 최대 2일 시공이 걸리는 경우도 있습니다." },
    { question: "Q. 줄눈 시공 후 바로 사용 가능한가요?", answer: "줄눈시공 후 폴리아스파틱은 6시간, 케라폭시는 2~3일, 스타라이크는 24시간 정도 양생기간이 필요합니다. 그 시간 동안은 물 사용을 자제해주시는 것이 가장 좋습니다." },
    { question: "Q. 왜 줄눈 시공을 해야 하나요?", answer: "줄눈은 곰팡이와 물때가 끼는 것을 방지하고, 타일 틈새 오염을 막아 청소가 쉬워지며, 인테리어 효과까지 얻을 수 있는 필수 시공입니다." },
    { question: "Q. A/S 기간 및 조건은 어떻게 되나요?", answer: "시공 후 폴리아스파틱은 2년, 에폭시는 5년의 A/S를 제공합니다. 단, 고객 부주의나 타일 문제로 인한 하자는 소액의 출장비가 발생할 수 있습니다." },
    { question: "Q. 구축 아파트도 시공이 가능한가요?", answer: "네, 가능합니다. 기존 줄눈을 제거하는 그라인딩 작업이 추가로 필요하며, 현재 견적은 신축/구축 동일하게 적용됩니다." },
];
const YOUTUBE_VIDEOS = [
    { id: 'XekG8hevWpA', title: '에폭시 시공영상 (벽면/바닥)', label: '시공 영상' },
    { id: 'M6Aq_VVaG0s', title: '밑작업 영상 (라인 그라인딩)', label: '밑작업 영상' },
];
const getEmbedUrl = (videoId) => `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&rel=0`;

const OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION = ['entrance', 'balcony_laundry', 'kitchen_wall', 'living_room', 'silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'];
const ORIGINAL_MIXED_PACKAGES = [
    { id: 'P_MIX_01', price: 750000, label: '혼합패키지 01', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_02', price: 750000, label: '혼합패키지 02', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_03_OLD', price: 800000, label: '혼합패키지 03 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1]] },
    { id: 'P_MIX_04_OLD', price: 800000, label: '혼합패키지 04 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['common_bath_wall', 1]] },
    { id: 'P_MIX_05_OLD', price: 1050000, label: '혼합패키지 05 (구형)', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1], ['common_bath_wall', 1]] },
    { id: 'P_MIX_06', price: 830000, label: '혼합패키지 06', E_areas: [['bathroom_floor', 2]], P_areas: [['shower_booth', 1]] },
    { id: 'P_MIX_07', price: 830000, label: '혼합패키지 07', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1]] },
    { id: 'P_MIX_08', price: 850000, label: '혼합패키지 08', E_areas: [['bathroom_floor', 2]], P_areas: [['bathtub_wall', 1], ['shower_booth', 1]] },
    { id: 'P_MIX_09', price: 1200000, label: '혼합패키지 09', E_areas: [['bathroom_floor', 2]], P_areas: [['master_bath_wall', 1], ['common_bath_wall', 1]] },
    { id: 'P_MIX_10', price: 900000, label: '혼합패키지 10', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [] },
    { id: 'P_MIX_11', price: 900000, label: '혼합패키지 11', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [] },
    { id: 'P_MIX_13', price: 1100000, label: '혼합패키지 13', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [] },
    { id: 'P_MIX_14', price: 1100000, label: '혼합패키지 14', E_areas: [['bathroom_floor', 2], ['bathtub_wall', 1]], P_areas: [] },
];
const CUSTOM_MIXED_PACKAGES = [
    { id: 'P_MIX_NEW_A', price: 1150000, label: '혼합벽면A (바닥/안방벽E, 공용벽P) 115만', E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1]], P_areas: [['common_bath_wall', 1]] },
    { id: 'P_MIX_NEW_B', price: 1150000, label: '혼합벽면B (바닥/공용벽E, 안방벽P) 115만', E_areas: [['bathroom_floor', 2], ['common_bath_wall', 1]], P_areas: [['master_bath_wall', 1]] },
];
const NEW_USER_PACKAGES = [
    { id: 'USER_E_700K_MASTER', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_E_700K_COMMON', price: 700000, label: '에폭시 벽면 패키지 (70만)', E_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], P_areas: [], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_P_500K_MASTER', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['master_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_P_500K_COMMON', price: 500000, label: '폴리 벽면 패키지 (50만)', E_areas: [], P_areas: [['bathroom_floor', 1], ['common_bath_wall', 1]], isFlexible: true, flexibleGroup: ['master_bath_wall', 'common_bath_wall'] },
    { id: 'USER_E_550K_FLOOR_2', price: 550000, label: '에폭시 바닥 2곳 (55만)', E_areas: [['bathroom_floor', 2]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_800K_FLOOR2_SHOWER1', price: 800000, label: '에폭시 바닥 2곳 + 샤워벽 1곳 (80만)', E_areas: [['bathroom_floor', 2], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_550K_FLOOR1_SHOWER1', price: 550000, label: '에폭시 바닥 1곳 + 샤워벽 1곳 (55만)', E_areas: [['bathroom_floor', 1], ['shower_booth', 1]], P_areas: [], isFlexible: false, },
    { id: 'USER_E_350K_BATH', price: 350000, label: '에폭시 바닥 1곳 (35만)', E_areas: [['bathroom_floor', 1]], P_areas: [], isFlexible: false, },
];
const HARDCODED_PACKAGES = [
    { id: 'POLY_550K', price: 550000, label: '폴리 5종 패키지 (55만)', P_areas: [['bathroom_floor', 2], ['shower_booth', 1], ['bathtub_wall', 1]], E_areas: [] },
    { id: 'POLY_700K_WALLS', price: 700000, label: '폴리 벽 전체 5종 패키지 (70만)', P_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]], E_areas: [] },
    { id: 'EPOXY_1300K_WALLS', price: 1300000, label: '에폭시 벽 전체 5종 패키지 (130만)', P_areas: [], E_areas: [['bathroom_floor', 2], ['master_bath_wall', 1], ['common_bath_wall', 1]] },
];
const MIXED_PACKAGES = [
    ...NEW_USER_PACKAGES,
    ...CUSTOM_MIXED_PACKAGES,
    ...ORIGINAL_MIXED_PACKAGES,
    ...HARDCODED_PACKAGES,
];
const getPackageAreaIds = (pkg) => [
    ...pkg.P_areas.map(([id]) => id),
    ...pkg.E_areas.map(([id]) => id),
];

// =================================================================
// [컴포넌트]
// =================================================================

const PackageToast = ({ isVisible, onClose, label }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-[140px] left-1/2 -translate-x-1/2 z-40 max-w-sm w-11/12 animate-slide-up">
            <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500 p-2 rounded-full text-slate-900">
                        <Gift size={18} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-medium">자동 할인 적용</div>
                        <div className="text-sm font-bold truncate">{label || '패키지 할인'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// -------------------------------------------------------------
// QuoteModal: 디자인 개선
// -------------------------------------------------------------
const QuoteModal = ({ calculation, onClose, quoteRef, selectedReviews, toggleReview }) => {
    const { price, label, minimumFeeApplied, itemizedPrices, priceBeforeAllDiscount } = calculation;
    const totalDiscount = priceBeforeAllDiscount - price;
    const isDiscountApplied = totalDiscount > 0;
    const packageItems = itemizedPrices.filter(i => i.quantity > 0 && !i.isDiscount).map(item => ({
        label: item.label, materialLabel: item.materialLabel, quantity: item.quantity, unit: ALL_AREAS.find(a => a.id === item.id)?.unit || '개소'
    }));
    const discountItems = itemizedPrices.filter(i => i.isDiscount);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    const displayLabel = minimumFeeApplied ? '최소 시공비 적용 중' : (label || '선택 항목 기반 견적');

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up my-4">
                <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <List className="h-5 w-5 text-amber-400" /> 최종 견적서
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition"><X size={20} /></button>
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto bg-slate-50">
                    <div ref={quoteRef} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                        <div className='text-center pb-4 border-b border-slate-100'>
                            <h4 className='text-xl font-extrabold text-slate-800 tracking-tight'>줄눈의미학</h4>
                            <p className='text-xs text-slate-400 mt-1'>PREMIUM GROUTING SERVICE</p>
                        </div>

                        {/* 합계 및 할인 정보 카드 */}
                        <div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                             <div className='flex justify-between items-start mb-2'>
                                <span className='text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200'>{displayLabel}</span>
                             </div>
                             {isDiscountApplied && (
                                <div className='flex justify-between items-center mt-1'>
                                    <span className='text-sm text-slate-500'>총 할인 금액</span>
                                    <span className='text-sm font-bold text-red-500'>-{totalDiscount.toLocaleString()}원</span>
                                </div>
                             )}
                            <div className='flex justify-between items-end mt-3 pt-3 border-t border-slate-200/60'>
                                <span className='text-slate-600 font-bold'>최종 예상 견적</span>
                                <div className='text-right'>
                                    <span className="text-2xl font-extrabold text-slate-900">{price.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-slate-600 ml-1">원</span>
                                </div>
                            </div>
                            <p className='text-[10px] text-right text-slate-400 mt-1'>VAT 별도 / 현장상황별 상이</p>
                        </div>

                        {/* 시공 내역 리스트 */}
                        {packageItems.length > 0 && (
                            <div>
                                <h5 className='text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider'>시공 상세 내역</h5>
                                <div className='space-y-2'>
                                    {packageItems.map((item, index) => (
                                        <div key={index} className='flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0'>
                                            <span className='font-medium text-slate-700'>{item.label}</span>
                                            <div className='flex items-center gap-2'>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.materialLabel === 'Epoxy' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {item.materialLabel}
                                                </span>
                                                <span className='text-slate-500'>{item.quantity}{item.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 할인 내역 */}
                        {discountItems.length > 0 && (
                            <div className='pt-2'>
                                <h5 className='text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider'>적용된 혜택</h5>
                                {discountItems.map((item, index) => (
                                    <div key={index} className='flex justify-between items-center text-sm py-1'>
                                        <span className='flex items-center text-slate-600'><Gift size={14} className='mr-1.5 text-red-400'/> {item.label}</span>
                                        <span className='font-bold text-red-500'>-{item.originalPrice.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 리뷰 이벤트 버튼 */}
                        <div onClick={() => toggleReview('soomgo_review')} className={`mt-2 p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${isSoomgoReviewApplied ? 'bg-red-50 border-red-100' : 'bg-white border-dashed border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${isSoomgoReviewApplied ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Star size={16} fill={isSoomgoReviewApplied ? "currentColor" : "none"} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{soomgoReviewEvent.label}</div>
                                    <div className="text-xs text-red-500 font-medium">-{soomgoReviewEvent.discount.toLocaleString()}원 추가 할인</div>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSoomgoReviewApplied ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                                {isSoomgoReviewApplied && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                        </div>

                        {/* 안내사항 */}
                        <div className='bg-slate-50 p-3 rounded-lg text-[10px] text-slate-500 leading-relaxed space-y-1'>
                           <p>• 바닥 30x30cm, 벽면 30x60cm 크기 기준입니다.</p>
                           <p>• 재시공(셀프포함) 및 조각타일/대리석은 별도 문의 바랍니다.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3">
                    <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-[#FAE100] text-[#371D1E] rounded-xl font-bold hover:brightness-95 transition flex items-center justify-center gap-2">
                        <Layers size={18} /> 카카오 상담
                    </a>
                    <a href={`tel:${PHONE_NUMBER}`} className="py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                        <Phone size={18} /> 전화 상담
                    </a>
                </div>
            </div>
        </div>
    );
};

// -------------------------------------------------------------
// MaterialDetailModal: 디자인 개선
// -------------------------------------------------------------
const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-amber-400" /> 재료별 상세 스펙</h3>
              <button onClick={onClose} className="text-white/70 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">구분</th>
                        <th className="px-4 py-3 text-center font-medium">폴리아스파틱</th>
                        <th className="px-4 py-3 text-center font-medium text-amber-600">케라폭시/에폭시</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-4 py-3.5 font-bold text-slate-800">내구성</td>
                        <td className="px-4 py-3.5 text-center text-slate-600">우수</td>
                        <td className="px-4 py-3.5 text-center font-bold text-amber-600">최상 (반영구)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3.5 font-bold text-slate-800">무상 A/S</td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-600">2년</td>
                        <td className="px-4 py-3.5 text-center font-bold text-amber-600">5년</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3.5 font-bold text-slate-800">양생 시간</td>
                        <td className="px-4 py-3.5 text-center text-slate-600">약 6시간</td>
                        <td className="px-4 py-3.5 text-center text-slate-600">약 24시간~</td>
                      </tr>
                    </tbody>
                  </table>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">확인했습니다</button>
            </div>
          </div>
        </div>
);

const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 rounded-xl mb-2 overflow-hidden bg-white transition-all hover:border-slate-300">
            <button
                className="flex justify-between items-center w-full p-4 text-left font-bold text-slate-800 hover:bg-slate-50 transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm">{question}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-sm text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100 animate-fade-in">
                    <div className="pt-3">{answer}</div>
                </div>
            )}
        </div>
    );
};

// -------------------------------------------------------------
// ColorPalette: 디자인 개선
// -------------------------------------------------------------
const ColorPalette = ({ selectedColorId, onSelect, onTileImageUpload, tileImageURL, brightnessLevel, onBrightnessChange, onTileImageReset }) => {
    const baseColorData = GROUT_COLORS.find(c => c.id === selectedColorId) || GROUT_COLORS[0];
    const GROUT_LINE_WIDTH = 10; // 세련된 느낌을 위해 줄눈 두께 약간 축소

    const effectiveTileImageURL = (tileImageURL && tileImageURL !== DEFAULT_TILE_IMAGE_URL) ? tileImageURL : DEFAULT_TILE_IMAGE_URL;
    
    const effectiveGroutColor = useMemo(() => {
        const baseHex = baseColorData.code;
        const level = brightnessLevel / 50;
        if (level === 0) return baseHex;
        const targetColor = level > 0 ? BRIGHT_COLOR_CODE : DARK_COLOR_CODE;
        return mixColors(baseHex, targetColor, Math.abs(level));
    }, [baseColorData.code, brightnessLevel]);

    const isDarkGrout = useMemo(() => {
        const hex = effectiveGroutColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) < 150;
    }, [effectiveGroutColor]);

    return (
        <div className='mt-8 pt-6 border-t border-slate-200 animate-fade-in'>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-800 uppercase tracking-wide">
                <Palette className="h-4 w-4 text-amber-500" /> Color Simulation
            </h3>

            {/* 시뮬레이션 화면 */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative bg-slate-100 group">
                <div className="w-full aspect-video relative">
                    <div className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${effectiveTileImageURL})` }}></div>
                    <div className="absolute inset-0 bg-black/5 pointer-events-none"></div> {/* 은은한 딤처리 */}
                    
                    {/* 줄눈 라인 */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 shadow-sm" style={{ width: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, zIndex: 10 }}></div>
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 shadow-sm" style={{ height: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, zIndex: 10 }}></div>
                    
                    {/* 워터마크 (로고가 없다면 텍스트로 대체) */}
                     <div className="absolute bottom-3 right-3 opacity-30 text-white font-black text-xs pointer-events-none z-20">MIHAK</div>
                </div>

                {/* 하단 컨트롤 바 */}
                <div className="bg-white p-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full shadow-inner border border-slate-200" style={{ backgroundColor: effectiveGroutColor }}></div>
                             <div>
                                 <div className="text-xs text-slate-400 font-medium">Selected Color</div>
                                 <div className="font-bold text-slate-800">{baseColorData.label} <span className="text-xs font-normal text-slate-500">({brightnessLevel !== 0 ? (brightnessLevel > 0 ? `+${brightnessLevel}%` : `${brightnessLevel}%`) : 'Standard'})</span></div>
                             </div>
                        </div>
                        {tileImageURL !== DEFAULT_TILE_IMAGE_URL && (
                            <button onClick={onTileImageReset} className="text-xs text-slate-400 hover:text-red-500 underline decoration-1 underline-offset-2 transition">이미지 초기화</button>
                        )}
                    </div>
                    
                    {/* 밝기 슬라이더 */}
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400">DARK</span>
                        <input
                            type="range" min="-50" max="50" step="10" value={brightnessLevel}
                            onChange={(e) => onBrightnessChange(Number(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                        />
                        <span className="text-[10px] font-bold text-slate-400">LIGHT</span>
                    </div>
                </div>
            </div>

            {/* 기능 버튼 */}
            <div className="mt-4">
                <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} className="hidden" />
                <label htmlFor="tileFileInput" className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-700 transition cursor-pointer">
                    <ImageIcon size={16} /> 우리집 타일 사진으로 확인하기
                </label>
            </div>

            {/* 색상 칩 그리드 */}
            <div className="grid grid-cols-5 gap-3 mt-6">
                {GROUT_COLORS.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => { onSelect(color.id); onBrightnessChange(0); }}
                        className={`aspect-square rounded-xl shadow-sm relative transition-all duration-300 group ${selectedColorId === color.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-105 z-10' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color.code }}
                    >
                         {selectedColorId === color.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-slate-900/20 backdrop-blur-[1px] rounded-full p-1">
                                    <CheckCircle2 size={16} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                        )}
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm z-20 pointer-events-none">
                            {color.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// ⭐️ [App Main] ⭐️
export default function App() {
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
    const [showToast, setShowToast] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(YOUTUBE_VIDEOS[0].id);

    const quoteRef = useRef(null);
    const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';

    // 로직 (기존과 동일)
    useEffect(() => {
        if (quantities['entrance'] > 0 && areaMaterials['entrance'] !== 'poly') {
            setAreaMaterials(prev => ({ ...prev, 'entrance': 'poly' }));
        }
    }, [quantities['entrance']]);

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
            const isBathroomFloorUpdated = id === 'bathroom_floor';
            let bathroomFloorCount = isBathroomFloorUpdated ? newQuantities['bathroom_floor'] : prev['bathroom_floor'];
            if (bathroomFloorCount >= 2 && newQuantities['entrance'] === 0) {
                newQuantities['entrance'] = 1;
            } else if (bathroomFloorCount < 2 && prev['bathroom_floor'] >= 2 && prev['entrance'] === 1 && newQuantities['entrance'] === 1) {
                if (newQuantities['entrance'] === 1) newQuantities['entrance'] = 0;
            }
            return newQuantities;
        });
    }, []);

    const handleAreaMaterialChange = useCallback((id, mat) => {
        if (id === 'entrance') setAreaMaterials(prev => ({ ...prev, [id]: 'poly' }));
        else setAreaMaterials(prev => ({ ...prev, [id]: mat }));
    }, []);

    const toggleReview = useCallback((id) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
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
            if (summary['kerapoxy'] && summary['kerapoxy']['entrance']) delete summary['kerapoxy']['entrance'];
        }
        return summary;
    }, []);

    const findMatchingPackage = useCallback((selectionSummary, quantities) => {
        const filterSelections = (selections) => {
            const filtered = {};
            for (const id in selections) {
                if (!OTHER_AREA_IDS_FOR_PACKAGE_EXCLUSION.includes(id)) filtered[id] = selections[id];
            }
            return filtered;
        };
        const filteredPolySelections = filterSelections(selectionSummary['poly'] || {});
        const filteredEpoxySelections = filterSelections(selectionSummary['kerapoxy'] || {});
        const totalSelectedCount = Object.values(filteredPolySelections).reduce((sum, v) => sum + v, 0) + Object.values(filteredEpoxySelections).reduce((sum, v) => sum + v, 0);

        if (totalSelectedCount === 0) return null;
        for (const pkg of MIXED_PACKAGES) {
             let tempPolySelections = { ...filteredPolySelections };
             let tempEpoxySelections = { ...filteredEpoxySelections };
             let appliedAutoEntrance = false;

             if (pkg.isFlexible) {
                const requiredPolyAreas = pkg.P_areas.map(([id]) => id).filter(id => id !== 'entrance');
                const requiredEpoxyAreas = pkg.E_areas.map(([id]) => id);
                let baseMatch = true;
                for (const id of requiredPolyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                    if ((tempPolySelections[id] || 0) !== pkg.P_areas.find(([pkId]) => pkId === id)[1]) { baseMatch = false; break; }
                }
                if (!baseMatch) continue;
                for (const id of requiredEpoxyAreas.filter(id => !pkg.flexibleGroup.includes(id))) {
                    if ((tempEpoxySelections[id] || 0) !== pkg.E_areas.find(([pkId]) => pkId === id)[1]) { baseMatch = false; break; }
                }
                if (!baseMatch) continue;

                const flexibleSelectedPolyCount = pkg.flexibleGroup.filter(id => tempPolySelections[id] > 0).length;
                const flexibleSelectedEpoxyCount = pkg.flexibleGroup.filter(id => tempEpoxySelections[id] > 0).length;
                let flexibleMatch = false;

                if (pkg.id.startsWith('USER_P_')) {
                    flexibleMatch = flexibleSelectedPolyCount === 1 && flexibleSelectedEpoxyCount === 0;
                    if (flexibleMatch) {
                        const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempPolySelections[id] > 0);
                        if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                        if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                    }
                } else if (pkg.id.startsWith('USER_E_')) {
                    flexibleMatch = flexibleSelectedEpoxyCount === 1 && flexibleSelectedPolyCount === 0;
                    if (flexibleMatch) {
                        const matchedFlexibleItem = pkg.flexibleGroup.find(id => tempEpoxySelections[id] > 0);
                        if (pkg.id.includes('MASTER') && matchedFlexibleItem !== 'master_bath_wall') flexibleMatch = false;
                        if (pkg.id.includes('COMMON') && matchedFlexibleItem !== 'common_bath_wall') flexibleMatch = false;
                    }
                }
                if (baseMatch && flexibleMatch) {
                     const packageAreaIds = new Set(getPackageAreaIds(pkg));
                     const finalSelectedAreaIds = new Set([...Object.keys(tempPolySelections).filter(id => tempPolySelections[id] > 0), ...Object.keys(tempEpoxySelections).filter(id => tempEpoxySelections[id] > 0)]);
                     if (finalSelectedAreaIds.size === packageAreaIds.size && [...finalSelectedAreaIds].every(id => packageAreaIds.has(id))) {
                         return { ...pkg, autoEntrance: appliedAutoEntrance };
                     }
                }
                continue;
             }
             let isMatch = true;
             for (const [id, requiredQty] of pkg.P_areas) {
                 if ((filteredPolySelections[id] || 0) !== requiredQty) { isMatch = false; break; }
             }
             if (!isMatch) continue;
             for (const [id, requiredQty] of pkg.E_areas) {
                 if ((filteredEpoxySelections[id] || 0) !== requiredQty) { isMatch = false; break; }
             }
             if (!isMatch) continue;
             const selectedAreaIds = new Set([...Object.keys(filteredPolySelections).filter(id => filteredPolySelections[id] > 0), ...Object.keys(filteredEpoxySelections).filter(id => filteredEpoxySelections[id] > 0)]);
             const packageAreaIds = new Set(getPackageAreaIds(pkg));
             if (selectedAreaIds.size === packageAreaIds.size && [...selectedAreaIds].every(id => packageAreaIds.has(id))) {
                 return { ...pkg, autoEntrance: appliedAutoEntrance };
             }
        }
        return null;
    }, []);

    const calculation = useMemo(() => {
        const selectedHousing = HOUSING_TYPES.find(h => h.id === housingType);
        let itemizedPrices = [];
        const selectionSummary = getSelectionSummary(quantities, areaMaterials);
        const matchedPackage = findMatchingPackage(selectionSummary, quantities);

        let q = { ...quantities };
        let total = 0;
        let labelText = null;
        let isPackageActive = false;
        let isFreeEntrance = false;
        let totalAreaCount = Object.values(quantities).some(v => v > 0) ? Object.keys(quantities).filter(k => quantities[k] > 0).length : 0;
        let packageAreas = [];

        if (matchedPackage) {
            total = matchedPackage.price;
            isPackageActive = true;
            labelText = '패키지 할인 적용 중';
            packageAreas = getPackageAreaIds(matchedPackage);
            packageAreas.forEach(id => { q[id] = 0; });
            if (quantities['entrance'] >= 1) { isFreeEntrance = true; q['entrance'] = 0; }
        }

        if (quantities['bathroom_floor'] >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
            isFreeEntrance = true; isPackageActive = true; labelText = '현관 서비스 적용 중'; q['entrance'] = 0;
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
            if (area.id === 'balcony_laundry') finalUnitBasePrice = isEpoxy ? 250000 : 100000;
            else if (area.id === 'kitchen_wall') finalUnitBasePrice = isEpoxy ? 250000 : 150000;
            else if (area.id === 'living_room') finalUnitBasePrice = isEpoxy ? 1100000 : 550000;
            else if (area.id === 'entrance') finalUnitBasePrice = 50000;
            else if (BATHROOM_AREAS.some(a => a.id === area.id)) finalUnitBasePrice = area.basePrice * (isEpoxy ? 1.8 : 1.0);

            const calculatedPricePerUnit = Math.floor(finalUnitBasePrice * selectedHousing.multiplier);
            let finalCalculatedPrice = 0;
            let finalDiscount = 0;
            let isFreeServiceItem = false;
            let packageCount = initialCount - count;
            let isPackageItemFlag = false;

            if (packageCount > 0 && (matchedPackage || isFreeEntrance) && count === 0) {
                finalCalculatedPrice = 0; finalDiscount = itemOriginalTotal;
                isFreeServiceItem = area.id === 'entrance' || packageAreas.includes(area.id);
                isPackageItemFlag = true;
            } else if (area.id === 'entrance' && isFreeEntrance && !matchedPackage && count === 0) {
                finalCalculatedPrice = 0; finalDiscount = itemOriginalTotal;
                isFreeServiceItem = true; isPackageItemFlag = true;
            } else {
                let remainingCalculatedPrice = calculatedPricePerUnit * count;
                let remainingDiscount = 0;
                if (area.id === 'silicon_bathtub' && totalAreaCount >= 3 && count > 0) {
                     remainingDiscount = (80000 * count) - (50000 * count);
                     remainingCalculatedPrice = 50000 * count;
                     isPackageItemFlag = true;
                } else if (area.id === 'silicon_living_baseboard' && totalAreaCount >= 3 && count > 0) {
                     remainingDiscount = (400000 * count) - (350000 * count);
                     remainingCalculatedPrice = 350000 * count;
                     isPackageItemFlag = true;
                } else if (area.id === 'silicon_sink') {
                     remainingCalculatedPrice = 30000 * count;
                }
                finalCalculatedPrice = remainingCalculatedPrice; finalDiscount = remainingDiscount; total += finalCalculatedPrice;
            }
            
            finalCalculatedPrice = Math.floor(finalCalculatedPrice / 1000) * 1000;
            itemOriginalTotal = Math.floor(itemOriginalTotal / 1000) * 1000;
            finalDiscount = Math.floor(finalDiscount / 1000) * 1000;

            itemizedPrices.push({
                id: area.id, label: area.label, quantity: initialCount, unit: area.unit, originalPrice: itemOriginalTotal, calculatedPrice: finalCalculatedPrice, discount: finalDiscount,
                isFreeService: isFreeServiceItem, isPackageItem: isPackageItemFlag || !isFreeServiceItem && (packageCount > 0 || isPackageActive || finalDiscount > 0), isDiscount: false,
                materialLabel: ['silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'].includes(area.id) ? 'Silicon' : (areaMatId === 'poly' ? 'Poly' : 'Epoxy')
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
        if (finalPrice > 0 && finalPrice < MIN_FEE) { finalPrice = MIN_FEE; minimumFeeApplied = true; }

        return { price: finalPrice, originalCalculatedPrice, priceBeforeAllDiscount: Math.floor(priceBeforeAllDiscount / 1000) * 1000, label: labelText, isPackageActive: isPackageActive || isFreeEntrance, isFreeEntrance: isFreeEntrance, discountAmount: priceBeforeAllDiscount - finalPrice, minimumFeeApplied, itemizedPrices: itemizedPrices.filter(item => item.quantity > 0 || item.isDiscount), };
    }, [quantities, selectedReviews, housingType, areaMaterials, getSelectionSummary, findMatchingPackage]);

    const packageActiveRef = useRef(calculation.isPackageActive);
    useEffect(() => {
        if (calculation.isPackageActive && !packageActiveRef.current) setShowToast(true);
        packageActiveRef.current = calculation.isPackageActive;
    }, [calculation.isPackageActive]);

    const handleTileImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => { setTileImageURL(reader.result); alert('✅ 타일 이미지가 적용되었습니다.'); };
            reader.readAsDataURL(file);
        }
    };
    const handleTileImageReset = useCallback(() => { setTileImageURL(DEFAULT_TILE_IMAGE_URL); alert('✅ 기본 타일로 초기화되었습니다.'); }, []);

    const hasSelections = Object.values(quantities).some(v => v > 0);
    const currentVideo = YOUTUBE_VIDEOS.find(v => v.id === activeVideoId);
    const currentEmbedUrl = getEmbedUrl(currentVideo.id);

    // ----------------------------------------------------------------------------------
    // 🎨 [디자인] MaterialSelectButtons (세그먼트 컨트롤 스타일)
    // ----------------------------------------------------------------------------------
    const MaterialSelectButtons = ({ areaId, currentMat, onChange, isQuantitySelected }) => {
        if (areaId === 'entrance') return <div className='mt-3 pt-2 text-[10px] text-slate-400 font-medium text-center border-t border-slate-100'>* 현관은 폴리아스파틱 전용 시공 구역입니다.</div>;
        if (['silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'].includes(areaId)) return <div className='mt-3 pt-2 text-[10px] text-slate-400 font-medium text-center border-t border-slate-100'>* 실리콘 전용 시공입니다.</div>;
        
        return (
            <div className={`mt-3 ${isQuantitySelected ? 'animate-fade-in' : ''}`}>
                 <div className='bg-slate-100 p-1 rounded-lg flex'>
                    {MATERIALS.map(mat => (
                        <button
                            key={mat.id}
                            onClick={(e) => { e.stopPropagation(); onChange(areaId, mat.id); }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${currentMat === mat.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {mat.label.split('(')[0].trim()}
                        </button>
                    ))}
                 </div>
            </div>
        );
    };

    // ----------------------------------------------------------------------------------
    // 🎨 [디자인] Area List Item
    // ----------------------------------------------------------------------------------
    const renderAreaList = (areas) => (
        <div className="space-y-3">
            {areas.map((area) => {
                const Icon = area.icon;
                const isSelected = quantities[area.id] > 0;
                const currentMat = area.id === 'entrance' ? 'poly' : areaMaterials[area.id];
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && quantities['bathroom_floor'] >= 2 && !calculation.isPackageActive;

                return (
                    <div key={area.id} className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 card-shadow ${isSelected ? 'bg-white border-slate-800 ring-1 ring-slate-800/10' : 'bg-white border-transparent hover:border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <div className={`font-bold text-base ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{area.label}</div>
                                    {area.desc && <div className="text-[10px] text-amber-600 font-medium mt-0.5">{area.desc}</div>}
                                </div>
                            </div>
                            
                            {/* 수량 조절기 (Pill Shape) */}
                            <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-1 h-10 shadow-inner">
                                <button
                                    onClick={() => handleQuantityChange(area.id, -1)}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${quantities[area.id] > 0 ? 'hover:bg-white hover:shadow-sm text-slate-800' : 'text-slate-300 cursor-not-allowed'}`}
                                >-</button>
                                <span className={`w-6 text-center text-sm font-bold ${quantities[area.id] > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{quantities[area.id]}</span>
                                <button
                                    onClick={() => { handleQuantityChange(area.id, 1); if (quantities[area.id] === 0) handleAreaMaterialChange(area.id, area.id === 'entrance' ? 'poly' : material); }}
                                    disabled={isEntranceAutoSelected && area.id === 'entrance'}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isEntranceAutoSelected ? 'text-slate-300' : 'hover:bg-white hover:shadow-sm text-slate-800'}`}
                                >+</button>
                            </div>
                        </div>
                        {isSelected && <MaterialSelectButtons areaId={area.id} currentMat={currentMat} onChange={handleAreaMaterialChange} isQuantitySelected={isSelected} />}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen pb-48 selection:bg-amber-200 selection:text-slate-900">
            <GlobalStyles />

            {/* 🎨 헤더: 프리미엄 다크 테마 */}
            <header className="sticky top-0 z-30 glass-bottom-bar border-b border-white/5">
                <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                           <Sparkles size={18} className="text-amber-400"/> 줄눈의미학
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">PREMIUM HOME CARE</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto p-5 space-y-8">
                
                {/* 1. 시공 현장 영상 */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-1">
                         <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                         <h2 className="text-lg font-bold text-slate-800">시공 현장 미리보기</h2>
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                        <div className="aspect-video w-full bg-slate-900">
                            <iframe key={currentVideo.id} width="100%" height="100%" src={currentEmbedUrl} title={currentVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" className="w-full h-full border-0"></iframe>
                        </div>
                        <div className="flex divide-x divide-slate-100">
                            {YOUTUBE_VIDEOS.map((video) => (
                                <button key={video.id} onClick={() => setActiveVideoId(video.id)} className={`flex-1 py-4 text-xs font-bold transition-all ${activeVideoId === video.id ? 'bg-slate-50 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                                    {video.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. 현장 유형 */}
                <section>
                     <div className="flex items-center gap-2 mb-4 px-1">
                         <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                         <h2 className="text-lg font-bold text-slate-800">현장 유형 선택</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {HOUSING_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setHousingType(type.id)}
                                className={`p-5 rounded-2xl text-left transition-all duration-300 border card-shadow group ${housingType === type.id ? 'bg-slate-900 border-slate-900 ring-2 ring-slate-900/20' : 'bg-white border-transparent hover:border-slate-200'}`}
                            >
                                <div className={`mb-3 p-3 w-fit rounded-xl ${housingType === type.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                    <Home size={24} />
                                </div>
                                <div className={`font-bold text-base ${housingType === type.id ? 'text-white' : 'text-slate-800'}`}>{type.label.split('(')[0]}</div>
                                <div className={`text-xs mt-1 ${housingType === type.id ? 'text-slate-400' : 'text-slate-400'}`}>{type.label.includes('(') ? type.label.split('(')[1].replace(')', '') : '선택'}</div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. 소재 안내 및 시뮬레이션 */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                         <div className="flex items-center gap-2">
                             <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                             <h2 className="text-lg font-bold text-slate-800">소재 & 색상 선택</h2>
                         </div>
                         <button onClick={() => setShowMaterialModal(true)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 transition"><Info size={12}/> 소재별 특징 비교</button>
                    </div>

                    <div className="space-y-4">
                        {MATERIALS.map((item) => (
                            <div key={item.id} onClick={() => setMaterial(item.id)} className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer card-shadow group ${item.id === material ? 'bg-slate-900 border-slate-900 ring-2 ring-slate-900/10' : 'bg-white border-transparent hover:border-slate-200'}`}>
                                <div className="p-5 flex items-start gap-4 z-10 relative">
                                    <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${item.id === material ? 'border-amber-400' : 'border-slate-300'}`}>
                                        {item.id === material && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-bold text-lg ${item.id === material ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.id === material ? 'bg-white/10 text-amber-400' : 'bg-slate-100 text-slate-500'}`}>{item.badge}</span>
                                        </div>
                                        <p className={`text-sm mt-1 leading-relaxed ${item.id === material ? 'text-slate-300' : 'text-slate-500'}`}>{item.description}</p>
                                        
                                        {/* 옵션 선택 영역 */}
                                        {item.id === material && (
                                            <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                                                <div className="flex gap-2">
                                                    {item.id === 'poly' ? (
                                                        <>
                                                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('pearl')}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${polyOption === 'pearl' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>펄 포함 (추천)</button>
                                                            <button onClick={(e) => {e.stopPropagation(); setPolyOption('no_pearl')}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${polyOption === 'no_pearl' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>무펄 (솔리드)</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('kerapoxy')}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${epoxyOption === 'kerapoxy' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>케라폭시</button>
                                                            <button onClick={(e) => {e.stopPropagation(); setEpoxyOption('starlike')}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${epoxyOption === 'starlike' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>스타라이크</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ColorPalette
                        selectedColorId={selectedGroutColor}
                        onSelect={setSelectedGroutColor}
                        onTileImageUpload={handleTileImageUpload}
                        tileImageURL={tileImageURL}
                        brightnessLevel={brightnessLevel}
                        onBrightnessChange={setBrightnessLevel}
                        onTileImageReset={handleTileImageReset}
                    />
                </section>

                {/* 4. 시공 범위 선택 */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-1">
                         <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                         <h2 className="text-lg font-bold text-slate-800">시공 범위 선택</h2>
                    </div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Bathroom</h3>
                    {renderAreaList(BATHROOM_AREAS)}

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-1">Living & Etc</h3>
                    {renderAreaList(OTHER_AREAS)}
                </section>

                {/* 5. 실리콘 오염방지 */}
                <section>
                     <div className="flex items-center gap-2 mb-4 px-1">
                         <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
                         <h2 className="text-lg font-bold text-slate-800">실리콘 오염방지</h2>
                    </div>
                    {renderAreaList(SILICON_AREAS)}
                </section>

                {/* FAQ */}
                <section className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <HelpCircle className="text-amber-500" />
                        <h2 className="text-lg font-bold text-slate-800">자주 묻는 질문</h2>
                    </div>
                    {FAQ_ITEMS.map((item, index) => <Accordion key={index} question={item.question} answer={item.answer} />)}
                </section>

                {/* 숨고 리뷰 */}
                <button onClick={() => window.open(SOOMGO_REVIEW_URL, '_blank')} className="w-full py-5 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center gap-2 group hover:border-slate-300 transition active:scale-[0.99]">
                    <span className="bg-[#00C7AE] p-1.5 rounded-md"><Star size={16} className="text-white fill-white"/></span>
                    <span className="font-bold text-slate-600 group-hover:text-slate-900 transition">숨고 고객 만족도 5.0 확인하기</span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition"/>
                </button>

            </main>

            {/* 🎨 하단 고정 바 (Glassmorphism) */}
            <PackageToast isVisible={showToast} onClose={() => setShowToast(false)} label={calculation.label} />
            
            {hasSelections && (
                <div className="fixed bottom-0 left-0 right-0 z-40 glass-bottom-bar safe-area-bottom animate-slide-up">
                    <div className="max-w-md mx-auto p-4">
                        <div className="flex items-end justify-between mb-3 px-1">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 mb-0.5 tracking-wider uppercase">Estimated Total</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-white tracking-tight">{calculation.price.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-slate-400">원</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                {calculation.minimumFeeApplied && <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded flex items-center gap-1 mb-1"><Clock size={10}/> 최소 출장비 적용</span>}
                                {((calculation.minimumFeeApplied || calculation.isPackageActive) && (calculation.priceBeforeAllDiscount > calculation.price)) && (
                                    <span className="text-xs text-slate-500 line-through decoration-slate-500">{calculation.priceBeforeAllDiscount.toLocaleString()}원</span>
                                )}
                                {calculation.label && !calculation.minimumFeeApplied && <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">{calculation.label}</span>}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-[1fr_2fr] gap-3">
                            <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-[#FAE100] text-[#371D1E] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-95 transition shadow-lg shadow-amber-900/10">
                                <Layers size={18} /> 상담
                            </a>
                            <button onClick={() => { setShowModal(true); setShowToast(false); }} className="h-12 rounded-xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition shadow-lg shadow-black/10">
                                견적서 확인하기 <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showMaterialModal && <MaterialDetailModal onClose={() => setShowMaterialModal(false)} />}
            {showModal && <QuoteModal calculation={calculation} onClose={() => setShowModal(false)} quoteRef={quoteRef} selectedReviews={selectedReviews} toggleReview={toggleReview} />}
        </div>
    );
}