import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    Calculator, Home, Bath, DoorOpen, Utensils, LayoutGrid,
    CheckCircle2, Info, RefreshCw, Phone, Sparkles, Hammer, Sofa, Palette, Crown, Gift, Eraser, Star, X, ChevronDown, HelpCircle, Zap, TrendingUp, Clock, Image as ImageIcon, Download, DollarSign, List, Layers, Check, ShieldCheck, Ruler, Settings, ThumbsUp, AlertCircle
} from 'lucide-react';

// =================================================================
// ⭐️ 상수 및 데이터
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
// ⭐️ 스타일 정의
// =================================================================
const GlobalStyles = () => (
    <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body { font-family: 'Pretendard', sans-serif; background-color: #f8fafc; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .glass-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        .glass-header {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .card-shadow { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); }
        .card-hover:hover { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06); transform: translateY(-2px); }
        
        input[type=range] {
            -webkit-appearance: none;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #4f46e5;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            margin-top: -8px;
            cursor: pointer;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            border-radius: 2px;
        }
        
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    `}</style>
);

const HOUSING_TYPES = [
    { id: 'new', label: '신축 아파트 (입주예정)', multiplier: 1.0 },
    { id: 'old', label: '구축/거주 중', multiplier: 1.0 },
];
const MATERIALS = [
    {
        id: 'poly', label: '폴리아스파틱', priceMod: 1.0,
        description: '우수한 광택과 합리적인 가격의 스탠다드 소재',
        badge: 'STANDARD', badgeColor: 'bg-slate-100 text-slate-600'
    },
    {
        id: 'kerapoxy', label: '에폭시', priceMod: 1.8,
        description: '반영구적인 내구성과 고급스러운 무광 텍스처',
        badge: 'PREMIUM', badgeColor: 'bg-amber-100 text-amber-700'
    },
];
const BATHROOM_AREAS = [
    { id: 'bathroom_floor', label: '욕실 바닥', basePrice: 150000, icon: Bath, unit: '개소' },
    { id: 'shower_booth', label: '샤워부스 벽면', basePrice: 150000, icon: LayoutGrid, unit: '구역' },
    { id: 'bathtub_wall', label: '욕조 벽면', basePrice: 150000, icon: LayoutGrid, unit: '구역' },
    { id: 'master_bath_wall', label: '안방욕실 벽 전체', basePrice: 300000, icon: LayoutGrid, unit: '구역' },
    { id: 'common_bath_wall', label: '공용욕실 벽 전체', basePrice: 300000, icon: LayoutGrid, unit: '구역' },
];
const OTHER_AREAS = [
    { id: 'entrance', label: '현관', basePrice: 50000, icon: DoorOpen, unit: '개소', desc: '바닥 2곳 이상 시공 시 무료 서비스' },
    { id: 'balcony_laundry', label: '베란다/세탁실', basePrice: 100000, icon: Layers, unit: '개소', desc: '' },
    { id: 'kitchen_wall', label: '주방 벽면', basePrice: 150000, icon: Utensils, unit: '구역', desc: '' },
    { id: 'living_room', label: '거실 바닥', basePrice: 550000, icon: Sofa, unit: '구역', desc: '' },
];
const SILICON_AREAS = [
    { id: 'silicon_bathtub', label: '욕조 테두리', basePrice: 80000, icon: Eraser, unit: '개소', desc: '' },
    { id: 'silicon_sink', label: '세면대+젠다이', basePrice: 30000, icon: Eraser, unit: '개소', desc: '' },
    { id: 'silicon_living_baseboard', label: '거실 걸레받이', basePrice: 400000, icon: Sofa, unit: '구역', desc: '' },
];
const ALL_AREAS = [...BATHROOM_AREAS, ...OTHER_AREAS, ...SILICON_AREAS];
const REVIEW_EVENTS = [
    { id: 'soomgo_review', label: '숨고 포토리뷰 약속', discount: 20000, icon: Star, desc: '시공 후기 작성 약속' },
];
const FAQ_ITEMS = [
    { question: "Q1. 시공 시간은 얼마나 걸리나요?", answer: "시공범위에 따라 다르지만, 평균적으로 4~6시간 정도 소요되고 있으며 범위/소재에 따라 최대 2일 시공이 걸리는 경우도 있습니다." },
    { question: "Q2. 줄눈 시공 후 바로 사용 가능한가요?", answer: "줄눈시공 후 폴리아스파틱은 6시간, 케라폭시는 2~3일, 스타라이크는 24시간 정도 양생기간이 필요합니다. 그 시간 동안은 물 사용을 자제해주시는 것이 가장 좋습니다." },
    { question: "Q3. 왜 줄눈 시공을 해야 하나요?", answer: "줄눈은 곰팡이와 물때가 끼는 것을 방지하고, 타일 틈새 오염을 막아 청소가 쉬워지며, 인테리어 효과까지 얻을 수 있는 필수 시공입니다." },
    { question: "Q4. A/S 기간 및 조건은 어떻게 되나요?", answer: "시공 후 폴리아스파틱은 2년, 에폭시는 5년의 A/S를 제공합니다. 단, 고객 부주의나 타일 문제로 인한 하자는 소액의 출장비가 발생할 수 있습니다." },
    { question: "Q5. 구축 아파트도 시공이 가능한가요?", answer: "네, 가능합니다. 기존 줄눈을 제거하는 그라인딩 작업이 추가로 필요하며, 현재 견적은 신축/구축 동일하게 적용됩니다." },
];
const YOUTUBE_VIDEOS = [
    { id: 'XekG8hevWpA', title: '에폭시 시공영상 (벽면/바닥)', label: '에폭시 시공' },
    { id: 'M6Aq_VVaG0s', title: '밑작업 영상 (라인 그라인딩)', label: '밑작업 과정' },
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
        <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <div className="bg-slate-800/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-fade-in border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-300 to-orange-500 rounded-full text-white shadow-lg">
                        <Gift size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-300 font-medium">자동 적용됨</div>
                        <div className="text-sm font-bold text-white">{label || '패키지 할인'}</div>
                    </div>
                </div>
                <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-white transition">닫기</button>
            </div>
        </div>
    );
};

const QuoteModal = ({ calculation, onClose, quoteRef, selectedReviews, toggleReview }) => {
    const { price, label, minimumFeeApplied, itemizedPrices, priceBeforeAllDiscount } = calculation;
    const totalDiscount = priceBeforeAllDiscount - price;
    const isDiscountApplied = totalDiscount > 0;
    const packageItems = itemizedPrices.filter(i => i.quantity > 0 && !i.isDiscount);
    const discountItems = itemizedPrices.filter(i => i.isDiscount);
    const soomgoReviewEvent = REVIEW_EVENTS.find(evt => evt.id === 'soomgo_review');
    const isSoomgoReviewApplied = selectedReviews.has('soomgo_review');
    const displayLabel = minimumFeeApplied ? '최소 시공비 적용' : (label || '맞춤 견적');

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up my-4">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md p-5 border-b border-slate-100 flex justify-between items-center z-10">
                    <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2 tracking-tight">
                        견적서 확인
                    </h3>
                    <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[65vh] bg-slate-50">
                    <div ref={quoteRef} className="bg-white rounded-2xl shadow-sm p-6 space-y-6 border border-slate-100">
                        <div className='text-center'>
                            <h4 className='text-lg font-extrabold text-slate-800 tracking-tight'>줄눈의미학 예상 견적서</h4>
                            <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString()} 기준</p>
                        </div>

                        <div className='p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3'>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <div className='text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1'><Sparkles size={12}/> {displayLabel}</div>
                                    {isDiscountApplied && (
                                        <div className='text-2xl font-black text-rose-500 tracking-tight'>
                                            -{totalDiscount.toLocaleString()}원
                                        </div>
                                    )}
                                </div>
                            </div>
                            <ul className='space-y-1'>
                                {isDiscountApplied && <li className="text-xs text-slate-500 flex items-center gap-1"><Check size={10}/> 패키지 및 이벤트 할인 적용</li>}
                                {minimumFeeApplied && <li className="text-xs text-slate-500 flex items-center gap-1"><Check size={10}/> 최소 시공비(20만원) 적용</li>}
                            </ul>
                        </div>

                        {packageItems.length > 0 && (
                            <div>
                                <div className='flex justify-between text-xs font-bold text-slate-400 mb-2 px-1'>
                                    <span>항목</span>
                                    <span>상세</span>
                                </div>
                                <div className='space-y-3'>
                                    {packageItems.map((item, index) => {
                                        const areaInfo = ALL_AREAS.find(a => a.id === item.id);
                                        return (
                                            <div key={index} className='flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0'>
                                                <span className='font-medium text-slate-700'>{item.label}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.materialLabel === 'Epoxy' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        {item.materialLabel}
                                                    </span>
                                                    <span className='font-bold text-slate-900'>{item.quantity}{areaInfo ? areaInfo.unit : '개소'}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {discountItems.length > 0 && (
                            <div className='pt-4 border-t border-dashed border-slate-200'>
                                {discountItems.map((item, index) => (
                                    <div key={index} className='flex justify-between items-center py-1'>
                                        <div className='flex items-center gap-1.5 text-sm font-medium text-slate-600'>
                                            <Gift size={14} className='text-rose-500'/> {item.label}
                                        </div>
                                        <div className='font-bold text-sm text-rose-500'>-{item.originalPrice.toLocaleString()}원</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => toggleReview('soomgo_review')}
                            className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${isSoomgoReviewApplied ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${isSoomgoReviewApplied ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Star size={16} fill={isSoomgoReviewApplied ? "currentColor" : "none"} />
                                </div>
                                <div className="text-left">
                                    <div className={`text-sm font-bold ${isSoomgoReviewApplied ? 'text-rose-700' : 'text-slate-700'}`}>{soomgoReviewEvent.label}</div>
                                    <div className="text-xs text-rose-500 font-semibold">20,000원 추가 할인</div>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSoomgoReviewApplied ? 'border-rose-500 bg-rose-500' : 'border-slate-300'}`}>
                                {isSoomgoReviewApplied && <Check size={12} className="text-white" />}
                            </div>
                        </button>

                        <div className='pt-6 border-t-2 border-slate-100 flex flex-col items-end gap-1'>
                            <span className="text-xs font-medium text-slate-400">최종 예상 금액 (VAT별도)</span>
                            <div className='flex items-baseline gap-1'>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                    {price.toLocaleString()}
                                </span>
                                <span className="text-lg font-bold text-slate-600">원</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-white border-t border-slate-100 grid grid-cols-2 gap-3">
                     <a
                        href={KAKAO_CHAT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 bg-yellow-400 text-slate-900 rounded-xl font-bold hover:bg-yellow-500 transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Layers size={18} /> 카카오 상담
                    </a>
                    <a
                        href={`tel:${PHONE_NUMBER}`}
                        className="py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                    >
                       <Phone size={18} /> 전화 상담
                    </a>
                </div>
            </div>
        </div>
    );
};

