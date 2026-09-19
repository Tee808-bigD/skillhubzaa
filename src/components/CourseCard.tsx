import React from 'react';
import { Course } from '../types';
import { Clock, Users, Star, Award, BookOpen, Check, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onSelectCourse: (course: Course) => void;
  onEnroll: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolled,
  onSelectCourse,
  onEnroll
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group">
      {/* Course Banner Image & Category */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={course.bannerImage}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        
        {/* SETA Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
          <Award className="w-3 h-3" />
          <span>{course.setaAccreditation}</span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-2.5 py-1 rounded-lg shadow-sm">
          {course.price}
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs">
          <span className="font-extrabold text-white text-xs drop-shadow-xs">{course.provider}</span>
          <div className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">
            <Star className="w-3 h-3 fill-slate-950" />
            <span>{course.rating}</span>
          </div>
        </div>
      </div>

      {/* Course Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 
            onClick={() => onSelectCourse(course)}
            className="font-extrabold text-sm text-slate-900 line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer mb-2"
          >
            {course.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {course.tags.map(tag => (
              <span key={tag} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Course Footer Info & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {course.enrolledCount} enrolled
            </span>
          </div>

          <button
            onClick={() => onSelectCourse(course)}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>{isEnrolled ? 'View Course' : 'Details & Enroll'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
