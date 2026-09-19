import React, { useState } from 'react';
import { LearningResource, User } from '../types';
import { X, Plus, BookOpen, Link, FileText, Globe, Sparkles } from 'lucide-react';

interface AddResourceModalProps {
  currentUser: User;
  onClose: () => void;
  onAddResource: (resource: LearningResource) => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  currentUser,
  onClose,
  onAddResource
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<LearningResource['category']>('coding');
  const [resourceType, setResourceType] = useState<LearningResource['resourceType']>('guide');
  const [difficulty, setDifficulty] = useState<LearningResource['difficulty']>('Beginner');
  const [region, setRegion] = useState('Global / Worldwide');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !description.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newResource: LearningResource = {
      id: `res_${Date.now()}`,
      title,
      description,
      category,
      resourceType,
      url,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorLocation: `${currentUser.location}`,
      upvotes: 1,
      isUpvoted: true,
      isBookmarked: false,
      tags: tags.length > 0 ? tags : [category, resourceType, 'Community'],
      difficulty,
      region,
      createdAt: 'Just now',
      commentsCount: 0
    };

    onAddResource(newResource);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">Share a Learning Resource with the Community</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">Resource Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Docker & Kubernetes Masterclass Handbook for Cloud Devs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Resource URL / Link</label>
              <input
                type="url"
                required
                placeholder="https://github.com/my-repo or https://youtube.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="coding">Software & Coding</option>
                <option value="ai_data">AI & Data Science</option>
                <option value="design">UI/UX & Graphic Design</option>
                <option value="trades">Solar & Technical Trades</option>
                <option value="business">Business & Freelancing</option>
                <option value="career">Career & CVs</option>
                <option value="languages">Languages & Academics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Format Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="guide">Guide / Article</option>
                <option value="video">Video Tutorial</option>
                <option value="cheatsheet">Cheat Sheet / PDF</option>
                <option value="repo">Open Source Repo</option>
                <option value="tool">Interactive Tool / App</option>
                <option value="book">E-Book / PDF</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Target Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="Global / Worldwide">Global / Worldwide</option>
                <option value="South Africa">South Africa</option>
                <option value="Africa Region">Africa Region</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="Asia Pacific">Asia Pacific</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">Summary / What Will Learners Master?</label>
            <textarea
              rows={3}
              required
              placeholder="Provide a clear description of what this resource covers, key takeaways, and why it is useful..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Next.js, Cloud, Open Source"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Resource</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