// ⭐️ [업데이트] 소재 비교 가이드 모달 ⭐️
const MaterialDetailModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-amber-400" /> 소재별 장단점 및 추천</h3>
              <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                {/* 1. 요약 비교 카드 */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs font-bold text-slate-500 mb-1">Standard</div>
                        <div className="text-lg font-black text-slate-800 mb-2">폴리</div>
                        <ul className="text-xs text-slate-600 space-y-1 text-left">
                            <li className="flex gap-1.5"><ThumbsUp size={12} className="text-indigo-500 mt-0.5"/> 우수한 광택</li>
                            <li className="flex gap-1.5"><ThumbsUp size={12} className="text-indigo-500 mt-0.5"/> 합리적 비용</li>
                            <li className="flex gap-1.5"><ThumbsUp size={12} className="text-indigo-500 mt-0.5"/> 6시간 빠른양생</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-400 text-white text-[9px] px-2 py-0.5 font-bold rounded-bl-lg">BEST</div>
                        <div className="text-xs font-bold text-indigo-500 mb-1">Premium</div>
                        <div className="text-lg font-black text-indigo-900 mb-2">에폭시</div>
                        <ul className="text-xs text-slate-700 space-y-1 text-left">
                            <li className="flex gap-1.5"><Star size={12} className="text-amber-500 mt-0.5"/> 반영구적 수명</li>
                            <li className="flex gap-1.5"><Star size={12} className="text-amber-500 mt-0.5"/> 고급 무광택</li>
                            <li className="flex gap-1.5"><Star size={12} className="text-amber-500 mt-0.5"/> 강력한 방수</li>
                        </ul>
                    </div>
                </div>

                {/* 2. 상세 비교표 */}
                <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-3 py-3 text-center font-bold text-slate-600 w-1/3">구분</th>
                                <th className="px-3 py-3 text-center font-bold text-slate-700 w-1/3">폴리</th>
                                <th className="px-3 py-3 text-center font-bold text-indigo-700 w-1/3">에폭시</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">내구성</td>
                                <td className="px-3 py-3 text-center text-slate-600">우수 (5년+)</td>
                                <td className="px-3 py-3 text-center font-bold text-indigo-600">최상 (반영구)</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">광택</td>
                                <td className="px-3 py-3 text-center text-slate-600">유광 (반짝임)</td>
                                <td className="px-3 py-3 text-center font-bold text-indigo-600">무광 (매트함)</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">시공 시간</td>
                                <td className="px-3 py-3 text-center font-bold text-blue-600">하루</td>
                                <td className="px-3 py-3 text-center text-slate-600">1~2일</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 text-center font-bold text-slate-500">물 사용</td>
                                <td className="px-3 py-3 text-center font-bold text-blue-600">6시간 후</td>
                                <td className="px-3 py-3 text-center text-slate-600">24~48시간 후</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 3. 추천 가이드 */}
                <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-indigo-500"/> 나에게 맞는 소재는?
                    </h4>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1">👍 폴리아스파틱을 추천해요</div>
                        <ul className="text-xs text-slate-500 space-y-1 ml-1 list-disc list-inside">
                            <li>3~5년 단기 거주 예정이신 분</li>
                            <li>빠른 시공과 저렴한 비용을 원하시는 분</li>
                        </ul>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="font-bold text-indigo-900 mb-1">👑 에폭시를 추천해요</div>
                        <ul className="text-xs text-indigo-800/80 space-y-1 ml-1 list-disc list-inside">
                            <li>자가 거주 또는 10년 이상 장기 거주 예정이신 분</li>
                            <li>호텔처럼 차분하고 고급스러운 무광을 원하시는 분</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
                <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg active:scale-[0.98]">확인했습니다</button>
            </div>
          </div>
        </div>
);

