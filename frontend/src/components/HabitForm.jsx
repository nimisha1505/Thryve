import React, { useState, useEffect } from 'react';
import { createHabit, updateHabit } from '../services/habitService.js';
import { Target, AlertCircle, Loader2 } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';

const HabitForm = ({ onSubmitSuccess, editEntry, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [customDetails, setCustomDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editEntry) {
      setName(editEntry.name);
      setDescription(editEntry.description || '');
      setFrequency(editEntry.frequency || 'daily');
      setCustomDetails(editEntry.customDetails || '');
    } else {
      setName('');
      setDescription('');
      setFrequency('daily');
      setCustomDetails('');
    }
    setError(null);
  }, [editEntry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a habit name.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        frequency,
        customDetails: frequency === 'custom' ? customDetails.trim() : undefined,
      };

      if (editEntry) {
        await updateHabit(editEntry._id, payload);
      } else {
        await createHabit(payload);
      }

      // Reset form if not editing
      if (!editEntry) {
        setName('');
        setDescription('');
        setFrequency('daily');
        setCustomDetails('');
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save habit.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden flex flex-col gap-5 border border-[#E7D8CC]" hoverable={false}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col gap-1 z-10">
        <h3 className="font-display font-bold text-lg text-[#5A4A42]">
          {editEntry ? 'Update Habit Details' : 'Track a New Habit'}
        </h3>
        <p className="text-xs text-[#8B766C] font-medium">
          Small steps lead to great changes. Define your routine guidelines.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 z-10">
        {/* Habit Name input */}
        <Input
          label="Habit Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Drink 8 glasses of water, 10 min Meds"
          maxLength={100}
          required
        />

        {/* Description textarea */}
        <Input
          label="Description (Optional)"
          type="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is your core motivation or action plan?"
          className="min-h-[96px]"
          maxLength={500}
        />
        <div className="flex justify-end -mt-3.5 px-1">
          <span className="text-[9px] font-mono text-slate-500 font-bold">{description.length}/500</span>
        </div>

        {/* Frequency selector buttons */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#8B766C] uppercase tracking-wider px-1">
            Repeat Frequency
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['daily', 'weekly', 'monthly', 'custom'].map((freq) => {
              const isSelected = frequency === freq;
              return (
                <button
                  type="button"
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`text-[10px] font-bold py-2.5 rounded-xl border transition-all duration-200 capitalize ${
                    isSelected
                      ? 'bg-[#D98C6B]/10 border-[#D98C6B]/30 text-[#D98C6B] shadow-sm shadow-[#D98C6B]/5'
                      : 'bg-[#FFF9F5] border-[#E7D8CC] text-[#8B766C] hover:border-[#D98C6B]/20 hover:text-[#5A4A42]'
                  }`}
                >
                  {freq}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom details (only visible if frequency === 'custom') */}
        {frequency === 'custom' && (
          <Input
            label="Custom Schedule Details"
            value={customDetails}
            onChange={(e) => setCustomDetails(e.target.value)}
            placeholder="e.g. Mon, Wed, Fri or Every other day"
            maxLength={100}
            required
            className="animate-fadeIn"
          />
        )}

        {/* Actions buttons */}
        <div className="flex gap-3 mt-2">
          {editEntry && (
            <Button
              variant="secondary"
              onClick={onCancelEdit}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className={editEntry ? 'flex-[2]' : 'w-full'}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {editEntry ? 'Saving changes...' : 'Creating goal...'}
              </>
            ) : editEntry ? (
              'Save Updates'
            ) : (
              'Add Habit'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default HabitForm;
