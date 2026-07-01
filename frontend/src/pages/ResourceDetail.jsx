import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResource } from '../services/resourceService.js';
import ResourceCard from '../components/ResourceCard.jsx';
import ResourceThumbnail from '../components/ResourceThumbnail.jsx';
import {
  BookOpen,
  ArrowLeft,
  Compass,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

const ResourceDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Audio Player State
  const [audioError, setAudioError] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setAudioError(false);
      const res = await getResource(id);
      if (res?.success) {
        setResource(res.data.resource);
        setRelated(res.data.related || []);
      }
    } catch (err) {
      console.error('Failed to load resource details:', err);
      setErrorMessage('Failed to load this resource. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 animate-fadeIn">
        <Loader2 className="w-8 h-8 animate-spin text-[#D98C6B]" />
        <span className="text-xs text-[#8B766C] font-bold">Opening wellness library...</span>
      </div>
    );
  }

  if (errorMessage || !resource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 animate-fadeIn">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-[#8B766C] font-semibold">{errorMessage || 'Resource not found.'}</p>
        <Link to="/resources">
          <Button variant="primary" size="sm">
            Return to Resources Hub
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Back Button */}
      <Link to="/resources" className="flex items-center gap-1.5 text-xs font-bold text-[#8B766C] hover:text-[#D98C6B] transition-colors self-start">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resources</span>
      </Link>

      {/* Main Resource Panel */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden border border-[#E7D8CC]" hoverable={false}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

        {/* Left column: SVG illustration */}
        <div className="w-full md:w-64 flex-shrink-0 flex items-center justify-center z-10">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-md border border-[#E7D8CC]">
            <ResourceThumbnail name={resource.thumbnail} />
          </div>
        </div>

        {/* Right column: Details and players */}
        <div className="flex flex-col gap-5 flex-grow z-10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#D98C6B] font-extrabold uppercase tracking-widest leading-none font-mono">
              {resource.category}
            </span>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#5A4A42]">
              {resource.title}
            </h1>
            <p className="text-sm text-[#8B766C] font-medium leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* AUDIO PLAYER */}
          {resource.type === 'audio' && (
            <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-5 rounded-2xl flex flex-col gap-4">
              {audioError ? (
                <div className="flex items-center gap-2.5 text-[#8B766C] font-bold py-3 px-4 bg-[#FFF9F5] border border-[#E7D8CC] rounded-xl justify-center font-mono">
                  <AlertCircle className="w-5 h-5 text-[#D98C6B]" />
                  <span>Audio resource coming soon.</span>
                </div>
              ) : (
                <audio
                  controls
                  preload="metadata"
                  src={resource.audioUrl}
                  onError={() => setAudioError(true)}
                  className="w-full focus:outline-none"
                />
              )}
            </div>
          )}

          {/* EXERCISE TEXT AND ARTICLES GUIDES */}
          {resource.type !== 'audio' && (
            <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-5.5 rounded-2xl flex flex-col gap-4">
              <h3 className="font-display font-extrabold text-sm text-[#5A4A42] flex items-center gap-2 border-b border-[#E7D8CC] pb-3">
                {resource.type === 'quote' ? (
                  <>
                    <BookOpen className="w-4.5 h-4.5 text-[#D98C6B]" />
                    <span>Daily Affirmation Message</span>
                  </>
                ) : resource.type === 'exercise' ? (
                  <>
                    <Compass className="w-4.5 h-4.5 text-[#CFC8E8]" />
                    <span>Exercise Steps Guide</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4.5 h-4.5 text-[#B8C9A3]" />
                    <span>Wellness Article Content</span>
                  </>
                )}
              </h3>
              
              <div className="text-[#725E54] text-sm font-medium leading-relaxed whitespace-pre-line">
                {resource.content}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* RELATED RESOURCES DRAW */}
      <div className="flex flex-col gap-4.5">
        <h3 className="font-display font-bold text-base text-[#5A4A42]">
          Related to {resource.category}
        </h3>
        {related.length === 0 ? (
          <p className="text-xs text-[#8B766C] font-bold font-mono">No other resources in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetail;
