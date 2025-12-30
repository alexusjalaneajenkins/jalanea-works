import React, { useState } from 'react';
import {
    Car, Bus, Footprints, Calendar, Clock,
    Flame, Target, ArrowRight, ArrowLeft, Check
} from 'lucide-react';

interface Stage3Props {
    data: {
        transport: 'car' | 'bus' | 'rideshare' | 'walk';
        hardStopStart: string;
        hardStopEnd: string;
        weekendsAvailable: boolean;
        // New fields
        commuteTolerance?: 'local' | 'standard' | 'ironman';
        constraintReason?: string;
    };
    onUpdate: (field: string, value: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const TRANSPORT_OPTIONS = [
    { value: 'car', label: 'Personal Car', icon: <Car className="w-5 h-5" />, desc: 'Reliable, wide range' },
    { value: 'bus', label: 'LYNX Bus', icon: <Bus className="w-5 h-5" />, desc: 'Budget-friendly' },
    { value: 'rideshare', label: 'Rideshare', icon: <Car className="w-5 h-5" />, desc: 'Uber/Lyft reliance' },
    { value: 'walk', label: 'Walk / Bike', icon: <Footprints className="w-5 h-5" />, desc: 'Hyper-local only' },
] as const;

const CONSTRAINT_REASONS = ['Daycare', 'Classes', 'Second Job', 'Other'];

export const Stage3_Logistics: React.FC<Stage3Props> = ({ data, onUpdate, onNext, onBack }) => {

    const getTransportFeedback = () => {
        switch (data.transport) {
            case 'walk':
                return { badge: '🎯 Hyper-Local Search', text: 'Radius: approx 3-5 miles', color: 'bg-green-50 text-green-700 border-green-200' };
            case 'bus':
                return { badge: '🚌 Transit Corridor Search', text: 'Prioritizing routes on LYNX lines', color: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'car':
            case 'rideshare':
                return { badge: '🌎 Wide Radius Search', text: 'Full ecosystem access', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
            default:
                return null;
        }
    };

    const transportFeedback = getTransportFeedback();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-full">
                    <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Mission Logistics</h2>
                    <p className="text-slate-500">Define your range and availability parameters.</p>
                </div>
            </div>

            {/* 1. Transport Cards ("Range Feedback") */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-jalanea-navy">
                    How do you get to the mission?
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {TRANSPORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => onUpdate('transport', opt.value)}
                            className={`flex flex-col md:flex-row items-center md:gap-3 gap-2 p-4 rounded-xl border-2 transition-all text-center md:text-left ${data.transport === opt.value
                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500/20'
                                : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${data.transport === opt.value ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {opt.icon}
                            </div>
                            <div className="flex-1">
                                <div className={`font-bold ${data.transport === opt.value ? 'text-blue-900' : 'text-slate-700'}`}>
                                    {opt.label}
                                </div>
                                <div className="text-xs text-slate-500 hidden md:block">{opt.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Dynamic Context Feedback */}
                {transportFeedback && (
                    <div className={`p-3 rounded-xl border flex items-center gap-3 animate-in fade-in duration-300 ${transportFeedback.color}`}>
                        <span className="font-bold text-sm px-2 py-0.5 bg-white/50 rounded-md shadow-sm">
                            {transportFeedback.badge}
                        </span>
                        <span className="text-sm opacity-90">{transportFeedback.text}</span>
                    </div>
                )}
            </div>

            {/* 2. Commute Tolerance ("The Grit Meter") */}
            <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-jalanea-navy flex items-center justify-between">
                    <span>Max Commute Willingness</span>
                    <span className="text-xs text-slate-400 font-normal">How far will you go?</span>
                </label>

                <div className="bg-slate-100 p-1 rounded-xl flex">
                    {(['local', 'standard', 'ironman'] as const).map((level) => {
                        const isSelected = (data.commuteTolerance || 'standard') === level;
                        return (
                            <button
                                key={level}
                                onClick={() => onUpdate('commuteTolerance', level)}
                                className={`flex-1 py-3 px-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isSelected
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {level === 'local' && <span>Local <span className="font-normal text-xs opacity-75">(&lt;30m)</span></span>}
                                {level === 'standard' && <span>Standard <span className="font-normal text-xs opacity-75">(&lt;60m)</span></span>}
                                {level === 'ironman' && (
                                    <>
                                        <Flame className={`w-4 h-4 ${isSelected ? 'text-orange-500 fill-orange-500' : ''}`} />
                                        <span>Ironman</span>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Time Constraints ("Precision") */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-jalanea-navy">
                        <Clock className="w-4 h-4 inline mr-2 text-slate-400" />
                        Schedule Constraints
                    </label>

                    <div className="space-y-3">
                        <div>
                            <span className="text-xs text-slate-500 block mb-1">Earliest Shift Start Time</span>
                            <input
                                type="time"
                                value={data.hardStopEnd || ''} // "Cannot start before" maps to hardStopEnd loosely in logic
                                onChange={(e) => onUpdate('hardStopEnd', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none hover:border-blue-200 transition-colors"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 block mb-1">Latest Shift End Time</span>
                            <input
                                type="time"
                                value={data.hardStopStart || ''} // "Must be free by" maps to hardStopStart
                                onChange={(e) => onUpdate('hardStopStart', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none hover:border-blue-200 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-jalanea-navy">
                        Primary Conflict Reason
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {CONSTRAINT_REASONS.map((reason) => (
                            <button
                                key={reason}
                                onClick={() => onUpdate('constraintReason', reason)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${data.constraintReason === reason
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {reason}
                            </button>
                        ))}
                    </div>

                    <div className="pt-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <div className="font-bold text-sm text-slate-900">Weekends?</div>
                                <div className="text-xs text-slate-500">Available Saturdays/Sundays</div>
                            </div>
                            <button
                                onClick={() => onUpdate('weekendsAvailable', !data.weekendsAvailable)}
                                className={`w-12 h-7 rounded-full transition-all duration-300 relative ${data.weekendsAvailable ? 'bg-green-500' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 flex items-center justify-center ${data.weekendsAvailable ? 'translate-x-5' : 'translate-x-0'
                                    }`}>
                                    {data.weekendsAvailable && <Check className="w-3 h-3 text-green-600" />}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-40 p-6 -mx-6 -mb-6 rounded-b-2xl flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    Next Step: Reality Context
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
