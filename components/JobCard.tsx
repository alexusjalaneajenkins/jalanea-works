import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import {
    Heart, Briefcase, MapPin, DollarSign, Calendar, Sparkles,
    Car, Bus, Bike, Footprints, Zap
} from 'lucide-react';
import { Job, TransportMode } from '../types';

interface JobCardProps {
    job: Job;
    isSaved: boolean;
    onSave: (job: Job) => void;
    onClick: (job: Job) => void;
}

const getCommuteIcon = (mode: TransportMode) => {
    const iconProps = { size: 12 };
    switch (mode) {
        case 'Bus': return <Bus {...iconProps} />;
        case 'Bike': return <Bike {...iconProps} />;
        case 'Scooter': return <Zap {...iconProps} />;
        case 'Walk': return <Footprints {...iconProps} />;
        default: return <Car {...iconProps} />;
    }
};

export const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onSave, onClick }) => {
    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave(job);
    };

    return (
        <Card
            variant="solid-white"
            hoverEffect
            className="group transition-all duration-300 border-l-[6px] border-l-transparent hover:border-l-jalanea-200 cursor-pointer"
        >
            <div onClick={() => onClick(job)} className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* LEFT: Job Details */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-2xl font-display font-bold text-jalanea-900 group-hover:text-jalanea-700 transition-colors">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                            {job.logo ? (
                                <img
                                    src={job.logo}
                                    alt={`${job.company} logo`}
                                    className="w-10 h-10 rounded-lg object-cover shadow-sm border border-jalanea-100"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-jalanea-100 flex items-center justify-center border border-jalanea-200">
                                    <Briefcase size={20} className="text-jalanea-400" />
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                <span className="font-bold text-lg text-jalanea-700">{job.company}</span>
                                <span className="hidden md:inline text-jalanea-300">•</span>
                                <div className="flex items-center gap-1 text-sm font-medium text-jalanea-500">
                                    <MapPin size={14} className="text-jalanea-400" />
                                    {job.location}
                                </div>

                                {/* Commute Badge */}
                                {job.commute && (
                                    <>
                                        <span className="hidden md:inline text-jalanea-300">•</span>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border bg-jalanea-50 text-jalanea-600 border-jalanea-100">
                                            {getCommuteIcon(job.commute.mode)}
                                            {job.commute.duration.text} ({job.commute.distance.text})
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${job.experienceLevel === 'Internship' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {job.experienceLevel}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-jalanea-50 text-jalanea-700 border border-jalanea-200">
                            <DollarSign size={12} className="text-jalanea-500" />
                            {job.salaryRange}
                        </span>

                        {job.locationType && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                <MapPin size={12} className="text-blue-500" />
                                {job.locationType}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-jalanea-700 leading-relaxed max-w-2xl line-clamp-2">
                        {job.description}
                    </p>

                    {job.matchReason && (
                        <div className="bg-jalanea-50 rounded-xl p-4 border border-jalanea-100 flex gap-3 items-start max-w-xl">
                            <div className="mt-0.5 p-1 bg-white rounded-md shadow-sm border border-jalanea-100">
                                <Sparkles size={14} className="text-gold" fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-jalanea-900 uppercase tracking-wide mb-1">Why this matches you</p>
                                <p className="text-sm text-jalanea-600 font-medium">{job.matchReason}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Stats & Actions */}
                <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-jalanea-100 pt-6 lg:pt-0 lg:pl-8">
                    <div className="flex justify-between items-start">
                        {job.matchScore !== undefined && (
                            <div className="flex flex-col items-center">
                                <div className="relative w-20 h-20">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-jalanea-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                        <path className="text-gold" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${job.matchScore}, 100`} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-display font-bold text-jalanea-900">{job.matchScore}%</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-jalanea-400 mt-2 uppercase tracking-wider">Match Score</span>
                            </div>
                        )}
                        <button
                            onClick={handleSaveClick}
                            className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-red-50 text-red-500' : 'text-jalanea-300 hover:text-red-500 hover:bg-red-50'
                                }`}
                        >
                            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="space-y-3 mt-6">
                        <Button fullWidth variant="primary" onClick={() => onClick(job)}>
                            View Details
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