const Accordion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left font-bold text-slate-700 hover:text-indigo-600 transition duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className='pr-4 leading-relaxed'>{question}</span>
                <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-sm text-slate-500 leading-relaxed animate-fade-in bg-slate-50/50 p-3 rounded-lg mb-2">
                    {answer}
                </div>
            )}
        </div>
    );
};

const ColorPalette = ({ selectedColorId, onSelect, onTileImageUpload, tileImageURL, brightnessLevel, onBrightnessChange, onTileImageReset }) => {
    const baseColorData = GROUT_COLORS.find(c => c.id === selectedColorId) || GROUT_COLORS[0];
    const GROUT_LINE_WIDTH = 12;

    const effectiveTileImageURL = (tileImageURL && tileImageURL !== DEFAULT_TILE_IMAGE_URL) ? tileImageURL : DEFAULT_TILE_IMAGE_URL;

    const effectiveGroutColor = useMemo(() => {
        const baseHex = baseColorData.code;
        const level = brightnessLevel / 50;
        if (level === 0) return baseHex;
        const weight = Math.abs(level);
        return mixColors(baseHex, level > 0 ? BRIGHT_COLOR_CODE : DARK_COLOR_CODE, weight);
    }, [baseColorData.code, brightnessLevel]);

    const isDarkGrout = useMemo(() => {
        const hex = effectiveGroutColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) < 150;
    }, [effectiveGroutColor]);

    const sliderTrackStyle = useMemo(() => ({
        backgroundImage: `linear-gradient(to right, ${DARK_COLOR_CODE}, ${baseColorData.code}, ${BRIGHT_COLOR_CODE})`
    }), [baseColorData.code]);

    return (
        <div className='mt-8 pt-6 border-t border-slate-100'>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
                <Palette className="h-5 w-5 text-indigo-500" /> 시공 미리보기 (시뮬레이션)
            </h3>

            {/* 1. 시뮬레이션 화면 (정보바 제거) */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-4 bg-slate-100 group">
                <div className="w-full aspect-video relative bg-slate-200">
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${effectiveTileImageURL})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }}></div>
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(/logo.png)', backgroundSize: '30%', backgroundRepeat: 'repeat', zIndex: 5 }}></div>
                    
                    {/* 줄눈 라인 */}
                    <div className="absolute top-0 bottom-0 left-1/2 shadow-sm" style={{ width: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, transform: 'translateX(-50%)', zIndex: 10 }}></div>
                    <div className="absolute left-0 right-0 top-1/2 shadow-sm" style={{ height: `${GROUT_LINE_WIDTH}px`, backgroundColor: effectiveGroutColor, transform: 'translateY(-50%)', zIndex: 10 }}></div>
                </div>
            </div>

            {/* 2. Tone & Mood 슬라이더 (색상 정보 포함) */}
            <div className='mb-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm'>
                <div className='flex items-center justify-between mb-3'>
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm" style={{backgroundColor: effectiveGroutColor}}></div>
                        <span className="text-sm font-bold text-slate-800">{baseColorData.label}</span>
                     </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {brightnessLevel > 0 ? '밝게' : brightnessLevel < 0 ? '어둡게' : '기본'} {Math.abs(brightnessLevel)}%
                    </span>
                </div>
                <div className='flex items-center gap-4'>
                    <span className='text-xs font-medium text-slate-400'>Dark</span>
                    <input
                        type="range" min="-50" max="50" step="10"
                        value={brightnessLevel}
                        onChange={(e) => onBrightnessChange(Number(e.target.value))}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={sliderTrackStyle}
                    />
                    <span className='text-xs font-medium text-slate-400'>Light</span>
                </div>
            </div>

            {/* 3. 우리집 타일 찍기 버튼 (슬라이더 바로 아래 위치) */}
            <div className='mb-6 flex gap-3'>
                <input type="file" id="tileFileInput" accept="image/*" onChange={onTileImageUpload} style={{ display: 'none' }} />
                <label htmlFor="tileFileInput" className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                    <ImageIcon size={16} className="text-slate-400"/> 우리집 타일 찍기
                </label>
                {tileImageURL !== DEFAULT_TILE_IMAGE_URL && (
                    <button onClick={onTileImageReset} className="py-3 px-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow-sm">
                        <RefreshCw size={16} />
                    </button>
                )}
            </div>

            {/* 4. 색상 선택 그리드 */}
            <div className='grid grid-cols-5 gap-3'>
                {GROUT_COLORS.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => { onSelect(color.id); onBrightnessChange(0); }}
                        className={`aspect-square rounded-xl shadow-sm transition-all duration-300 relative group overflow-hidden ${
                            selectedColorId === color.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 z-10' : 'hover:scale-105 hover:shadow-md'
                        }`}
                        style={{ backgroundColor: color.code }}
                    >
                        {selectedColorId === color.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <CheckCircle2 size={20} className={`${color.isDark ? 'text-white' : 'text-slate-900'} drop-shadow-sm`} />
                            </div>
                        )}
                        <span className={`absolute bottom-0 inset-x-0 text-[9px] font-bold py-1 text-center truncate ${color.isDark ? 'text-white bg-black/30' : 'text-slate-900 bg-white/50'}`}>
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
    const [showToast, setShowToast] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(YOUTUBE_VIDEOS[0].id);
    const quoteRef = useRef(null);
    const SOOMGO_REVIEW_URL = 'https://www.soomgo.com/profile/users/10755579?tab=review';

    // (기존 useEffect 및 핸들러들 생략 없이 유지됨 - 이전 코드와 동일)
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
            if (bathroomFloorCount >= 2 && newQuantities['entrance'] === 0) { newQuantities['entrance'] = 1; }
            else if (bathroomFloorCount < 2 && prev['bathroom_floor'] >= 2 && prev['entrance'] === 1 && newQuantities['entrance'] === 1) {
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

        const totalSelectedCount = Object.values(filteredPolySelections).reduce((sum, v) => sum + v, 0) +
                                   Object.values(filteredEpoxySelections).reduce((sum, v) => sum + v, 0);

        if (totalSelectedCount === 0) return null;
        const sortedPackages = MIXED_PACKAGES;

        for (const pkg of sortedPackages) {
                    let tempPolySelections = { ...filteredPolySelections };
                    let tempEpoxySelections = { ...filteredEpoxySelections };
                    let appliedAutoEntrance = false;

                    if (pkg.isFlexible) {
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
                                                       const isIdSetMatch = finalSelectedAreaIds.size === packageAreaIds.size &&
                                                                                               [...finalSelectedAreaIds].every(id => packageAreaIds.has(id));

                                                       if (isIdSetMatch) {
                                                           return { ...pkg, autoEntrance: appliedAutoEntrance };
                                                       }
                                                   }
                                                   continue;
                    }

                    let isMatch = true;
                    for (const [id, requiredQty] of pkg.P_areas) {
                                             if ((filteredPolySelections[id] || 0) !== requiredQty) {
                                                 isMatch = false;
                                                 break;
                                             }
                    }
                    if (!isMatch) continue;

                    for (const [id, requiredQty] of pkg.E_areas) {
                                             if ((filteredEpoxySelections[id] || 0) !== requiredQty) {
                                                 isMatch = false;
                                                 break;
                                             }
                    }
                    if (!isMatch) continue;

                    const selectedAreaIds = new Set([...Object.keys(filteredPolySelections).filter(id => filteredPolySelections[id] > 0), ...Object.keys(filteredEpoxySelections).filter(id => filteredEpoxySelections[id] > 0)]);
                    const packageAreaIds = new Set(getPackageAreaIds(pkg));
                    const isIdSetMatch = selectedAreaIds.size === packageAreaIds.size &&
                                                               [...selectedAreaIds].every(id => packageAreaIds.has(id));

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

        let packageAreas = [];

        if (matchedPackage) {
            total = matchedPackage.price;
            isPackageActive = true;
            labelText = '패키지 할인 적용 중';
            packageAreas = getPackageAreaIds(matchedPackage);
            packageAreas.forEach(id => { q[id] = 0; });
            if (quantities['entrance'] >= 1) {
                isFreeEntrance = true;
                q['entrance'] = 0;
            }
        }

        if (quantities['bathroom_floor'] >= 2 && quantities['entrance'] >= 1 && !matchedPackage) {
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
            }

            const calculatedPricePerUnit = Math.floor(finalUnitBasePrice * selectedHousing.multiplier);
            let finalCalculatedPrice = 0;
            let finalDiscount = 0;
            let isFreeServiceItem = false;
            let packageCount = initialCount - count;

            let isPackageItemFlag = false;

            if (packageCount > 0 && (matchedPackage || isFreeEntrance) && count === 0) {
                finalCalculatedPrice = 0;
                finalDiscount = itemOriginalTotal; 
                isFreeServiceItem = area.id === 'entrance' || packageAreas.includes(area.id);
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
                isPackageItem: isPackageItemFlag || !isFreeServiceItem && (packageCount > 0 || isPackageActive || finalDiscount > 0),
                isDiscount: false,
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

    const packageActiveRef = useRef(calculation.isPackageActive);
    useEffect(() => {
        if (calculation.isPackageActive && !packageActiveRef.current) { setShowToast(true); }
        packageActiveRef.current = calculation.isPackageActive;
    }, [calculation.isPackageActive]);

    const handleCloseToast = useCallback(() => { setShowToast(false); }, []);
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
        if (['silicon_bathtub', 'silicon_sink', 'silicon_living_baseboard'].includes(areaId)) {
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
                const isEntranceAutoSelected = area.id === 'entrance' && quantities['entrance'] >= 1 && quantities['bathroom_floor'] >= 2 && !calculation.isPackageActive;
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

            <header className="glass-header sticky top-0 z-30 transition-all duration-300">
                <div className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto">
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

                <section className="animate-fade-in delay-100">
                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm flex flex-col gap-3">
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
                                <div className="text-[11px] text-indigo-700/80 leading-tight mt-0.5">바닥 300x300, 벽면 300x600 타일 기준</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="animate-fade-in delay-200">
                     <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold">1</span>
                        시공 소재 선택
                    </h2>
                    <div className="space-y-4">
                        {MATERIALS.map((item) => (
                            <div key={item.id} onClick={() => setMaterial(item.id)} className={`relative overflow-hidden rounded-[1.5rem] cursor-pointer transition-all duration-300 card-shadow border ${item.id === material ? 'bg-white border-indigo-500 ring-2 ring-indigo-500' : 'bg-white border-transparent hover:border-slate-200'}`}>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.id === material ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                {item.id === material && <Check size={12} className="text-white" strokeWidth={4} />}
                                            </div>
                                            <span className="font-bold text-lg text-slate-800">{item.label}</span>
                                        </div>
                                        <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 pl-8 leading-relaxed">{item.description}</p>
                                    
                                    {item.id === material && (
                                        <div className="mt-4 pl-8 animate-slide-up">
                                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                                {item.id === 'poly' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); setPolyOption('pearl'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${polyOption === 'pearl' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>펄 있음</button>
                                                        <button onClick={(e) => { e.stopPropagation(); setPolyOption('no_pearl'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${polyOption === 'no_pearl' ? 'bg-white text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>펄 없음</button>
                                                    </>
                                                )}
                                                {item.id === 'kerapoxy' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('starlike'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${epoxyOption === 'starlike' ? 'bg-white text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>스타라이크 EVO</button>
                                                        <button onClick={(e) => { e.stopPropagation(); setEpoxyOption('kerapoxy'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${epoxyOption === 'kerapoxy' ? 'bg-white text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>케라폭시</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ⭐️ [수정] 소재 비교 버튼 문구 변경 및 아이콘 변경 ⭐️ */}
                    <button onClick={() => setShowMaterialModal(true)} className="w-full mt-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2">
                        <HelpCircle size={18} className='text-indigo-500'/> 🤔 폴리 vs 에폭시, 어떤게 더 좋을까요?
                    </button>

                    <ColorPalette
                        selectedColorId={selectedGroutColor} onSelect={setSelectedGroutColor}
                        onTileImageUpload={handleTileImageUpload} tileImageURL={tileImageURL}
                        brightnessLevel={brightnessLevel} onBrightnessChange={setBrightnessLevel}
                        onTileImageReset={handleTileImageReset}
                    />
                </section>

                <section className="animate-fade-in delay-300">
                     <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold">2</span>
                        시공 범위 선택
                    </h2>
                    
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

            <PackageToast isVisible={showToast} onClose={handleCloseToast} label={calculation.label} />

            {hasSelections && (
                <div className="fixed bottom-0 left-0 right-0 glass-panel shadow-[0_-8px_30px_rgba(0,0,0,0.1)] safe-area-bottom z-40 transition-transform duration-300 animate-slide-up">
                    <div className="max-w-lg mx-auto p-5">
                        <div className='flex items-end justify-between mb-4'>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1">예상 견적 금액</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{calculation.price.toLocaleString()}</span>
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
                                onClick={() => { setShowModal(true); setShowToast(false); }}
                                className="col-span-3 py-4 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <List size={18} /> 견적서 상세보기
                            </button>
                             <a
                                href={KAKAO_CHAT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="col-span-2 py-4 rounded-2xl font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 shadow-lg shadow-yellow-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Layers size={18} /> 상담하기
                            </a>
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